import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react"
import { LAB_USER, SEEDED_LOGINS, STORE_KEY, makeSeed, makePhoto, hydrateEnclosure, spliceDetailSummary } from "./seed"

const Ctx = createContext(null)
function uid(p) { return p + "-" + Math.random().toString(36).slice(2, 8) }
function nowIso() { return new Date().toISOString() }
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.job && Array.isArray(parsed.enclosures) && parsed.enclosures.length) {
        parsed.session = parsed.session || { email: null, role: "tech", authed: false }
        parsed.enclosures = (parsed.enclosures || []).map((e) => {
          const afterN = (e.photos || []).filter((p) => p.kind === "after").length
          if (afterN > 0) e = { ...e, notes: (e.notes || []).filter((n) => !/after still 0/i.test(n.text || "")) }
          return hydrateEnclosure(e)
        })
        return parsed
      }
    }
  } catch (e) { /* reset */ }
  return makeSeed()
}
function hist(actor, action, detail) { return { id: uid("h"), at: nowIso(), actor, action, detail } }
function queue(state, label, enclosureId) { return [...(state.syncQueue || []), { id: uid("q"), at: nowIso(), label, enclosureId, pending: true }] }
function patchEnc(state, id, fn) { return { ...state, enclosures: state.enclosures.map((e) => (e.id === id ? fn(e) : e)) } }
const IDENTITY_KEYS = ["name", "type", "portsAvailable", "placement", "condition", "lat", "lng", "address", "ispRoomFloor"]

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      const u = SEEDED_LOGINS.find((x) => x.email === action.email && x.password === action.password)
      if (!u) return { ...state, session: { ...state.session, authed: false, error: "Unknown lab.local login" } }
      return { ...state, session: { email: u.email, role: u.role, authed: true, error: null } }
    }
    case "LOGOUT": return { ...state, session: { email: null, role: "tech", authed: false } }
    case "SET_ROLE": return { ...state, session: { ...state.session, role: action.role } }
    case "RESET": { const next = makeSeed(); return { ...next, session: { email: state.session.email, role: state.session.role, authed: true, error: null } } }
    case "SYNC": return { ...state, syncQueue: (state.syncQueue || []).map((q) => ({ ...q, pending: false })), lastSyncAt: nowIso() }
    case "ADD_PHOTO": {
      const enc = state.enclosures.find((e) => e.id === action.enclosureId)
      if (!enc) return state
      const photo = makePhoto(action.kind, enc, { published: false, at: nowIso() })
      return patchEnc({ ...state, captures: [{ id: uid("cap"), enclosureId: enc.id, kind: action.kind, at: photo.at, who: "Lab Tech" }, ...state.captures], syncQueue: queue(state, "photo." + action.kind, enc.id) }, enc.id, (e) => ({ ...e, photos: [photo, ...e.photos], history: [hist("Lab Tech", "photo." + action.kind, action.kind), ...e.history], notes: action.kind === "after" ? (e.notes || []).filter((n) => !/after still 0/i.test(n.text || "")) : e.notes }))
    }
    case "PUBLISH_PHOTO": return patchEnc(state, action.enclosureId, (e) => ({ ...e, photos: e.photos.map((p) => p.id === action.photoId ? { ...p, published: true } : p) }))
    case "MARKUP_PHOTO": return patchEnc(state, action.enclosureId, (e) => ({ ...e, photos: e.photos.map((p) => p.id === action.photoId ? { ...p, markup: [...p.markup, { id: uid("mk"), x: action.x, y: action.y, text: action.text }] } : p) }))
    case "SET_COUNTS": return patchEnc(state, action.enclosureId, (e) => ({ ...e, counts: { ...e.counts, ...action.counts } }))
    case "SET_IDENTITY": return patchEnc(state, action.enclosureId, (e) => {
      const patch = {}
      IDENTITY_KEYS.forEach((k) => {
        if (action.patch && action.patch[k] !== undefined) patch[k] = action.patch[k]
      })
      if (patch.lat !== undefined) { const n = Number(patch.lat); patch.lat = Number.isFinite(n) ? n : e.lat }
      if (patch.lng !== undefined) { const n = Number(patch.lng); patch.lng = Number.isFinite(n) ? n : e.lng }
      if (patch.portsAvailable !== undefined) { const n = Number(patch.portsAvailable); patch.portsAvailable = Number.isFinite(n) ? n : e.portsAvailable }
      return { ...e, ...patch }
    })
    case "SET_SPLICE_DETAIL": return patchEnc(state, action.enclosureId, (e) => {
      const spliceDetail = action.spliceDetail || { spans: [], crossConnects: [] }
      const summary = action.summary || spliceDetailSummary(spliceDetail)
      const prev = (e.history || [])[0]
      const dup = prev && prev.actor === "Tech" && prev.action === "splice.detail" && prev.detail === summary && (Date.now() - Date.parse(prev.at) < 300)
      if (dup) return { ...e, spliceDetail }
      return { ...e, spliceDetail, history: [hist("Tech", "splice.detail", summary), ...(e.history || [])] }
    })
    case "SET_LIGHT": return patchEnc(state, action.enclosureId, (e) => ({ ...e, lightLevel: action.value }))
    case "SET_AS_DESIGNED": return patchEnc(state, action.enclosureId, (e) => ({ ...e, asDesigned: action.value, changeNote: action.note || e.changeNote }))
    case "ADD_NOTE": return patchEnc(state, action.enclosureId, (e) => ({ ...e, notes: [{ id: uid("n"), text: action.text, at: nowIso(), who: "Lab Tech" }, ...e.notes] }))
    case "ADD_TIME": return patchEnc(state, action.enclosureId, (e) => ({ ...e, time: [{ id: uid("t"), hours: action.hours, who: action.who || "Lab Tech", at: nowIso() }, ...e.time] }))
    case "ADD_LOG": return patchEnc(state, action.enclosureId, (e) => ({ ...e, dailyLog: [{ id: uid("d"), date: action.date, weather: action.weather, note: action.note, hours: action.hours }, ...e.dailyLog] }))
    case "ADD_CREW": return patchEnc(state, action.enclosureId, (e) => ({ ...e, crew: [{ id: uid("cr"), name: action.name, role: action.role, hours: action.hours }, ...e.crew] }))
    case "DOC_MARKUP": return patchEnc(state, action.enclosureId, (e) => {
      const prev = (e.history || [])[0]
      const dup = prev && prev.actor === "Tech" && prev.action === "markup.doc" && prev.detail === action.text && (Date.now() - Date.parse(prev.at) < 300)
      if (dup) return e
      return { ...e, docs: (e.docs && e.docs.length) ? e.docs.map((d, i) => i === 0 ? { ...d, markup: [...(d.markup || []), { id: uid("dm"), text: action.text, x: 24, y: 30 }] } : d) : [{ id: uid("doc"), title: e.name, markup: [{ id: uid("dm"), text: action.text, x: 24, y: 30 }] }], history: [hist("Tech", "markup.doc", action.text), ...(e.history || [])] }
    })
    case "CHECKIN": return patchEnc({ ...state, syncQueue: queue(state, "check-in", action.enclosureId) }, action.enclosureId, (e) => {
      const goingIn = action.force ? action.force === "IN" : !e.checkIn.in
      const verb = goingIn ? "IN" : "OUT"
      return { ...e, checkIn: { in: goingIn, log: [{ id: uid("ci"), action: verb, at: nowIso(), via: action.via || "qr", who: "Lab Tech" }, ...e.checkIn.log] }, history: [hist("Lab Tech", "checkin." + verb, verb), ...e.history] }
    })
    case "CAD_PIN": return patchEnc(state, action.enclosureId, (e) => ({ ...e, cad: { ...e.cad, pins: [...e.cad.pins, { id: uid("pin"), x: action.x, y: action.y, label: action.label, at: nowIso() }] } }))
    case "CAD_REDLINE": return patchEnc(state, action.enclosureId, (e) => ({ ...e, cad: { ...e.cad, redlines: [...e.cad.redlines, { id: uid("rl"), x1: action.x1, y1: action.y1, x2: action.x2, y2: action.y2, note: action.note, at: nowIso() }] }, asDesigned: "change" }))
    case "PUBLISH_CAD": return patchEnc(state, action.enclosureId, (e) => ({ ...e, cad: { ...e.cad, publishedMarkup: [...e.cad.pins.map((p) => ({ id: uid("pm"), kind: "pin", ref: p.id, at: nowIso() })), ...e.cad.redlines.map((r) => ({ id: uid("pm"), kind: "redline", ref: r.id, at: nowIso() }))] } }))
    case "HYDRATE_CAD": {
      const dlr = state.job.dlrVersions.find((d) => d.id === action.dlrId) || state.job.dlrVersions[state.job.dlrVersions.length - 1]
      if (!dlr) return state
      const actor = action.source === "pm" ? "PM" : "Tech"
      return patchEnc(state, action.enclosureId, (e) => {
        if ((e.cad.versions || []).some((v) => v.dlrId === dlr.id)) return e
        return { ...e, taskInstructions: e.taskInstructions || (dlr.name + ": " + dlr.note), cad: { ...e.cad, versions: [...e.cad.versions, { id: uid("cad"), dlrId: dlr.id, name: dlr.name, at: nowIso(), source: action.source || "job" }] }, history: [hist(actor, "hydrate.cad", dlr.name), ...(e.history || [])] }
      })
    }
    case "SUBMIT": return patchEnc(state, action.enclosureId, (e) => (e.photos.filter((p) => p.kind === "after").length < 1 || e.submitted) ? e : { ...e, submitted: true, checkIn: { in: false, log: [{ id: uid("ci"), action: "OUT", at: nowIso(), via: "submit", who: "Lab Tech" }, ...(e.checkIn.log || [])] }, history: [hist("Tech", "submit", "Submitted this enclosure"), hist("Tech", "checkin.OUT", "OUT on submit"), ...(e.history || [])] })
    case "CLOSE": return patchEnc(state, action.enclosureId, (e) => (e.photos.filter((p) => p.kind === "after").length < 1 || !e.submitted) ? e : { ...e, closed: true })
    case "QC": return patchEnc(state, action.enclosureId, (e) => ({ ...e, qc: { status: action.status, reason: action.reason || "" } }))
    case "ASSIGN_WORK": return patchEnc(state, action.enclosureId, (e) => ({ ...e, taskInstructions: action.text, history: [hist("Engineer", "assign", action.text), ...(e.history || [])] }))
    case "INVITE": return { ...state, invites: [{ id: uid("inv"), email: action.email, password: "lab-" + Math.random().toString(36).slice(2, 10), at: nowIso() }, ...state.invites] }
    default: return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)
  useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(state)) }, [state])
  const api = useMemo(() => ({
    state, dispatch,
    login: (email, password) => {
      const u = SEEDED_LOGINS.find((x) => x.email === email && x.password === password)
      dispatch({ type: "LOGIN", email, password })
      return u ? { ok: true } : { ok: false, error: "Unknown lab.local login" }
    },
    logout: () => dispatch({ type: "LOGOUT" }),
    setRole: (role) => dispatch({ type: "SET_ROLE", role }),
    reset: () => dispatch({ type: "RESET" }),
    sync: () => dispatch({ type: "SYNC" }),
    addPhoto: (enclosureId, kind) => dispatch({ type: "ADD_PHOTO", enclosureId, kind }),
    publishPhoto: (enclosureId, photoId) => dispatch({ type: "PUBLISH_PHOTO", enclosureId, photoId }),
    markupPhoto: (enclosureId, photoId, x, y, text) => dispatch({ type: "MARKUP_PHOTO", enclosureId, photoId, x, y, text }),
    setCounts: (enclosureId, counts) => dispatch({ type: "SET_COUNTS", enclosureId, counts }),
    setIdentity: (enclosureId, patch) => dispatch({ type: "SET_IDENTITY", enclosureId, patch }),
    saveSpliceDetail: (enclosureId, spliceDetail) => dispatch({ type: "SET_SPLICE_DETAIL", enclosureId, spliceDetail, summary: spliceDetailSummary(spliceDetail) }),
    setLight: (enclosureId, value) => dispatch({ type: "SET_LIGHT", enclosureId, value }),
    setAsDesigned: (enclosureId, value, note) => dispatch({ type: "SET_AS_DESIGNED", enclosureId, value, note }),
    addNote: (enclosureId, text) => dispatch({ type: "ADD_NOTE", enclosureId, text }),
    addTime: (enclosureId, hours, who) => dispatch({ type: "ADD_TIME", enclosureId, hours, who }),
    addLog: (enclosureId, date, weather, note, hours) => dispatch({ type: "ADD_LOG", enclosureId, date, weather, note, hours }),
    addCrew: (enclosureId, name, role, hours) => dispatch({ type: "ADD_CREW", enclosureId, name, role, hours }),
    docMarkup: (enclosureId, text) => dispatch({ type: "DOC_MARKUP", enclosureId, text }),
    checkIn: (enclosureId, via, force) => dispatch({ type: "CHECKIN", enclosureId, via, force }),
    cadPin: (enclosureId, x, y, label) => dispatch({ type: "CAD_PIN", enclosureId, x, y, label }),
    cadRedline: (enclosureId, x1, y1, x2, y2, note) => dispatch({ type: "CAD_REDLINE", enclosureId, x1, y1, x2, y2, note }),
    publishCad: (enclosureId) => dispatch({ type: "PUBLISH_CAD", enclosureId }),
    hydrateCad: (enclosureId, dlrId, source) => dispatch({ type: "HYDRATE_CAD", enclosureId, dlrId, source }),
    submit: (enclosureId) => dispatch({ type: "SUBMIT", enclosureId }),
    close: (enclosureId) => dispatch({ type: "CLOSE", enclosureId }),
    qc: (enclosureId, status, reason) => dispatch({ type: "QC", enclosureId, status, reason }),
    assignWork: (enclosureId, text) => dispatch({ type: "ASSIGN_WORK", enclosureId, text }),
    invite: (email) => dispatch({ type: "INVITE", email }),
  }), [state])
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
export function useStore() { const v = useContext(Ctx); if (!v) throw new Error("store"); return v }
export function afterCount(enc) { return enc.photos.filter((p) => p.kind === "after").length }
export function spliceCount(enc) { return enc.photos.filter((p) => p.kind === "splice").length }
export function dlrPhotoCount(enc) { return enc.photos.filter((p) => p.kind === "dlr").length }
export function hasCad(enc) { return enc.cad.versions.length > 0 }
export function lastScan(enc) { return enc.checkIn.log[0] || null }
export function circuitStatus(state, circuit) {
  const blocked = circuit.path.filter((id) => { const e = state.enclosures.find((x) => x.id === id); return e && afterCount(e) === 0 })
  return { green: blocked.length === 0, blocked }
}

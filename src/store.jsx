import React, { createContext, useContext, useMemo, useState } from "react"
import { DLR_ID, ENC_ID, STORE_KEY, makeJobDlr, makeSeed, svgPhoto } from "./seed.js"
import { jobDlr, nid } from "./lib.js"

const StoreContext = createContext(null)

function persist(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    job: state.job, enclosures: state.enclosures, users: state.users,
    session: state.session, dlrBackup: state.dlrBackup,
    mockOnSite: state.mockOnSite, forceOffline: state.forceOffline, pendingSync: state.pendingSync,
  }))
}

function hydrateCad(state) {
  const dlr = jobDlr(state.job)
  const enclosures = (state.enclosures || []).map((enc) => {
    if (enc.cadSlot) return enc
    if (!dlr) return enc
    return { ...enc, cadSlot: { dlrId: dlr.id, name: dlr.name, kind: "dlr", source: "job", hydratedAt: new Date().toISOString() } }
  })
  return { ...state, enclosures }
}

function hist(enc, role, action) {
  const row = { id: nid("h"), at: new Date().toISOString(), role, action }
  return { ...enc, history: [...(enc.history || []), row] }
}

function ensureShape(parsed) {
  const seed = makeSeed()
  const job = parsed.job && parsed.job.id ? parsed.job : seed.job
  if (!Array.isArray(job.paperwork)) job.paperwork = []
  if (!Array.isArray(job.dlrVersions)) job.dlrVersions = seed.job.dlrVersions
  const base = seed.enclosures[0]
  const enclosures = Array.isArray(parsed.enclosures) && parsed.enclosures.length
    ? parsed.enclosures.slice(0, 1).map((e) => ({
        ...base, ...e, id: base.id, jobId: job.id,
        photos: {
          before: Array.isArray(e?.photos?.before) ? e.photos.before : [],
          after: Array.isArray(e?.photos?.after) ? e.photos.after : [],
        },
        markups: Array.isArray(e?.markups) ? e.markups : [],
        qrLog: Array.isArray(e?.qrLog) ? e.qrLog : [],
        tasks: Array.isArray(e?.tasks) && e.tasks.length ? e.tasks : base.tasks,
        counts: { ...base.counts, ...(e?.counts || {}) },
        remainingFt: e?.remainingFt ?? base.remainingFt,
        redline: e?.redline || base.redline,
        checkIn: e?.checkIn || base.checkIn,
        history: Array.isArray(e?.history) ? e.history : base.history,
        qc: { ...base.qc, ...(e?.qc || {}) },
      }))
    : seed.enclosures
  const users = Array.isArray(parsed.users) && parsed.users.length ? parsed.users : seed.users
  return {
    job, enclosures, users, session: parsed.session || null, dlrBackup: parsed.dlrBackup || seed.dlrBackup,
    mockOnSite: parsed.mockOnSite !== false, forceOffline: !!parsed.forceOffline,
    pendingSync: Array.isArray(parsed.pendingSync) ? parsed.pendingSync : [],
  }
}

function initState() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const shaped = hydrateCad(ensureShape(JSON.parse(raw)))
      persist(shaped)
      return shaped
    }
  } catch { /* seed */ }
  const seeded = hydrateCad(makeSeed())
  persist(seeded)
  return seeded
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(initState)
  const api = useMemo(() => {
    function commit(updater) {
      setState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        persist(next)
        return next
      })
    }
    function enqueue(prev, kind, payload) {
      if (!prev.forceOffline) return prev
      return { ...prev, pendingSync: [...(prev.pendingSync || []), { id: nid("sync"), kind, payload, at: new Date().toISOString() }] }
    }
    return {
      state, session: state.session, job: state.job, users: state.users, ready: true,
      mockOnSite: state.mockOnSite, forceOffline: state.forceOffline, pendingSync: state.pendingSync,
      enclosure(id) { return state.enclosures.find((e) => e.id === id) || state.enclosures[0] || null },
      login(email, password) {
        const user = state.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())
        if (!user) return { ok: false, error: "No invite for this email. Ask an admin to mint a password." }
        if (user.password !== password) return { ok: false, error: "Wrong password." }
        commit((s) => ({ ...s, session: { email: user.email, role: user.role } }))
        return { ok: true, user }
      },
      logout() { commit((s) => ({ ...s, session: null })) },
      switchRole(role) { commit((s) => s.session ? { ...s, session: { ...s.session, role } } : s) },
      updateEnclosure(id, patch) {
        commit((s) => enqueue({ ...s, enclosures: s.enclosures.map((e) => (e.id === id ? hist({ ...e, ...patch }, s.session?.role, "update") : e)) }, "update", { id, patch }))
      },
      patchEnclosure(id, fn) {
        commit((s) => ({ ...s, enclosures: s.enclosures.map((e) => (e.id === id ? fn(e) : e)) }))
      },
      saveEnclosure(id, fields) {
        commit((s) => {
          const enc = s.enclosures.find((e) => e.id === id)
          const afterN = (fields.photos || enc?.photos)?.after?.length || 0
          return enqueue({ ...s, enclosures: s.enclosures.map((e) => (e.id === id ? hist({ ...e, ...fields, status: e.submitted ? e.status : "draft" }, s.session?.role, "save") : e)) }, "save", { id })
        })
      },
      submitEnclosure(id, fields) {
        commit((s) => {
          const enc = s.enclosures.find((e) => e.id === id)
          const afterN = (fields.photos || enc?.photos)?.after?.length || 0
          if (afterN < 1) return s
          return enqueue({ ...s, enclosures: s.enclosures.map((e) => e.id === id ? hist({ ...e, ...fields, submitted: true, status: "submitted" }, s.session?.role, "submit") : e) }, "submit", { id })
        })
      },
      logQrOpen(id, email, role) {
        const at = new Date().toISOString()
        commit((s) => ({
          ...s,
          enclosures: s.enclosures.map((e) => {
            if (e.id !== id) return e
            const last = (e.qrLog || [])[(e.qrLog || []).length - 1]
            if (last && last.email === email && Date.now() - new Date(last.at).getTime() < 2000) return e
            const log = [...(e.qrLog || []), { at, email, role, action: "OPEN" }]
            return hist({ ...e, qrLog: log, checkIn: { ...(e.checkIn || { in: false, log: [] }), in: true, log: [...(e.checkIn?.log || []), { id: nid("ci"), action: "IN", at, via: "qr", who: email }] } }, role, "QR open / IN")
          }),
        }))
      },
      qrIn(id) {
        commit((s) => ({
          ...s,
          enclosures: s.enclosures.map((e) => {
            if (e.id !== id) return e
            const at = new Date().toISOString()
            const row = { id: nid("ci"), action: "IN", at, via: "qr", who: s.session?.email, geofence: s.mockOnSite }
            return hist({ ...e, checkIn: { in: true, log: [...(e.checkIn?.log || []), row] }, qrLog: [...(e.qrLog || []), { at, email: s.session?.email, role: s.session?.role, action: "IN" }], tasks: (e.tasks || []).map((t) => t.kind === "checkin" ? { ...t, done: true } : t) }, s.session?.role, s.mockOnSite ? "QR IN" : "QR IN (off-geofence lab mock)")
          }),
        }))
      },
      qrOut(id) {
        commit((s) => ({
          ...s,
          enclosures: s.enclosures.map((e) => {
            if (e.id !== id) return e
            const at = new Date().toISOString()
            const row = { id: nid("ci"), action: "OUT", at, via: "qr", who: s.session?.email }
            return hist({ ...e, checkIn: { in: false, log: [...(e.checkIn?.log || []), row] }, qrLog: [...(e.qrLog || []), { at, email: s.session?.email, role: s.session?.role, action: "OUT" }] }, s.session?.role, "QR OUT")
          }),
        }))
      },
      toggleMockOnSite() { commit((s) => ({ ...s, mockOnSite: !s.mockOnSite })) },
      toggleForceOffline() { commit((s) => ({ ...s, forceOffline: !s.forceOffline })) },
      syncPending() { commit((s) => ({ ...s, pendingSync: [], lastSyncAt: new Date().toISOString() })) },
      publishMarkup(id) {
        commit((s) => ({
          ...s,
          enclosures: s.enclosures.map((e) => e.id === id ? hist({ ...e, publishedMarkup: { at: new Date().toISOString(), by: s.session?.role, count: (e.markups || []).length } }, s.session?.role, "publish CAD markup") : e),
        }))
      },
      officeApprove(id) {
        commit((s) => ({
          ...s,
          enclosures: s.enclosures.map((e) => {
            if (e.id !== id) return e
            const missing = !(e.photos?.after?.length)
            return hist({ ...e, qc: { status: "office-approved", reason: missing ? "office-approve · photo missing" : "office-approve", officeApproved: true } }, s.session?.role, missing ? "office-approve · photo missing" : "office-approve")
          }),
        }))
      },
      completeTask(id, taskId) {
        commit((s) => ({
          ...s,
          enclosures: s.enclosures.map((e) => {
            if (e.id !== id) return e
            const task = (e.tasks || []).find((t) => t.id === taskId)
            if (!task) return e
            if (task.requiresPhoto === "after" && !(e.photos?.after?.length)) return e
            if (task.requiresPhoto === "before" && !(e.photos?.before?.length)) return e
            return hist({ ...e, tasks: e.tasks.map((t) => t.id === taskId ? { ...t, done: true } : t) }, s.session?.role, "task done: " + task.name)
          }),
        }))
      },
      addSyntheticPhoto(id, kind) {
        commit((s) => ({
          ...s,
          enclosures: s.enclosures.map((e) => {
            if (e.id !== id) return e
            const photo = { id: nid(kind), kind, name: "synthetic-" + kind + ".svg", dataUrl: svgPhoto(kind.toUpperCase() + " · " + e.label, e.code || e.id, kind === "after" ? 152 : 32), addedAt: new Date().toISOString() }
            const photos = { ...e.photos, [kind]: [...(e.photos[kind] || []), photo] }
            const tasks = (e.tasks || []).map((t) => t.requiresPhoto === kind ? { ...t, done: true } : t)
            return hist({ ...e, photos, tasks }, s.session?.role, "capture " + kind)
          }),
        }))
      },
      removePhoto(id, kind, photoId) {
        commit((s) => ({
          ...s,
          enclosures: s.enclosures.map((e) => {
            if (e.id !== id) return e
            const photos = { ...e.photos, [kind]: (e.photos[kind] || []).filter((p) => p.id !== photoId) }
            const tasks = (e.tasks || []).map((t) => t.requiresPhoto === kind && photos[kind].length === 0 ? { ...t, done: false } : t)
            return hist({ ...e, photos, tasks, submitted: photos.after.length ? e.submitted : false }, s.session?.role, "remove " + kind)
          }),
        }))
      },
      mintInvite(email, role, password) {
        const clean = String(email).trim().toLowerCase()
        if (!clean || !clean.includes("@")) return { ok: false, error: "Enter an email." }
        const mintedAt = new Date().toISOString()
        commit((s) => {
          const existing = s.users.find((u) => u.email.toLowerCase() === clean)
          const nextUser = { email: clean, role, password, mintedAt }
          return { ...s, users: existing ? s.users.map((u) => (u.email.toLowerCase() === clean ? nextUser : u)) : [...s.users, nextUser] }
        })
        return { ok: true, email: clean, role, password, mintedAt }
      },
      removeJobDlr() {
        commit((s) => ({ ...s, job: { ...s.job, paperwork: (s.job.paperwork || []).filter((p) => p.kind !== "dlr") } }))
      },
      restoreJobDlr() {
        commit((s) => {
          const dlr = s.dlrBackup || makeJobDlr()
          const others = (s.job.paperwork || []).filter((p) => p.kind !== "dlr")
          return hydrateCad({ ...s, job: { ...s.job, paperwork: [...others, dlr] }, dlrBackup: dlr })
        })
      },
      hydrateNow(id) {
        commit((s) => hydrateCad({ ...s, enclosures: s.enclosures.map((e) => e.id === id ? { ...e, cadSlot: null } : e) }))
      },
      resetSeed() { const seeded = hydrateCad(makeSeed()); persist(seeded); setState(seeded) },
    }
  }, [state])
  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore outside StoreProvider")
  return ctx
}

export { ENC_ID, DLR_ID }

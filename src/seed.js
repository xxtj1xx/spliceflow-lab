export const SEEDED_LOGINS = [
  { email: "admin@lab.local", password: "lab-admin", role: "admin" },
  { email: "pm@lab.local", password: "lab-pm", role: "pm" },
  { email: "tech@lab.local", password: "lab-tech", role: "tech" },
  { email: "engineer@lab.local", password: "lab-eng", role: "engineer" },
  { email: "noc@lab.local", password: "lab-noc", role: "noc" },
]
export const LAB_USER = SEEDED_LOGINS[2]
export const STORE_KEY = "spliceflow-lab-locked"
export const iso = (ms) => new Date(ms).toISOString()

function svgPhoto(label, sub, hue) {
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'><rect width='640' height='400' fill='hsl(" + hue + ",28%,18%)'/><text x='320' y='190' text-anchor='middle' fill='#f8f4e8' font-family='system-ui' font-size='26'>" + label + "</text><text x='320' y='224' text-anchor='middle' fill='#c8c0a8' font-size='16'>" + sub + "</text></svg>"
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg)
}

export function makePhoto(kind, enc, extra) {
  extra = extra || {}
  const hues = { before: 32, after: 152, splice: 200, dlr: 262 }
  return Object.assign({
    id: "ph-" + kind + "-" + enc.id + "-" + Math.random().toString(36).slice(2, 7),
    kind, enclosureId: enc.id,
    dataUrl: svgPhoto(kind.toUpperCase() + " · " + enc.name, enc.code, hues[kind] || 40),
    lat: enc.lat, lng: enc.lng, at: extra.at || new Date().toISOString(), markup: [], published: false,
  }, extra)
}

function blankCad() { return { versions: [], pins: [], redlines: [], publishedMarkup: [] } }

const IDENTITY_BY_ID = {
  "LAB-ENC-01": { portsAvailable: 144, placement: "Pad-mount, lab plant", condition: "Closed, labeled", address: "Lab Plant row 1, synthetic block", ispRoomFloor: "" },
  "LAB-ENC-02": { portsAvailable: 288, placement: "Below-grade vault, lab plant", condition: "Open, dry, trays accessible", address: "Lab Plant row 12, synthetic block", ispRoomFloor: "" },
  "LAB-ENC-03": { portsAvailable: 48, placement: "Handhole, lab plant", condition: "Open, lid shift", address: "Lab Plant row 3, synthetic block", ispRoomFloor: "" },
}

export function defaultSpliceDetail(encId) {
  if (encId === "LAB-ENC-02") {
    return {
      spans: [
        { id: "SPAN-X", letter: "A", name: "Span X", fiberCount: 144, fiberType: "SMF", range: "1-144", spliced: 0, unused: 144 },
        { id: "SPAN-Y", letter: "B", name: "Span Y", fiberCount: 48, fiberType: "SMF", range: "1-48", spliced: 0, unused: 48 },
      ],
      crossConnects: [
        { id: "xc-ab", from: "A", to: "B", pairs: "1-12" },
      ],
    }
  }
  if (encId === "LAB-ENC-01") {
    return {
      spans: [
        { id: "SPAN-X", letter: "A", name: "Span X", fiberCount: 144, fiberType: "SMF", range: "1-144", spliced: 144, unused: 0 },
      ],
      crossConnects: [],
    }
  }
  return {
    spans: [
      { id: "SPAN-Y", letter: "A", name: "Span Y", fiberCount: 48, fiberType: "SMF", range: "1-48", spliced: 24, unused: 24 },
    ],
    crossConnects: [],
  }
}

export function spliceDetailSummary(detail) {
  const spans = (detail && detail.spans) || []
  const xcs = (detail && detail.crossConnects) || []
  const xc = xcs.length ? xcs.map((x) => (x.from || "?") + "↔" + (x.to || "?") + " " + (x.pairs || "")).join("; ") : "no XC"
  return spans.length + " spans · " + xc
}

export function hydrateEnclosure(e) {
  if (!e) return e
  const d = IDENTITY_BY_ID[e.id] || { portsAvailable: 0, placement: "", condition: "", address: "", ispRoomFloor: "" }
  const next = { ...e }
  if (next.portsAvailable === undefined) next.portsAvailable = d.portsAvailable
  if (next.placement === undefined) next.placement = d.placement
  if (next.condition === undefined) next.condition = d.condition
  if (next.address === undefined) next.address = d.address
  if (next.ispRoomFloor === undefined) next.ispRoomFloor = d.ispRoomFloor
  if (!next.spliceDetail || !Array.isArray(next.spliceDetail.spans)) next.spliceDetail = defaultSpliceDetail(e.id)
  if (!Array.isArray(next.spliceDetail.crossConnects)) next.spliceDetail = { ...next.spliceDetail, crossConnects: [] }
  return next
}

export function makeSeed() {
  const now = Date.now()
  const e1 = { id: "LAB-ENC-01", code: "LAB-ENC-01", name: "PED-01 Oak Ridge", type: "Pedestal", location: "Oak Ridge (synthetic)", lat: 35.9617, lng: -83.9207, counts: { plannedFibers: 144, spliced: 144, drops: 12, actualSpliced: 144, actualDrops: 12 }, taskInstructions: "Splice 144F. After + splice photo required.", lightLevel: -18.4, asDesigned: "as-designed", changeNote: "", submitted: true, closed: false, qc: { status: "approved", reason: "" }, checkIn: { in: false, log: [{ id: "ci1", action: "OUT", at: iso(now - 5700000), via: "qr", who: "Lab Tech" }] } }
  const e2 = { id: "LAB-ENC-02", code: "LAB-ENC-02", name: "Vault 12", type: "Vault", location: "Vault 12 (synthetic)", lat: 35.9641, lng: -83.9179, counts: { plannedFibers: 288, spliced: 0, drops: 0, actualSpliced: 0, actualDrops: 0 }, taskInstructions: "", lightLevel: null, asDesigned: "as-designed", changeNote: "", submitted: false, closed: false, qc: { status: "open", reason: "" }, checkIn: { in: true, log: [{ id: "ci2", action: "IN", at: iso(now - 120000), via: "qr", who: "Lab Tech" }] } }
  const e3 = { id: "LAB-ENC-03", code: "LAB-ENC-03", name: "HH-03 Handhole", type: "Handhole", location: "HH-03 (synthetic)", lat: 35.9662, lng: -83.9144, counts: { plannedFibers: 48, spliced: 24, drops: 6, actualSpliced: 20, actualDrops: 4 }, taskInstructions: "Splice 48F. After required.", lightLevel: -21.1, asDesigned: "change", changeNote: "Drops 4 vs 6.", submitted: false, closed: false, qc: { status: "pushed", reason: "DLR pin missing." }, checkIn: { in: false, log: [{ id: "ci3", action: "OUT", at: iso(now - 19200000), via: "qr", who: "Lab Tech" }] } }
  const wrap = (e, photos, extra) => Object.assign({}, e, extra, { photos })
  return {
    job: {
      id: "DEMO-LAB-1001", name: "Oak Ridge Feeder — Lab Plant", customer: "Lab Telco (synthetic)", address: "Synthetic",
      paperwork: [{ id: "doc-sow", title: "SOW (lab)", pages: 4, markup: [] }],
      dlrVersions: [
        { id: "dlr-v1", name: "OSP CAD DLR v1", at: iso(now - 345600000), note: "Vault 12 splice 288F." },
        { id: "dlr-v2", name: "OSP CAD DLR v2", at: iso(now - 64800000), note: "C-14 through Vault 12 tray 3." },
      ],
    },
    enclosures: [
      wrap(e1, [makePhoto("before", e1, { published: true }), makePhoto("splice", e1, { published: true }), makePhoto("after", e1, { published: true }), makePhoto("dlr", e1, {})], {
        ...IDENTITY_BY_ID["LAB-ENC-01"], spliceDetail: defaultSpliceDetail("LAB-ENC-01"),
        cad: { versions: [{ id: "cad-01", dlrId: "dlr-v2", name: "OSP CAD DLR v2", at: iso(now - 57600000), source: "job" }], pins: [{ id: "pin-01", x: 42, y: 38, label: "Tray 1", at: iso(now) }], redlines: [], publishedMarkup: [{ id: "pm-01", kind: "pin", ref: "pin-01", at: iso(now) }] },
        notes: [{ id: "n1", text: "Ped closed.", at: iso(now), who: "Lab Tech" }], time: [{ id: "t1", hours: 3.5, who: "Lab Tech", at: iso(now) }], dailyLog: [{ id: "d1", date: iso(now).slice(0,10), weather: "Clear", note: "After captured.", hours: 3.5 }], crew: [{ id: "cr1", name: "Lab Tech", role: "Splicer", hours: 3.5 }], docs: [{ id: "ed1", title: "PED-01 sheet", markup: [] }], history: [{ id: "h1", at: iso(now), actor: "PM", action: "qc.approved", detail: "QC approved" }],
      }),
      wrap(e2, [makePhoto("before", e2, {})], {
        ...IDENTITY_BY_ID["LAB-ENC-02"], spliceDetail: defaultSpliceDetail("LAB-ENC-02"),
        cad: blankCad(), notes: [{ id: "n2", text: "Vault opened.", at: iso(now), who: "Lab Tech" }], time: [{ id: "t2", hours: 0.4, who: "Lab Tech", at: iso(now) }], dailyLog: [], crew: [], docs: [], history: [{ id: "h5", at: iso(now - 120000), actor: "Lab Tech", action: "checkin.IN", detail: "QR IN" }],
      }),
      wrap(e3, [makePhoto("before", e3, { published: true }), makePhoto("after", e3, { published: true }), makePhoto("splice", e3, {})], {
        ...IDENTITY_BY_ID["LAB-ENC-03"], spliceDetail: defaultSpliceDetail("LAB-ENC-03"),
        cad: { versions: [{ id: "cad-03", dlrId: "dlr-v1", name: "OSP CAD DLR v1", at: iso(now), source: "pm" }], pins: [], redlines: [{ id: "rl-03", x1: 22, y1: 50, x2: 70, y2: 55, note: "shifted", at: iso(now) }], publishedMarkup: [] },
        notes: [{ id: "n3", text: "Change: 4 drops.", at: iso(now), who: "Lab Tech" }], time: [{ id: "t3", hours: 2, who: "Lab Tech", at: iso(now) }], dailyLog: [], crew: [], docs: [], history: [{ id: "h8", at: iso(now), actor: "PM", action: "qc.pushed", detail: "Push-back" }],
      }),
    ],
    spans: [
      { id: "SPAN-X", name: "Span X", a: "LAB-ENC-01", b: "LAB-ENC-02", footage: 1240, designed: true, strands: "1-144", cable: "144F" },
      { id: "SPAN-Y", name: "Span Y", a: "LAB-ENC-02", b: "LAB-ENC-03", footage: 860, designed: true, strands: "1-48", cable: "48F" },
    ],
    circuits: [{ id: "C-14", name: "Circuit C-14", path: ["LAB-ENC-01", "LAB-ENC-02", "LAB-ENC-03"], strandMap: [
      { enclosureId: "LAB-ENC-01", tray: "T1", strand: "1-12", status: "complete" },
      { enclosureId: "LAB-ENC-02", tray: "T3", strand: "1-12", status: "open" },
      { enclosureId: "LAB-ENC-03", tray: "T1", strand: "1-12", status: "partial" },
    ] }],
    captures: [
      { id: "cap1", enclosureId: "LAB-ENC-01", kind: "after", at: iso(now - 8400000), who: "Lab Tech" },
      { id: "cap2", enclosureId: "LAB-ENC-02", kind: "before", at: iso(now - 3000000), who: "Lab Tech" },
      { id: "cap3", enclosureId: "LAB-ENC-03", kind: "after", at: iso(now - 20400000), who: "Lab Tech" },
    ],
    invites: [], syncQueue: [], lastSyncAt: iso(now - 480000),
    session: { email: null, role: "tech", authed: false },
  }
}

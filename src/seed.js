export const STORE_KEY = "spliceflow-lab-v0"
export const JOB_ID = "LAB-1001"
export const ENC_ID = "enc-lab-01"
export const DLR_ID = "dlr-lab-1001"

export function buildOspDlrSvg() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" width="960" height="640">
  <rect width="960" height="640" fill="#0b1c32"/>
  <rect x="16" y="16" width="928" height="608" fill="none" stroke="#f5b942" stroke-width="2"/>
  <text x="32" y="48" fill="#f5b942" font-family="ui-monospace,monospace" font-size="18" font-weight="700">LAB-1001  OSP DLR SCHEMATIC</text>
  <text x="32" y="70" fill="#c9b37a" font-family="ui-monospace,monospace" font-size="12">SYN-CLLI-LAB-01  ·  DOME  ·  AERIAL  ·  enc-lab-01  ·  T1-T12</text>
  <ellipse cx="490" cy="180" rx="170" ry="40" fill="#15263d" stroke="#f5b942" stroke-width="3"/>
  <text x="490" y="186" text-anchor="middle" fill="#f5b942" font-family="ui-monospace,monospace" font-size="14">SYN-CLLI-LAB-01</text>
  <rect x="330" y="240" width="320" height="280" rx="10" fill="#0e2238" stroke="#f5b942" stroke-width="2"/>
  <text x="490" y="270" text-anchor="middle" fill="#8fa0b8" font-family="ui-monospace,monospace" font-size="12">TRAYS · OSP CAD DLR</text>
  <rect x="40" y="140" width="18" height="360" rx="4" fill="#1b3a4a" stroke="#5ec8c8" stroke-width="2"/>
  <rect x="902" y="140" width="18" height="360" rx="4" fill="#3a3018" stroke="#e8c872" stroke-width="2"/>
  <path d="M58 200 C 180 200, 240 250, 330 280" fill="none" stroke="#5ec8c8" stroke-width="4"/>
  <path d="M902 200 C 780 200, 720 250, 650 280" fill="none" stroke="#e8c872" stroke-width="4"/>
</svg>`
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
}

export function makeJobDlr() {
  return { id: DLR_ID, name: "LAB-1001 OSP DLR schematic v2 — strand assign", kind: "dlr", svgDataUrl: buildOspDlrSvg(), note: "Strand C-14 through Vault 12 tray 3." }
}

export function svgPhoto(label, sub, hue) {
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'><rect width='640' height='400' fill='hsl(" + hue + ",28%,18%)'/><text x='320' y='190' text-anchor='middle' fill='#f8f4e8' font-size='26'>" + label + "</text><text x='320' y='224' text-anchor='middle' fill='#c8c0a8' font-size='16'>" + sub + "</text></svg>"
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg)
}

export const SEEDED_LOGINS = [
  { email: "admin@lab.local", password: "lab-admin", role: "admin" },
  { email: "tech@lab.local", password: "lab-tech", role: "contractor" },
  { email: "engineer@lab.local", password: "lab-eng", role: "engineer" },
  { email: "noc@lab.local", password: "lab-noc", role: "noc" },
]

export function makeSeed() {
  const dlr = makeJobDlr()
  const now = new Date().toISOString()
  return {
    job: {
      id: JOB_ID,
      title: "Lab synthetic fiber job",
      clli: "SYN-CLLI-LAB-01",
      paperwork: [dlr],
      dlrVersions: [
        { id: "dlr-v1", name: "OSP CAD DLR v1 — issued", note: "Issued design. Vault 12 splice 288F." },
        { id: "dlr-v2", name: dlr.name, note: dlr.note },
      ],
    },
    enclosures: [{
      id: ENC_ID,
      jobId: JOB_ID,
      label: "SYN-CLLI-LAB-01",
      code: "enc-lab-01",
      caseType: "Dome",
      placement: "Aerial",
      spanCount: 12,
      fibersSpliced: 144,
      remainingFt: 420,
      counts: { plannedFibers: 144, spliced: 0, drops: 0, actualSpliced: 0, actualDrops: 0 },
      timeEntered: "",
      timeClosed: "",
      photos: { before: [], after: [] },
      cadSlot: null,
      markups: [],
      publishedMarkup: null,
      engineerNotes: "",
      nocNotes: "",
      redline: { note: "", strokes: [] },
      tasks: [
        { id: "t1", seq: 1, name: "Check-in", kind: "checkin", done: false, requiresPhoto: null },
        { id: "t2", seq: 2, name: "Capture Before", kind: "before", done: false, requiresPhoto: "before" },
        { id: "t3", seq: 3, name: "Splice / counts", kind: "counts", done: false, requiresPhoto: null },
        { id: "t4", seq: 4, name: "Capture After", kind: "after", done: false, requiresPhoto: "after" },
        { id: "t5", seq: 5, name: "Redline", kind: "redline", done: false, requiresPhoto: null },
        { id: "t6", seq: 6, name: "Submit", kind: "submit", done: false, requiresPhoto: "after" },
      ],
      qrLog: [],
      checkIn: { in: false, log: [] },
      history: [{ id: "h0", at: now, role: "admin", action: "Lab seed loaded · LAB-1001 / Vault 12" }],
      qc: { status: "open", reason: "", officeApproved: false },
      asDesigned: "as-designed",
      status: "draft",
      submitted: false,
    }],
    users: SEEDED_LOGINS.map((u) => ({ ...u, mintedAt: "seed" })),
    session: null,
    dlrBackup: dlr,
    mockOnSite: true,
    forceOffline: false,
    pendingSync: [],
  }
}

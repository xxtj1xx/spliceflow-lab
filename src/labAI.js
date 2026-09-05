import { afterCount, spliceCount, dlrPhotoCount, hasCad, lastScan, circuitStatus } from "./store"

export function relTime(isoStr) {
  if (!isoStr) return "never"
  const s = Math.max(0, (Date.now() - new Date(isoStr).getTime()) / 1000)
  if (s < 60) return Math.round(s) + "s ago"
  if (s < 3600) return Math.round(s / 60) + "m ago"
  if (s < 86400) return Math.round(s / 3600) + "h ago"
  return Math.round(s / 86400) + "d ago"
}
function src(enclosure, field, value) {
  return { enclosure: enclosure ? enclosure.name + " (" + enclosure.code + ")" : "job", field, value }
}
export function labInsights(state, role, enclosureId) {
  const enc = state.enclosures.find((e) => e.id === enclosureId) || state.enclosures.find((e) => e.id === "LAB-ENC-02") || state.enclosures[0]
  const vault = state.enclosures.find((e) => e.id === "LAB-ENC-02")
  const spanX = state.spans.find((s) => s.id === "SPAN-X")
  const c14 = state.circuits.find((c) => c.id === "C-14")
  const items = []
  if (role === "tech" && enc) {
    const after = afterCount(enc)
    if (after === 0) items.push({ tone: "block", headline: "This can can’t submit — After is 0. Take the After, then I can draft closeout.", body: enc.name + " has no After photo. After-0 is the pass gate.", sources: [src(enc, "photos.after", "0")], href: "/app/enclosure/" + enc.id })
    else items.push({ tone: "ok", headline: "After is on this can (" + after + "). Submit is unlocked. I can draft closeout from this record.", body: "Photo-gate passed.", sources: [src(enc, "photos.after", String(after))], href: "/app/closeout/" + enc.id })
    if ((enc.counts && enc.counts.actualSpliced === 0) || spliceCount(enc) === 0) items.push({ tone: "warn", headline: "Spliced is 0 on " + enc.name + " — warning only, not a second hard gate.", body: "After-0 is the submit gate. Fill spliced counts when you have them.", sources: [src(enc, "counts.actualSpliced", String(enc.counts.actualSpliced))], href: "/app/enclosure/" + enc.id })
    if (enc.lightLevel == null) items.push({ tone: "warn", headline: "Light-level is empty on this capture — warning only, not a second hard gate.", body: "After-0 is the submit gate. Enter dBm when you have it.", sources: [src(enc, "lightLevel", "empty")], href: "/app/enclosure/" + enc.id })
    if (!hasCad(enc)) items.push({ tone: "warn", headline: "No CAD in the enclosure slot. Ask PM/Engineer to hydrate job DLR onto this can.", body: "Cannot pin until DLR lives here.", sources: [src(enc, "cad.versions", "0")], href: "/app/enclosure/" + enc.id })
  }
  if (role === "pm") {
    const after = afterCount(enc)
    if (after === 0) items.push({ tone: "block", headline: "After-0 is the hard gate on " + enc.name + ".", body: "Closeout drafts from this record after an After photo lives here.", sources: [src(enc, "photos.after", "0")], href: "/app/closeout/" + enc.id })
    else items.push({ tone: "ok", headline: "After is on " + enc.name + ". Packet can draft from this record.", body: "After-0 passed. Other holes are warnings, not a second hard gate.", sources: [src(enc, "photos.after", String(after))], href: "/app/closeout/" + enc.id })
    if (enc.counts && enc.counts.actualSpliced === 0) items.push({ tone: "warn", headline: "Spliced is 0 — warning only.", body: "Not a second hard gate.", sources: [src(enc, "counts.actualSpliced", "0")], href: "/app/enclosure/" + enc.id })
    if (enc.lightLevel == null) items.push({ tone: "warn", headline: "Light-level empty — warning only.", body: "Not a second hard gate.", sources: [src(enc, "lightLevel", "empty")], href: "/app/enclosure/" + enc.id })
  }
  if (role === "engineer") {
    const vaultAfter = vault ? afterCount(vault) : 0
    items.push({ tone: vaultAfter ? "ok" : "warn", headline: (spanX ? spanX.name : "Span X") + " is designed; " + (vault ? vault.name : "Vault 12") + (vaultAfter ? " is captured." : " not captured yet."), body: "Design lives as spans + task instructions on the enclosure.", sources: [src(vault, "photos.after", String(vaultAfter))], href: "/app/enclosure/" + (vault ? vault.id : "") })
  }
  if (role === "noc" && c14 && vault) {
    const st = circuitStatus(state, c14)
    const scan = lastScan(vault)
    items.push({
      tone: st.green ? "ok" : "block",
      headline: st.green ? "Circuit C-14 is green — After is on every can in the path." : "Circuit C-14 is red because After=0 on " + vault.name + " (tech last scan-in " + (scan ? relTime(scan.at) : "never") + ").",
      body: "NOC watches the enclosure record. Click through to that can.",
      sources: [src(vault, "photos.after", String(afterCount(vault))), src(vault, "checkIn.in", String(vault.checkIn.in))],
      href: "/app/enclosure/" + vault.id,
    })
  }
  return { enclosure: enc, items }
}

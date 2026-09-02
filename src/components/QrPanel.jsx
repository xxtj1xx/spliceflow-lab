import React from "react"
import { qrHref } from "../lib.js"

export default function QrPanel({ encId, qrLog, checkIn, mockOnSite, onQrIn, onQrOut, onToggleSite }) {
  const href = qrHref(encId)
  const last = qrLog && qrLog.length ? qrLog[qrLog.length - 1] : null
  const onSite = !!(checkIn && checkIn.in)
  return (
    <section className="card">
      <h2>Mock QR in/out + geofence</h2>
      <p className="muted">Lab mock. Not a printed sticker service. Not live GPS.</p>
      <div className="qr-wrap">
        <div className="mock-qr" aria-label="Mock QR">
          <svg viewBox="0 0 64 64" width="120" height="120">
            <rect width="64" height="64" fill="#f8f4e8"/>
            <rect x="4" y="4" width="18" height="18" fill="#0a1628"/>
            <rect x="42" y="4" width="18" height="18" fill="#0a1628"/>
            <rect x="4" y="42" width="18" height="18" fill="#0a1628"/>
            <rect x="26" y="26" width="12" height="12" fill="#0a1628"/>
            <rect x="42" y="42" width="6" height="6" fill="#0a1628"/>
            <rect x="52" y="50" width="6" height="6" fill="#0a1628"/>
          </svg>
        </div>
        <div>
          <p className="mono">{href}</p>
          <p className={"chip " + (mockOnSite ? "ok" : "warn")}>{mockOnSite ? "geofence ON (mock on-site)" : "off-geofence (lab mock)"}</p>
          <p className={"chip " + (onSite ? "ok" : "warn")}>{onSite ? "ON SITE IN" : "OUT"}</p>
          <div className="row">
            <button type="button" onClick={onQrIn}>QR IN</button>
            <button type="button" className="secondary" onClick={onQrOut}>QR OUT</button>
            <button type="button" className="secondary" onClick={onToggleSite}>Toggle mock on-site</button>
          </div>
          {!mockOnSite && <p className="gate">off-geofence (lab mock) — IN still allowed for the tester.</p>}
          {last ? <p>Last: <span className="mono">{last.email || last.who}</span> · {last.action || last.role} · {last.at}</p> : <p className="muted">No QR events yet.</p>}
        </div>
      </div>
    </section>
  )
}

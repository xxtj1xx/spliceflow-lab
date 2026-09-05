import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useStore } from "./store"
import { FakeQR, Layout } from "./ui-banner"

export function QR() {
  const { state, checkIn } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get("code") || "LAB-ENC-02")
  const match = useMemo(() => state.enclosures.find((e) => e.code.toUpperCase() === code.trim().toUpperCase()), [code, state.enclosures])
  function scan() { if (!match) return; checkIn(match.id, "qr"); nav("/app/enclosure/" + match.id) }
  return (
    <Layout enclosureId={match && match.id}>
      <div className="card">
        <h2>QR / barcode on the can</h2>
        <p className="muted">No camera required. SCAN opens that enclosure and logs IN or OUT.</p>
        <label className="field">Code<input value={code} onChange={(e) => setCode(e.target.value)} /></label>
        <div style={{ margin: "12px 0" }}><button className="big-scan" onClick={scan}>SCAN</button></div>
      </div>
      <div className="grid grid-3" style={{ marginTop: 12 }}>
        {state.enclosures.map((e) => (
          <div key={e.id} className="card">
            <div className="row">
              <FakeQR code={e.code} size={108} />
              <div>
                <b>{e.name}</b>
                <div className="muted">{e.code}</div>
                <div className={"pill " + (e.checkIn.in ? "pill-ok" : "pill-warn")}>{e.checkIn.in ? "IN" : "OUT"}</div>
                <button className="btn-primary" onClick={() => { setCode(e.code); checkIn(e.id, "qr"); nav("/app/enclosure/" + e.id) }}>Scan this can</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

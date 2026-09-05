import { useState } from "react"
import { Link } from "react-router-dom"
import { afterCount, useStore } from "./store"
import { Layout } from "./ui-banner"
import { PlantMap } from "./widgets"

export function Engineer() {
  const api = useStore()
  const [trace, setTrace] = useState("C-14")
  const [assign, setAssign] = useState("Splice per DLR v2. Capture After + splice photo.")
  const circuit = api.state.circuits.find((c) => c.id === trace) || api.state.circuits[0]
  return (
    <Layout>
      <div className="grid">
        <div className="card">
          <h2>Engineer · DESIGN</h2>
          <p className="muted">Spans, A/B, auto schematic, trace-to-strand. Not GIS.</p>
          <PlantMap state={api.state} highlight={circuit ? circuit.path : []} />
        </div>
        <div className="card">
          <h3>Auto schematic from designed spans</h3>
          <svg viewBox="0 0 640 140" width="100%" height="140" style={{ background: "#0c1a2e", borderRadius: 10 }}>
            {api.state.spans.map((s, i) => {
              const a = api.state.enclosures.find((e) => e.id === s.a)
              const b = api.state.enclosures.find((e) => e.id === s.b)
              const x1 = 70 + i * 240, x2 = x1 + 200
              return (
                <g key={s.id}>
                  <rect x={x1 - 50} y={40} width="100" height="50" rx="8" fill="#24364f" stroke="#f5b942" />
                  <text x={x1} y={70} textAnchor="middle" fill="#fff" fontSize="11">{a && a.name}</text>
                  <line x1={x1 + 50} y1={65} x2={x2 - 50} y2={65} stroke="#3dd6b8" strokeWidth="3" />
                  <text x={(x1 + x2) / 2} y={58} textAnchor="middle" fill="#9adfd0" fontSize="10">{s.name}</text>
                  <rect x={x2 - 50} y={40} width="100" height="50" rx="8" fill="#24364f" stroke="#f5b942" />
                  <text x={x2} y={70} textAnchor="middle" fill="#fff" fontSize="11">{b && b.name}</text>
                </g>
              )
            })}
          </svg>
        </div>
        <div className="card">
          <h3>Trace-to-strand</h3>
          {api.state.circuits.map((c) => <button key={c.id} className={trace === c.id ? "btn-primary" : "btn"} onClick={() => setTrace(c.id)}>{c.name}</button>)}
          <table className="table">
            <thead><tr><th>Enclosure</th><th>Tray</th><th>Strand</th><th>After</th></tr></thead>
            <tbody>
              {circuit && circuit.strandMap.map((s) => {
                const e = api.state.enclosures.find((x) => x.id === s.enclosureId)
                return <tr key={s.enclosureId}><td><Link to={"/app/enclosure/" + s.enclosureId}>{e && e.name}</Link></td><td>{s.tray}</td><td>{s.strand}</td><td>{e ? afterCount(e) : 0}</td></tr>
              })}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Assign work + hydrate job DLR</h3>
          <textarea rows={2} value={assign} onChange={(e) => setAssign(e.target.value)} />
          <div className="row" style={{ marginTop: 8 }}>
            {api.state.enclosures.map((e) => <button key={e.id} className="btn" onClick={() => { api.assignWork(e.id, assign); api.hydrateCad(e.id, "dlr-v2", "job") }}>Assign {e.name}</button>)}
          </div>
        </div>
      </div>
    </Layout>
  )
}

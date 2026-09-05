import { Link } from "react-router-dom"
import { afterCount, circuitStatus, hasCad, lastScan, useStore } from "./store"
import { relTime } from "./labAI"
import { Layout } from "./ui-banner"
import { PlantMap } from "./widgets"

export function NOC() {
  const { state } = useStore()
  return (
    <Layout>
      <div className="grid">
        <div className="card"><h2>NOC</h2><PlantMap state={state} highlight={state.circuits[0] && state.circuits[0].path} /></div>
        <div className="grid grid-3">
          {state.circuits.map((c) => {
            const st = circuitStatus(state, c)
            return (
              <div key={c.id} className="card">
                <h3>{c.name}</h3>
                <span className={"pill " + (st.green ? "pill-ok" : "pill-red")}>{st.green ? "GREEN" : "RED"}</span>
                {!st.green && <p className="muted">Blocked on {st.blocked.map((id) => (state.enclosures.find((e) => e.id === id) || {}).name).join(", ")}</p>}
                <div>{c.path.map((id) => <Link key={id} to={"/app/enclosure/" + id} style={{ marginRight: 8 }}>{id}</Link>)}</div>
              </div>
            )
          })}
        </div>
        <div className="card">
          <h3>Alarms</h3>
          <table className="table">
            <thead><tr><th>Can</th><th>After</th><th>CAD</th><th>Scan</th></tr></thead>
            <tbody>
              {state.enclosures.map((e) => {
                const scan = lastScan(e)
                return <tr key={e.id}><td><Link to={"/app/enclosure/" + e.id}>{e.name}</Link></td><td>{afterCount(e)}</td><td>{hasCad(e) ? "yes" : "missing"}</td><td>{scan ? scan.action + " " + relTime(scan.at) : "-"}</td></tr>
              })}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Live captures</h3>
          {state.captures.map((c) => {
            const e = state.enclosures.find((x) => x.id === c.enclosureId)
            return <div key={c.id} className="muted">{relTime(c.at)} · {c.kind} · <Link to={"/app/enclosure/" + c.enclosureId}>{e && e.name}</Link></div>
          })}
        </div>
      </div>
    </Layout>
  )
}

import { Link } from "react-router-dom"
import { afterCount, hasCad, useStore } from "./store"
import { Layout } from "./ui-banner"

export function PM() {
  const api = useStore()
  return (
    <Layout>
      <div className="grid">
        <div className="card">
          <h2>PM · {api.state.job.id}</h2>
          <p className="muted">Attach CAD onto the enclosure. QC approve or push-back. Closeout from the record.</p>
          {api.state.job.dlrVersions.map((d) => <div key={d.id} className="muted">{d.name} · {d.note}</div>)}
        </div>
        {api.state.enclosures.map((e) => (
          <div key={e.id} className="card">
            <div className="row">
              <h3 style={{ margin: 0 }}>{e.name}</h3>
              <span className={"pill " + (afterCount(e) ? "pill-ok" : "pill-red")}>After {afterCount(e)}</span>
              <span className={"pill " + (hasCad(e) ? "pill-ok" : "pill-warn")}>{hasCad(e) ? "CAD on can" : "Missing: CAD on this can"}</span>
            </div>
            <div className="row">
              {api.state.job.dlrVersions.map((d) => <button key={d.id} className="btn-primary" onClick={() => api.hydrateCad(e.id, d.id, "pm")}>Attach {d.id}</button>)}
              <button className="btn-ok" onClick={() => api.qc(e.id, "approved", "QC pass")}>Approve</button>
              <button className="btn-danger" onClick={() => api.qc(e.id, "pushed", "Push-back")}>Push back</button>
              <Link className="btn packet-hit" to={"/app/closeout/" + e.id} onClick={(ev) => ev.stopPropagation()}>Packet</Link>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

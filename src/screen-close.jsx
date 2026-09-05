import { useParams } from "react-router-dom"
import { afterCount, spliceCount, useStore } from "./store"
import { Layout } from "./ui-banner"

export function Closeout() {
  const { id } = useParams()
  const api = useStore()
  const enc = api.state.enclosures.find((e) => e.id === id)
  if (!enc) return <Layout><div className="card">Unknown</div></Layout>
  const after = afterCount(enc)
  const ready = after > 0
  const splicedZero = enc.counts.actualSpliced === 0
  const lightEmpty = enc.lightLevel == null
  return (
    <Layout enclosureId={enc.id}>
      <div className="card">
        <h2>Closeout · {enc.name}</h2>
        {!ready && <div className="gate">After-0 is the hard gate. After={after} on this enclosure.</div>}
        {ready && splicedZero && <div className="warn">Warning: spliced=0. Not a second hard gate.</div>}
        {ready && lightEmpty && <div className="warn">Warning: light-level empty. Not a second hard gate.</div>}
        <ul>
          <li>{api.state.job.id} {enc.code} {enc.asDesigned}</li>
          <li>spliced {enc.counts.actualSpliced} After {after} splice {spliceCount(enc)}</li>
          <li>light {enc.lightLevel == null ? "empty" : enc.lightLevel}</li>
          <li>CAD {enc.cad.versions.length} pins {enc.cad.pins.length} QC {enc.qc.status}</li>
        </ul>
        <div className="photo-grid">{enc.photos.map((p) => <div key={p.id} className="photo-card"><img src={p.dataUrl} alt={p.kind} /><div className="muted">{p.kind}</div></div>)}</div>
        <button className="btn-ok" disabled={!ready} type="button" data-enc={enc.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); api.close(enc.id) }}>{ready ? "Close record" : "Close blocked (After-0)"}</button>
      </div>
    </Layout>
  )
}

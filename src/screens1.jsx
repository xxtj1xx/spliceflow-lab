import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { afterCount, hasCad, spliceCount, useStore } from "./store"
import { relTime } from "./labAI"
import { Banner, FakeQR, Layout } from "./ui-banner"
import { CadBoard, PlantMap } from "./widgets"

function cloneDetail(d) {
  const src = d || { spans: [], crossConnects: [] }
  return {
    spans: (src.spans || []).map((s) => ({ ...s })),
    crossConnects: (src.crossConnects || []).map((x) => ({ ...x })),
  }
}

function IdentityCard({ enc, onSave }) {
  return (
    <div className="card">
      <h3>Enclosure identity</h3>
      <p className="muted">Closure name is the CLI on the plant diagram. Blur a field to save. Synthetic lab values only.</p>
      <div className="grid grid-3">
        <label className="field">Name (closure / CLI)<input defaultValue={enc.name || ""} onBlur={(e) => onSave({ name: e.target.value })} /></label>
        <label className="field">Type<input defaultValue={enc.type || ""} onBlur={(e) => onSave({ type: e.target.value })} /></label>
        <label className="field">Ports available<input type="number" defaultValue={enc.portsAvailable ?? ""} onBlur={(e) => onSave({ portsAvailable: e.target.value === "" ? 0 : Number(e.target.value) })} /></label>
        <label className="field">Placement<input defaultValue={enc.placement || ""} onBlur={(e) => onSave({ placement: e.target.value })} /></label>
        <label className="field">Condition<input defaultValue={enc.condition || ""} onBlur={(e) => onSave({ condition: e.target.value })} /></label>
        <label className="field">Address<input defaultValue={enc.address || ""} onBlur={(e) => onSave({ address: e.target.value })} /></label>
        <label className="field">Lat<input defaultValue={enc.lat ?? ""} onBlur={(e) => onSave({ lat: e.target.value })} /></label>
        <label className="field">Lng<input defaultValue={enc.lng ?? ""} onBlur={(e) => onSave({ lng: e.target.value })} /></label>
        <label className="field">ISP room / floor (optional)<input defaultValue={enc.ispRoomFloor || ""} placeholder="optional" onBlur={(e) => onSave({ ispRoomFloor: e.target.value })} /></label>
      </div>
    </div>
  )
}

function SpliceDetailCard({ enc, onSave }) {
  const [detail, setDetail] = useState(() => cloneDetail(enc.spliceDetail))
  const [saved, setSaved] = useState(false)
  useEffect(() => { setDetail(cloneDetail(enc.spliceDetail)); setSaved(false) }, [enc.id])
  function patchSpan(i, patch) {
    setDetail((d) => ({ ...d, spans: d.spans.map((s, n) => (n === i ? { ...s, ...patch } : s)) }))
    setSaved(false)
  }
  function patchXc(i, patch) {
    setDetail((d) => ({ ...d, crossConnects: d.crossConnects.map((x, n) => (n === i ? { ...x, ...patch } : x)) }))
    setSaved(false)
  }
  const spans = detail.spans || []
  const xcs = detail.crossConnects || []
  return (
    <div className="card">
      <h3>Splice detail</h3>
      <p className="muted">Required child of this enclosure. Span cards and lettered cross-connects — not a street OSP map or circuit A–Z sheet.</p>
      <div className="grid grid-3">
        {spans.map((s, i) => (
          <div key={s.id || i} className="span-card">
            <div className="row">
              <span className="pill pill-navy">Span {s.letter || "?"}</span>
              <span className="muted">{s.id}</span>
            </div>
            <label className="field">Span name<input value={s.name || ""} onChange={(e) => patchSpan(i, { name: e.target.value })} /></label>
            <div className="row">
              <label className="field">Fiber count<input type="number" value={s.fiberCount ?? ""} onChange={(e) => patchSpan(i, { fiberCount: Number(e.target.value) })} /></label>
              <label className="field">Fiber type<input value={s.fiberType || ""} onChange={(e) => patchSpan(i, { fiberType: e.target.value })} /></label>
            </div>
            <label className="field">Fiber index range<input value={s.range || ""} onChange={(e) => patchSpan(i, { range: e.target.value })} /></label>
            <div className="row">
              <label className="field">Spliced (fx)<input type="number" value={s.spliced ?? ""} onChange={(e) => patchSpan(i, { spliced: Number(e.target.value) })} /></label>
              <label className="field">Unused (fx)<input type="number" value={s.unused ?? ""} onChange={(e) => patchSpan(i, { unused: Number(e.target.value) })} /></label>
            </div>
            <div className="muted">{s.fiberCount || 0}F {s.fiberType || ""} · {s.range || "—"} · {s.spliced || 0} spliced / {s.unused || 0} unused (fx)</div>
          </div>
        ))}
      </div>
      <h3 style={{ marginTop: 12 }}>Cross-connects</h3>
      {xcs.length === 0 && <p className="muted">No lettered cross-connects on this can.</p>}
      {xcs.map((x, i) => (
        <div key={x.id || i} className="row" style={{ marginBottom: 8 }}>
          <span className="pill pill-ok">{x.from}↔{x.to}</span>
          <label className="field">Fiber pairs<input value={x.pairs || ""} onChange={(e) => patchXc(i, { pairs: e.target.value })} /></label>
        </div>
      ))}
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn-primary" type="button" onClick={() => { onSave(detail); setSaved(true) }}>Save splice detail</button>
        {saved && <span className="pill pill-ok">saved</span>}
      </div>
    </div>
  )
}

export function Login() {
  const { state, login } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState("tech@lab.local")
  const [password, setPassword] = useState("")
  if (state.session.authed) { nav("/app"); return null }
  return (
    <div>
      <Banner />
      <div className="login-wrap card">
        <h2>SpliceFlow Lab</h2>
        <p className="muted">Kitchen-sink tester on DEMO-LAB-1001. Not production.</p>
        <form className="grid" onSubmit={(e) => { e.preventDefault(); const r = login(email, password); if (r && r.ok) nav("/app") }}>
          <label className="field">Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="field">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {state.session.error && <div className="gate">{state.session.error}</div>}
          <button className="btn-primary" type="submit">Enter lab</button>
        </form>
      </div>
    </div>
  )
}

export function TechHome() {
  const { state } = useStore()
  return (
    <Layout>
      <div className="grid">
        <div className="card">
          <h2>Jobs to enclosures</h2>
          <p className="muted">{state.job.id} · {state.job.name} · unit of work is the can.</p>
          <PlantMap state={state} />
        </div>
        <div className="grid grid-3">
          {state.enclosures.map((e) => (
            <Link key={e.id} to={"/app/enclosure/" + e.id} className="card">
              <div className="row"><FakeQR code={e.code} size={56} /><div><h3 style={{ margin: 0 }}>{e.name}</h3><div className="muted">{e.code}</div></div></div>
              <div className="row" style={{ marginTop: 8 }}>
                <span className={"pill " + (afterCount(e) ? "pill-ok" : "pill-red")}>After {afterCount(e)}</span>
                <span className={"pill " + (hasCad(e) ? "pill-ok" : "pill-warn")}>{hasCad(e) ? "CAD on" : "CAD empty"}</span>
                <span className={"pill " + (e.checkIn.in ? "pill-navy" : "pill-warn")}>{e.checkIn.in ? "IN" : "OUT"}</span>{" "}
                <span className={"pill " + (e.submitted ? "pill-ok" : "pill-warn")}>{e.submitted ? "Submitted" : "Not submitted"}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export function Enclosure() {
  const { id } = useParams()
  const api = useStore()
  const enc = api.state.enclosures.find((e) => e.id === id)
  const [note, setNote] = useState("")
  const [hours, setHours] = useState("1")
  const [light, setLight] = useState(enc && enc.lightLevel != null ? String(enc.lightLevel) : "")
  const [pinLabel, setPinLabel] = useState("Tray pin")
  if (!enc) return <Layout><div className="card">Unknown enclosure</div></Layout>
  const after = afterCount(enc)
  return (
    <Layout enclosureId={enc.id}>
      <div className="grid">
        <div className="card">
          <div className="row">
            <FakeQR code={enc.code} size={72} />
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0 }}>{enc.name}</h2>
              <div className="muted">{enc.code} · {enc.type}</div>
              <div className="row" style={{ marginTop: 6 }}>
                <span className={"pill " + (after ? "pill-ok" : "pill-red")}>After {after}</span>
                <span className={"pill " + (spliceCount(enc) ? "pill-ok" : "pill-warn")}>Splice {spliceCount(enc)}</span>
                <span className={"pill " + (enc.checkIn.in ? "pill-navy" : "pill-warn")}>{enc.checkIn.in ? "IN" : "OUT"}</span>
                <span className={"pill " + (enc.submitted ? "pill-ok" : "pill-warn")}>{enc.submitted ? "Submitted" : "Not submitted"}</span>
                <span className={"pill " + (enc.qc.status === "approved" ? "pill-ok" : enc.qc.status === "pushed" ? "pill-red" : "pill-warn")}>QC {enc.qc.status}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => api.checkIn(enc.id, "button")}>{enc.checkIn.in ? "Check OUT" : "Check IN"}</button>
          </div>
          <p className="muted">Task: {enc.taskInstructions || "none — hydrate DLR"}</p>
        </div>
        {after === 0 && <div className="gate">After-0: this can cannot submit until an After photo lives here.</div>}
        <IdentityCard key={"ident-" + enc.id} enc={enc} onSave={(patch) => api.setIdentity(enc.id, patch)} />
        <SpliceDetailCard key={"spl-" + enc.id} enc={enc} onSave={(detail) => api.saveSpliceDetail(enc.id, detail)} />
        <div className="card">
          <h3>Quantities on this location</h3>
          <div className="kpis">
            <div className="kpi"><b>{enc.counts.plannedFibers}</b>planned</div>
            <div className="kpi"><b>{enc.counts.actualSpliced}</b>actual spliced</div>
            <div className="kpi"><b>{enc.counts.actualDrops}/{enc.counts.drops}</b>drops</div>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <label className="field">Actual spliced<input type="number" defaultValue={enc.counts.actualSpliced} onBlur={(e) => api.setCounts(enc.id, { actualSpliced: Number(e.target.value) })} /></label>
            <label className="field">Light-level dBm<input value={light} onChange={(e) => setLight(e.target.value)} onBlur={() => { if (light !== "") api.setLight(enc.id, Number(light)) }} /></label>
            <button className="btn" onClick={() => api.setAsDesigned(enc.id, "as-designed")}>As-designed</button>
            <button className="btn" onClick={() => api.setAsDesigned(enc.id, "change", "Field change")}>Mark change</button>
          </div>
        </div>
        <div className="card">
          <h3>Photos (children of this enclosure)</h3>
          <div className="row">{["before", "after", "splice", "dlr"].map((k) => <button key={k} className={k === "after" ? "btn-ok" : "btn"} onClick={() => api.addPhoto(enc.id, k)}>Add {k}</button>)}</div>
          <div className="photo-grid" style={{ marginTop: 10 }}>
            {enc.photos.map((p) => (
              <div key={p.id} className="photo-card card" style={{ padding: 8 }} onClick={(ev) => { const r = ev.currentTarget.getBoundingClientRect(); api.markupPhoto(enc.id, p.id, ((ev.clientX - r.left) / r.width) * 100, ((ev.clientY - r.top) / r.height) * 100, "mark") }}>
                <img src={p.dataUrl} alt={p.kind} />
                <div className="muted">{p.kind} · {relTime(p.at)}</div>
                <button className="btn" onClick={(e) => { e.stopPropagation(); api.publishPhoto(enc.id, p.id) }}>{p.published ? "published" : "Publish"}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>CAD OSP DLR on this can</h3>
          <CadBoard enc={enc} onPin={(x, y) => api.cadPin(enc.id, x, y, pinLabel)} onRedline={(x1, y1, x2, y2) => api.cadRedline(enc.id, x1, y1, x2, y2, pinLabel)} />
          <div className="row" style={{ marginTop: 8 }}>
            <input value={pinLabel} onChange={(e) => setPinLabel(e.target.value)} />
            <button className="btn" onClick={() => api.publishCad(enc.id)}>Publish markup</button>
            {api.state.job.dlrVersions.map((d) => <button key={d.id} className="btn-primary" onClick={() => api.hydrateCad(enc.id, d.id, "job")}>Hydrate {d.id}</button>)}
          </div>
          {enc.cad.versions.length > 1 && <div className="muted">Revision compare: {enc.cad.versions.map((v) => v.name).join(" vs ")}</div>}
        </div>
        <div className="grid grid-3">
          <div className="card"><h3>Daily field log</h3><button className="btn" onClick={() => api.addLog(enc.id, new Date().toISOString().slice(0, 10), "Clear", "Worked " + enc.name, Number(hours))}>Add today</button>{enc.dailyLog.map((d) => <div key={d.id} className="muted">{d.date} · {d.note}</div>)}</div>
          <div className="card"><h3>Crew / time</h3><input style={{ width: 70 }} value={hours} onChange={(e) => setHours(e.target.value)} /><button className="btn" onClick={() => { api.addTime(enc.id, Number(hours)); api.addCrew(enc.id, "Lab Tech", "Splicer", Number(hours)) }}>+ hours</button>{enc.time.map((t) => <div key={t.id} className="muted">{t.who} {t.hours}h</div>)}</div>
          <div className="card"><h3>Notes + docs markup</h3><input value={note} onChange={(e) => setNote(e.target.value)} /><button className="btn" onClick={() => { if (note) { api.addNote(enc.id, note); setNote("") } }}>Note</button><button type="button" className="btn" onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); api.docMarkup(enc.id, note.trim() || "Mark doc"); setNote("") }}>Mark doc</button>{enc.notes.filter((n) => after > 0 ? !/after still 0/i.test(n.text) : true).map((n) => <div key={n.id} className="muted">{n.text}</div>)}</div>
        </div>
        <div className="card">
          <button className="btn-ok" disabled={after < 1} onClick={() => api.submit(enc.id)}>{after < 1 ? "Submit blocked (After-0)" : (enc.submitted ? "Submitted" : "Submit")}</button>
          <Link className="btn-primary" to={"/app/closeout/" + enc.id} style={{ marginLeft: 8 }}>Closeout packet</Link>
          <h3>History</h3>
          <div className="hist">{enc.history.map((h) => <div key={h.id}>{relTime(h.at)} · {h.actor} · {h.action}</div>)}</div>
        </div>
      </div>
    </Layout>
  )
}

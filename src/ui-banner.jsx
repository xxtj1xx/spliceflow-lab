import { Link, NavLink, useNavigate } from "react-router-dom"
import { useStore } from "./store"
import { labInsights } from "./labAI"

export function Banner() {
  return <div className="tester-banner">SpliceFlow Lab — tester, not production.</div>
}

export function FakeQR({ code, size = 112 }) {
  const cells = []
  let h = 0
  const src = code || "LAB"
  for (let i = 0; i < src.length; i++) h = (h * 33 + src.charCodeAt(i)) >>> 0
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
    const on = finder ? (x === 0 || y === 0 || x === 6 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5) || (x > 15 && x < 19 && y > 1 && y < 5) || (x > 1 && x < 5 && y > 15 && y < 19)) : ((h >> ((x * 3 + y) % 31)) & 1) === 1
    if (on) cells.push([x, y])
  }
  const s = size / 21
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ background: "#fff", borderRadius: 8 }}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map(([x, y], i) => <rect key={i} x={x * s + 2} y={y * s + 2} width={s - 0.6} height={s - 0.6} fill="#0c1a2e" />)}
    </svg>
  )
}

export function LabAI({ enclosureId }) {
  const { state } = useStore()
  const { items } = labInsights(state, state.session.role, enclosureId)
  return (
    <aside className="lab-ai">
      <div className="lab-ai-banner">Lab AI — simulated on this record, not a live model.</div>
      {items.map((it, i) => (
        <div key={i} className={"lab-ai-item " + it.tone}>
          <h4>{it.headline}</h4>
          <div className="muted">{it.body}</div>
          {it.checks && <ul className="checks">{it.checks.map((c) => <li key={c.label} className={c.ok ? "okey" : "nope"}>{c.label}</li>)}</ul>}
          <div className="sources">{it.sources.map((s, j) => <div key={j}>{s.enclosure} · {s.field} = {s.value}</div>)}</div>
          {it.href && <div style={{ marginTop: 8 }}><Link to={it.href}>Open record</Link></div>}
        </div>
      ))}
    </aside>
  )
}

const ROLES = [
  { id: "tech", label: "Tech", to: "/app" },
  { id: "pm", label: "PM", to: "/app/pm" },
  { id: "engineer", label: "Engineer", to: "/app/engineer" },
  { id: "noc", label: "NOC", to: "/app/noc" },
]

export function Layout({ children, enclosureId }) {
  const { state, setRole, logout, sync, reset } = useStore()
  const nav = useNavigate()
  const pending = (state.syncQueue || []).filter((q) => q.pending).length
  return (
    <div>
      <Banner />
      <header className="topbar">
        <div className="brand">SPLICE<span>FLOW</span> LAB</div>
        <nav className="roles">
          {ROLES.map((r) => (
            <button key={r.id} className={state.session.role === r.id ? "on" : ""} onClick={() => { setRole(r.id); nav(r.to) }}>{r.label}</button>
          ))}
          <NavLink to="/app/qr" className="ghost">QR</NavLink>
          <NavLink to="/app/invite" className="ghost">Invite</NavLink>
        </nav>
        <div className="spacer" />
        <span className="muted">{state.job.id}</span>
        <button className="btn" onClick={sync}>Sync{pending ? " (" + pending + ")" : ""}</button>
        <button type="button" className="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); reset(); nav("/app"); window.scrollTo(0, 0) }}>Reset seed</button>
        <button className="ghost" onClick={() => { logout(); nav("/") }}>Out</button>
      </header>
      <div className="layout"><main>{children}</main><LabAI enclosureId={enclosureId} /></div>
    </div>
  )
}

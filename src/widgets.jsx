import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { afterCount } from "./store"

export function PlantMap({ state, highlight }) {
  const nav = useNavigate()
  const pos = { "LAB-ENC-01": { x: 70, y: 90 }, "LAB-ENC-02": { x: 220, y: 90 }, "LAB-ENC-03": { x: 370, y: 90 } }
  return (
    <div className="plant">
      <svg viewBox="0 0 460 160" width="100%" height="160">
        {state.spans.map((s) => {
          const a = pos[s.a], b = pos[s.b]
          if (!a || !b) return null
          return <g key={s.id}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#3dd6b8" strokeWidth="4" /><text x={(a.x + b.x) / 2} y="60" fill="#9adfd0" fontSize="11" textAnchor="middle">{s.name}</text></g>
        })}
        {state.enclosures.map((e) => {
          const p = pos[e.id]
          return (
            <g key={e.id} onClick={() => nav("/app/enclosure/" + e.id)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r="22" fill={afterCount(e) ? "#157a3a" : "#b42318"} stroke={highlight && highlight.includes(e.id) ? "#f5b942" : "#fff"} strokeWidth="3" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#fff" fontSize="9">{e.type.slice(0, 3).toUpperCase()}</text>
              <text x={p.x} y={p.y + 42} textAnchor="middle" fill="#f4efe4" fontSize="11">{e.name}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function CadBoard({ enc, onPin, onRedline }) {
  const [mode, setMode] = useState("pin")
  const [draft, setDraft] = useState(null)
  const [label, setLabel] = useState("Pin")
  const has = enc.cad.versions.length > 0
  function xy(e) { const r = e.currentTarget.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 } }
  function click(e) {
    if (!has) return
    const p = xy(e)
    if (mode === "pin") onPin(p.x, p.y, label || "Pin")
    else if (!draft) setDraft(p)
    else { onRedline(draft.x, draft.y, p.x, p.y, label || "Redline"); setDraft(null) }
  }
  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <button className={mode === "pin" ? "btn-primary" : "btn"} onClick={() => setMode("pin")}>Pin</button>
        <button className={mode === "red" ? "btn-primary" : "btn"} onClick={() => setMode("red")}>Redline</button>
        <input value={label} onChange={(e) => setLabel(e.target.value)} />
        {!has && <span className="pill pill-warn">CAD slot empty — hydrate job DLR</span>}
      </div>
      <div className="cad" onClick={click}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect width="100" height="100" fill="#0f2a24" />
          <path d="M8 72 L28 40 L48 52 L72 22 L92 30" fill="none" stroke="#3dd6b8" strokeWidth="1.4" />
          <text x="5" y="10" fill="#9adfd0" fontSize="4">{enc.code} OSP CAD DLR</text>
          {enc.cad.redlines.map((r) => <line key={r.id} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#ff6b4a" strokeWidth="1.2" />)}
          {enc.cad.pins.map((p) => <g key={p.id}><circle cx={p.x} cy={p.y} r="1.8" fill="#ffe08a" /><text x={p.x + 2} y={p.y} fill="#ffe08a" fontSize="3">{p.label}</text></g>)}
          {draft && <circle cx={draft.x} cy={draft.y} r="1.4" fill="#ff6b4a" />}
        </svg>
      </div>
    </div>
  )
}

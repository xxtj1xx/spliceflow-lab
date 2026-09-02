import React, { useEffect, useRef, useState } from 'react'
import { nid } from '../lib.js'

const TOOLS = ['pen', 'line', 'box', 'text', 'pin']
const COLORS = ['#f5b942', '#e85d4c', '#5ec8c8', '#e8eef6']

function toLocal(svg, e) {
  const r = svg.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  }
}

function MarkupShape({ m }) {
  const c = m.color || '#f5b942'
  const g = m.geometry || {}
  if (m.type === 'pen' && g.points?.length) {
    const d = g.points.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join(' ')
    return <path d={d} fill="none" stroke={c} strokeWidth="0.008" strokeLinecap="round" strokeLinejoin="round" />
  }
  if (m.type === 'line') {
    return <line x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke={c} strokeWidth="0.008" />
  }
  if (m.type === 'box') {
    const x = Math.min(g.x, g.x + g.w)
    const y = Math.min(g.y, g.y + g.h)
    return <rect x={x} y={y} width={Math.abs(g.w)} height={Math.abs(g.h)} fill="none" stroke={c} strokeWidth="0.008" />
  }
  if (m.type === 'text') {
    return (
      <text x={g.x} y={g.y} fill={c} fontSize="0.035" fontFamily="ui-monospace,monospace">
        {m.note || 'text'}
      </text>
    )
  }
  if (m.type === 'pin') {
    return (
      <g>
        <circle cx={g.x} cy={g.y} r="0.014" fill={c} />
        <path d={`M ${g.x} ${g.y} l 0.012 0.028`} stroke={c} strokeWidth="0.006" />
        {m.note ? (
          <text x={g.x + 0.02} y={g.y} fill={c} fontSize="0.028" fontFamily="ui-monospace,monospace">
            {m.note}
          </text>
        ) : null}
      </g>
    )
  }
  return null
}

export default function MarkupCanvas({ cadUrl, markups, onSave, readOnly, disabled }) {
  const svgRef = useRef(null)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#f5b942')
  const [note, setNote] = useState('')
  const [local, setLocal] = useState(markups || [])
  const [draft, setDraft] = useState(null)
  const drawing = useRef(false)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    setLocal(markups || [])
  }, [markups])

  function down(e) {
    if (readOnly || disabled || !cadUrl) return
    const svg = svgRef.current
    svg.setPointerCapture?.(e.pointerId)
    const p = toLocal(svg, e)
    drawing.current = true
    if (tool === 'pen') {
      setDraft({ type: 'pen', color, note, geometry: { points: [p] } })
    } else if (tool === 'line') {
      setDraft({ type: 'line', color, note, geometry: { x1: p.x, y1: p.y, x2: p.x, y2: p.y } })
    } else if (tool === 'box') {
      setDraft({ type: 'box', color, note, geometry: { x: p.x, y: p.y, w: 0, h: 0 } })
    } else if (tool === 'text') {
      const text = note || window.prompt('Text on CAD OSP DLR', 'splice')
      if (text) setLocal((m) => [...m, { id: nid('mk'), type: 'text', geometry: { x: p.x, y: p.y }, color, note: text }])
      drawing.current = false
    } else if (tool === 'pin') {
      setLocal((m) => [
        ...m,
        { id: nid('mk'), type: 'pin', geometry: { x: p.x, y: p.y }, color, note: note || 'pin' },
      ])
      drawing.current = false
    }
  }

  function move(e) {
    if (!drawing.current || !draft) return
    const p = toLocal(svgRef.current, e)
    if (draft.type === 'pen') {
      setDraft({ ...draft, geometry: { points: [...draft.geometry.points, p] } })
    } else if (draft.type === 'line') {
      setDraft({ ...draft, geometry: { ...draft.geometry, x2: p.x, y2: p.y } })
    } else if (draft.type === 'box') {
      setDraft({
        ...draft,
        geometry: { ...draft.geometry, w: p.x - draft.geometry.x, h: p.y - draft.geometry.y },
      })
    }
  }

  function up() {
    if (draft) setLocal((m) => [...m, { ...draft, id: nid('mk') }])
    setDraft(null)
    drawing.current = false
  }

  if (!cadUrl) {
    return (
      <div className="gate">
        Missing DLR — job-level schematic is not on LAB-1001. Enclosure CAD slot cannot hydrate.
      </div>
    )
  }

  return (
    <div>
      {!readOnly && (
        <div className="markup-tools">
          {TOOLS.map((t) => (
            <button key={t} type="button" className={tool === t ? 'on' : 'secondary'} onClick={() => setTool(t)} disabled={disabled}>
              {t}
            </button>
          ))}
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={color === c ? 'on' : 'secondary'}
              style={{ width: 28, height: 28, background: c, color: '#0a1628' }}
              onClick={() => setColor(c)}
              aria-label={'color ' + c}
            />
          ))}
          <input
            placeholder="note for pin/text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ background: '#0a1628', border: '1px solid #1e3d62', padding: '6px 8px', minWidth: 140 }}
          />
          <button type="button" className="secondary" disabled={disabled} onClick={() => setLocal([])}>
            Clear
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onSave(local)
              setSavedMsg('Markups saved on this enclosure')
            }}
          >
            Save markups
          </button>
        </div>
      )}
      <div className="cad-stage">
        <img src={cadUrl} alt="OSP DLR schematic" />
        <svg
          ref={svgRef}
          className={'cad-overlay' + (readOnly ? ' ro' : '')}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
        >
          {local.map((m) => (
            <MarkupShape key={m.id} m={m} />
          ))}
          {draft ? <MarkupShape m={{ ...draft, id: 'draft' }} /> : null}
        </svg>
      </div>
      <p className="muted">
        {local.length} markup(s) on enclosure CAD OSP DLR (pen / line / box / text / pin). Overlay on the schematic, not a job-photo pin.
        {readOnly ? ' Read-only on this review page.' : ''}
      </p>
      {savedMsg && <p className="ok-box">{savedMsg}</p>}
    </div>
  )
}

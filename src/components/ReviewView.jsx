import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import RoleNav from './RoleNav.jsx'
import CadSlot from './CadSlot.jsx'
import { cadPresent, jobDlr } from '../lib.js'
import HeuristicPane from './HeuristicPane.jsx'

export default function ReviewView({ mode }) {
  const { id } = useParams()
  const { enclosure, job, updateEnclosure } = useStore()
  const enc = enclosure(id)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => {
    const current = enclosure(id)
    setNotes(mode === 'noc' ? current?.nocNotes || '' : current?.engineerNotes || '')
    setSaved('')
  }, [id, mode])

  if (!enc) {
    return (
      <div className="page">
        <p className="gate">No enclosure {id}</p>
        <Link to="/">Job hub</Link>
      </div>
    )
  }

  const after = enc.photos?.after || []
  const cad = cadPresent(job, enc)
  const dlr = jobDlr(job)
  const isNoc = mode === 'noc'
  const chip = isNoc
    ? 'NOC review of enclosure ' + enc.label
    : 'Engineer review of enclosure ' + enc.label
  const noteKey = isNoc ? 'nocNotes' : 'engineerNotes'

  const checks = isNoc
    ? [
        { ok: enc.spanCount > 0, label: 'Spans present (' + enc.spanCount + ')' },
        { ok: cad, label: cad ? 'CAD OSP DLR present' : 'Missing DLR' },
        { ok: after.length >= 1, label: 'After photos (' + after.length + ')' },
        { ok: String(enc.nocNotes || notes).trim().length > 0, label: 'NOC notes on this enclosure' },
      ]
    : [
        { ok: enc.spanCount > 0 && enc.fibersSpliced > 0, label: 'Spans / fiber counts (' + enc.spanCount + ' / ' + enc.fibersSpliced + ')' },
        { ok: cad, label: cad ? 'CAD OSP DLR present' : 'Missing DLR' },
        { ok: after.length >= 1, label: 'After photos (' + after.length + ')' },
        { ok: String(enc.engineerNotes || notes).trim().length > 0, label: 'Engineer notes on this enclosure' },
      ]

  return (
    <div className="page">
      <RoleNav encId={enc.id} />
      <div className="row" style={{ marginBottom: 10 }}>
        <span className="chip">{chip}</span>
        <span className="job-id">{enc.jobId}</span>
      </div>
      <h1>{enc.label}</h1>
      <p className="muted">Same enclosure record as the tech page. Not GIS. Not Gantt. Not a second object.</p>
      <HeuristicPane enclosure={enc} job={job} />

      <div className="grid two" style={{ margin: '14px 0' }}>
        <div className="card">
          <h2>Spans / fiber counts</h2>
          <p>
            Case: {enc.caseType} · Placement: {enc.placement}
          </p>
          <p className="mono">
            spanCount={enc.spanCount} · fibersSpliced={enc.fibersSpliced}
          </p>
          <p className="muted">
            timeEntered {enc.timeEntered || '—'} · timeClosed {enc.timeClosed || '—'}
          </p>
        </div>
        <div className="card">
          <h2>{isNoc ? 'NOC checklist' : 'Engineer checklist'}</h2>
          <ul>
            {checks.map((c) => (
              <li key={c.label} className={c.ok ? 'good' : 'bad'}>
                {c.ok ? '✓' : '○'} {c.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {!dlr && <div className="gate">Missing DLR — job-level schematic is not on {enc.jobId}.</div>}

      <div className="card" style={{ marginBottom: 14 }}>
        <h2>After photos ({after.length})</h2>
        {after.length === 0 && <div className="gate">After-0 on this enclosure.</div>}
        <div className="gallery">
          {after.map((p) => (
            <div className="ph" key={p.id}>
              <img src={p.dataUrl} alt="After" />
              <div className="cap">after</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <CadSlot job={job} enclosure={enc} readOnly onSaveMarkups={() => {}} />
      </div>

      <div className="card">
        <h2>{isNoc ? 'NOC notes' : 'Engineer notes'}</h2>
        <p className="muted">Saved on the same enclosure record ({enc.id}).</p>
        <label className="field">
          {noteKey}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button
          type="button"
          onClick={() => {
            updateEnclosure(enc.id, { [noteKey]: notes })
            setSaved('Notes saved on enclosure ' + enc.id)
          }}
        >
          Save notes
        </button>
        {saved && <p className="ok-box">{saved}</p>}
      </div>
    </div>
  )
}

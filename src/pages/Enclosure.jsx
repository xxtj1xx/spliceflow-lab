import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import RoleNav from '../components/RoleNav.jsx'
import PhotoGallery from '../components/PhotoGallery.jsx'
import CadSlot from '../components/CadSlot.jsx'
import CompletenessFooter from '../components/CompletenessFooter.jsx'
import QrPanel from '../components/QrPanel.jsx'
import HeuristicPane from '../components/HeuristicPane.jsx'

export default function Enclosure() {
  const { id } = useParams()
  const nav = useNavigate()
  const { enclosure, job, saveEnclosure, submitEnclosure, updateEnclosure } = useStore()
  const stored = enclosure(id)
  const [draft, setDraft] = useState(stored)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setDraft(enclosure(id))
    setMsg('')
  }, [id])

  if (!stored || !draft) {
    return (
      <div className="page">
        <p className="gate">No enclosure {id}</p>
        <Link to="/">Job hub</Link>
      </div>
    )
  }

  const afterN = draft.photos?.after?.length || 0
  const blocked = afterN === 0

  function patch(fields) {
    setDraft((d) => ({ ...d, ...fields }))
  }

  function persistSave() {
    if (blocked) return
    saveEnclosure(id, {
      caseType: draft.caseType,
      placement: draft.placement,
      spanCount: Number(draft.spanCount) || 0,
      fibersSpliced: Number(draft.fibersSpliced) || 0,
      timeEntered: draft.timeEntered,
      timeClosed: draft.timeClosed,
      photos: draft.photos,
      markups: draft.markups,
      cadSlot: draft.cadSlot,
    })
    setMsg('Saved locally on this enclosure (lab JSON).')
  }

  function persistSubmit() {
    if (blocked) return
    submitEnclosure(id, {
      caseType: draft.caseType,
      placement: draft.placement,
      spanCount: Number(draft.spanCount) || 0,
      fibersSpliced: Number(draft.fibersSpliced) || 0,
      timeEntered: draft.timeEntered,
      timeClosed: draft.timeClosed,
      photos: draft.photos,
      markups: draft.markups,
      cadSlot: draft.cadSlot,
    })
    setMsg('Submitted locally on this enclosure. Not production.')
  }

  return (
    <div className="page">
      <RoleNav encId={id} />
      <div className="row">
        <span className="chip">ENCLOSURE</span>
        <span className="job-id">{draft.jobId}</span>
        {draft.submitted && <span className="chip ok">submitted (local)</span>}
      </div>
      <h1 className="mono">{draft.label}</h1>
      <p className="muted">
        id {draft.id} · counts live on this enclosure · photos are children · CAD OSP DLR hydrates from the job
      </p>

      {blocked && <div className="gate">After-0 — at least one After photo is required on this enclosure.</div>}

      <div className="card" style={{ margin: '14px 0' }}>
        <h2>Counts on this enclosure</h2>
        <div className="grid two">
          <label className="field">
            caseType
            <input value={draft.caseType} onChange={(e) => patch({ caseType: e.target.value })} />
          </label>
          <label className="field">
            placement
            <input value={draft.placement} onChange={(e) => patch({ placement: e.target.value })} />
          </label>
          <label className="field">
            spanCount
            <input
              type="number"
              value={draft.spanCount}
              onChange={(e) => patch({ spanCount: e.target.value })}
            />
          </label>
          <label className="field">
            fibersSpliced
            <input
              type="number"
              value={draft.fibersSpliced}
              onChange={(e) => patch({ fibersSpliced: e.target.value })}
            />
          </label>
          <label className="field">
            timeEntered
            <input value={draft.timeEntered} onChange={(e) => patch({ timeEntered: e.target.value })} placeholder="empty" />
          </label>
          <label className="field">
            timeClosed
            <input value={draft.timeClosed} onChange={(e) => patch({ timeClosed: e.target.value })} placeholder="empty" />
          </label>
        </div>
      </div>

      <PhotoGallery photos={draft.photos} onChange={(photos) => patch({ photos })} />

      <div className="card" style={{ margin: '14px 0' }}>
        <CadSlot
          job={job}
          enclosure={draft}
          onSaveMarkups={(markups) => {
            patch({ markups })
            saveEnclosure(id, {
              markups,
              photos: draft.photos,
              caseType: draft.caseType,
              placement: draft.placement,
              spanCount: Number(draft.spanCount) || 0,
              fibersSpliced: Number(draft.fibersSpliced) || 0,
              timeEntered: draft.timeEntered,
              timeClosed: draft.timeClosed,
              cadSlot: draft.cadSlot,
            })
          }}
        />
      </div>

      <QrPanel encId={id} qrLog={stored.qrLog} />

      <HeuristicPane enclosure={draft} job={job} />
      <CompletenessFooter enclosure={draft} job={job} />

      <div className="actions no-print">
        <button type="button" disabled={blocked} onClick={persistSave}>
          Save
        </button>
        <button type="button" disabled={blocked} onClick={persistSubmit}>
          Submit
        </button>
        <button
          type="button"
          className="secondary"
          disabled={blocked}
          onClick={() => {
            if (blocked) return
            persistSave()
            nav('/closeout/' + id)
          }}
        >
          Generate closeout from this enclosure
        </button>
      </div>
      {msg && <p className="ok-box">{msg}</p>}
    </div>
  )
}

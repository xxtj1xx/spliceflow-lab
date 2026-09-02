import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import RoleNav from '../components/RoleNav.jsx'
import { ENC_ID } from '../seed.js'
import { cadPresent, jobDlr } from '../lib.js'

export default function JobHub() {
  const { job, enclosure, removeJobDlr, restoreJobDlr, hydrateNow } = useStore()
  const enc = enclosure(ENC_ID)
  const dlr = jobDlr(job)
  const afterN = enc?.photos?.after?.length || 0
  const cad = enc ? cadPresent(job, enc) : false

  return (
    <div className="page">
      <RoleNav encId={ENC_ID} />
      <p className="chip">JOB</p>
      <h1>
        <span className="job-id">{job.id}</span> {job.title}
      </h1>
      <p className="muted">
        CLLI site <span className="mono">{job.clli}</span> · synthetic lab record
      </p>

      <div className="grid two" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Enclosure</h2>
          {enc ? (
            <>
              <p>
                <Link to={'/enclosure/' + enc.id} className="mono">
                  {enc.label}
                </Link>
              </p>
              <p className="muted">
                {enc.caseType} · remaining {enc.remainingFt ?? "—"} ft · fibers {enc.counts?.plannedFibers ?? enc.fibersSpliced}
              </p>
              <p>
                After photos: {afterN}{' '}
                {afterN === 0 && <span className="chip warn">After-0</span>}
              </p>
              <p>CAD OSP DLR: {cad ? 'hydrated from job DLR' : 'missing DLR'}</p>
              <div className="actions">
                <button type="button" className="secondary" onClick={() => hydrateNow(enc.id)}>Hydrate CAD from job DLR</button>
                <Link className="btn" to={'/enclosure/' + enc.id}>
                  Open enclosure
                </Link>
                {afterN >= 1 ? (
                  <Link className="btn secondary" to={'/closeout/' + enc.id}>
                    Generate closeout from this enclosure
                  </Link>
                ) : (
                  <span className="btn secondary" aria-disabled="true">
                    Generate closeout from this enclosure
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="gate">No enclosure on this job.</p>
          )}
        </div>

        <div className="card">
          <h2>Job paperwork — DLR</h2>
          {dlr ? (
            <>
              <p className="mono">{dlr.name}</p>
              <p className="muted">
                This DLR sits on the job and hydrates the enclosure CAD slot.
              </p>
              {dlr.svgDataUrl && (
                <img src={dlr.svgDataUrl} alt="Job DLR schematic" style={{ width: '100%', border: '1px solid rgba(245,185,66,0.35)' }} />
              )}
              <div className="actions">
                <button type="button" className="danger" onClick={removeJobDlr}>
                  Remove job DLR (lab test)
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="gate">Job DLR removed. Enclosure CAD will show missing DLR until restored.</div>
              <button type="button" onClick={restoreJobDlr}>
                Restore seed DLR
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card stub-card" style={{ marginTop: 14 }}>
        <div className="row">
          <h2 style={{ margin: 0 }}>Clad slice — pending public list</h2>
          <span className="chip stub">STUB</span>
        </div>
        <p>
          Clad public best-feature list is still being researched. This Lab panel is an honest placeholder. Nothing here is a Clad capability.
        </p>
      </div>
    </div>
  )
}

import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import RoleNav from '../components/RoleNav.jsx'
import { cadPresent, dash, qrHref } from '../lib.js'

export default function Closeout() {
  const { id } = useParams()
  const { enclosure, job } = useStore()
  const enc = enclosure(id)

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
  const href = qrHref(enc.id)

  return (
    <div className="page">
      <RoleNav encId={enc.id} />
      <p className="chip">CLOSEOUT</p>
      <h1>Closeout packet from enclosure {enc.label}</h1>
      <p className="muted">
        Generated FROM this enclosure record. Fields not on the record print as —. Not invented paperwork.
      </p>
      <div className="actions no-print">
        <button type="button" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>
      <div className="packet">
        <h1>SpliceFlow Lab closeout</h1>
        <p>Synthetic tester, not production. Packet source: enclosure {enc.id}</p>
        <div className="k">
          <div>jobId</div><div>{enc.jobId}</div>
          <div>enclosure label</div><div>{enc.label}</div>
          <div>enclosure id</div><div>{enc.id}</div>
          <div>caseType</div><div>{dash(enc.caseType)}</div>
          <div>placement</div><div>{dash(enc.placement)}</div>
          <div>spanCount</div><div>{dash(enc.spanCount)}</div>
          <div>fibersSpliced</div><div>{dash(enc.fibersSpliced)}</div>
          <div>timeEntered</div><div>{dash(enc.timeEntered)}</div>
          <div>timeClosed</div><div>{dash(enc.timeClosed)}</div>
          <div>After photos</div><div>{after.length}</div>
          <div>CAD OSP DLR</div><div>{cad ? 'yes (hydrated from job DLR)' : 'no — missing DLR'}</div>
          <div>markup count</div><div>{enc.markups?.length || 0}</div>
          <div>engineerNotes</div><div>{dash(enc.engineerNotes)}</div>
          <div>nocNotes</div><div>{dash(enc.nocNotes)}</div>
          <div>QR deep link</div><div>{href}</div>
        </div>
        <h2>After photos</h2>
        {after.length === 0 ? (
          <p>After = 0 on this enclosure. Closeout still prints the record; Save/Submit stay gated on the form.</p>
        ) : (
          <div className="thumbs">
            {after.map((p) => (
              <img key={p.id} src={p.dataUrl} alt={p.name || 'after'} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

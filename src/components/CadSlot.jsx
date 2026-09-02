import React from 'react'
import MarkupCanvas from './MarkupCanvas.jsx'
import { jobDlr } from '../lib.js'

export default function CadSlot({ job, enclosure, onSaveMarkups, readOnly }) {
  const dlr = jobDlr(job)
  const missing = !dlr
  const hydrated = !!enclosure.cadSlot && !missing

  return (
    <section>
      <h2>CAD OSP DLR — enclosure schematic (markup + save)</h2>
      {hydrated ? (
        <p className="muted">
          Hydrated from job DLR on LAB-1001 (job-level DLR → enclosure CAD slot). Not a separate upload on this enclosure.
        </p>
      ) : (
        <div className="gate">
          Missing DLR — the job-level schematic was removed from LAB-1001. Enclosure CAD slot cannot hydrate.
        </div>
      )}
      {enclosure.cadSlot && (
        <p className="mono muted">
          cadSlot source={enclosure.cadSlot.source || 'job'} · dlrId={enclosure.cadSlot.dlrId || '—'}
        </p>
      )}
      <MarkupCanvas
        cadUrl={dlr?.svgDataUrl || null}
        markups={enclosure.markups || []}
        onSave={onSaveMarkups}
        readOnly={readOnly || missing}
        disabled={missing}
      />
    </section>
  )
}

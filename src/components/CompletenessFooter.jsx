import React from 'react'
import { cadPresent } from '../lib.js'

export default function CompletenessFooter({ enclosure, job }) {
  const afterN = enclosure.photos?.after?.length || 0
  const beforeN = enclosure.photos?.before?.length || 0
  const cad = cadPresent(job, enclosure)
  const requiredOk = afterN >= 1

  return (
    <footer className="completeness">
      <h3>Completeness on this enclosure</h3>
      <ul>
        <li className={afterN >= 1 ? 'good' : 'bad'}>
          After photos: {afterN}
          {afterN === 0 ? ' — After-0 gate (required)' : ''}
        </li>
        <li className={cad ? 'good' : 'bad'}>CAD OSP DLR: {cad ? 'present (hydrated from job DLR)' : 'missing DLR'}</li>
        <li>Before photos: {beforeN} (optional)</li>
        <li>Markups: {enclosure.markups?.length || 0}</li>
        <li>Remaining footage: {enclosure.remainingFt ?? "—"} ft</li>
      </ul>
      {!requiredOk && (
        <p className="gate">QUALITY GATE · After = 0. Required items are not complete. Save and Submit blocked.</p>
      )}
      {requiredOk && <p className="ok-box">Required After photo is present. Save is enabled.</p>}
    </footer>
  )
}

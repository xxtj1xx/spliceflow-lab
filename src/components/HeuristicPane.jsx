import React from 'react'
import { cadPresent, jobDlr } from '../lib.js'

export default function HeuristicPane({ enclosure, job }) {
  const afterN = enclosure?.photos?.after?.length || 0
  const missingAfter = afterN === 0
  const cad = cadPresent(job, enclosure)
  const emptyCounts = !(Number(enclosure?.spanCount) > 0 && Number(enclosure?.fibersSpliced) > 0)
  const red = []
  if (missingAfter) red.push('After=0')
  if (!cad) red.push('missing DLR')
  if (emptyCounts) red.push('empty counts')
  if (!enclosure?.publishedMarkup) red.push('published markup missing')
  const packet = []
  if (missingAfter) packet.push('After photos missing — closeout packet incomplete')
  if (!cad) packet.push('No CAD OSP DLR on enclosure')
  if (!enclosure?.timeEntered || !enclosure?.timeClosed) packet.push('Time in/out empty')
  if (!String(enclosure?.placement || '').trim()) packet.push('Placement unset (will print as — ; not invented)')
  return (
    <div className="card heuristic" data-testid="heuristic-ai">
      <h3>HEURISTIC · not a live model</h3>
      <p className="muted">Labeled HEURISTIC. Pure functions over enclosure state. No live model.</p>
      <p><strong>Missing After:</strong> {missingAfter ? 'After photos = 0 on this enclosure' : 'After = ' + afterN + ' (gate open)'}</p>
      <p><strong>Packet draft</strong></p>
      {packet.length ? <ul>{packet.map((x) => <li key={x}>{x}</li>)}</ul> : <p>No missing packet items from current fields.</p>}
      <p><strong>Circuit red-because</strong></p>
      {red.length ? <ul>{red.map((x) => <li key={x}>{x}</li>)}</ul> : <p>No red reasons.</p>}
      <p className="muted">Job DLR: {jobDlr(job) ? 'present' : 'removed'} · CAD slot: {cad ? 'hydrated' : 'empty'}</p>
    </div>
  )
}

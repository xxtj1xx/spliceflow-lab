import React from 'react'

const KEEP = [
  { name: 'Clad', steal: 'Counts on the enclosure, CAD markup tied to those counts, remaining footage with the capture. Not Clad billing production.' },
  { name: 'Procore', steal: 'Photos as children of the enclosure, markup that publishes to the record, pin on CAD, After-0 before pass, offline then sync.' },
  { name: 'Render', steal: 'Job DLR hydrates enclosure tasks, mandatory capture at the task, closeout from that record. Not a Gantt.' },
  { name: 'IQGeo', steal: 'Engineer/NOC trace and schematic as the enclosure DLR view. Not a GIS clone.' },
  { name: 'Sitetracker', steal: 'On-site check-in, required photo, QR in/out of this enclosure, closeout package from the record.' },
  { name: 'VETRO', steal: 'Mandatory splice photo, required fields, as-designed vs change, history on this enclosure. Not FiberMap GIS.' },
]

export default function Clad() {
  return (
    <div className="page">
      <div className="card">
        <h2>KEEP — Lab only</h2>
        <p>
          Public raid, folded onto this enclosure. Not spliceflow.app. Not a clone of any of these tools.
          SpliceFlow Lab does not invent Clad features.
        </p>
        <p className="muted">Steal attachment-to-the-enclosure and capture-once → as-built. Skip invoices, 811, Gantt, OSS.</p>
        <ul>
          {KEEP.map((row) => (
            <li key={row.name}><strong>{row.name}</strong> — {row.steal}</li>
          ))}
        </ul>
        <ul>
          <li>NO invoices</li>
          <li>NO 811</li>
          <li>NO Gantt</li>
          <li>NO OSS</li>
        </ul>
      </div>
    </div>
  )
}

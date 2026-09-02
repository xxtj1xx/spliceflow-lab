import React, { useState } from 'react'
import { compressImageFile, nid } from '../lib.js'

function FileBtn({ label, capture, disabled, onFiles }) {
  return (
    <label className="file-btn btn secondary">
      {label}
      <input
        type="file"
        accept="image/*"
        capture={capture}
        disabled={disabled}
        onChange={(e) => {
          onFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </label>
  )
}

export default function PhotoGallery({ photos, onChange, onSynthetic, onRemove }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const before = photos?.before || []
  const after = photos?.after || []

  async function addFiles(kind, files) {
    setErr('')
    const list = Array.from(files || [])
    if (!list.length) return
    setBusy(true)
    try {
      const added = []
      for (const file of list) {
        const dataUrl = await compressImageFile(file)
        added.push({ id: nid(kind), name: file.name, dataUrl, addedAt: new Date().toISOString(), kind })
      }
      onChange({ ...photos, [kind]: [...(photos[kind] || []), ...added] })
    } catch (e) {
      setErr(String(e.message || e))
    }
    setBusy(false)
  }

  function bucket(kind, list) {
    const isAfter = kind === 'after'
    return (
      <div>
        <strong>{isAfter ? 'After' : 'Before'} ({list.length})</strong>
        <div className="actions">
          <FileBtn label={isAfter ? 'Capture After (camera)' : 'Capture Before (camera)'} capture="environment" disabled={busy} onFiles={(f) => addFiles(kind, f)} />
          <FileBtn label={isAfter ? 'Add After from gallery' : 'Add Before from gallery'} disabled={busy} onFiles={(f) => addFiles(kind, f)} />
          {onSynthetic && (
            <button type="button" className="secondary" onClick={() => onSynthetic(kind)}>
              Add synthetic {kind}
            </button>
          )}
        </div>
        {isAfter && list.length === 0 && <div className="gate">After = 0 — camera and gallery both count</div>}
        <div className="gallery">
          {list.map((p) => (
            <div key={p.id} className="ph">
              <img src={p.dataUrl} alt={p.name || kind} />
              <div className="cap">{kind}</div>
              {onRemove && (
                <button type="button" className="secondary" onClick={() => onRemove(kind, p.id)}>x</button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Photos on this enclosure</h2>
      <p className="muted">Camera capture and gallery/file picker both count. After-0 blocks Save/Submit on this enclosure.</p>
      {err && <p className="gate">{err}</p>}
      <div className="grid two">
        {bucket('before', before)}
        {bucket('after', after)}
      </div>
    </div>
  )
}

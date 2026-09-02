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

export default function PhotoGallery({ photos, onChange }) {
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
        added.push({
          id: nid(kind),
          name: file.name,
          dataUrl,
          addedAt: new Date().toISOString(),
          kind,
        })
      }
      onChange({ ...photos, [kind]: [...(photos[kind] || []), ...added] })
    } catch (e) {
      setErr(String(e.message || e))
    }
    setBusy(false)
  }

  function remove(kind, id) {
    onChange({ ...photos, [kind]: (photos[kind] || []).filter((p) => p.id !== id) })
  }

  return (
    <div className="card">
      <h2>Photos on this enclosure</h2>
      <p className="muted">
        Camera capture and gallery/file picker both count. After-0 blocks Save/Submit on this enclosure.
      </p>
      {err && <p className="gate">{err}</p>}
      <div className="grid two">
        <div>
          <strong>Before ({before.length})</strong>
          <div className="actions">
            <FileBtn label="Capture Before (camera)" capture="environment" disabled={busy} onFiles={(f) => addFiles('before', f)} />
            <FileBtn label="Add Before from gallery" disabled={busy} onFiles={(f) => addFiles('before', f)} />
          </div>
          <div className="gallery">
            {before.length === 0 && <div className="ph"><div className="cap">none</div></div>}
            {before.map((p) => (
              <div className="ph" key={p.id}>
                <img src={p.dataUrl} alt={p.name || 'before'} />
                <div className="cap">before</div>
                <button type="button" className="secondary" onClick={() => remove('before', p.id)}>x</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <strong>After ({after.length})</strong>
          <div className="actions">
            <FileBtn label="Capture After (camera)" capture="environment" disabled={busy} onFiles={(f) => addFiles('after', f)} />
            <FileBtn label="Add After from gallery" disabled={busy} onFiles={(f) => addFiles('after', f)} />
          </div>
          {after.length === 0 && <div className="gate">After = 0 — gallery and camera both count</div>}
          <div className="gallery">
            {after.map((p) => (
              <div className="ph" key={p.id}>
                <img src={p.dataUrl} alt={p.name || 'after'} />
                <div className="cap">after</div>
                <button type="button" className="secondary" onClick={() => remove('after', p.id)}>x</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

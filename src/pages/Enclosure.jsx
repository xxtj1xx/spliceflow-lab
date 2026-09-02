import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useStore } from "../store.jsx"
import RoleNav from "../components/RoleNav.jsx"
import PhotoGallery from "../components/PhotoGallery.jsx"
import CadSlot from "../components/CadSlot.jsx"
import CompletenessFooter from "../components/CompletenessFooter.jsx"
import QrPanel from "../components/QrPanel.jsx"
import HeuristicPane from "../components/HeuristicPane.jsx"
import LabPanel from "../components/LabPanel.jsx"

export default function Enclosure() {
  const { id } = useParams()
  const nav = useNavigate()
  const api = useStore()
  const stored = api.enclosure(id)
  const [draft, setDraft] = useState(stored)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    setDraft(api.enclosure(id))
    setMsg("")
  }, [id, api.state])

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
  const counts = draft.counts || {}

  function patch(fields) { setDraft((d) => ({ ...d, ...fields })) }

  function persistSave() {
    if (blocked) { setMsg("QUALITY GATE · After = 0 blocks Save"); return }
    api.saveEnclosure(id, {
      caseType: draft.caseType, placement: draft.placement,
      spanCount: Number(draft.spanCount) || 0, fibersSpliced: Number(draft.fibersSpliced) || 0,
      remainingFt: Number(draft.remainingFt) || 0, counts: draft.counts,
      timeEntered: draft.timeEntered, timeClosed: draft.timeClosed,
      photos: draft.photos, markups: draft.markups, cadSlot: draft.cadSlot,
      redline: draft.redline,
    })
    setMsg("Saved locally on this enclosure.")
  }

  function persistSubmit() {
    if (blocked) { setMsg("QUALITY GATE · After = 0 blocks Submit"); return }
    api.submitEnclosure(id, {
      caseType: draft.caseType, placement: draft.placement,
      spanCount: Number(draft.spanCount) || 0, fibersSpliced: Number(draft.fibersSpliced) || 0,
      remainingFt: Number(draft.remainingFt) || 0, counts: draft.counts,
      timeEntered: draft.timeEntered, timeClosed: draft.timeClosed,
      photos: draft.photos, markups: draft.markups, cadSlot: draft.cadSlot,
      redline: draft.redline,
    })
    setMsg("Submitted locally on this enclosure. Not production.")
  }

  return (
    <div className="page">
      <RoleNav encId={id} />
      <div className="row">
        <span className="chip">ENCLOSURE</span>
        <span className="job-id">{draft.jobId}</span>
        <span className={"chip " + (blocked ? "warn" : "ok")}>{blocked ? "QUALITY GATE · After = 0" : "QUALITY GATE · After " + afterN}</span>
        {draft.submitted && <span className="chip ok">submitted (local)</span>}
      </div>
      <h1 className="mono">{draft.label} · {draft.code || draft.id}</h1>
      <p className="muted">Counts live on this enclosure · photos are children · CAD OSP DLR hydrates from the job · remaining footage sits with this capture</p>

      {blocked && <div className="gate">QUALITY GATE · After = 0 — Save and Submit blocked until at least one After photo lives on this enclosure.</div>}

      <HeuristicPane enclosure={draft} job={api.job} />

      <div className="card" style={{ margin: "14px 0" }}>
        <h2>Counts on this enclosure</h2>
        <div className="grid two">
          <label className="field">planned fibers<input type="number" value={counts.plannedFibers ?? ""} onChange={(e) => patch({ counts: { ...counts, plannedFibers: Number(e.target.value) } })} /></label>
          <label className="field">actual spliced<input type="number" value={counts.actualSpliced ?? draft.fibersSpliced} onChange={(e) => patch({ counts: { ...counts, actualSpliced: Number(e.target.value) }, fibersSpliced: Number(e.target.value) })} /></label>
          <label className="field">planned drops<input type="number" value={counts.drops ?? ""} onChange={(e) => patch({ counts: { ...counts, drops: Number(e.target.value) } })} /></label>
          <label className="field">actual drops<input type="number" value={counts.actualDrops ?? ""} onChange={(e) => patch({ counts: { ...counts, actualDrops: Number(e.target.value) } })} /></label>
          <label className="field">remaining footage (ft)<input type="number" value={draft.remainingFt ?? ""} onChange={(e) => patch({ remainingFt: Number(e.target.value) })} /></label>
          <label className="field">case type<input value={draft.caseType || ""} onChange={(e) => patch({ caseType: e.target.value })} /></label>
        </div>
      </div>

      <div className="card" style={{ margin: "14px 0" }}>
        <h2>Sequenced enclosure tasks</h2>
        <p className="muted">Not a Gantt. Ordered 1..n on this enclosure. Capture tasks require the child photo.</p>
        <ol className="task-seq">
          {(draft.tasks || []).map((t) => {
            const need = t.requiresPhoto
            const has = need ? (draft.photos?.[need] || []).length >= 1 : true
            return (
              <li key={t.id} className={t.done ? "good" : ""}>
                <span className="mono">{t.seq}</span> {t.name} {t.done ? "✓" : "○"}
                {need && !has && <span className="chip warn">mandatory capture · {need}</span>}
                <button type="button" className="secondary" disabled={t.done || !has} onClick={() => api.completeTask(id, t.id)}>
                  {t.done ? "done" : (has ? "Mark done" : "blocked") }
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <PhotoGallery
        photos={draft.photos}
        onChange={(photos) => patch({ photos })}
        onSynthetic={(kind) => api.addSyntheticPhoto(id, kind)}
        onRemove={(kind, photoId) => api.removePhoto(id, kind, photoId)}
      />

      <div className="card" style={{ margin: "14px 0" }}>
        <CadSlot
          job={api.job}
          enclosure={draft}
          onSaveMarkups={(markups) => {
            patch({ markups })
            api.updateEnclosure(id, { markups })
          }}
          onPublish={() => api.publishMarkup(id)}
        />
        {stored.publishedMarkup && <p className="ok-box">Published to record {stored.publishedMarkup.at} by {stored.publishedMarkup.by}</p>}
      </div>

      <div className="card" style={{ margin: "14px 0" }}>
        <h2>Field redline (one record)</h2>
        <p className="muted">One redline note on ENC-V12. Not a second document system.</p>
        <textarea value={draft.redline?.note || ""} onChange={(e) => patch({ redline: { ...(draft.redline || {}), note: e.target.value } })} />
        <button type="button" className="secondary" onClick={() => api.updateEnclosure(id, { redline: draft.redline })}>Save redline on this enclosure</button>
      </div>

      <QrPanel
        encId={id}
        qrLog={stored.qrLog}
        checkIn={stored.checkIn}
        mockOnSite={api.mockOnSite}
        onQrIn={() => api.qrIn(id)}
        onQrOut={() => api.qrOut(id)}
        onToggleSite={() => api.toggleMockOnSite()}
      />

      <CompletenessFooter enclosure={draft} job={api.job} />

      <div className="actions no-print">
        <button type="button" disabled={blocked} onClick={persistSave}>Save</button>
        <button type="button" disabled={blocked} onClick={persistSubmit}>Submit</button>
        <button type="button" className="secondary" disabled={blocked} onClick={() => { if (blocked) return; persistSave(); nav("/closeout/" + id) }}>
          Generate closeout from this enclosure
        </button>
      </div>
      {msg && <p className={blocked ? "gate" : "ok-box"}>{msg}</p>}

      <div className="card" style={{ marginTop: 14 }}>
        <h2>History on this enclosure</h2>
        <div className="hist">
          {(stored.history || []).slice().reverse().map((h) => (
            <div key={h.id}>{h.at} · {h.role} · {h.action}</div>
          ))}
        </div>
      </div>

      <LabPanel />
    </div>
  )
}

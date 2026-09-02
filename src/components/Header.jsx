import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useStore } from "../store.jsx"
import { JOB_ID } from "../seed.js"

const ROLES = ["tech", "pm", "engineer", "noc", "admin"]

export default function Header() {
  const { session, logout, switchRole, forceOffline, toggleForceOffline, pendingSync, syncPending } = useStore()
  const nav = useNavigate()
  if (!session) return null
  const pending = (pendingSync || []).length
  return (
    <header className="lab-header no-print">
      <div className="brand">
        <strong>SpliceFlow Lab</strong>
        <Link className="job-id" to="/" title="Plant hub">{JOB_ID}</Link>
      </div>
      <div className="who">
        <label className="role-switch">
          role
          <select value={session.role} onChange={(e) => switchRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <span className="email">{session.email}</span>
        <button type="button" className={forceOffline ? "danger" : "secondary"} onClick={toggleForceOffline}>
          {forceOffline ? "Force offline ON" : "Force offline"}
        </button>
        <button type="button" className="secondary" onClick={syncPending}>Sync{pending ? " (" + pending + ")" : ""}</button>
        <button type="button" className="secondary" onClick={() => { logout(); nav("/login") }}>Log out</button>
      </div>
    </header>
  )
}

import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { JOB_ID } from '../seed.js'

export default function Header() {
  const { session, logout, switchRole } = useStore()
  const nav = useNavigate()
  if (!session) return null
  return (
    <header className="lab-header no-print">
      <div className="brand">
        <strong>SpliceFlow Lab</strong>
        <Link className="job-id" to="/" title="Job hub">
          {JOB_ID}
        </Link>
      </div>
      <div className="who">
                <span className="muted">Lab tester, not production auth</span>
        <select value={session.role} onChange={(e) => switchRole(e.target.value)}>
          {['contractor','tech','pm','engineer','noc','admin'].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <Link to="/clad">KEEP</Link>
        <span className="chip role">{session.role}</span>
        <span className="email">{session.email}</span>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            logout()
            nav('/login')
          }}
        >
          Log out
        </button>
      </div>
    </header>
  )
}

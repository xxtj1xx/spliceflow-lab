import React from 'react'
import { Link } from 'react-router-dom'
import { ENC_ID, JOB_ID } from '../seed.js'
import { useStore } from '../store.jsx'

export default function Offline() {
  const { session } = useStore()
  return (
    <div className="page">
      <div className="card">
        <h1>Offline</h1>
        <div className="warn-box">Offline — enclosure form is cached locally.</div>
        <p className="muted">
          SpliceFlow Lab service worker caches the app shell. This is a local tester, not production sync.
        </p>
        {session ? (
          <div className="actions">
            <Link className="btn" to={'/enclosure/' + ENC_ID}>
              Open enclosure {ENC_ID}
            </Link>
            <Link className="btn secondary" to="/">
              Job {JOB_ID}
            </Link>
          </div>
        ) : (
          <div className="actions">
            <Link className="btn" to="/login">
              Sign in (from cache)
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

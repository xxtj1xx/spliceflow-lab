import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { mintPassword } from '../lib.js'
import { ENC_ID, JOB_ID } from '../seed.js'

export default function AdminInvites() {
  const { users, mintInvite, resetSeed } = useStore()
  const [email, setEmail] = useState('crew2@lab.local')
  const [role, setRole] = useState('tech')
  const [once, setOnce] = useState(null)
  const [err, setErr] = useState('')

  function onMint(e) {
    e.preventDefault()
    const password = mintPassword()
    const r = mintInvite(email, role, password)
    if (!r.ok) {
      setErr(r.error)
      setOnce(null)
      return
    }
    setErr('')
    setOnce(r)
  }

  return (
    <div className="page">
      <p className="chip">ADMIN</p>
      <h1>Mint-password invites</h1>
      <p className="muted">
        No public Create account. Admin mints a password for an email. /login is Sign in only.
      </p>
      <p>
        Job link: <Link className="job-id" to="/">{JOB_ID}</Link>
        {' · '}
        <Link to={'/enclosure/' + ENC_ID}>enclosure {ENC_ID}</Link>
      </p>

      <form className="card" onSubmit={onMint} style={{ marginTop: 14, maxWidth: 520 }}>
        <label className="field">
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
        </label>
        <label className="field">
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="tech">tech</option>
            <option value="pm">pm</option>
            <option value="engineer">engineer</option>
            <option value="noc">noc</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <button type="submit">Mint password</button>
        {err && <p className="gate">{err}</p>}
        {once && (
          <div className="mint-once">
            <p>
              Minted for <strong>{once.email}</strong> ({once.role})
            </p>
            <p>Password (shown once — hand it to the contractor):</p>
            <p>
              <code>{once.password}</code>
            </p>
          </div>
        )}
      </form>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Local users</h2>
        <table className="seed-table">
          <thead>
            <tr>
              <th>email</th>
              <th>role</th>
              <th>mintedAt</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.mintedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">Passwords stay in local JSON for this lab tester. Not a production directory.</p>
        <button type="button" className="secondary" onClick={resetSeed}>
          Reset synthetic seed
        </button>
      </div>
    </div>
  )
}

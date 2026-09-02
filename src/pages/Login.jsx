import React, { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { landingFor } from '../lib.js'
import { SEEDED_LOGINS } from '../seed.js'

export default function Login() {
  const { session, login } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [params] = useSearchParams()
  const next = params.get('next')

  if (session) return <Navigate to={next || landingFor(session.role)} replace />

  function onSubmit(e) {
    e.preventDefault()
    const r = login(email, password)
    if (!r.ok) setErr(r.error)
  }

  return (
    <div className="page">
      <div className="card login-box">
        <h1>Sign in</h1>
        <p className="muted">Your admin mints accounts. No public signup.</p>
        <form onSubmit={onSubmit}>
          <label className="field">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              inputMode="email"
            />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {err && <p className="gate">{err}</p>}
          <button type="submit">Sign in</button>
        </form>
        <p className="muted" style={{ marginTop: 12 }}>
          Sign in only. No Create account. Uninvited emails cannot register.
        </p>
      </div>
      <div className="card" style={{ maxWidth: 560, margin: '16px auto' }}>
        <h2>Seeded lab accounts</h2>
        <p className="muted">Synthetic only. Not production identities.</p>
        <table className="seed-table">
          <thead>
            <tr>
              <th>email</th>
              <th>password</th>
              <th>role</th>
            </tr>
          </thead>
          <tbody>
            {SEEDED_LOGINS.map((u) => (
              <tr key={u.email}>
                <td>{u.email}</td>
                <td>{u.password}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

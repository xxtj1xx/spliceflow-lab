import React, { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'

export default function QrLanding() {
  const { id } = useParams()
  const { session, enclosure, logQrOpen } = useStore()
  const nav = useNavigate()
  const enc = enclosure(id)
  const once = useRef(false)

  useEffect(() => {
    if (!session || !enc || once.current) return
    once.current = true
    logQrOpen(id, session.email, session.role)
    nav('/enclosure/' + id, { replace: true })
  }, [session, enc, id, logQrOpen, nav])

  if (!enc) {
    return (
      <div className="page">
        <p className="gate">No splice case {id}</p>
        <Link to="/">Job hub</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <p className="muted">Logging QR open for {enc.label}…</p>
    </div>
  )
}

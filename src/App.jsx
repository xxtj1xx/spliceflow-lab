import React from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store.jsx'
import LabBanner from './components/LabBanner.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'
import Header from './components/Header.jsx'
import Login from './pages/Login.jsx'
import JobHub from './pages/JobHub.jsx'
import Enclosure from './pages/Enclosure.jsx'
import Engineer from './pages/Engineer.jsx'
import Noc from './pages/Noc.jsx'
import Closeout from './pages/Closeout.jsx'
import AdminInvites from './pages/AdminInvites.jsx'
import QrLanding from './pages/QrLanding.jsx'
import Offline from './pages/Offline.jsx'
import Clad from './pages/Clad.jsx'

function RequireAuth() {
  const { session } = useStore()
  const loc = useLocation()
  if (!session) {
    const next = loc.pathname + loc.search
    return <Navigate to={'/login?next=' + encodeURIComponent(next)} replace />
  }
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

function AdminOnly() {
  const { session } = useStore()
  if (session?.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <div className="app">
      <LabBanner />
      <OfflineBanner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/offline" element={<Offline />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<JobHub />} />
          <Route path="/enclosure/:id" element={<Enclosure />} />
          <Route path="/enclosure/:id/engineer" element={<Engineer />} />
          <Route path="/enclosure/:id/noc" element={<Noc />} />
          <Route path="/closeout/:id" element={<Closeout />} />
          <Route path="/qr/:id" element={<QrLanding />} />
          <Route path="/e/:id" element={<QrLanding />} />
          <Route path="/clad" element={<Clad />} />
          <Route element={<AdminOnly />}>
            <Route path="/admin/invites" element={<AdminInvites />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

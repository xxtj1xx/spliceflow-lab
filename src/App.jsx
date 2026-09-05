import { Navigate, Route, Routes } from "react-router-dom"
import { useStore } from "./store"
import { Login, TechHome, Enclosure } from "./screens1"
import { QR } from "./screen-qr"
import { PM } from "./screen-pm"
import { Engineer } from "./screen-eng"
import { NOC } from "./screen-noc"
import { Closeout } from "./screen-close"
import { Invite } from "./screen-inv"

function Guard({ children }) {
  const { state } = useStore()
  if (!state.session.authed) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<Guard><TechHome /></Guard>} />
      <Route path="/app/enclosure/:id" element={<Guard><Enclosure /></Guard>} />
      <Route path="/app/qr" element={<Guard><QR /></Guard>} />
      <Route path="/app/pm" element={<Guard><PM /></Guard>} />
      <Route path="/app/engineer" element={<Guard><Engineer /></Guard>} />
      <Route path="/app/noc" element={<Guard><NOC /></Guard>} />
      <Route path="/app/closeout/:id" element={<Guard><Closeout /></Guard>} />
      <Route path="/app/invite" element={<Guard><Invite /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

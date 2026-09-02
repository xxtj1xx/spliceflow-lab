import React, { useEffect, useState } from "react"
import { useStore } from "../store.jsx"

export default function OfflineBanner() {
  const { forceOffline } = useStore()
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener("online", on)
    window.addEventListener("offline", off)
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off) }
  }, [])
  if (online && !forceOffline) return null
  return (
    <div className="offline-banner" role="status">
      {forceOffline ? "Force offline (lab) — mutations queue for later sync." : "Offline — enclosure form is cached locally"}
    </div>
  )
}

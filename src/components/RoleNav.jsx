import React from 'react'
import { NavLink } from 'react-router-dom'
import { useStore } from '../store.jsx'

export default function RoleNav({ encId }) {
  const { session } = useStore()
  return (
    <nav className="role-nav no-print" aria-label="Enclosure roles">
      <NavLink to="/" end>
        Job hub
      </NavLink>
      <NavLink to={'/enclosure/' + encId} end>
        Enclosure (tech)
      </NavLink>
      <NavLink to={'/enclosure/' + encId + '/engineer'}>Engineer</NavLink>
      <NavLink to={'/enclosure/' + encId + '/noc'}>NOC</NavLink>
      <NavLink to={'/closeout/' + encId}>Closeout</NavLink>
      {session?.role === 'admin' && <NavLink to="/admin/invites">Admin invites</NavLink>}
    </nav>
  )
}

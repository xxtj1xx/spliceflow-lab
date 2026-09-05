import { useState } from "react"
import { useStore } from "./store"
import { Layout } from "./ui-banner"

export function Invite() {
  const { state, invite } = useStore()
  const [email, setEmail] = useState("crew@lab.local")
  return (
    <Layout>
      <div className="card">
        <h2>Invite · mint password (local)</h2>
        <div className="row">
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn-primary" onClick={() => invite(email)}>Mint password</button>
        </div>
        <table className="table">
          <thead><tr><th>Email</th><th>Minted password</th></tr></thead>
          <tbody>{state.invites.map((i) => <tr key={i.id}><td>{i.email}</td><td><code>{i.password}</code></td></tr>)}</tbody>
        </table>
      </div>
    </Layout>
  )
}

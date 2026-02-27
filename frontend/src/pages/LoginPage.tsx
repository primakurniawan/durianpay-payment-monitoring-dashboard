import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../lib/axios"
import { useAuthStore } from "../features/auth/authStore"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()

  const handleLogin = async () => {
    const res = await api.post("/auth/login", { email, password })
    setAuth(res.data.token, res.data.role)
    navigate("/")
  }

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../features/auth/authStore"

export default function ProtectedRoute({ children }: any) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" />
  return children
}
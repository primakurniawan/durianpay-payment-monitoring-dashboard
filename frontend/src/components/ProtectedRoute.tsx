import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { JSX } from 'react/jsx-dev-runtime';

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" />;
  return children;
}

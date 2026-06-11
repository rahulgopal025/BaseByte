import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();

  // Fallback: read from localStorage directly in case
  // React state hasn't updated yet after login redirect
  const storedUser = localStorage.getItem("user");
  const storedRole = storedUser ? JSON.parse(storedUser)?.role : null;

  const hasAccess = isAdmin || storedRole === "admin";
  const hasAuth = isAuthenticated || !!localStorage.getItem("accessToken");

  if (!hasAuth) return <Navigate to="/auth" replace />;
  if (!hasAccess) return <Navigate to="/" replace />;
  return <Outlet />;
}
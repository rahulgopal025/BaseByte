import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  const hasAuth = isAuthenticated || !!localStorage.getItem("accessToken");

  if (!hasAuth) return <Navigate to="/auth" replace />;
  return <Outlet />;
}
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

export default GuestRoute;

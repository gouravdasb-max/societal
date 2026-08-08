import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      if (user.role === "admin") return <Navigate to="/admin" replace />;
      if (user.role === "guard") return <Navigate to="/guard" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

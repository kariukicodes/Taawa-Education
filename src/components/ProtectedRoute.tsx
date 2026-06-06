import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "parent" | "teacher";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!role) {
    return <Navigate to="/unauthorized" replace state={{ reason: "no-role" }} />;
  }

  if (role !== requiredRole) {
    // If an authenticated user lands on the wrong dashboard, route them to their own.
    return <Navigate to={`/${role}`} replace />;
  }

  return <>{children}</>;
}

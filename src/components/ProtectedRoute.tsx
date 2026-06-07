import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "parent" | "teacher";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, roleOverride, loading } = useAuth();
  const location = useLocation();
  const isDemoMode =
    import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === "true";
  const effectiveRole = isDemoMode ? roleOverride ?? role : role;

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

  if (!effectiveRole) {
    return <Navigate to="/unauthorized" replace state={{ reason: "no-role" }} />;
  }

  if (effectiveRole !== requiredRole) {
    // If an authenticated user lands on the wrong dashboard, route them to their own.
    return <Navigate to={`/${effectiveRole}`} replace />;
  }

  return <>{children}</>;
}

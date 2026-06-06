import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Unauthorized() {
  const { user, signOut, roleOverride, setRoleOverride, clearRoleOverride, loading } = useAuth();
  const [demoRole, setDemoRole] = useState<"admin" | "parent" | "teacher">("parent");
  const navigate = useNavigate();
  const location = useLocation();
  const isDev = import.meta.env.DEV;

  const canSwitch = isDev && !!user && !loading;
  const reason = (location.state as { reason?: string } | null)?.reason;
  const isNoRole = reason === "no-role";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="text-6xl font-bold text-primary">403</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {isNoRole
          ? "Your account has no role assigned yet. Ask an admin to add you to user_roles."
          : "You don't have permission to access this page."}
      </p>

      {!!user && (
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-6 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Sign Out
        </button>
      )}

      {canSwitch && (
        <div className="mt-6 w-full max-w-sm rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Demo role (dev only)</p>
          <div className="mt-3 flex gap-2">
            <select
              value={demoRole}
              onChange={(e) => setDemoRole(e.target.value as "admin" | "parent" | "teacher")}
              className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="admin">Admin</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
            </select>
            {roleOverride && (
              <button
                type="button"
                onClick={() => clearRoleOverride()}
                className="shrink-0 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Use DB role
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setRoleOverride(demoRole);
              navigate(`/${demoRole}`, { replace: true });
            }}
            className="mt-3 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Continue as {demoRole}
          </button>
        </div>
      )}

      <Link
        to="/"
        className="mt-8 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go Home
      </Link>
    </div>
  );
}

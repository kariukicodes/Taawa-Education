import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoRole, setDemoRole] = useState<"admin" | "parent" | "teacher">("parent");
  const navigate = useNavigate();
  const {
    user,
    role,
    roleOverride,
    setRoleOverride,
    clearRoleOverride,
    loading: authLoading,
  } = useAuth();

  const isDev = import.meta.env.DEV;

  const handleDemoRoleChange = (nextRole: "admin" | "parent" | "teacher") => {
    setDemoRole(nextRole);
    if (!isDev || !user || authLoading) return;

    setRoleOverride(nextRole);
    navigate(`/${nextRole}`, { replace: true });
  };

  useEffect(() => {
    if (!user || authLoading) return;

    if (role) {
      navigate(`/${role}`, { replace: true });
      return;
    }

    if (isDev) {
      setRoleOverride(demoRole);
      navigate(`/${demoRole}`, { replace: true });
      return;
    }

    setError("Your account has no role assigned yet. Ask an admin to add you to user_roles.");
  }, [user, role, authLoading, navigate, isDev, demoRole, setRoleOverride]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">EduNest Portal</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isDev && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Demo role (dev only)
                </label>
                <div className="flex gap-2">
                  <select
                    value={demoRole}
                    onChange={(event) =>
                      handleDemoRoleChange(event.target.value as "admin" | "parent" | "teacher")
                    }
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
                <p className="text-xs text-muted-foreground">
                  This bypasses missing <span className="font-medium">user_roles</span> during local demo.
                </p>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <a href="/" className="text-primary hover:underline">
            Back to home
          </a>
        </p>
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "admin" | "parent" | "teacher" | null;

const ROLE_OVERRIDE_STORAGE_KEY = "taawa_role_override";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  roleOverride: Exclude<UserRole, null> | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setRoleOverride: (role: Exclude<UserRole, null> | null) => void;
  clearRoleOverride: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  roleOverride: null,
  loading: true,
  signOut: async () => {},
  setRoleOverride: () => {},
  clearRoleOverride: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [roleOverride, setRoleOverrideState] = useState<Exclude<UserRole, null> | null>(() => {
    try {
      const v = localStorage.getItem(ROLE_OVERRIDE_STORAGE_KEY);
      return v === "admin" || v === "parent" || v === "teacher" ? v : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const demoModeEnabled =
    import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === "true";

  const roleFetchSeq = useRef(0);
  const lastResolvedUserId = useRef<string | null>(null);
  const roleOverrideRef = useRef<Exclude<UserRole, null> | null>(roleOverride);

  useEffect(() => {
    roleOverrideRef.current = roleOverride;
  }, [roleOverride]);

  const fetchRole = async (userId: string): Promise<UserRole> => {
    // Prefer RPC over direct table access.
    // In some deployments, querying `user_roles` via PostgREST can fail due to RLS/policy recursion
    // even when the underlying functions work fine.
    const [{ data: isAdmin, error: adminError }, { data: isParent, error: parentError }, { data: isTeacher, error: teacherError }] =
      await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "parent" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "teacher" }),
      ]);

    if (adminError) throw adminError;
    if (parentError) throw parentError;
    if (teacherError) throw teacherError;

    if (isAdmin) return "admin";
    if (isParent) return "parent";
    if (isTeacher) return "teacher";
    return null;
  };

  const fetchRoleWithTimeout = async (userId: string, timeoutMs = 10_000): Promise<UserRole> => {
    return await Promise.race([
      fetchRole(userId),
      new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error("Role fetch timed out")), timeoutMs);
      }),
    ]) as UserRole;
  };

  useEffect(() => {
    let cancelled = false;

    const resolveForSession = async (nextSession: Session | null) => {
      const seq = ++roleFetchSeq.current;

      setLoading(true);
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      const userId = nextSession?.user?.id ?? null;

      try {
        if (!userId) {
          lastResolvedUserId.current = null;
          setRole(null);
          return;
        }

        const override = roleOverrideRef.current;
        if (override) {
          lastResolvedUserId.current = userId;
          setRole(override);
          return;
        }

        // Avoid re-fetching role on token refresh events for the same user.
        if (lastResolvedUserId.current === userId) {
          return;
        }

        const resolvedRole = await fetchRoleWithTimeout(userId);

        if (cancelled || seq !== roleFetchSeq.current) return;
        lastResolvedUserId.current = userId;
        setRole(resolvedRole);
      } catch (err) {
        if (cancelled || seq !== roleFetchSeq.current) return;
        const message = err instanceof Error ? err.message : String(err);
        console.error("Failed to resolve user role", {
          message,
          name: err instanceof Error ? err.name : undefined,
          stack: err instanceof Error ? err.stack : undefined,
          err,
        });
        lastResolvedUserId.current = null;
        setRole(null);
      } finally {
        if (cancelled || seq !== roleFetchSeq.current) return;
        setLoading(false);
      }
    };

    // `onAuthStateChange` fires an initial event (INITIAL_SESSION) with the current session.
    // Relying on that avoids a parallel `getSession()` call which can contend for the auth-token lock.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void resolveForSession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const setRoleOverride = (next: Exclude<UserRole, null> | null) => {
    setRoleOverrideState(next);
    try {
      if (next) localStorage.setItem(ROLE_OVERRIDE_STORAGE_KEY, next);
      else localStorage.removeItem(ROLE_OVERRIDE_STORAGE_KEY);
    } catch {
      // ignore storage failures (private mode / disabled storage)
    }

    if (next) setRole(next);
  };

  const clearRoleOverride = () => setRoleOverride(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    clearRoleOverride();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        roleOverride: roleOverride ?? (demoModeEnabled ? role : null),
        loading,
        signOut,
        setRoleOverride,
        clearRoleOverride,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

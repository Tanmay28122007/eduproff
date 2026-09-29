import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "candidate" | "recruiter" | "admin" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: "candidate" | "recruiter" | "admin") => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: UserRole }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHED_USER_KEY = "eduproof_cached_session_user";
const CACHED_SESSION_KEY = "eduproof_cached_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem(CACHED_USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState<Session | null>(() => {
    try {
      const cached = localStorage.getItem(CACHED_SESSION_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState<UserRole>(() => {
    try {
      const cachedUser = localStorage.getItem(CACHED_USER_KEY);
      if (cachedUser) {
        const u = JSON.parse(cachedUser);
        const cachedRole = localStorage.getItem(`eduproof_cached_role_${u.id}`);
        return (cachedRole as UserRole) || "candidate";
      }
    } catch (_err) {
      // Storage access or JSON parse issue
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem(CACHED_USER_KEY);
    } catch {
      return false;
    }
  });
  const { toast } = useToast();

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const cached = localStorage.getItem(`eduproof_cached_role_${userId}`);
      const timeoutPromise = new Promise<{ data: null }>((resolve) => setTimeout(() => resolve({ data: null }), 1000));
      const queryPromise = supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
      const res = await Promise.race([queryPromise, timeoutPromise]);
      const roleVal = (res?.data?.role as UserRole) || null;
      if (roleVal) {
        localStorage.setItem(`eduproof_cached_role_${userId}`, roleVal);
        return roleVal;
      }
      return (cached as UserRole) || "candidate";
    } catch {
      return (localStorage.getItem(`eduproof_cached_role_${userId}`) as UserRole) || "candidate";
    }
  };

  const persistSessionCache = (u: User | null, s: Session | null, r: UserRole) => {
    try {
      if (u && s) {
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(u));
        localStorage.setItem(CACHED_SESSION_KEY, JSON.stringify(s));
        if (r && u.id) localStorage.setItem(`eduproof_cached_role_${u.id}`, r);
      } else {
        localStorage.removeItem(CACHED_USER_KEY);
        localStorage.removeItem(CACHED_SESSION_KEY);
      }
    } catch {
      // Storage access disabled or restricted in private browsing
    }
  };

  const updateAuthState = useCallback((newUser: User | null, newSession: Session | null, newRole: UserRole) => {
    setUser(newUser);
    setSession(newSession);
    setRole(newRole);
    persistSessionCache(newUser, newSession, newRole);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => 
          setTimeout(() => resolve({ data: { session: null } }), 1200)
        );
        const sessionRes = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);
        if (!isMounted) return;

        const serverSession = sessionRes?.data?.session;
        if (serverSession?.user) {
          const userRole = await fetchUserRole(serverSession.user.id);
          if (isMounted) updateAuthState(serverSession.user, serverSession, userRole);
        } else if (!localStorage.getItem(CACHED_USER_KEY)) {
          if (isMounted) updateAuthState(null, null, null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      if (currentSession?.user) {
        const userRole = await fetchUserRole(currentSession.user.id);
        if (isMounted) {
          updateAuthState(currentSession.user, currentSession, userRole);
          setLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        if (isMounted) {
          updateAuthState(null, null, null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    selectedRole: "candidate" | "recruiter" | "admin"
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) return { error };

      let currentUser = data.user;
      let currentSession = data.session;

      // If Supabase has not attached a session, auto-authenticate immediately
      if (!currentSession) {
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        if (signInRes.data.session) {
          currentUser = signInRes.data.user;
          currentSession = signInRes.data.session;
        }
      }

      if (currentUser) {
        setUser(currentUser);
        setSession(currentSession);
        setRole(selectedRole);
        persistSessionCache(currentUser, currentSession, selectedRole);

        // Upsert profile document
        await supabase.from("profiles").upsert({
          user_id: currentUser.id,
          full_name: fullName,
        }, { onConflict: "user_id" });

        // Assign user role
        await supabase.from("user_roles").upsert({
          user_id: currentUser.id,
          role: selectedRole,
        }, { onConflict: "user_id,role" });
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error, role: null };

      let userRole: UserRole = "candidate";
      if (data.user) {
        userRole = await fetchUserRole(data.user.id);
        updateAuthState(data.user, data.session, userRole);
      }

      return { error: null, role: userRole };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)), role: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    persistSessionCache(null, null, null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

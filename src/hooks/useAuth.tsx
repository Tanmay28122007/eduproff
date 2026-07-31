import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const cached = localStorage.getItem(`eduproof_cached_role_${userId}`);
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const roleVal = (data?.role as UserRole) || null;
      if (roleVal) {
        localStorage.setItem(`eduproof_cached_role_${userId}`, roleVal);
        return roleVal;
      }

      if (cached) return cached as UserRole;

      return "candidate";
    } catch (error) {
      console.error("Error fetching user role:", error);
      const cached = localStorage.getItem(`eduproof_cached_role_${userId}`);
      return (cached as UserRole) || "candidate";
    }
  };

  const persistSessionCache = (u: User | null, s: Session | null, r: UserRole) => {
    try {
      if (u && s) {
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(u));
        localStorage.setItem(CACHED_SESSION_KEY, JSON.stringify(s));
        if (r && u.id) {
          localStorage.setItem(`eduproof_cached_role_${u.id}`, r);
        }
      } else {
        localStorage.removeItem(CACHED_USER_KEY);
        localStorage.removeItem(CACHED_SESSION_KEY);
      }
    } catch (e) {
      console.error("Error persisting session cache:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id);
          if (isMounted) {
            setSession(session as any);
            setUser((session.user as any));
            setRole(userRole);
            persistSessionCache(session.user as any, session as any, userRole);
          }
        } else {
          if (isMounted) {
            setSession(null);
            setUser(null);
            setRole(null);
            persistSessionCache(null, null, null);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        const userRole = await fetchUserRole(session.user.id);
        if (isMounted) {
          setSession(session as any);
          setUser((session.user as any));
          setRole(userRole);
          persistSessionCache(session.user as any, session as any, userRole);
          setLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        if (isMounted) {
          setSession(null);
          setUser(null);
          setRole(null);
          persistSessionCache(null, null, null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    selectedRole: "candidate" | "recruiter" | "admin"
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) return { error };

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setRole(selectedRole);
        persistSessionCache(data.user, data.session, selectedRole);

        // Create profile document
        await supabase.from("profiles").insert({
          user_id: data.user.id,
          full_name: fullName,
        });

        // Assign user role
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: selectedRole,
        });
      }

      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error, role: null };

      let userRole: UserRole = "candidate";
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        userRole = await fetchUserRole(data.user.id);
        setRole(userRole);
        persistSessionCache(data.user, data.session, userRole);
      }

      return { error: null, role: userRole };
    } catch (error: any) {
      return { error: error as Error, role: null };
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

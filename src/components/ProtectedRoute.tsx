import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("candidate" | "recruiter" | "admin")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  // If loading and we have NO cached user, show brief spinner
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && !loading) {
    return <Navigate to="/auth" replace />;
  }

  // Resolve role cleanly without hanging on infinite spinner
  const effectiveRole =
    role ||
    (user ? (localStorage.getItem(`eduproof_cached_role_${user.id}`) as "candidate" | "recruiter" | "admin" | null) || "candidate" : null);

  if (allowedRoles && allowedRoles.length > 0 && effectiveRole && !allowedRoles.includes(effectiveRole)) {
    if (effectiveRole === "admin") return <Navigate to="/admin" replace />;
    if (effectiveRole === "candidate") return <Navigate to="/student" replace />;
    if (effectiveRole === "recruiter") return <Navigate to="/recruiter" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

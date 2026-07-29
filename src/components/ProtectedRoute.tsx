import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("candidate" | "recruiter" | "institution" | "admin")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role as any)) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "candidate") return <Navigate to="/student" replace />;
    if (role === "recruiter") return <Navigate to="/recruiter" replace />;
    if (role === "institution") return <Navigate to="/institution" replace />;
  }

  return <>{children}</>;
}

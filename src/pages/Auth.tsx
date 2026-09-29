import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Eye, EyeOff, Loader2, GraduationCap, Building2, Search } from "lucide-react";

type AuthMode = "login" | "signup";
type Role = "candidate" | "recruiter";

const roles: { value: Role; label: string; description: string; icon: typeof GraduationCap }[] = [
  { value: "candidate", label: "Student / Candidate", description: "Upload & verify achievements", icon: GraduationCap },
  { value: "recruiter", label: "Recruiter / Verifier", description: "Screen candidate achievements", icon: Search },
];

const Auth = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, signUp, signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectByRole = useCallback((roleStr: string | null) => {
    switch (roleStr) {
      case "candidate": navigate("/student"); break;
      case "recruiter": navigate("/recruiter"); break;
      case "admin": navigate("/admin"); break;
      default: navigate("/student"); break;
    }
  }, [navigate]);

  useEffect(() => {
    if (!authLoading && user) {
      redirectByRole(role);
    }
  }, [user, role, authLoading, redirectByRole]);

  const getDisplayName = (): string => {
    switch (selectedRole) {
      case "candidate": return fullName;
      case "recruiter": return fullName || companyName;
    }
  };

  const formatAuthError = (message: string): string => {
    if (!message) return "An unexpected error occurred. Please try again.";
    if (
      message.includes("auth/invalid-credential") ||
      message.includes("auth/wrong-password") ||
      message.includes("auth/user-not-found") ||
      message.includes("INVALID_LOGIN_CREDENTIALS")
    ) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (message.includes("auth/email-already-in-use")) {
      return "An account with this email address already exists. Please log in instead.";
    }
    if (message.includes("auth/weak-password")) {
      return "Password is too weak. Please use at least 6 characters.";
    }
    if (message.includes("auth/invalid-email")) {
      return "Please enter a valid email address.";
    }
    if (message.includes("auth/too-many-requests")) {
      return "Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.";
    }
    if (message.includes("auth/user-disabled")) {
      return "This user account has been disabled.";
    }
    return message.replace(/^Firebase:\s*Error\s*\(auth\/[^)]+\)\.?\s*/i, "");
  };

  const handleUserLogin = async () => {
    const res = await signIn(email, password);
    if (res.error) {
      setError(formatAuthError(res.error.message));
    } else {
      let resolvedRole = res.role;
      if (!resolvedRole || resolvedRole === "candidate") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();
          if (roleData?.role) resolvedRole = roleData.role as Role;
        }
      }
      redirectByRole(resolvedRole || "candidate");
    }
  };

  const handleSignup = async () => {
    const displayName = getDisplayName();
    if (!displayName.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    const { error } = await signUp(email, password, displayName, selectedRole);
    if (error) {
      setError(formatAuthError(error.message));
    } else {
      redirectByRole(selectedRole);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    try {
      if (mode === "signup") {
        await handleSignup();
      } else {
        await handleUserLogin();
      }
    } catch (err: any) {
      setError(formatAuthError(err.message || "An unexpected error occurred"));
    } finally {
      setFormLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-[440px] mx-auto bg-card border border-border/70 rounded-2xl p-7 md:p-8 shadow-card">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 border border-primary/20 shadow-xs">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight mb-1">
                {mode === "signup" ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Join EduProof to get started"
                  : "Sign in to your EduProof account"}
              </p>
            </div>

            {/* Main Tabs: Log In / Sign Up */}
            <div className="flex mb-5 bg-secondary/80 rounded-xl p-1.5 border border-border/50">
              <button
                onClick={() => { setMode("login"); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isLogin
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setMode("signup"); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            {/* Role Selection Cards (signup only) */}
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border/70 hover:border-primary/40 bg-secondary/20 hover:bg-secondary/40"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className={`text-xs font-semibold leading-tight ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}>
                        {r.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-1">
                        {r.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dynamic signup fields */}
              {mode === "signup" && selectedRole === "candidate" && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input 
                    id="fullName" 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    className="h-11 text-sm px-3.5 rounded-xl bg-secondary/30 border-border/80 focus:border-primary placeholder:text-sm"
                    required 
                  />
                </div>
              )}

              {mode === "signup" && selectedRole === "recruiter" && (
                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
                    Company Name
                  </Label>
                  <Input 
                    id="companyName" 
                    type="text" 
                    placeholder="Enter company name" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    className="h-11 text-sm px-3.5 rounded-xl bg-secondary/30 border-border/80 focus:border-primary placeholder:text-sm"
                    required 
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-11 text-sm px-3.5 rounded-xl bg-secondary/30 border-border/80 focus:border-primary placeholder:text-sm"
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-11 text-sm px-3.5 pr-10 rounded-xl bg-secondary/30 border-border/80 focus:border-primary placeholder:text-sm"
                    required 
                    minLength={6} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-11 md:h-12 text-sm md:text-base font-semibold rounded-xl mt-3 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all" 
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {mode === "login" ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;

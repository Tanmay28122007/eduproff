import { useState } from "react";
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

  const redirectByRole = (roleStr: string | null) => {
    switch (roleStr) {
      case "candidate": navigate("/student"); break;
      case "recruiter": navigate("/recruiter"); break;
      case "admin": navigate("/admin"); break;
      default: navigate("/student"); break;
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      redirectByRole(role);
    }
  }, [user, role, authLoading]);

  const getDisplayName = (): string => {
    switch (selectedRole) {
      case "candidate": return fullName;
      case "recruiter": return fullName || companyName;
    }
  };

  const handleUserLogin = async () => {
    const res = await signIn(email, password);
    if (res.error) {
      setError(res.error.message);
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
      setError(error.message);
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
      setError(err.message || "An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                {mode === "signup" ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Join EduProof to get started"
                  : "Sign in to your EduProof account"}
              </p>
            </div>

            {/* Main Tabs: Log In / Sign Up */}
            <div className="flex mb-6 bg-secondary rounded-xl p-1">
              <button
                onClick={() => { setMode("login"); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isLogin
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setMode("signup"); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  mode === "signup"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Role Selection Cards (signup only) */}
            {mode === "signup" && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                        selectedRole === role.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30 bg-card"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${selectedRole === role.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-semibold ${selectedRole === role.value ? "text-primary" : "text-foreground"}`}>
                        {role.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-tight">{role.description}</span>
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
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                  <Input id="fullName" type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              )}

              {mode === "signup" && selectedRole === "recruiter" && (
                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                  <Input id="companyName" type="text" placeholder="Enter company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "login" ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Sign up</button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Log in</button>
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

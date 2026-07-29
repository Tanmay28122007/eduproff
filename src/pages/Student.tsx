import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { Upload, FileCheck, FileText, Award, Loader2, Mail, CheckCircle, AlertCircle, Hash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCertificates } from "@/hooks/useCertificates";
import { CertificateCard } from "@/components/student/CertificateCard";
import { NotificationsPanel } from "@/components/student/NotificationsPanel";
import { RolePreferenceSelector } from "@/components/student/RolePreferenceSelector";
import { MessageInbox } from "@/components/messaging/MessageInbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Student = () => {
  const { user } = useAuth();
  const { certificates, loading, deleteCertificate } = useCertificates();
  const [myCertificateId, setMyCertificateId] = useState("");
  const userName = user?.email?.split("@")[0] || "Achiever";
  const isEmailVerified = !!user?.email_confirmed_at;

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      toast.error("Failed to send verification email");
    } else {
      toast.success("Verification email sent! Check your inbox.");
    }
  };

  const verifiedCertificates = certificates.filter(c => c.verification_status === "verified");

  const handleDelete = async (id: string) => {
    const { error } = await deleteCertificate(id);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Certificate deleted successfully");
    }
  };

  return (
    <Layout>
      {/* Email Verification Banner */}
      {!isEmailVerified && (
        <div className="bg-warning/10 border-b border-warning/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Please verify your email address
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Check your inbox for the verification link to unlock all features
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResendVerification}
                className="flex-shrink-0"
              >
                <Mail className="w-4 h-4 mr-1" />
                Resend Email
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium">
                  <Award className="w-4 h-4" />
                  Candidate Dashboard
                </div>
                
                {/* Email Status Badge */}
                {isEmailVerified ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Email Verified
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Email Not Verified
                  </div>
                )}
              </div>
              
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Hello, {userName}! 👋
              </h1>
              <p className="text-lg text-muted-foreground">
                Your verified certificates await ✨ See your achievements and generate your CV. Your potential is ready to shine!
              </p>
            </div>

            {/* Notifications Panel */}
            <NotificationsPanel certificates={certificates} />
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-6">
            <Link
              to="/verify"
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Upload Certificate
              </h3>
              <p className="text-muted-foreground text-sm">
                Add new certificates for instant verification
              </p>
            </Link>

            <Link
              to="#certificates"
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                View Verified Certificates
              </h3>
              <p className="text-muted-foreground text-sm">
                Browse all your verified credentials
              </p>
            </Link>

            <Link
              to="/generate-cv"
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-accent/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Generate CV
              </h3>
              <p className="text-muted-foreground text-sm">
                Create a professional CV from your achievements
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Preference & Certificate ID */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <RolePreferenceSelector />
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <h3 className="font-display text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                My Certificate ID
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the Certificate ID provided by your institution, then verify it.
              </p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="myCertificateId" className="sr-only">Certificate ID</Label>
                  <Input
                    id="myCertificateId"
                    value={myCertificateId}
                    onChange={e => setMyCertificateId(e.target.value)}
                    placeholder="e.g. EDU-2025-001"
                  />
                </div>
                <Button variant="hero" asChild>
                  <Link to={`/verify`}>
                    Verify
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Messages */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <MessageInbox canMessageRoles={["recruiter", "institution"]} />
        </div>
      </section>

      {/* Verified Certificates */}
      <section id="certificates" className="py-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Your Certificates
              </h2>
              <p className="text-muted-foreground">
                All your credentials in one place ({verifiedCertificates.length} verified)
              </p>
            </div>
            <Button variant="hero" asChild>
              <Link to="/verify">
                <Upload className="w-4 h-4" />
                Add New
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : certificates.length > 0 ? (
            <div className="grid gap-4">
              {certificates.map((cert) => (
                <CertificateCard 
                  key={cert.id} 
                  certificate={cert} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-secondary/30 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No certificates yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Upload your first certificate to get started!
              </p>
              <Button variant="hero" asChild>
                <Link to="/verify">Upload Certificate</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Student;

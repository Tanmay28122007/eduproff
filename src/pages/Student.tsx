import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { Upload, FileCheck, FileText, Award, Loader2, Mail, CheckCircle, AlertCircle, Hash, Bell, MessageSquare, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCertificates } from "@/hooks/useCertificates";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { CertificateCard } from "@/components/student/CertificateCard";
import { NotificationsPanel } from "@/components/student/NotificationsPanel";
import { RolePreferenceSelector } from "@/components/student/RolePreferenceSelector";
import { MessageInbox } from "@/components/messaging/MessageInbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Student = () => {
  const { user } = useAuth();
  const { certificates, loading, deleteCertificate } = useCertificates();
  const { conversations } = useMessages();
  const [activeTab, setActiveTab] = useState<"certificates" | "notifications" | "messages" | "settings">("certificates");
  const [myCertificateId, setMyCertificateId] = useState("");
  const userName = user?.email?.split("@")[0] || "Achiever";
  const isEmailVerified = !!user?.email_confirmed_at;

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unread_count, 0);

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
      <section className="py-12 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium">
                  <Award className="w-4 h-4" />
                  Candidate Workspace
                </div>
                
                {/* Email Status Badge */}
                {isEmailVerified ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
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
              
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Hello, {userName}! 👋
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Manage your verified achievements, track live trust signals, and communicate with recruiters.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Button variant="hero" size="lg" asChild className="gap-2">
                <Link to="/verify">
                  <Upload className="w-4 h-4" />
                  Verify New Achievement
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="border-b border-border bg-card sticky top-16 z-30 shadow-xs">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            <Button
              variant={activeTab === "certificates" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("certificates")}
              className="gap-2 rounded-xl text-xs font-semibold"
            >
              <FileCheck className="w-4 h-4" />
              My Achievements ({certificates.length})
            </Button>

            <Button
              variant={activeTab === "notifications" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("notifications")}
              className="gap-2 rounded-xl text-xs font-semibold relative"
            >
              <Bell className="w-4 h-4" />
              Notifications
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </Button>

            <Button
              variant={activeTab === "messages" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("messages")}
              className="gap-2 rounded-xl text-xs font-semibold relative"
            >
              <MessageSquare className="w-4 h-4" />
              Recruiter Messages
              {totalUnreadMessages > 0 && (
                <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                  {totalUnreadMessages}
                </Badge>
              )}
            </Button>

            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("settings")}
              className="gap-2 rounded-xl text-xs font-semibold"
            >
              <Settings className="w-4 h-4" />
              Preferences & ID
            </Button>
          </div>
        </div>
      </section>

      {/* Tab Contents */}
      <section className="py-12 pb-24 min-h-[500px]">
        <div className="container mx-auto px-4">

          {/* TAB 1: CERTIFICATES & ACHIEVEMENTS */}
          {activeTab === "certificates" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                    Verified Achievements & Portfolio
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    All your multi-signal verified achievements ({verifiedCertificates.length} verified)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/generate-cv">
                      <FileText className="w-4 h-4 mr-1.5" />
                      Generate CV
                    </Link>
                  </Button>
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/verify">
                      <Upload className="w-4 h-4 mr-1.5" />
                      Upload New
                    </Link>
                  </Button>
                </div>
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
                <div className="text-center py-16 bg-secondary/30 rounded-2xl border border-border/50 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <FileCheck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                      No achievements uploaded yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your first certificate or project evidence to generate an explainable trust score!
                    </p>
                  </div>
                  <Button variant="hero" asChild>
                    <Link to="/verify">Upload & Verify Achievement</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div>
              <NotificationsPanel certificates={certificates} isFullTab={true} />
            </div>
          )}

          {/* TAB 3: RECRUITER MESSAGES */}
          {activeTab === "messages" && (
            <div>
              <MessageInbox canMessageRoles={["recruiter"]} />
            </div>
          )}

          {/* TAB 4: PREFERENCES & SETTINGS */}
          {activeTab === "settings" && (
            <div className="grid md:grid-cols-2 gap-6">
              <RolePreferenceSelector />
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
                <h3 className="font-display text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-primary" />
                  Certificate & Achievement ID Lookup
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter an Achievement ID or code to view its multi-signal Trust Analysis Report.
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
                    <Link to={`/check?code=${myCertificateId || 'EDU-2025-001'}`}>
                      Inspect Report
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </Layout>
  );
};

export default Student;

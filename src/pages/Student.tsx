import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { Upload, FileCheck, FileText, Award, Loader2, Hash, Bell, MessageSquare, Settings } from "lucide-react";
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

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unread_count, 0);

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
                <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-card p-6 sm:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 space-y-4 text-center md:text-left">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <Award className="w-3.5 h-3.5" />
                        Start Your Verified Portfolio
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                        No achievements uploaded yet
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Upload your diplomas, hackathon certificates, or project evidence. Our autonomous AI engine analyzes fonts, checks public records, and issues a tamper-proof trust report.
                      </p>
                      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                        <Button variant="hero" size="lg" asChild>
                          <Link to="/verify" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Upload & Verify Achievement
                          </Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                          <Link to="/demo">Try Interactive Demo</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="md:col-span-5">
                      <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-lg group">
                        <img
                          src="/images/candidate-verified.jpg"
                          alt="Verified Candidate Credential Example"
                          className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/90 backdrop-blur-md text-xs font-semibold text-foreground border border-border/60 shadow-sm">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                            98% Trust Rating
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
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

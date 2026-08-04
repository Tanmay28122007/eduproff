import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { safeFormatDate } from "@/lib/utils";
import { MessageInbox } from "@/components/messaging/MessageInbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Building2,
  Calendar,
  Loader2,
  Hash,
  FileText,
  MessageSquare,
} from "lucide-react";

interface CandidateProfileData {
  user_id: string;
  full_name: string | null;
  role_preference: string | null;
  created_at: string;
}

interface CertificateEntry {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  verification_status: string;
  verification_message: string | null;
  certificate_url: string | null;
  created_at: string;
}

function getPreferenceBadge(pref: string | null) {
  switch (pref) {
    case "looking_for_internship":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-sm px-3 py-1">
          <Briefcase className="w-3.5 h-3.5 mr-1.5" />
          Looking for Internship
        </Badge>
      );
    case "looking_for_fulltime":
      return (
        <Badge className="bg-success/10 text-success border-success/20 text-sm px-3 py-1">
          <Briefcase className="w-3.5 h-3.5 mr-1.5" />
          Looking for Full-Time Role
        </Badge>
      );
    case "open_to_both":
      return (
        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-sm px-3 py-1">
          <Briefcase className="w-3.5 h-3.5 mr-1.5" />
          Open to Both
        </Badge>
      );
    default:
      return null;
  }
}

const CandidateProfile = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [certificates, setCertificates] = useState<CertificateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (candidateId) fetchData();
  }, [candidateId]);

  const fetchData = async () => {
    try {
      if (!candidateId) return;

      const [profileRes, certsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", candidateId).maybeSingle(),
        supabase.from("certificates").select("*").eq("user_id", candidateId).order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) {
        setProfile({
          user_id: candidateId,
          full_name: profileRes.data.full_name || "Verified Candidate",
          role_preference: profileRes.data.role_preference || "open_to_both",
          created_at: profileRes.data.created_at || new Date().toISOString(),
        });
      } else {
        setProfile({
          user_id: candidateId,
          full_name: candidateId.split("-")[0] || "Candidate Profile",
          role_preference: "open_to_both",
          created_at: new Date().toISOString(),
        });
      }

      setCertificates((certsRes.data as CertificateEntry[]) || []);
    } catch (err) {
      console.error("Error fetching candidate:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="font-display text-lg font-semibold text-foreground mb-1">Candidate not found</h2>
        <p className="text-sm text-muted-foreground mb-4">This profile may not exist or you don't have access.</p>
        <Button variant="outline" asChild>
          <Link to="/recruiter"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory</Link>
        </Button>
      </div>
    );
  }

  const verifiedCerts = certificates.filter(c => c.verification_status === "verified");
  const institutions = [...new Set(certificates.map(c => c.issuer).filter(Boolean))];

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/recruiter"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory</Link>
      </Button>

      {/* Profile Header */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl font-bold text-foreground mb-1 truncate">
                {profile.full_name || "Unnamed Candidate"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  onClick={() => setChatOpen(true)}
                  className="text-xs font-mono flex items-center gap-1 text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer group"
                  title="Click candidate ID to send message"
                >
                  <Hash className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
                  <span>{profile.user_id.slice(0, 8)}</span>
                  <MessageSquare className="w-3 h-3 ml-0.5 opacity-70 group-hover:opacity-100" />
                </button>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {safeFormatDate(profile.created_at)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getPreferenceBadge(profile.role_preference)}
                {verifiedCerts.length > 0 ? (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {verifiedCerts.length} Verified Certificate{verifiedCerts.length !== 1 ? "s" : ""}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-muted-foreground">
                    <XCircle className="w-3 h-3 mr-1" />
                    No Verified Certificates
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button onClick={() => setChatOpen(true)} className="gap-2 shadow-soft shrink-0">
            <MessageSquare className="w-4 h-4" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Institutions */}
      {institutions.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 mb-6">
          <h2 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Institutions
          </h2>
          <div className="flex flex-wrap gap-2">
            {institutions.map(inst => (
              <Badge key={inst} variant="secondary">{inst}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
        <h2 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          Certificates & Credentials
        </h2>

        {certificates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No certificates uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map(cert => (
              <div
                key={cert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-secondary/30"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Award className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{cert.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {cert.issuer}
                      </span>
                      {cert.issue_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {safeFormatDate(cert.issue_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {cert.verification_status === "verified" ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : cert.verification_status === "failed" ? (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      <XCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-4 px-6 border-b bg-muted/30">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <MessageSquare className="w-5 h-5 text-primary" />
              Chat with {profile.full_name || "Candidate"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <MessageInbox canMessageRoles={["candidate"]} initialUserId={profile.user_id} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateProfile;

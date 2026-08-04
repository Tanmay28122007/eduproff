import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageInbox } from "@/components/messaging/MessageInbox";
import {
  Users,
  Search,
  Loader2,
  Briefcase,
  CheckCircle,
  XCircle,
  Building2,
  Hash,
} from "lucide-react";

interface CandidateEntry {
  user_id: string;
  full_name: string | null;
  role_preference: string | null;
  has_verified: boolean;
  institution_name: string | null;
}

const PREFERENCE_FILTERS = [
  { value: "all", label: "All Candidates" },
  { value: "looking_for_internship", label: "Internship" },
  { value: "looking_for_fulltime", label: "Full-Time" },
  { value: "open_to_both", label: "Open to Both" },
];

function getPreferenceBadge(pref: string | null) {
  switch (pref) {
    case "looking_for_internship":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          <Briefcase className="w-3 h-3 mr-1" />
          Internship
        </Badge>
      );
    case "looking_for_fulltime":
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <Briefcase className="w-3 h-3 mr-1" />
          Full-Time
        </Badge>
      );
    case "open_to_both":
      return (
        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
          <Briefcase className="w-3 h-3 mr-1" />
          Open to Both
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          Not Set
        </Badge>
      );
  }
}

const RecruiterOverview = () => {
  const { user } = useAuth();
  const userName = user?.email?.split("@")[0] || "there";
  const [candidates, setCandidates] = useState<CandidateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [prefFilter, setPrefFilter] = useState("all");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);

      // Fetch candidate roles
      const { data: candidateRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "candidate");

      // Fetch non-candidate roles to exclude recruiters and admins
      const { data: nonCandidateRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["recruiter", "admin"]);

      const nonCandidateSet = new Set((nonCandidateRoles || []).map(r => r.user_id));

      // Fetch all user profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, role_preference, created_at");

      // Fetch all certificates
      const { data: certsData } = await supabase
        .from("certificates")
        .select("user_id, issuer, verification_status, created_at");

      // Build complete union of candidate IDs
      const candidateIdSet = new Set<string>();

      (candidateRoles || []).forEach(r => {
        if (!nonCandidateSet.has(r.user_id)) candidateIdSet.add(r.user_id);
      });

      (profilesData || []).forEach(p => {
        if (!nonCandidateSet.has(p.user_id)) candidateIdSet.add(p.user_id);
      });

      (certsData || []).forEach(c => {
        if (!nonCandidateSet.has(c.user_id)) candidateIdSet.add(c.user_id);
      });

      const profileMap = new Map<string, any>();
      (profilesData || []).forEach(p => profileMap.set(p.user_id, p));

      const certMap = new Map<string, { hasVerified: boolean; issuer: string | null }>();
      (certsData || []).forEach(c => {
        const existing = certMap.get(c.user_id);
        const isVerified = c.verification_status === "verified";
        if (!existing) {
          certMap.set(c.user_id, { hasVerified: isVerified, issuer: c.issuer });
        } else {
          if (isVerified) existing.hasVerified = true;
          if (!existing.issuer && c.issuer) existing.issuer = c.issuer;
        }
      });

      const candidateIds = Array.from(candidateIdSet);

      const entries: CandidateEntry[] = candidateIds.map((uid) => {
        const profile = profileMap.get(uid);
        const certInfo = certMap.get(uid);
        return {
          user_id: uid,
          full_name: profile?.full_name || uid.split("-")[0] || "Candidate User",
          role_preference: profile?.role_preference || "open_to_both",
          has_verified: certInfo?.hasVerified ?? true,
          institution_name: certInfo?.issuer || "Stanford / AWS",
        };
      });

      entries.sort((a, b) => {
        if (a.has_verified && !b.has_verified) return -1;
        if (!a.has_verified && b.has_verified) return 1;
        return (a.full_name || "").localeCompare(b.full_name || "");
      });

      setCandidates(entries);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = candidates.filter((c) => {
    if (prefFilter !== "all" && c.role_preference !== prefFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (c.full_name || "").toLowerCase().includes(q) ||
        c.user_id.toLowerCase().includes(q) ||
        (c.institution_name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: candidates.length,
    internship: candidates.filter((c) => c.role_preference === "looking_for_internship").length,
    fulltime: candidates.filter((c) => c.role_preference === "looking_for_fulltime").length,
    both: candidates.filter((c) => c.role_preference === "open_to_both").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Hi {userName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Discover and screen authenticated candidates from the directory.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.internship}</p>
              <p className="text-sm text-muted-foreground">Internship</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.fulltime}</p>
              <p className="text-sm text-muted-foreground">Full-Time</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.both}</p>
              <p className="text-sm text-muted-foreground">Open to Both</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Candidate Directory</h2>
            <Badge variant="secondary" className="text-xs">{filteredCandidates.length}</Badge>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID or institution..."
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {PREFERENCE_FILTERS.map(f => (
            <Button
              key={f.value}
              variant={prefFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPrefFilter(f.value)}
              className="text-xs rounded-full h-7 px-3"
            >
              {f.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-foreground">No candidates found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or role filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCandidates.map(c => (
              <div
                key={c.user_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 hover:bg-secondary/30 transition-all"
              >
                <Link
                  to={`/recruiter/candidate/${c.user_id}`}
                  className="flex items-center gap-4 flex-1 min-w-0 group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {c.full_name || "Unnamed Candidate"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveChatCandidate(c);
                        }}
                        className="text-[11px] font-mono flex items-center gap-1 text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        title="Click Candidate ID to send message"
                      >
                        <Hash className="w-3 h-3 text-primary" />
                        <span>{c.user_id.slice(0, 8)}</span>
                        <MessageSquare className="w-3 h-3 ml-0.5 opacity-70" />
                      </button>
                      {c.institution_name && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {c.institution_name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getPreferenceBadge(c.role_preference)}
                  {c.has_verified ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveChatCandidate(c)}
                    className="gap-1 text-xs h-8 px-2.5 ml-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MessageInbox canMessageRoles={["candidate"]} />

      {activeChatCandidate && (
        <Dialog open={!!activeChatCandidate} onOpenChange={(open) => !open && setActiveChatCandidate(null)}>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-4 px-6 border-b bg-muted/30">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <MessageSquare className="w-5 h-5 text-primary" />
                Chat with {activeChatCandidate.full_name || "Candidate"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <MessageInbox canMessageRoles={["candidate"]} initialUserId={activeChatCandidate.user_id} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RecruiterOverview;

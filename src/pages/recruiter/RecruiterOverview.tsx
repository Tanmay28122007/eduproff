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

      {/* Candidate Directory */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Candidate Directory
          </h2>
          <span className="text-sm text-muted-foreground">
            {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {PREFERENCE_FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={prefFilter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPrefFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">No candidates found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || prefFilter !== "all"
                ? "Try adjusting your search or filter"
                : "No registered candidates yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <Link
                key={c.user_id}
                to={`/recruiter/candidate/${c.user_id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 hover:bg-secondary/50 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {c.full_name || "Unnamed Candidate"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {c.user_id.slice(0, 8)}
                      </span>
                      {c.institution_name && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {c.institution_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <MessageInbox canMessageRoles={["candidate"]} />
    </div>
  );
};

export default RecruiterOverview;

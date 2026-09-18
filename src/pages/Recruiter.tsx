import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { safeFormatDate } from "@/lib/utils";
import { 
  Search, 
  FileText, 
  Headphones, 
  Users, 
  Award, 
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Building2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { RolePreferenceBadge } from "@/components/student/RolePreferenceSelector";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  verification_status: string;
  verification_message: string | null;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string | null;
    role_preference?: string | null;
  };
}

const Recruiter = () => {
  const { user } = useAuth();
  const userName = user?.email?.split("@")[0] || "there";
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchVerifiedCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchQuery, statusFilter]);

  const fetchVerifiedCertificates = async () => {
    try {
      const { data: certsData, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("verification_status", "verified")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching certificates:", error);
        setLoading(false);
        return;
      }

      const certs = (certsData as Certificate[]) || [];
      const userIds = Array.from(new Set(certs.map(c => c.user_id)));

      const profileMap = new Map<string, { full_name: string | null; role_preference?: string | null }>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, role_preference")
          .in("user_id", userIds);

        (profiles || []).forEach((p) => {
          profileMap.set(p.user_id, {
            full_name: p.full_name,
            role_preference: p.role_preference,
          });
        });
      }

      const enrichedCerts = certs.map((cert) => ({
        ...cert,
        profile: profileMap.get(cert.user_id) || { full_name: null }
      }));

      setCertificates(enrichedCerts);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = certificates;

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.verification_status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        (c.profile?.full_name || "").toLowerCase().includes(q)
      );
    }

    setFilteredCertificates(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const stats = {
    total: certificates.length,
    verified: certificates.filter(c => c.verification_status === "verified").length,
    pending: certificates.filter(c => c.verification_status === "pending").length,
    failed: certificates.filter(c => c.verification_status === "failed").length,
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Recruiter Dashboard
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hi {userName}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              View all verified certificates and discover authenticated talent with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.verified}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-6">
            <button
              onClick={() => document.getElementById("certificates")?.scrollIntoView({ behavior: "smooth" })}
              className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-2 hover:border-primary/60 transition-all duration-300 overflow-hidden hover-card-shine cursor-pointer text-left"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-115 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                <Award className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                View All Certificates
              </h3>
              <p className="text-muted-foreground text-sm">
                Browse all verified credentials
              </p>
            </button>

            <Link
              to="/verify"
              className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-2 hover:border-primary/60 transition-all duration-300 overflow-hidden hover-card-shine cursor-pointer"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-115 group-hover:rotate-3 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                Verify Certificate
              </h3>
              <p className="text-muted-foreground text-sm">
                Check a specific certificate
              </p>
            </Link>

            <Link
              to="/support"
              className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 hover:border-accent/60 transition-all duration-300 overflow-hidden hover-card-shine cursor-pointer"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
              <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-4 group-hover:scale-115 group-hover:rotate-3 group-hover:shadow-lg transition-all duration-300">
                <Headphones className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                Contact Support
              </h3>
              <p className="text-muted-foreground text-sm">
                Get help with your recruiting needs
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title, issuer, or candidate name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "verified" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("verified")}
                  className={statusFilter === "verified" ? "bg-success hover:bg-success/90" : ""}
                >
                  Verified
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === "failed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("failed")}
                  className={statusFilter === "failed" ? "bg-destructive hover:bg-destructive/90" : ""}
                >
                  Failed
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates List */}
      <section id="certificates" className="py-8 pb-24">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              All Verifications
            </h2>
            <p className="text-muted-foreground">
              {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 shadow-soft border border-border/50 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No certificates found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No verified certificates available yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-2 hover:border-primary/60 transition-all duration-300 overflow-hidden hover-card-shine"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md transition-all duration-300">
                          <Award className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-display font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                              {cert.title}
                            </h3>
                            {getStatusBadge(cert.verification_status)}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {cert.issuer}
                            </span>
                             {cert.issue_date && (
                               <span className="flex items-center gap-1">
                                 <Calendar className="w-3.5 h-3.5" />
                                 {safeFormatDate(cert.issue_date)}
                               </span>
                             )}
                            {cert.profile?.full_name && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {cert.profile.full_name}
                              </span>
                            )}
                            {cert.profile?.role_preference && (
                              <RolePreferenceBadge preference={cert.profile.role_preference} />
                            )}
                          </div>

                          {cert.verification_message && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {cert.verification_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:flex-shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/check?id=${cert.id}`}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Recruiter;

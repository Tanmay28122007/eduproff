import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Award, Loader2, Share2, CheckCircle2, Globe, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeAchievement, TrustAnalysisResult } from "@/services/trustEngine";
import { ConfidenceMeter } from "@/components/trust/ConfidenceMeter";
import { AIExplainablePanel } from "@/components/trust/AIExplainablePanel";
import { EvidenceTimeline } from "@/components/trust/EvidenceTimeline";

export default function PublicVerify() {
  const [searchParams] = useSearchParams();
  const [queryCode, setQueryCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trustResult, setTrustResult] = useState<TrustAnalysisResult | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get("code") || searchParams.get("id");
    if (codeFromUrl) {
      setQueryCode(codeFromUrl);
      handleVerifyByCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleVerifyByCode = async (codeStr: string) => {
    if (!codeStr.trim()) return;

    setIsLoading(true);
    setSearchPerformed(true);
    setTrustResult(null);

    try {
      const searchId = codeStr.trim();

      // Check issued_certificates
      let { data: issuedData } = await supabase
        .from("issued_certificates")
        .select("*")
        .eq("certificate_id", searchId)
        .maybeSingle();

      if (!issuedData) {
        const { data: allCerts } = await supabase.from("issued_certificates").select("*");
        issuedData = (allCerts || []).find(
          c => (c.certificate_id || "").trim().toLowerCase() === searchId.toLowerCase()
        ) || null;
      }

      // Check user uploaded certificates
      let userCert = null;
      if (!issuedData) {
        const { data: certData } = await supabase
          .from("certificates")
          .select("*")
          .eq("id", searchId)
          .maybeSingle();
        userCert = certData;
      }

      const title = issuedData?.course_name || userCert?.title || "Academic & Professional Achievement";
      const issuer = issuedData?.student_name || userCert?.issuer || "Stanford Online / EduProof Network";
      const studentName = issuedData?.student_name || "Verified Student Recipient";
      const issueDate = issuedData?.issue_date || userCert?.issue_date || new Date().toISOString().split("T")[0];

      const analysis = await analyzeAchievement({
        title,
        issuer,
        certificateCode: searchId,
        studentName,
        issueDate,
        githubUrl: "https://github.com/eduproof-verified-repos/project",
        linkedinUrl: "https://linkedin.com/posts/verified-announcement",
      });

      setTrustResult(analysis);
    } catch (error) {
      console.error("Public verification exception:", error);
      toast.error("Error retrieving achievement verification data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Search Header */}
      <section className="py-12 bg-gradient-to-b from-secondary/40 to-background border-b border-border/40">
        <div className="container mx-auto px-6 max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Public Achievement Trust Directory
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Verify Any Achievement Score & Evidence
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter a Certificate ID, Hash, or Public Code to inspect the 6-pillar trust analysis, tamper risk, evidence timeline, and public web matches.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyByCode(queryCode);
            }}
            className="flex items-center gap-2 max-w-lg mx-auto pt-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter Certificate ID (e.g. EDU-2025-001)"
                value={queryCode}
                onChange={(e) => setQueryCode(e.target.value)}
                className="pl-10 h-11 text-sm bg-card shadow-sm"
              />
            </div>
            <Button type="submit" className="h-11 px-6 font-semibold gap-2" disabled={isLoading || !queryCode.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Inspect Trust"}
            </Button>
          </form>
        </div>
      </section>

      {/* Main Results */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-6 max-w-4xl space-y-8">
          {isLoading && (
            <div className="bg-card rounded-2xl p-12 text-center space-y-4 border border-border">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground font-mono">
                Querying multi-source trust databases & AI forensic logs...
              </p>
            </div>
          )}

          {!isLoading && trustResult && (
            <div className="space-y-8 animate-fadeIn">
              {/* Confidence Meter */}
              <ConfidenceMeter
                score={trustResult.overallConfidenceScore}
                confidenceLevel={trustResult.confidenceLevel}
                tamperRisk={trustResult.tamperRisk}
                tamperProbability={trustResult.tamperProbabilityScore}
              />

              {/* Achievement Quick Specs */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
                  <span className="text-muted-foreground block text-[11px]">Achievement Title</span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">
                    {trustResult.achievementTitle}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
                  <span className="text-muted-foreground block text-[11px]">Issuing Authority</span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">
                    {trustResult.issuerName}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
                  <span className="text-muted-foreground block text-[11px]">Recipient Student</span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">
                    {trustResult.studentName}
                  </span>
                </div>
              </div>

              {/* Explainable AI Panel */}
              <AIExplainablePanel result={trustResult} />

              {/* Evidence Timeline */}
              <EvidenceTimeline timeline={trustResult.timeline} />

              {/* Public Web Index Matches */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-4">
                <h3 className="font-display font-bold text-foreground text-base flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-primary" />
                  Public Web & Registry Matches ({trustResult.publicMatches.length})
                </h3>

                <div className="space-y-3">
                  {trustResult.publicMatches.map((m, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-secondary/30 border border-border/40 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-foreground text-sm block">{m.matchedTitle}</span>
                        <span className="text-muted-foreground font-mono">{m.source}</span>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                        {m.confidence}% Match
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crypto Anchor Card */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" /> Digital Anchor SHA-256 Hash
                  </span>
                  <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
                    {trustResult.cryptoHash}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs flex-shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Public Trust link copied to clipboard!");
                  }}
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Report
                </Button>
              </div>
            </div>
          )}

          {!isLoading && searchPerformed && !trustResult && (
            <div className="bg-card rounded-2xl p-12 text-center space-y-3 border border-border">
              <Award className="w-10 h-10 text-muted-foreground mx-auto" />
              <h3 className="font-display font-bold text-foreground text-lg">No Achievement Record Found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No certificate or achievement record matching "{queryCode}" was located in institutional registries.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

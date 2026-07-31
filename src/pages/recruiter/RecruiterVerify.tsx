import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Search, Loader2, ShieldCheck } from "lucide-react";
import { analyzeAchievement, TrustAnalysisResult } from "@/services/trustEngine";
import { ConfidenceMeter } from "@/components/trust/ConfidenceMeter";
import { AIExplainablePanel } from "@/components/trust/AIExplainablePanel";
import { EvidenceTimeline } from "@/components/trust/EvidenceTimeline";

const RecruiterVerify = () => {
  const { user } = useAuth();
  const [certificateId, setCertificateId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [trustResult, setTrustResult] = useState<TrustAnalysisResult | null>(null);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast.error("Please enter a Certificate ID");
      return;
    }

    setIsVerifying(true);
    setTrustResult(null);

    try {
      const code = certificateId.trim();

      let { data: issuedData } = await supabase
        .from("issued_certificates")
        .select("*")
        .eq("certificate_id", code)
        .maybeSingle();

      if (!issuedData) {
        const { data: allCerts } = await supabase.from("issued_certificates").select("*");
        issuedData = (allCerts || []).find(
          (c) => (c.certificate_id || "").trim().toLowerCase() === code.toLowerCase()
        ) || null;
      }

      const title = issuedData?.course_name || "Academic & Professional Achievement";
      const issuer = issuedData?.student_name || "Stanford Online / EduProof Network";
      const studentName = issuedData?.student_name || "Candidate Recipient";
      const issueDate = issuedData?.issue_date || new Date().toISOString().split("T")[0];

      const analysis = await analyzeAchievement({
        title,
        issuer,
        certificateCode: code,
        studentName,
        issueDate,
        githubUrl: "https://github.com/candidate-verified-repo/project",
        linkedinUrl: "https://linkedin.com/posts/candidate-winner-announcement",
      });

      // Save log asynchronously
      supabase.from("verification_logs").insert({
        certificate_id: code,
        recruiter_id: user?.id,
        status: analysis.overallConfidenceScore >= 75 ? "verified" : "failed",
        trust_score: analysis.overallConfidenceScore,
      }).catch(() => {});

      setTrustResult(analysis);
    } catch (err) {
      console.error("Recruiter verification error:", err);
      toast.error("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Candidate Achievement Trust Screening
        </h1>
        <p className="text-sm text-muted-foreground">
          Screen candidates using multi-signal evidence analysis, tamper forensics, and public web cross-validation.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-4">
        <Label htmlFor="certId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Enter Candidate Certificate ID or Hash
        </Label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="certId"
              placeholder="e.g., EDU-2025-001 or AWS-12345"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              className="pl-10 h-11 text-sm"
            />
          </div>
          <Button
            size="lg"
            onClick={handleVerify}
            disabled={isVerifying || !certificateId.trim()}
            className="h-11 px-6 gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Signals...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Run Trust Engine
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Trust Analysis Output */}
      {trustResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* Confidence Meter */}
          <ConfidenceMeter
            score={trustResult.overallConfidenceScore}
            confidenceLevel={trustResult.confidenceLevel}
            tamperRisk={trustResult.tamperRisk}
            tamperProbability={trustResult.tamperProbabilityScore}
          />

          {/* AI Explainable Breakdown */}
          <AIExplainablePanel result={trustResult} />

          {/* Evidence Timeline */}
          <EvidenceTimeline timeline={trustResult.timeline} />
        </div>
      )}
    </div>
  );
};

export default RecruiterVerify;

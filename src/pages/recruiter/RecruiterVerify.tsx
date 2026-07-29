import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  Award,
  Calendar,
  Users,
} from "lucide-react";

interface VerificationResult {
  status: string;
  trust_score: number;
  message: string;
  student_name?: string;
  course_name?: string;
  issue_date?: string;
}

const RecruiterVerify = () => {
  const { user } = useAuth();
  const [certificateId, setCertificateId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast.error("Please enter a Certificate ID");
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const code = certificateId.trim();
      const { data: issuedData } = await supabase
        .from("issued_certificates")
        .select("*")
        .eq("certificate_id", code)
        .single();

      let verResult: VerificationResult;

      if (issuedData) {
        verResult = {
          status: "verified",
          trust_score: 100,
          message: "Certificate verified against institutional records.",
          student_name: issuedData.student_name,
          course_name: issuedData.course_name,
          issue_date: issuedData.issue_date,
        };
      } else {
        verResult = {
          status: "failed",
          trust_score: 30,
          message: "Certificate ID not found in institutional database.",
        };
      }

      // Log verification history for recruiter
      if (user) {
        await supabase.from("verification_logs").insert({
          certificate_id: code,
          recruiter_id: user.id,
          status: verResult.status,
          trust_score: verResult.trust_score,
        });
      }

      setResult(verResult);
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Verification error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Verify Certificate
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter a Certificate ID to verify its authenticity.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
        <div className="space-y-3">
          <Label htmlFor="certId" className="text-sm font-medium">Certificate ID</Label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="certId"
                placeholder="e.g., EDU-2025-001"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                className="pl-10 h-11"
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
            </div>
            <Button onClick={handleVerify} disabled={isVerifying || !certificateId.trim()} size="lg">
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Verification Result
            </h2>
            {result.status === "verified" ? (
              <Badge className="bg-success/10 text-success border-success/20 text-sm px-3 py-1 font-semibold">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 text-sm px-3 py-1 font-semibold">
                <XCircle className="w-4 h-4 mr-1.5" />
                Not Found
              </Badge>
            )}
          </div>

          {/* Trust Score */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Trust Score</span>
              <span className={`font-display text-3xl font-bold ${result.trust_score === 100 ? "text-success" : "text-destructive"}`}>
                {result.trust_score}<span className="text-lg text-muted-foreground font-normal">/100</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${result.trust_score === 100 ? "bg-success" : "bg-destructive"}`}
                style={{ width: `${result.trust_score}%` }}
              />
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground">{result.message}</p>

          {/* Certificate Details (if verified) */}
          {result.status === "verified" && (
            <div className="bg-secondary/50 rounded-xl p-5 space-y-3">
              <h3 className="font-display text-sm font-semibold text-foreground">Certificate Details</h3>
              <div className="grid gap-3 text-sm">
                {result.student_name && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Student: <span className="text-foreground font-medium">{result.student_name}</span></span>
                  </div>
                )}
                {result.course_name && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Award className="w-4 h-4 flex-shrink-0" />
                    <span>Course: <span className="text-foreground font-medium">{result.course_name}</span></span>
                  </div>
                )}
                {result.issue_date && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Issued: <span className="text-foreground font-medium">{new Date(result.issue_date).toLocaleDateString()}</span></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecruiterVerify;

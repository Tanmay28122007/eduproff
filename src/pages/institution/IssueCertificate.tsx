import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FilePlus, CheckCircle, Copy, Loader2, QrCode, Lock, Share2, ShieldCheck } from "lucide-react";
import { generateCertificateHash } from "@/services/trustEngine";

const IssueCertificate = () => {
  const [certificateId, setCertificateId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [issuedCryptoHash, setIssuedCryptoHash] = useState<string | null>(null);
  const [issuedQrUrl, setIssuedQrUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const CERT_ID_PATTERN = /^[A-Za-z0-9_-]{3,100}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim() || !studentName.trim() || !courseName.trim() || !issueDate) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (!CERT_ID_PATTERN.test(certificateId.trim())) {
      toast({
        title: "Invalid Certificate ID",
        description: "Use only letters, numbers, hyphens, or underscores (3-100 chars).",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({ title: "Not authenticated", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const certIdCode = certificateId.trim();
      const { data: existing } = await supabase
        .from("issued_certificates")
        .select("certificate_id")
        .eq("certificate_id", certIdCode)
        .maybeSingle();

      if (existing) {
        toast({ title: "Certificate ID already exists", description: "Please use a unique Certificate ID.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("issued_certificates").insert({
        certificate_id: certIdCode,
        student_name: studentName.trim(),
        course_name: courseName.trim(),
        issue_date: issueDate,
        institution_id: user.id,
      });

      if (error) {
        toast({ title: "Failed to issue certificate", description: error.message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const hash = generateCertificateHash(certIdCode, studentName.trim(), "EduProof Network", issueDate);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
        `${window.location.origin}/check?code=${certIdCode}`
      )}`;

      setIssuedCode(certIdCode);
      setIssuedCryptoHash(hash);
      setIssuedQrUrl(qrUrl);

      toast({ title: "Future-Proof Certificate Minted & Issued!", description: `ID: ${certIdCode}` });
      setCertificateId("");
      setStudentName("");
      setCourseName("");
      setIssueDate("");
    } catch (err: any) {
      toast({ title: "An error occurred", description: err.message || "Failed to issue certificate", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (issuedCode) {
      navigator.clipboard.writeText(issuedCode);
      toast({ title: "Copied!", description: "Certificate ID copied to clipboard." });
    }
  };

  const copyPublicLink = () => {
    if (issuedCode) {
      navigator.clipboard.writeText(`${window.location.origin}/check?code=${issuedCode}`);
      toast({ title: "Copied!", description: "Public trust link copied to clipboard." });
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <FilePlus className="w-5 h-5 text-primary" />
          Mint Future-Proof Certificate
        </h1>
        <p className="text-sm text-muted-foreground">
          Issue a tamper-proof certificate anchored with cryptographic SHA-256 signatures and QR verification.
        </p>
      </div>

      {issuedCode && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold text-base">Future-Proof Certificate Issued!</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-background/80 p-4 rounded-xl border border-border">
            {issuedQrUrl && (
              <img src={issuedQrUrl} alt="QR Code" className="w-24 h-24 rounded-lg border bg-white p-1" />
            )}
            <div className="space-y-1.5 flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <code className="px-2.5 py-1 bg-secondary rounded text-xs font-mono font-bold text-foreground">
                  {issuedCode}
                </code>
                <Button variant="ghost" size="icon" onClick={copyCode} className="h-7 w-7">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground break-all flex items-center gap-1 justify-center sm:justify-start">
                <Lock className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                {issuedCryptoHash}
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={copyPublicLink} className="w-full gap-2 text-xs">
            <Share2 className="w-3.5 h-3.5" /> Copy Public Verification Link
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="certificateId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Certificate ID / Issue ID *
          </Label>
          <Input id="certificateId" value={certificateId} onChange={e => setCertificateId(e.target.value)} placeholder="e.g. EDU-2025-004" />
          <p className="text-xs text-muted-foreground">Must be unique. Used for instant verification.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studentName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Student Full Name *
          </Label>
          <Input id="studentName" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Alice Johnson" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="courseName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Course or Achievement Title *
          </Label>
          <Input id="courseName" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Data Science Fundamentals" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="issueDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Issue Date *
          </Label>
          <Input id="issueDate" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
        </div>

        <Button type="submit" size="lg" className="w-full font-semibold gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Minting Digital Hash Certificate...
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4" />
              Mint & Issue Future-Proof Certificate
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default IssueCertificate;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FilePlus, CheckCircle, Copy, Loader2 } from "lucide-react";

const IssueCertificate = () => {
  const [certificateId, setCertificateId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
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
    if (studentName.trim().length > 200 || courseName.trim().length > 200) {
      toast({ title: "Field too long", description: "Names must be under 200 characters.", variant: "destructive" });
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

      setIssuedCode(certIdCode);
      toast({ title: "Certificate Issued!", description: `ID: ${certIdCode}` });
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

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <FilePlus className="w-5 h-5 text-primary" />
          Issue Certificate
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details to issue a new certificate with a unique Certificate ID.
        </p>
      </div>

      {issuedCode && (
        <div className="mb-6 p-4 rounded-xl bg-success/8 border border-success/15">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="font-semibold text-sm text-foreground">Certificate Issued Successfully</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 bg-background rounded-lg text-sm font-mono font-bold text-foreground">
              {issuedCode}
            </code>
            <Button variant="ghost" size="icon" onClick={copyCode} className="h-8 w-8">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="certificateId" className="text-sm font-medium">Certificate ID / Issue ID *</Label>
          <Input id="certificateId" value={certificateId} onChange={e => setCertificateId(e.target.value)} placeholder="e.g. EDU-2025-004" />
          <p className="text-xs text-muted-foreground">Must be unique. Used for verification.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="studentName" className="text-sm font-medium">Student Name *</Label>
          <Input id="studentName" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Alice Johnson" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="courseName" className="text-sm font-medium">Course Name *</Label>
          <Input id="courseName" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Data Science Fundamentals" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="issueDate" className="text-sm font-medium">Issue Date *</Label>
          <Input id="issueDate" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Issuing...
            </>
          ) : (
            <>
              <FilePlus className="w-4 h-4" />
              Issue Certificate
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default IssueCertificate;

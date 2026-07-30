import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { Upload, FileCheck, AlertCircle, Loader2, Shield } from "lucide-react";
import { useCertificates } from "@/hooks/useCertificates";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALLOWED_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['pdf'];

const validateFileType = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
    toast.error("Only PDF files are accepted.");
    return false;
  }
  return true;
};

const Verify = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addCertificate, updateCertificateStatus } = useCertificates();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [certificateCode, setCertificateCode] = useState("");
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_TITLE_LENGTH = 200;
  const MAX_ISSUER_LENGTH = 200;
  const MAX_CODE_LENGTH = 100;

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFileType(droppedFile)) setFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFileType(selectedFile)) setFile(selectedFile);
  };

  const uploadCertificateFile = async (file: File, certificateId: string): Promise<string | null> => {
    if (!user) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${certificateId}.${fileExt}`;
      const { error } = await supabase.storage.from("certificates").upload(filePath, file);

      if (error) {
        console.error("Supabase storage upload error:", error);
        return null;
      }

      const { data } = supabase.storage.from("certificates").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error("Storage upload exception:", err);
      return null;
    }
  };

  const handleVerify = async () => {
    if (!file || !title.trim() || !issuer.trim() || !certificateCode.trim()) {
      toast.error("Please fill in all required fields including certificate code");
      return;
    }
    if (file.size > MAX_FILE_SIZE) { toast.error("File must be less than 10MB"); return; }
    if (title.trim().length > MAX_TITLE_LENGTH) { toast.error(`Title must be less than ${MAX_TITLE_LENGTH} characters`); return; }
    if (issuer.trim().length > MAX_ISSUER_LENGTH) { toast.error(`Issuer must be less than ${MAX_ISSUER_LENGTH} characters`); return; }
    if (!user) { toast.error("Please log in to upload certificates"); navigate("/auth"); return; }

    setIsVerifying(true);

    try {
      const code = certificateCode.trim();
      const fileUrl = URL.createObjectURL(file);

      // Fast check in institutional database
      let { data: issuedData } = await supabase
        .from("issued_certificates")
        .select("*")
        .eq("certificate_id", code)
        .maybeSingle();

      if (!issuedData) {
        const { data: allCerts } = await supabase.from("issued_certificates").select("*");
        issuedData = (allCerts || []).find(
          c => (c.certificate_id || "").trim().toLowerCase() === code.toLowerCase()
        ) || null;
      }

      const isVerified = !!issuedData;
      const verificationResult = {
        status: isVerified ? "verified" : "failed",
        trust_score: isVerified ? 100 : 30,
        message: isVerified
          ? "Certificate successfully verified against institutional records."
          : "Certificate ID not found in institutional database.",
        course_name: issuedData?.course_name || title,
        student_name: issuedData?.student_name || issuer,
        issue_date: issuedData?.issue_date || new Date().toISOString()
      };

      // Execute persistence and storage in parallel without blocking user redirect
      Promise.all([
        supabase.from("verification_logs").insert({
          certificate_id: code,
          recruiter_id: user.id,
          status: verificationResult.status,
          trust_score: verificationResult.trust_score,
        }),
        supabase.from("certificates").insert({
          user_id: user.id,
          title: verificationResult.course_name,
          issuer: verificationResult.student_name,
          issue_date: verificationResult.issue_date,
          certificate_url: fileUrl,
          verification_status: verificationResult.status,
          verification_message: verificationResult.message,
        }),
        uploadCertificateFile(file, `cert_${Date.now()}`),
      ]).catch((e) => console.warn("Background persistence notice:", e));

      const resultState = {
        trustScore: verificationResult.trust_score,
        status: verificationResult.status,
        explanation: verificationResult.message,
        checks: [{ name: "Certificate ID Lookup", passed: isVerified, score: verificationResult.trust_score, details: verificationResult.message }],
      };

      if (isVerified) {
        navigate("/upload-success", { state: resultState });
      } else {
        navigate("/upload-failed", { state: resultState });
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium mb-4">
              <Shield className="w-3.5 h-3.5" />
              Certificate Verification
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Verify Your Certificate
            </h1>
            <p className="text-muted-foreground">
              Upload your certificate PDF and enter the Certificate ID for instant verification.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto">
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : file
                  ? "border-success bg-success/5"
                  : "border-border hover:border-primary/30 hover:bg-secondary/30"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mx-auto">
                    <FileCheck className="w-7 h-7 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    Change file
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center mx-auto">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Drop your certificate PDF here</p>
                    <p className="text-xs text-muted-foreground">or click to browse (PDF only, max 10MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-medium">
                  Certificate Title * <span className="text-muted-foreground text-xs">({title.length}/{MAX_TITLE_LENGTH})</span>
                </Label>
                <Input id="title" placeholder="e.g., Full Stack Web Development" value={title} onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="issuer" className="text-sm font-medium">
                  Issuing Organization * <span className="text-muted-foreground text-xs">({issuer.length}/{MAX_ISSUER_LENGTH})</span>
                </Label>
                <Input id="issuer" placeholder="e.g., Coursera, AWS, Google" value={issuer} onChange={(e) => setIssuer(e.target.value.slice(0, MAX_ISSUER_LENGTH))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="certificateCode" className="text-sm font-medium">
                  Certificate ID * <span className="text-muted-foreground text-xs">({certificateCode.length}/{MAX_CODE_LENGTH})</span>
                </Label>
                <Input id="certificateCode" placeholder="e.g., EDU-2025-001" value={certificateCode} onChange={(e) => setCertificateCode(e.target.value.slice(0, MAX_CODE_LENGTH))} />
                <p className="text-xs text-muted-foreground">Enter the Certificate ID issued by your institution</p>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">PDF Only.</span> We accept PDF files up to 10MB. Ensure your certificate is in PDF format.
                </p>
              </div>
            </div>

            {/* Verify Button */}
            <Button
              size="lg"
              className="w-full mt-6"
              onClick={handleVerify}
              disabled={!file || !title || !issuer || !certificateCode || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify Certificate
                </>
              )}
            </Button>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-success" />
                Secure Upload
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                Database Verified
              </span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Verify;

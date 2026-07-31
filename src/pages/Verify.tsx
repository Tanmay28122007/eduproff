import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { Upload, FileCheck, Shield, Loader2, Cpu, CheckCircle2, ArrowRight, Share2, Award, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  analyzeAchievement,
  TrustAnalysisResult,
  EvidenceItem,
  VerifierEndorsement,
} from "@/services/trustEngine";
import { ConfidenceMeter } from "@/components/trust/ConfidenceMeter";
import { AIExplainablePanel } from "@/components/trust/AIExplainablePanel";
import { EvidenceTimeline } from "@/components/trust/EvidenceTimeline";
import { EvidenceUploader } from "@/components/trust/EvidenceUploader";
import { HumanEndorsementCard } from "@/components/trust/HumanEndorsementCard";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg"];

const validateFileType = (file: File): boolean => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    toast.error("Please upload a valid PDF or Image file (PDF, PNG, JPG).");
    return false;
  }
  return true;
};

const SCAN_STEPS = [
  "Running AI Forensic Tamper Detection...",
  "Parsing OCR & Validating Date/Text Logic...",
  "Cross-Matching Supporting Evidence Files...",
  "Querying Public Registries (GitHub, Kaggle, Winner Lists)...",
  "Verifying Cryptographic Signatures & Hashes...",
  "Computing Achievement Trust Score (0-100%)...",
];

const Verify = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  // Core Form State
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [certificateCode, setCertificateCode] = useState("");
  const [studentName, setStudentName] = useState(user?.email?.split("@")[0] || "");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);

  // Evidence & Links
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [endorsements, setEndorsements] = useState<VerifierEndorsement[]>([]);

  // Engine Output
  const [trustResult, setTrustResult] = useState<TrustAnalysisResult | null>(null);

  const MAX_FILE_SIZE = 15 * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };

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

  const handleRunTrustEngine = async () => {
    if (!title.trim() || !issuer.trim()) {
      toast.error("Please enter the Achievement Title and Issuing Organization.");
      return;
    }

    if (file && file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 15MB limit.");
      return;
    }

    setIsVerifying(true);
    setScanStepIndex(0);

    // Step-by-step progress simulation
    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const result = await analyzeAchievement({
        title,
        issuer,
        certificateCode,
        studentName: studentName || user?.email?.split("@")[0],
        issueDate,
        file,
        evidenceItems,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        endorsements,
      });

      setTimeout(() => {
        clearInterval(stepInterval);
        setTrustResult(result);
        setIsVerifying(false);
        toast.success("Achievement Trust Analysis Complete!");
      }, 2600);
    } catch (err) {
      clearInterval(stepInterval);
      setIsVerifying(false);
      console.error("Trust Engine Error:", err);
      toast.error("An error occurred during trust engine analysis.");
    }
  };

  const handleSaveAchievement = async () => {
    if (!user || !trustResult) return;
    try {
      await supabase.from("certificates").insert({
        user_id: user.id,
        title: trustResult.achievementTitle,
        issuer: trustResult.issuerName,
        issue_date: trustResult.issueDate,
        verification_status: trustResult.overallConfidenceScore >= 75 ? "verified" : "failed",
        verification_message: `Trust Score: ${trustResult.overallConfidenceScore}% (${trustResult.confidenceLevel})`,
      });

      await supabase.from("verification_logs").insert({
        certificate_id: trustResult.certificateId,
        recruiter_id: user.id,
        status: trustResult.overallConfidenceScore >= 75 ? "verified" : "failed",
        trust_score: trustResult.overallConfidenceScore,
      });

      toast.success("Achievement saved to student profile!");
      navigate("/student");
    } catch (err) {
      console.error("Error saving achievement:", err);
      toast.error("Could not save to database.");
    }
  };

  const handleReanalyzeWithEvidence = async (updatedItems: EvidenceItem[]) => {
    setEvidenceItems(updatedItems);
    if (!trustResult) return;

    const updatedResult = await analyzeAchievement({
      title,
      issuer,
      certificateCode,
      studentName,
      issueDate,
      file,
      evidenceItems: updatedItems,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      endorsements,
    });
    setTrustResult(updatedResult);
    toast.info("Re-calculated Trust Score with new evidence!");
  };

  const handleAddEndorsement = async (newEndorsement: VerifierEndorsement) => {
    const updatedEndorsements = [...endorsements, newEndorsement];
    setEndorsements(updatedEndorsements);
    if (trustResult) {
      const updatedResult = await analyzeAchievement({
        title,
        issuer,
        certificateCode,
        studentName,
        issueDate,
        file,
        evidenceItems,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        endorsements: updatedEndorsements,
      });
      setTrustResult(updatedResult);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-secondary/40 to-background border-b border-border/40">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              EduProof Achievement Trust Engine v2
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Verify Authentic Achievement
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Never rely solely on editable PDFs. EduProof evaluates achievements across <span className="text-foreground font-semibold">6 independent trust signals</span> to compute an explainable Confidence Score.
            </p>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-6 max-w-4xl space-y-8">
          {/* Scanning Progress Overlay */}
          {isVerifying && (
            <div className="bg-card rounded-2xl p-10 shadow-soft border border-primary/20 text-center space-y-6 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Cpu className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Analyzing Achievement Trust Signals...
                </h3>
                <p className="text-sm text-primary font-mono font-medium">
                  {SCAN_STEPS[scanStepIndex]}
                </p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 max-w-md mx-auto overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${((scanStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Form & Upload Workspace (Show when not analyzed yet or re-editing) */}
          {!isVerifying && (
            <div className="space-y-8">
              {/* Document Upload Area */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-4">
                <h3 className="font-display font-bold text-foreground text-base flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  1. Achievement Document (Certificate PDF or Image)
                </h3>

                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : file
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:border-primary/40 hover:bg-secondary/20"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-foreground text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "Document"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Replace document
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-medium text-foreground text-sm">
                        Drop Certificate PDF or Image here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports PDF, PNG, JPG up to 15MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Achievement Metadata Details */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-4">
                <h3 className="font-display font-bold text-foreground text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  2. Achievement Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-medium">
                      Achievement Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. Winner - Global AI Hackathon 2025"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issuer" className="text-xs font-medium">
                      Issuing Organization / Organizer *
                    </Label>
                    <Input
                      id="issuer"
                      placeholder="e.g. Stanford University / Google"
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="studentName" className="text-xs font-medium">
                      Student / Recipient Full Name
                    </Label>
                    <Input
                      id="studentName"
                      placeholder="e.g. Alex Morgan"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="certificateCode" className="text-xs font-medium">
                      Certificate ID / Code (if available)
                    </Label>
                    <Input
                      id="certificateCode"
                      placeholder="e.g. EDU-2025-8849"
                      value={certificateCode}
                      onChange={(e) => setCertificateCode(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Evidence Uploader Component */}
              <EvidenceUploader
                evidenceItems={evidenceItems}
                onChange={setEvidenceItems}
                githubUrl={githubUrl}
                setGithubUrl={setGithubUrl}
                linkedinUrl={linkedinUrl}
                setLinkedinUrl={setLinkedinUrl}
                portfolioUrl={portfolioUrl}
                setPortfolioUrl={setPortfolioUrl}
              />

              {/* Submit Engine Trigger */}
              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold gap-2 shadow-lg"
                onClick={handleRunTrustEngine}
                disabled={!title || !issuer || isVerifying}
              >
                <Shield className="w-5 h-5" />
                Analyze Achievement Trust & Calculate Confidence Score
              </Button>
            </div>
          )}

          {/* Render Trust Results Dashboard when ready */}
          {!isVerifying && trustResult && (
            <div className="space-y-8 animate-fadeIn">
              {/* Confidence Meter */}
              <ConfidenceMeter
                score={trustResult.overallConfidenceScore}
                confidenceLevel={trustResult.confidenceLevel}
                tamperRisk={trustResult.tamperRisk}
                tamperProbability={trustResult.tamperProbabilityScore}
              />

              {/* AI Explainable Panel */}
              <AIExplainablePanel result={trustResult} />

              {/* Timeline Visualization */}
              <EvidenceTimeline timeline={trustResult.timeline} />

              {/* Cross Evidence Re-Manager */}
              <EvidenceUploader
                evidenceItems={trustResult.evidenceItems}
                onChange={handleReanalyzeWithEvidence}
                githubUrl={githubUrl}
                setGithubUrl={setGithubUrl}
                linkedinUrl={linkedinUrl}
                setLinkedinUrl={setLinkedinUrl}
                portfolioUrl={portfolioUrl}
                setPortfolioUrl={setPortfolioUrl}
              />

              {/* Human Endorsements Section */}
              <HumanEndorsementCard
                endorsements={trustResult.endorsements}
                onAddEndorsement={handleAddEndorsement}
              />

              {/* Cryptographic Hash & Verification Badge Card */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-display font-bold text-foreground text-sm">
                    Cryptographic Achievement Anchor
                  </h4>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    Hash: {trustResult.cryptoHash}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/check?code=${trustResult.certificateId}`
                      );
                      toast.success("Public verification link copied to clipboard!");
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5" /> Copy Verification Link
                  </Button>

                  {user && (
                    <Button className="gap-1.5 text-xs" onClick={handleSaveAchievement}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Save to Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Verify;

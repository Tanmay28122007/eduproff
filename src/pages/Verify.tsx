import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import {
  Upload,
  FileCheck,
  Shield,
  Loader2,
  Cpu,
  CheckCircle2,
  Share2,
  Award,
  Sparkles,
  Layers,
  Settings2,
  Code,
  AlertCircle,
  RefreshCw,
  GitFork,
  HelpCircle,
  Database,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  analyzeAchievement,
  TrustAnalysisResult,
  EvidenceItem,
  VerifierEndorsement,
} from "@/services/trustEngine";
import {
  VerificationSignalWeights,
  DEFAULT_SIGNAL_WEIGHTS,
} from "@/services/aiCertificateVerificationEngine";
import { ConfidenceMeter } from "@/components/trust/ConfidenceMeter";
import { AIExplainablePanel } from "@/components/trust/AIExplainablePanel";
import { EvidenceTimeline } from "@/components/trust/EvidenceTimeline";
import { EvidenceUploader } from "@/components/trust/EvidenceUploader";
import { HumanEndorsementCard } from "@/components/trust/HumanEndorsementCard";
import { AICertificateVerificationPipeline } from "@/components/trust/AICertificateVerificationPipeline";
import { WeightConfigurator } from "@/components/trust/WeightConfigurator";
import { JSONOutputViewer } from "@/components/trust/JSONOutputViewer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "webp"];

const validateFileType = (file: File): boolean => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    toast.error("Please upload a valid PDF or Image file (PDF, PNG, JPG, WEBP).");
    return false;
  }
  return true;
};

const SCAN_STEPS = [
  "1. Sanitizing untrusted file payload & verifying security boundaries...",
  "2. Performing Document Classification (VALID / NOT_A_CERTIFICATE / UNCERTAIN)...",
  "3. Executing OCR & Extracting 12 Structured Certificate Metadata Fields...",
  "4. Running Visual Forensics (Font spacing, alignment, sharpness, compression)...",
  "5. Running PDF Forensics (Object streams, creation software, revision layers)...",
  "6. Evaluating Generative AI & Digital Manipulation Probabilities (0-100%)...",
  "7. Cross-Matching Institutional Issuer & Public Database Registries...",
  "8. Constructing Traceable Multi-Signal Evidence Graph...",
  "9. Aggregating Multi-Pillar Verification Confidence Score (0-100)...",
];

const Verify = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const analysisCountRef = useRef<number>(1);
  const latestAnalysisIdRef = useRef<string | null>(null);

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

  // Configurable Weights State
  const [signalWeights, setSignalWeights] = useState<VerificationSignalWeights>(DEFAULT_SIGNAL_WEIGHTS);

  // Engine Output & Error State
  const [trustResult, setTrustResult] = useState<TrustAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string>("");

  const MAX_FILE_SIZE = 15 * 1024 * 1024;

  const generateNewAnalysisId = (): string => {
    const nextNum = String(analysisCountRef.current++).padStart(3, "0");
    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const id = `analysis_${nextNum}_${uniqueSuffix}`;
    latestAnalysisIdRef.current = id;
    setActiveAnalysisId(id);
    return id;
  };

  /**
   * Completely clears previous analysis results and stale form state when a new file is uploaded/selected
   */
  const clearPreviousState = () => {
    setTrustResult(null);
    setAnalysisError(null);
    setTitle("");
    setIssuer("");
    setCertificateCode("");
    setStudentName(user?.email?.split("@")[0] || "");
    setEvidenceItems([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
    if (droppedFile && validateFileType(droppedFile)) {
      clearPreviousState();
      setFile(droppedFile);
      const newId = generateNewAnalysisId();
      triggerVerification(droppedFile, newId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFileType(selectedFile)) {
      clearPreviousState();
      setFile(selectedFile);
      const newId = generateNewAnalysisId();
      triggerVerification(selectedFile, newId);
    }
  };

  const handleReplaceDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    clearPreviousState();
  };

  const triggerVerification = async (
    targetFile: File | null,
    analysisIdStr: string,
    weightsOverride?: VerificationSignalWeights
  ) => {
    if (targetFile && targetFile.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 15MB limit.");
      return;
    }

    setIsVerifying(true);
    setScanStepIndex(0);
    setTrustResult(null);
    setAnalysisError(null);

    const activeWeights = weightsOverride || signalWeights;

    // Step-by-step progress simulation
    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 280);

    try {
      const result = await analyzeAchievement({
        analysisId: analysisIdStr,
        title: title || targetFile?.name?.replace(/\.[^/.]+$/, "").replace(/_/g, " ") || "Certificate",
        issuer: issuer || "Issuing Institution",
        certificateCode,
        studentName: studentName || user?.email?.split("@")[0],
        issueDate,
        file: targetFile,
        evidenceItems,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        endorsements,
        customWeights: activeWeights,
      });

      clearInterval(stepInterval);

      // Verify request is still the latest active analysis ID
      if (analysisIdStr !== latestAnalysisIdRef.current) {
        console.log(`[ANALYSIS_DISCARDED] Stale analysis response ignored for ${analysisIdStr}`);
        return;
      }

      setTrustResult(result);
      setIsVerifying(false);
      toast.success(`Forensic Analysis (${analysisIdStr}) Complete!`);
    } catch (err) {
      clearInterval(stepInterval);
      setIsVerifying(false);
      console.error(`[ANALYSIS_ERROR] Verification failed for ${analysisIdStr}:`, err);

      if (analysisIdStr === latestAnalysisIdRef.current) {
        setTrustResult(null);
        setAnalysisError("We could not complete forensic inspection on this document. Please verify the file and try again.");
      }
    }
  };

  const handleManualRunClick = () => {
    const currentId = activeAnalysisId || generateNewAnalysisId();
    triggerVerification(file, currentId);
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

  const handleApplyNewWeights = (newWeights: VerificationSignalWeights) => {
    setSignalWeights(newWeights);
    if (file || title) {
      const currentId = activeAnalysisId || generateNewAnalysisId();
      triggerVerification(file, currentId, newWeights);
    }
  };

  const handleReanalyzeWithEvidence = async (updatedItems: EvidenceItem[]) => {
    setEvidenceItems(updatedItems);
    if (!file && !title) return;

    const currentId = activeAnalysisId || generateNewAnalysisId();
    triggerVerification(file, currentId);
  };

  const handleAddEndorsement = async (newEndorsement: VerifierEndorsement) => {
    const updatedEndorsements = [...endorsements, newEndorsement];
    setEndorsements(updatedEndorsements);
    if (file || title) {
      const currentId = activeAnalysisId || generateNewAnalysisId();
      triggerVerification(file, currentId);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-secondary/40 to-background border-b border-border/40">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              Specialized Certificate Forensics AI Engine
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Verify Document Authenticity
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Multi-signal forensic analysis inspecting document classification, typography consistency, PDF stream layers, AI-generated artifacts, and independent institutional verification.
            </p>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-6 max-w-4xl space-y-8">
          {/* Active Analysis ID Header */}
          {activeAnalysisId && (
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono bg-secondary/30 px-4 py-2.5 rounded-xl border border-border/40">
              <span>Active Session: <strong>{activeAnalysisId}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Independent Execution Context</span>
            </div>
          )}

          {/* Scanning Progress Overlay */}
          {isVerifying && (
            <div className="bg-card rounded-2xl p-10 shadow-soft border border-primary/20 text-center space-y-6 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Running Forensic Engine Pipeline...
                </h3>
                <p className="text-xs text-primary font-mono font-medium">
                  {SCAN_STEPS[scanStepIndex]}
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${((scanStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Step {scanStepIndex + 1} of {SCAN_STEPS.length}</span>
                  <span>{Math.round(((scanStepIndex + 1) / SCAN_STEPS.length) * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {!isVerifying && analysisError && (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-red-700 dark:text-red-400 text-base">
                  Forensic Analysis Interrupted
                </h3>
                <p className="text-sm text-foreground/90 max-w-md mx-auto">
                  {analysisError}
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 font-semibold text-xs"
                onClick={() => {
                  setAnalysisError(null);
                  if (file) {
                    const newId = generateNewAnalysisId();
                    triggerVerification(file, newId);
                  }
                }}
              >
                <RefreshCw className="w-4 h-4" /> Try Uploading Again
              </Button>
            </div>
          )}

          {/* Form & Upload Workspace */}
          {!isVerifying && (
            <div className="space-y-8">
              {/* Document Upload Area */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-xl hover:border-primary/40 transition-all duration-300 space-y-4">
                <h3 className="font-display font-bold text-foreground text-base flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  1. Achievement Document (Certificate PDF or Image)
                </h3>

                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : file
                      ? "border-emerald-500 bg-emerald-500/5 hover:border-emerald-500/80 hover:shadow-md"
                      : "border-border hover:border-primary/60 hover:bg-secondary/30 hover:scale-[1.005] hover:shadow-md cursor-pointer"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
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
                        onClick={handleReplaceDocument}
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
                        Supports PDF, PNG, JPG, WEBP up to 15MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Achievement Metadata Details */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-xl hover:border-primary/40 transition-all duration-300 space-y-4">
                <h3 className="font-display font-bold text-foreground text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  2. Optional Override Metadata Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-medium">
                      Achievement Title / Course Name
                    </Label>
                    <Input
                      id="title"
                      placeholder="Auto-extracted from document or enter manually"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issuer" className="text-xs font-medium">
                      Issuing Organization / Organizer
                    </Label>
                    <Input
                      id="issuer"
                      placeholder="Auto-extracted from document or enter manually"
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
                      placeholder="Auto-extracted from document or enter manually"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="certificateCode" className="text-xs font-medium">
                      Certificate ID / Serial Number (if available)
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
                onClick={handleManualRunClick}
                disabled={isVerifying}
              >
                <Shield className="w-5 h-5" />
                Run Certificate Forensics Engine & Verify Authenticity
              </Button>
            </div>
          )}

          {/* Render Trust & AI Verification Results Dashboard */}
          {!isVerifying && trustResult && (
            <div className="space-y-8 animate-fadeIn">
              <Tabs defaultValue="pipeline" className="w-full space-y-6">
                <TabsList className="grid grid-cols-4 w-full h-12 bg-secondary/50 p-1 rounded-xl">
                  <TabsTrigger value="pipeline" className="gap-1.5 text-xs font-bold">
                    <Layers className="w-3.5 h-3.5" /> Forensics Pipeline
                  </TabsTrigger>
                  <TabsTrigger value="explainable" className="gap-1.5 text-xs font-bold">
                    <HelpCircle className="w-3.5 h-3.5" /> Explainable Audit
                  </TabsTrigger>
                  <TabsTrigger value="weights" className="gap-1.5 text-xs font-bold">
                    <Settings2 className="w-3.5 h-3.5" /> Signal Weights
                  </TabsTrigger>
                  <TabsTrigger value="json" className="gap-1.5 text-xs font-bold">
                    <Code className="w-3.5 h-3.5" /> Sec 24 JSON
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: AI Verification Pipeline & Evidence Graph */}
                <TabsContent value="pipeline" className="space-y-8">
                  {/* AI Certificate Verification Pipeline UI */}
                  {trustResult.aiVerificationResult && (
                    <AICertificateVerificationPipeline result={trustResult.aiVerificationResult} />
                  )}

                  {/* Confidence Meter */}
                  <ConfidenceMeter
                    score={trustResult.overallConfidenceScore}
                    confidenceLevel={trustResult.confidenceLevel}
                    tamperRisk={trustResult.tamperRisk}
                    tamperProbability={trustResult.tamperProbabilityScore}
                  />

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
                </TabsContent>

                {/* Tab 2: Explainable Trust Analysis */}
                <TabsContent value="explainable" className="space-y-6">
                  <AIExplainablePanel result={trustResult} />
                </TabsContent>

                {/* Tab 3: Configurable Signal Weights */}
                <TabsContent value="weights" className="space-y-6">
                  <WeightConfigurator
                    currentWeights={signalWeights}
                    onApplyWeights={handleApplyNewWeights}
                  />
                </TabsContent>

                {/* Tab 4: Strict Section 24 Structured JSON Payload */}
                <TabsContent value="json" className="space-y-6">
                  {trustResult.aiVerificationResult && (
                    <JSONOutputViewer result={trustResult.aiVerificationResult} />
                  )}
                </TabsContent>
              </Tabs>

              {/* Cryptographic Hash & Verification Badge Card */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6">
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

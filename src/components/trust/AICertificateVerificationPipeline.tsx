import React, { useState } from "react";
import { AICertificateVerificationResult } from "@/services/aiCertificateVerificationEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Award,
  Search,
  Cpu,
  Layers,
  Info,
  ShieldCheck,
  Building,
  UserCheck,
  Calendar,
  Key,
  Globe,
  PenTool,
  Sparkles,
  GitFork,
  Database,
  FileCode,
} from "lucide-react";
import { EvidenceGraphVisualizer } from "./EvidenceGraphVisualizer";
import { ForensicDatasetReviewModal } from "./ForensicDatasetReviewModal";

interface AICertificateVerificationPipelineProps {
  result: AICertificateVerificationResult;
}

export const AICertificateVerificationPipeline: React.FC<AICertificateVerificationPipelineProps> = ({ result }) => {
  const [showWhySection, setShowWhySection] = useState(true);
  const [showGraph, setShowGraph] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "HIGHLY_VERIFIED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold px-3 py-1 text-xs">HIGHLY VERIFIED</Badge>;
      case "LIKELY_GENUINE":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold px-3 py-1 text-xs">LIKELY GENUINE</Badge>;
      case "NEEDS_REVIEW":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold px-3 py-1 text-xs">NEEDS REVIEW</Badge>;
      case "SUSPICIOUS":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30 font-bold px-3 py-1 text-xs">SUSPICIOUS</Badge>;
      case "LIKELY_INVALID":
      default:
        return <Badge variant="destructive" className="font-bold px-3 py-1 text-xs">LIKELY INVALID</Badge>;
    }
  };

  const pipelineStages = [
    { label: "1. File Validation", status: true, icon: FileCheck },
    { label: "2. Document Classifier", status: result.is_certificate, icon: Layers },
    { label: "3. OCR Stream", status: true, icon: Search },
    { label: "4. 12-Field Extraction", status: result.extracted_information.name !== "NOT_FOUND", icon: Key },
    { label: "5. Visual Typography", status: result.manipulation_status !== "STRONG_MANIPULATION_EVIDENCE", icon: PenTool },
    { label: "6. PDF Object Streams", status: true, icon: FileCode },
    { label: "7. AI Artifact Detector", status: result.ai_manipulation_probability < 65, icon: Sparkles },
    { label: "8. Issuer Registry", status: result.issuer_verification !== "FAILED", icon: Building },
    { label: "9. Cross-Evidence", status: true, icon: Globe },
    { label: "10. Evidence Graph", status: true, icon: GitFork },
    { label: "11. Risk Engine", status: true, icon: ShieldCheck },
    { label: "12. Confidence Aggregator", status: true, icon: Award },
    { label: "13. Forensic Report", status: true, icon: Cpu },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive 13-Stage Verification Header Bar */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-foreground text-base">
                  EduProof Specialized Forensics Engine
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono bg-primary/5 text-primary border-primary/20">
                  13-Stage Pipeline
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Deterministic forensic tools + multimodal reasoning layer with strict zero-hallucination rules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReviewModalOpen(true)}
              className="text-xs gap-1.5 border-primary/30 hover:bg-primary/5"
            >
              <Database className="w-3.5 h-3.5 text-primary" />
              Auditor Feedback
            </Button>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">
                Verification Confidence
              </span>
              <span className="font-mono text-xl font-extrabold text-foreground">
                {result.verification_confidence}/100
              </span>
            </div>
            {getStatusBadge(result.authenticity_status)}
          </div>
        </div>

        {/* 13 Stage Pipeline Grid Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {pipelineStages.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                  item.status
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400"
                }`}
              >
                <div className="flex items-center gap-1">
                  <IconComp className="w-3 h-3 opacity-75" />
                  <CheckCircle2 className={`w-3 h-3 ${item.status ? "text-emerald-500" : "text-amber-500"}`} />
                </div>
                <span className="text-[9px] font-semibold leading-tight">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Human Review Trigger Callout Banner */}
      {result.manual_review_required && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-amber-700 dark:text-amber-400 text-sm">
                Manual Verification Recommended (MANUAL_REVIEW_REQUIRED)
              </h4>
              <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-none text-[10px]">
                Triggered by Risk Engine
              </Badge>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              This achievement has been queued for human review. In accordance with EduProof credibility rules, whenever objective signals (such as institutional lookup or metadata revision history) are ambiguous or score between 40-74, human auditor review is required.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Evidence Graph Visualizer */}
      {result.evidence_graph && result.evidence_graph.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Traceable Evidence Graph</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGraph(!showGraph)}
              className="text-xs h-7"
            >
              {showGraph ? "Collapse Graph" : "Expand Graph"}
            </Button>
          </div>

          {showGraph && <EvidenceGraphVisualizer nodes={result.evidence_graph} />}
        </div>
      )}

      {/* 4 Separate Questions Architecture View */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground text-base">
            4-Question Independent Verification Separation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question 1 */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-primary" />
                1. Is this actually a certificate?
              </span>
              <Badge className={result.is_certificate ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]" : "bg-red-500/10 text-red-600 border-red-500/20 text-[10px]"}>
                {result.is_certificate ? "YES" : result.certificate_classification}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.details.question1_is_certificate.reasoning}
            </p>
          </div>

          {/* Question 2 */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" />
                2. Does the certificate appear genuine?
              </span>
              {getStatusBadge(result.authenticity_status)}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verification Confidence Score: <strong>{result.verification_confidence}/100</strong> ({result.authenticity_status.replace(/_/g, " ")})
            </p>
          </div>

          {/* Question 3 */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-primary" />
                3. Does it show signs of digital manipulation?
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {result.ai_manipulation_probability}% AI Risk
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Status: <strong>{result.manipulation_status.replace(/_/g, " ")}</strong>. {result.details.question3_manipulation.indicators[0] || "No manipulation detected."}
            </p>
          </div>

          {/* Question 4 */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-primary" />
                4. Can issuer be independently verified?
              </span>
              <Badge className={result.issuer_verification === "VERIFIED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]" : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"}>
                {result.issuer_verification}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.details.question4_issuer_verifiable.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Extracted 12-Field Metadata Grid */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground text-base">
            Extracted Structured Certificate Metadata (Zero Hallucination)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "Student Name", val: result.extracted_information.name, icon: UserCheck },
            { label: "Certificate Type", val: result.extracted_information.certificate_type, icon: Award },
            { label: "Achievement", val: result.extracted_information.achievement, icon: Sparkles },
            { label: "Issuing Organization", val: result.extracted_information.issuer, icon: Building },
            { label: "Certificate ID", val: result.extracted_information.certificate_id, icon: Key },
            { label: "Issue Date", val: result.extracted_information.date, icon: Calendar },
            { label: "Course / Event", val: result.extracted_information.course_or_event, icon: Layers },
            { label: "Signatory", val: result.extracted_information.signatory, icon: PenTool },
            { label: "Organization Website", val: result.extracted_information.organization_website, icon: Globe },
          ].map((item, idx) => {
            const IconComp = item.icon;
            const isNotFound = item.val === "NOT_FOUND";

            return (
              <div key={idx} className="p-3 rounded-xl bg-secondary/30 border border-border/40 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <IconComp className="w-3.5 h-3.5 text-primary" />
                  {item.label}
                </span>
                {isNotFound ? (
                  <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-muted-foreground/30">
                    NOT_FOUND
                  </Badge>
                ) : (
                  <span className="text-xs font-bold text-foreground block truncate">
                    {item.val}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable "WHY DID EDUPROOF GIVE THIS RESULT?" Accordion Section */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-4">
        <div
          className="flex items-center justify-between cursor-pointer border-b border-border/60 pb-3"
          onClick={() => setShowWhySection(!showWhySection)}
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-foreground text-base">
              WHY DID EDUPROOF GIVE THIS RESULT?
            </h3>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            {showWhySection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showWhySection ? "Hide Evidence" : "Show Evidence"}
          </Button>
        </div>

        {showWhySection && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-xs text-foreground/90 bg-secondary/40 p-4 rounded-xl border border-border/40 leading-relaxed font-sans">
              "{result.final_conclusion}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Positive Evidence */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Positive Evidence Signals ({result.evidence.positive.length})
                </h4>
                <ul className="space-y-1.5">
                  {result.evidence.positive.map((item, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Warnings & Indicators */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Risk Warnings & Indicators ({result.evidence.warnings.length + (result.evidence.risk_indicators?.length || 0)})
                </h4>
                <ul className="space-y-1.5">
                  {result.evidence.warnings.map((item, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-2">
                      <span className="text-amber-500 font-bold">⚠</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {result.evidence.risk_indicators?.map((item, i) => (
                    <li key={`risk_${i}`} className="text-xs text-red-500 flex items-start gap-2">
                      <span className="text-red-500 font-bold">⚠</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {result.evidence.warnings.length === 0 && (!result.evidence.risk_indicators || result.evidence.risk_indicators.length === 0) && (
                    <li className="text-xs text-muted-foreground italic">No structural or verification risks identified.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Warning Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-secondary/60 border border-border/50 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Forensic Assurance Policy:</strong> AI detection is probabilistic and cannot guarantee authenticity from visual appearance alone. Independent institutional verification provides significantly higher confidence evidence.
        </p>
      </div>

      {/* Auditor Review Modal */}
      <ForensicDatasetReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        analysisId={result.analysis_id}
        fileName={result.raw_forensic_response?.file.name || "certificate_document"}
        predictedCategory={
          result.authenticity_status === "HIGHLY_VERIFIED" || result.authenticity_status === "LIKELY_GENUINE"
            ? "GENUINE_CERTIFICATE"
            : result.manipulation_status === "STRONG_MANIPULATION_EVIDENCE"
            ? "MANIPULATED_CERTIFICATE"
            : result.ai_manipulation_probability >= 65
            ? "AI_GENERATED_CERTIFICATE"
            : "UNCERTAIN"
        }
        predictedScore={result.verification_confidence}
      />
    </div>
  );
};

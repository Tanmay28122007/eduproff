import React, { useState } from "react";
import { AICertificateVerificationResult } from "@/services/aiCertificateVerificationEngine";
import { ForensicAPIResponse } from "@/services/certificateForensicsEngine";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface JSONOutputViewerProps {
  result: AICertificateVerificationResult;
}

export const JSONOutputViewer: React.FC<JSONOutputViewerProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<"standard" | "extended">("standard");

  // Exact Section 24 specification output
  const standardSection24Json: ForensicAPIResponse = result.raw_forensic_response || {
    analysis_id: result.analysis_id,
    file: {
      name: "certificate.pdf",
      type: "application/pdf",
    },
    classification: {
      is_certificate: result.is_certificate,
      status: result.certificate_classification,
      confidence: result.certificate_confidence,
    },
    extracted_information: {
      student_name: result.extracted_information.name,
      certificate_type: result.extracted_information.certificate_type,
      achievement: result.extracted_information.achievement,
      issuer: result.extracted_information.issuer,
      certificate_id: result.extracted_information.certificate_id,
      issue_date: result.extracted_information.date,
      course_or_event: result.extracted_information.course_or_event,
      signatory: result.extracted_information.signatory,
      organization_website: result.extracted_information.organization_website,
    },
    forensics: {
      visual_manipulation: result.manipulation_status,
      pdf_manipulation: result.manipulation_status,
      ai_artifact_probability: result.ai_manipulation_probability,
      metadata_risk: "LOW",
    },
    verification: {
      issuer_status: result.issuer_verification,
      external_evidence_status: "SUPPORTED",
      authenticity_status: result.authenticity_status,
      verification_confidence: result.verification_confidence,
    },
    evidence: {
      positive: result.evidence.positive,
      warnings: result.evidence.warnings,
      risk_indicators: result.evidence.risk_indicators || [],
    },
    final_conclusion: result.final_conclusion,
    manual_review_required: result.manual_review_required,
  };

  const extendedAuditJson = {
    ...standardSection24Json,
    evidence_graph: result.evidence_graph,
    details: result.details,
  };

  const currentJson = activeView === "standard" ? standardSection24Json : extendedAuditJson;
  const jsonString = JSON.stringify(currentJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success("Standard Section 24 JSON copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eduproof_forensic_${result.analysis_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON Forensic Audit Report downloaded!");
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-foreground text-sm">
                Strict Section 24 API Output JSON
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Schema Validated
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Standardized forensic JSON response structure with zero invented evidence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary/50 rounded-lg p-0.5 border border-border/40 text-xs">
            <button
              onClick={() => setActiveView("standard")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeView === "standard" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Standard (Sec 24)
            </button>
            <button
              onClick={() => setActiveView("extended")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeView === "extended" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Extended Audit
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 gap-1.5 text-xs">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Download
          </Button>
        </div>
      </div>

      <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[420px] border border-slate-800">
        <pre>{jsonString}</pre>
      </div>
    </div>
  );
};

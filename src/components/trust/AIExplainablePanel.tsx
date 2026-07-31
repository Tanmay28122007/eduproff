import React from "react";
import { TrustAnalysisResult } from "@/services/trustEngine";
import { CheckCircle, AlertTriangle, Cpu, Globe, Search, Lock, UserCheck, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AIExplainablePanelProps {
  result: TrustAnalysisResult;
}

export const AIExplainablePanel: React.FC<AIExplainablePanelProps> = ({ result }) => {
  const pillars = [
    { label: "AI Forensic Scan", score: result.pillarScores.forensics, weight: "20%", icon: Cpu },
    { label: "OCR & Content Logic", score: result.pillarScores.ocrValidation, weight: "15%", icon: Search },
    { label: "Cross-Evidence Alignment", score: result.pillarScores.crossEvidence, weight: "25%", icon: Eye },
    { label: "Public Web Matching", score: result.pillarScores.publicWebMatch, weight: "20%", icon: Globe },
    { label: "Digital Signatures", score: result.pillarScores.digitalSignature, weight: "10%", icon: Lock },
    { label: "Human Verification", score: result.pillarScores.humanEndorsement, weight: "10%", icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Cpu className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-lg">
              Explainable AI Trust Analysis
            </h3>
            <p className="text-xs text-muted-foreground">
              Independent breakdown of verification evidence and potential risks
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground/90 bg-secondary/40 p-4 rounded-xl border border-border/40 leading-relaxed font-sans">
          "{result.aiSummary}"
        </p>

        {/* Positive Signals & Risk Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Verified Positive Signals */}
          <div className="space-y-3 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Verified Signals ({result.positiveSignals.length})
            </h4>
            <ul className="space-y-2">
              {result.positiveSignals.map((sig, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Potential Risks / Recommendations */}
          <div className="space-y-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Potential Risks & Gaps ({result.riskWarnings.length})
            </h4>
            <ul className="space-y-2">
              {result.riskWarnings.length > 0 ? (
                result.riskWarnings.map((warn, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-amber-500 font-bold">⚠</span>
                    <span>{warn}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground italic">No structural or verification risks identified.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 6-Pillar Score Composition */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
        <h3 className="font-display font-bold text-foreground text-base mb-4">
          Verification Pillar Weights & Scores
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <IconComponent className="w-4 h-4 text-primary" />
                    {item.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {item.score}% <span className="text-muted-foreground text-[10px]">({item.weight})</span>
                  </span>
                </div>
                <Progress value={item.score} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

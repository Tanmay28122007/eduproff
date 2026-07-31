import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConfidenceMeterProps {
  score: number; // 0-100
  confidenceLevel: string;
  tamperRisk: string;
  tamperProbability: number;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  confidenceLevel,
  tamperRisk,
  tamperProbability,
}) => {
  // Determine color theme
  let strokeColor = "#10b981"; // emerald-500
  let badgeBg = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  let Icon = ShieldCheck;

  if (confidenceLevel === "Needs Manual Review" || score < 50) {
    strokeColor = confidenceLevel === "Needs Manual Review" ? "#f97316" : "#ef4444"; // orange-500 / red-500
    badgeBg = confidenceLevel === "Needs Manual Review" 
      ? "bg-orange-500/10 text-orange-600 border-orange-500/20 font-bold" 
      : "bg-destructive/10 text-destructive border-destructive/20";
    Icon = ShieldAlert;
  } else if (score < 75) {
    strokeColor = "#f59e0b"; // amber-500
    badgeBg = "bg-amber-500/10 text-amber-600 border-amber-500/20";
    Icon = AlertTriangle;
  }

  // SVG Gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 flex flex-col md:flex-row items-center gap-6">
      {/* SVG Radial Gauge */}
      <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-muted/20"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-foreground font-display">
            {score}<span className="text-lg font-normal text-muted-foreground">%</span>
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
            Trust Score
          </span>
        </div>
      </div>

      {/* Info Breakdown */}
      <div className="flex-1 space-y-3 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <Badge className={`px-3 py-1 text-xs font-semibold ${badgeBg}`}>
            <Icon className="w-3.5 h-3.5 mr-1.5" />
            {confidenceLevel}
          </Badge>
          <Badge variant="outline" className="text-xs font-mono">
            Tamper Risk: {tamperRisk} ({tamperProbability}%)
          </Badge>
        </div>

        <h3 className="font-display text-xl font-bold text-foreground">
          Achievement Authenticity Report
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Evaluated using Multi-Source Evidence Cross-Validation, AI Forensics, Public Web Records, and Digital Hash Signature Verification.
        </p>

        <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/40">
            <span className="text-muted-foreground block text-[11px]">Forensic Status</span>
            <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Clean Layout
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/40">
            <span className="text-muted-foreground block text-[11px]">Evidence Layers</span>
            <span className="font-semibold text-foreground mt-0.5 block">
              Multi-Source Checked
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/40 col-span-2 sm:col-span-1">
            <span className="text-muted-foreground block text-[11px]">Validation Method</span>
            <span className="font-semibold text-foreground mt-0.5 block truncate">
              Trust Engine v2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

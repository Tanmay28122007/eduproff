import React, { useState } from "react";
import { VerificationSignalWeights, DEFAULT_SIGNAL_WEIGHTS } from "@/services/aiCertificateVerificationEngine";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Settings2, RotateCcw, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WeightConfiguratorProps {
  currentWeights: VerificationSignalWeights;
  onApplyWeights: (newWeights: VerificationSignalWeights) => void;
}

export const WeightConfigurator: React.FC<WeightConfiguratorProps> = ({
  currentWeights,
  onApplyWeights,
}) => {
  const [weights, setWeights] = useState<VerificationSignalWeights>(currentWeights);

  const totalSum =
    weights.classificationWeight +
    weights.ocrConsistencyWeight +
    weights.visualForensicsWeight +
    weights.pdfForensicsWeight +
    weights.issuerVerificationWeight +
    weights.externalEvidenceWeight;

  const handleSliderChange = (key: keyof VerificationSignalWeights, value: number[]) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value[0],
    }));
  };

  const handleReset = () => {
    setWeights(DEFAULT_SIGNAL_WEIGHTS);
    onApplyWeights(DEFAULT_SIGNAL_WEIGHTS);
  };

  const handleSave = () => {
    onApplyWeights(weights);
  };

  const signalItems = [
    {
      key: "classificationWeight" as keyof VerificationSignalWeights,
      label: "Certificate Classification",
      desc: "Document layout, structural pattern, and non-certificate rejection rules",
    },
    {
      key: "ocrConsistencyWeight" as keyof VerificationSignalWeights,
      label: "OCR / Text Consistency",
      desc: "Presence and consistency of recipient name, date, issuer, and certificate ID",
    },
    {
      key: "visualForensicsWeight" as keyof VerificationSignalWeights,
      label: "Visual Forensics",
      desc: "Font sharpness, character spacing, alignment, and pixel compression analysis",
    },
    {
      key: "pdfForensicsWeight" as keyof VerificationSignalWeights,
      label: "PDF Forensics",
      desc: "PDF creation metadata, stream layers, and incremental revision objects",
    },
    {
      key: "issuerVerificationWeight" as keyof VerificationSignalWeights,
      label: "Issuer Verification",
      desc: "Public institutional registry match & authority lookup",
    },
    {
      key: "externalEvidenceWeight" as keyof VerificationSignalWeights,
      label: "External Evidence",
      desc: "Supporting links (GitHub repo, LinkedIn announcement, portfolio)",
    },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-base">
              Multi-Signal Verification Weight Configurator
            </h3>
            <p className="text-xs text-muted-foreground">
              Customize weight distribution across the 6 verification signals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="font-mono text-xs">
            Sum: {totalSum}% {totalSum === 100 ? "✓ Normalized" : ""}
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {signalItems.map((item) => {
          const val = weights[item.key];
          const normalizedPct = Math.round((val / (totalSum || 1)) * 100);

          return (
            <div key={item.key} className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">{item.label}</Label>
                <div className="text-xs font-mono font-bold text-primary">
                  {val}% <span className="text-[10px] text-muted-foreground">({normalizedPct}% effective)</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
              <Slider
                value={[val]}
                min={0}
                max={50}
                step={5}
                onValueChange={(v) => handleSliderChange(item.key, v)}
                className="py-1"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="gap-2 font-semibold text-xs h-10 px-6">
          <Check className="w-4 h-4" /> Apply Custom Weight Matrix
        </Button>
      </div>
    </div>
  );
};

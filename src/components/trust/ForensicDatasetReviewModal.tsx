import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DatasetCategory,
  ManipulationType,
  saveEvaluationDatasetRecord,
} from "@/services/certificateForensicsEngine";
import { toast } from "sonner";
import { Database, CheckCircle2, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

interface ForensicDatasetReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  fileName: string;
  predictedCategory: DatasetCategory;
  predictedScore: number;
}

export const ForensicDatasetReviewModal: React.FC<ForensicDatasetReviewModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  fileName,
  predictedCategory,
  predictedScore,
}) => {
  const [humanLabel, setHumanLabel] = useState<DatasetCategory>(predictedCategory);
  const [manipulationType, setManipulationType] = useState<ManipulationType>("NONE");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = () => {
    setIsSubmitting(true);
    const isCorrect = humanLabel === predictedCategory;
    const isFalsePositive = (predictedCategory === "MANIPULATED_CERTIFICATE" || predictedCategory === "AI_GENERATED_CERTIFICATE") && humanLabel === "GENUINE_CERTIFICATE";
    const isFalseNegative = predictedCategory === "GENUINE_CERTIFICATE" && (humanLabel === "MANIPULATED_CERTIFICATE" || humanLabel === "AI_GENERATED_CERTIFICATE");

    saveEvaluationDatasetRecord({
      id: `review_${analysisId}_${Date.now()}`,
      analysis_id: analysisId,
      timestamp: new Date().toISOString(),
      file_name: fileName,
      predicted_category: predictedCategory,
      predicted_score: predictedScore,
      human_label: humanLabel,
      manipulation_type: humanLabel === "MANIPULATED_CERTIFICATE" ? manipulationType : "NONE",
      reviewer_notes: reviewerNotes,
      is_correct: isCorrect,
      is_false_positive: isFalsePositive,
      is_false_negative: isFalseNegative,
    });

    setIsSubmitting(false);
    toast.success("Auditor ground-truth label recorded in EduProof Evaluation Dataset.");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Database className="w-5 h-5" />
            <DialogTitle className="font-display font-bold">
              Auditor Continuous Learning & Dataset Review
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Submit verified ground-truth labels for this analysis to benchmark and continuously improve EduProof's Forensic AI models.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Metadata Card */}
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Analysis ID:</span>
              <span className="font-mono font-bold text-foreground">{analysisId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">File Analyzed:</span>
              <span className="font-medium text-foreground truncate max-w-[240px]">{fileName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Engine Prediction:</span>
              <Badge variant="outline" className="font-semibold text-[10px]">
                {predictedCategory} ({predictedScore}/100)
              </Badge>
            </div>
          </div>

          {/* Confirmed Ground Truth Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Confirmed Human Auditor Category (Ground Truth)
            </Label>
            <Select
              value={humanLabel}
              onValueChange={(val) => setHumanLabel(val as DatasetCategory)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select confirmed label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENUINE_CERTIFICATE">GENUINE_CERTIFICATE (Authentic award)</SelectItem>
                <SelectItem value="MANIPULATED_CERTIFICATE">MANIPULATED_CERTIFICATE (Tampered / Modified)</SelectItem>
                <SelectItem value="AI_GENERATED_CERTIFICATE">AI_GENERATED_CERTIFICATE (Generative Diffusion/LLM)</SelectItem>
                <SelectItem value="CERTIFICATE_TEMPLATE">CERTIFICATE_TEMPLATE (Blank / Unpopulated template)</SelectItem>
                <SelectItem value="NON_CERTIFICATE">NON_CERTIFICATE (Resume, Marksheet, ID Card, Poster)</SelectItem>
                <SelectItem value="UNCERTAIN">UNCERTAIN (Ambiguous evidence)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specific Manipulation Type (if manipulated) */}
          {humanLabel === "MANIPULATED_CERTIFICATE" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
              <Label className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Specific Manipulation Type Detected
              </Label>
              <Select
                value={manipulationType}
                onValueChange={(val) => setManipulationType(val as ManipulationType)}
              >
                <SelectTrigger className="text-xs border-amber-500/30">
                  <SelectValue placeholder="Select manipulation technique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NAME_EDIT">NAME_EDIT (Recipient name alteration)</SelectItem>
                  <SelectItem value="DATE_EDIT">DATE_EDIT (Issue date changed)</SelectItem>
                  <SelectItem value="CERTIFICATE_ID_EDIT">CERTIFICATE_ID_EDIT (Forged credential code)</SelectItem>
                  <SelectItem value="LOGO_EDIT">LOGO_EDIT (Replaced or spoofed institutional emblem)</SelectItem>
                  <SelectItem value="SIGNATURE_EDIT">SIGNATURE_EDIT (Copied/Pasted signatory block)</SelectItem>
                  <SelectItem value="SEAL_EDIT">SEAL_EDIT (Fabricated seal or stamp)</SelectItem>
                  <SelectItem value="TEXT_OVERLAY">TEXT_OVERLAY (Digitally inserted font layer)</SelectItem>
                  <SelectItem value="BACKGROUND_REPLACEMENT">BACKGROUND_REPLACEMENT (Altered background canvas)</SelectItem>
                  <SelectItem value="MULTIPLE_EDITS">MULTIPLE_EDITS (Compound tampering techniques)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Auditor Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Auditor Forensic Rationale & Notes
            </Label>
            <Textarea
              placeholder="e.g., Contacted registrar and verified student graduated in 2025; font mismatch in name row was due to publisher export plugin."
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              className="text-xs min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmitReview} disabled={isSubmitting}>
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
            Commit Ground Truth Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

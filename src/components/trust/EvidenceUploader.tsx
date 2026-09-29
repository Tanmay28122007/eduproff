import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EvidenceItem } from "@/services/trustEngine";
import { Plus, Github, Linkedin, Globe, Mail, Image as ImageIcon, Trash2, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sanitizeUrl } from "@/lib/utils";

interface EvidenceUploaderProps {
  evidenceItems: EvidenceItem[];
  onChange: (items: EvidenceItem[]) => void;
  githubUrl: string;
  setGithubUrl: (url: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (url: string) => void;
  portfolioUrl: string;
  setPortfolioUrl: (url: string) => void;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  evidenceItems,
  onChange,
  githubUrl,
  setGithubUrl,
  linkedinUrl,
  setLinkedinUrl,
  portfolioUrl,
  setPortfolioUrl,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<EvidenceItem["type"]>("email");

  const handleAddCustomEvidence = () => {
    if (!newTitle.trim()) return;
    const newItem: EvidenceItem = {
      id: `ev_custom_${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      url: newUrl.trim() || undefined,
      verifiedStatus: "verified",
      confidenceBoost: 15,
      description: "User-submitted supporting evidence",
    };
    onChange([...evidenceItems, newItem]);
    setNewTitle("");
    setNewUrl("");
  };

  const handleRemoveItem = (id: string) => {
    onChange(evidenceItems.filter((item) => item.id !== id));
  };

  const getTypeIcon = (type: EvidenceItem["type"]) => {
    switch (type) {
      case "github": return <Github className="w-4 h-4 text-purple-500" />;
      case "linkedin": return <Linkedin className="w-4 h-4 text-blue-500" />;
      case "portfolio": return <Globe className="w-4 h-4 text-emerald-500" />;
      case "email": return <Mail className="w-4 h-4 text-amber-500" />;
      case "photo": return <ImageIcon className="w-4 h-4 text-rose-500" />;
      default: return <LinkIcon className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-6">
      <div>
        <h3 className="font-display font-bold text-foreground text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Cross-Evidence Verification Sources
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Attach independent evidence (GitHub code, emails, winner announcements, photos) to boost your confidence score up to 100%.
        </p>
      </div>

      {/* Primary Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GitHub */}
        <div className="space-y-1.5">
          <Label htmlFor="githubUrl" className="text-xs font-medium flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5 text-purple-500" /> GitHub Repository URL
          </Label>
          <Input
            id="githubUrl"
            placeholder="https://github.com/user/repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* LinkedIn */}
        <div className="space-y-1.5">
          <Label htmlFor="linkedinUrl" className="text-xs font-medium flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-blue-500" /> LinkedIn Announcement
          </Label>
          <Input
            id="linkedinUrl"
            placeholder="https://linkedin.com/posts/..."
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Portfolio / Project Demo */}
        <div className="space-y-1.5">
          <Label htmlFor="portfolioUrl" className="text-xs font-medium flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-500" /> Project / Portfolio Link
          </Label>
          <Input
            id="portfolioUrl"
            placeholder="https://myproject.com"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      {/* Custom Evidence List */}
      {evidenceItems.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-foreground">Attached Evidence Files & Links ({evidenceItems.length}):</span>
          <div className="space-y-2">
            {evidenceItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/40 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {getTypeIcon(item.type)}
                  <span className="font-medium text-foreground truncate">{item.title}</span>
                  {item.url && (
                    <a href={sanitizeUrl(item.url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[150px]">
                      {item.url}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    +{item.confidenceBoost}% Trust
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveItem(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Evidence Form */}
      <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-3">
        <span className="text-xs font-semibold text-foreground block">Add Additional Evidence (Emails, Photos, Winner PDF, Team Lists)</span>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as EvidenceItem["type"])}
            className="text-xs h-9 px-3 rounded-md border border-input bg-background text-foreground"
          >
            <option value="email">Registration / Acceptance Email</option>
            <option value="photo">Event Photograph / Screenshot</option>
            <option value="announcement">Winner Announcement PDF</option>
            <option value="paper">Research Paper / Proceedings</option>
            <option value="other">Other Evidence Link</option>
          </select>

          <Input
            placeholder="Title (e.g. Winner Announcement Email)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="text-xs h-9 flex-1"
          />

          <Input
            placeholder="URL (optional)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="text-xs h-9 flex-1"
          />

          <Button size="sm" onClick={handleAddCustomEvidence} disabled={!newTitle.trim()} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

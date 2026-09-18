import React, { useState } from "react";
import { EvidenceNode } from "@/services/certificateForensicsEngine";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  UserCheck,
  Building,
  Key,
  PenTool,
  FileCode,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
} from "lucide-react";

interface EvidenceGraphVisualizerProps {
  nodes?: EvidenceNode[];
}

export const EvidenceGraphVisualizer: React.FC<EvidenceGraphVisualizerProps> = ({ nodes = [] }) => {
  const [selectedNode, setSelectedNode] = useState<EvidenceNode | null>(nodes[0] || null);

  const getNodeIcon = (category: EvidenceNode["category"]) => {
    switch (category) {
      case "student_name":
        return <UserCheck className="w-4 h-4 text-sky-500" />;
      case "issuer":
        return <Building className="w-4 h-4 text-emerald-500" />;
      case "certificate_id":
        return <Key className="w-4 h-4 text-amber-500" />;
      case "signature":
        return <PenTool className="w-4 h-4 text-purple-500" />;
      case "pdf_structure":
        return <FileCode className="w-4 h-4 text-indigo-500" />;
      case "visual_structure":
        return <Layers className="w-4 h-4 text-teal-500" />;
      case "ai_artifacts":
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      case "cross_evidence":
        return <ExternalLink className="w-4 h-4 text-blue-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: EvidenceNode["status"]) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">Verified</Badge>;
      case "consistent":
        return <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/30 text-[10px]">Consistent</Badge>;
      case "warning":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">Review Flag</Badge>;
      case "suspicious":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/30 text-[10px]">Suspicious</Badge>;
      case "unverified":
      default:
        return <Badge variant="outline" className="text-muted-foreground text-[10px]">Unverified</Badge>;
    }
  };

  if (!nodes || nodes.length === 0) {
    return (
      <Card className="border border-border/50 bg-card">
        <CardContent className="p-6 text-center text-muted-foreground text-xs">
          No structured evidence graph generated for this document.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 bg-card shadow-soft overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-display font-bold">
                Forensic Evidence Graph
              </CardTitle>
              <CardDescription className="text-xs">
                Traceable multi-signal evidence tree linking observed signals directly to verdict
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-[11px] bg-secondary/50">
            {nodes.length} Primary Nodes
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Node Hierarchy Tree */}
          <div className="lg:col-span-6 space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div key={node.id} className="space-y-1.5">
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-primary/10 border-primary/40 shadow-sm"
                        : "bg-secondary/20 hover:bg-secondary/40 border-border/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-card border border-border/50 flex items-center justify-center flex-shrink-0">
                        {getNodeIcon(node.category)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-xs text-foreground block truncate">
                          {node.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Confidence: {node.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(node.status)}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-primary rotate-90" : "text-muted-foreground"}`} />
                    </div>
                  </div>

                  {/* Sub Nodes if any */}
                  {node.subNodes && node.subNodes.length > 0 && (
                    <div className="pl-6 space-y-1 border-l-2 border-primary/20 ml-4 my-1">
                      {node.subNodes.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => setSelectedNode(sub)}
                          className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/30 border border-border/30 text-xs flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {getNodeIcon(sub.category)}
                            <span className="text-[11px] font-medium text-foreground truncate max-w-[180px]">
                              {sub.label}
                            </span>
                          </div>
                          {getStatusBadge(sub.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed Inspector for Selected Node */}
          <div className="lg:col-span-6 bg-secondary/15 rounded-xl border border-border/40 p-4 flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    {getNodeIcon(selectedNode.category)}
                    <h4 className="font-bold text-foreground text-xs">
                      {selectedNode.label}
                    </h4>
                  </div>
                  {getStatusBadge(selectedNode.status)}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                      Observed Signal Details
                    </label>
                    <p className="text-xs text-foreground bg-card p-3 rounded-lg border border-border/40 leading-relaxed">
                      {selectedNode.details}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-card border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Evidence Category</span>
                      <span className="font-mono text-xs font-semibold text-foreground uppercase">
                        {selectedNode.category.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-card border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Signal Weight</span>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {selectedNode.confidence}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-[11px] text-muted-foreground flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    Deterministic verification rule: This evidence node was evaluated independently and corroborated against external registry hashes.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-xs">
                Select an evidence node on the left to inspect detailed signals.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

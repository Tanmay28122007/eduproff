import React from "react";
import { TimelineMilestone } from "@/services/trustEngine";
import { CheckCircle2, Clock, Calendar, GitCommit, Award, UserCheck, FileCheck2 } from "lucide-react";
import { safeFormatDate } from "@/lib/utils";

interface EvidenceTimelineProps {
  timeline: TimelineMilestone[];
}

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({ timeline }) => {
  const getIcon = (type: TimelineMilestone["type"]) => {
    switch (type) {
      case "registration":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "commit":
        return <GitCommit className="w-4 h-4 text-purple-500" />;
      case "submission":
      case "evaluation":
        return <FileCheck2 className="w-4 h-4 text-amber-500" />;
      case "issuance":
      case "announcement":
        return <Award className="w-4 h-4 text-emerald-500" />;
      case "endorsement":
        return <UserCheck className="w-4 h-4 text-teal-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Achievement Evidence Timeline
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chronological sequence of verified signals from registration to issuance.
          </p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative flex items-start gap-4 group">
            {/* Circle Node */}
            <div className="absolute -left-[31px] top-0.5 w-7 h-7 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center shadow-sm group-hover:border-primary transition-colors">
              {getIcon(item.type)}
            </div>

            <div className="flex-1 bg-secondary/30 rounded-xl p-3.5 border border-border/40 hover:bg-secondary/50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-sm text-foreground">{item.title}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {safeFormatDate(item.date)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-background border border-border/50 text-[11px] font-medium text-foreground">
                  Source: {item.source}
                </span>
                {item.status === "confirmed" ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed Signal
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Estimated Match
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

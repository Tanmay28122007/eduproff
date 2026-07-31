import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, FileText, Share2, Eye, Trash2, Calendar, Building2, ExternalLink } from "lucide-react";
import { Certificate } from "@/hooks/useCertificates";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { safeFormatDate } from "@/lib/utils";

interface CertificateCardProps {
  certificate: Certificate;
  onDelete?: (id: string) => void;
}

export function CertificateCard({ certificate, onDelete }: CertificateCardProps) {
  // Parse trust score from message if available
  const match = certificate.verification_message?.match(/Trust Score: (\d+)%/);
  const score = match ? parseInt(match[1], 10) : certificate.verification_status === "verified" ? 94 : 35;

  const getStatusBadge = () => {
    if (score >= 75) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
          {score}% Trust Score
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-mono font-bold">
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-500" />
          {score}% Trust Score
        </Badge>
      );
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/check?code=${certificate.id}`;
    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: `Check out my verified achievement trust report: ${certificate.title}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Public verification trust link copied to clipboard!");
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium transition-all group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-display font-semibold text-foreground text-lg">
                {certificate.title}
              </h3>
              {getStatusBadge()}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                {certificate.issuer}
              </span>
              {certificate.issue_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {safeFormatDate(certificate.issue_date)}
                </span>
              )}
            </div>

            {certificate.verification_message && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {certificate.verification_message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
          {certificate.certificate_url && (
            <Button variant="outline" size="sm" asChild className="text-xs">
              <a href={certificate.certificate_url} target="_blank" rel="noopener noreferrer">
                <Eye className="w-3.5 h-3.5 mr-1" />
                View File
              </a>
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleShare} className="text-xs">
            <Share2 className="w-3.5 h-3.5 mr-1" />
            Share Report
          </Button>

          <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
            <Link to={`/check?code=${certificate.id}`}>
              <ExternalLink className="w-3.5 h-3.5" /> Full Trust Analysis
            </Link>
          </Button>

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(certificate.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

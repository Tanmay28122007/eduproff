import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, FileText, Share2, Eye, Trash2, Calendar, Building2 } from "lucide-react";
import { Certificate } from "@/hooks/useCertificates";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface CertificateCardProps {
  certificate: Certificate;
  onDelete?: (id: string) => void;
}

export function CertificateCard({ certificate, onDelete }: CertificateCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Verified
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Pending Analysis
          </Badge>
        );
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify?id=${certificate.id}`;
    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: `Check out my verified certificate: ${certificate.title}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Verification link copied to clipboard!");
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
              {getStatusBadge(certificate.verification_status)}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                {certificate.issuer}
              </span>
              {certificate.issue_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {new Date(certificate.issue_date).toLocaleDateString()}
                </span>
              )}
            </div>

            {certificate.verification_message && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {certificate.verification_message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
          {certificate.certificate_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={certificate.certificate_url} target="_blank" rel="noopener noreferrer">
                <Eye className="w-4 h-4 mr-1" />
                View PDF
              </a>
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link to={`/public-verify?id=${certificate.id}`}>
              Verify Link
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

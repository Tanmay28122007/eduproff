import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { CheckCircle, FileText, Share2, ArrowRight, Shield } from "lucide-react";

interface VerificationCheck {
  name: string;
  passed: boolean;
  score: number;
  details: string;
}

interface LocationState {
  trustScore?: number;
  checks?: VerificationCheck[];
  explanation?: string;
  status?: 'verified' | 'partially_verified' | 'invalid';
}

const UploadSuccess = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  
  const trustScore = state?.trustScore ?? 100;
  const status = state?.status ?? 'verified';
  const checks = state?.checks ?? [
    { name: "Certificate ID Lookup", passed: true, score: 100, details: "Certificate found in institutional database" },
  ];
  const explanation = state?.explanation ?? "Certificate Verified Successfully.";

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Certificate Verified
            </h1>
            <p className="text-muted-foreground mb-8">
              Your credential has been authenticated and added to your profile.
            </p>

            {/* Trust Score */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Trust Score</span>
                <span className={`font-display text-3xl font-bold ${
                  trustScore >= 70 ? 'text-success' : trustScore >= 50 ? 'text-warning' : 'text-destructive'
                }`}>{trustScore}<span className="text-base text-muted-foreground font-normal">/100</span></span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${trustScore >= 70 ? 'bg-success' : trustScore >= 50 ? 'bg-warning' : 'bg-destructive'}`}
                  style={{ width: `${trustScore}%` }}
                />
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success">
                <Shield className="w-3 h-3" />
                {status === 'partially_verified' ? 'PARTIALLY VERIFIED' : 'VERIFIED'}
              </div>
              <p className="text-sm text-muted-foreground mt-3">{explanation}</p>
            </div>

            {/* Checks */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-8 text-left">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">Verification Checks</h3>
              <div className="space-y-2">
                {checks.map((check, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      check.passed ? 'bg-success/5 border border-success/10' : 'bg-warning/5 border border-warning/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className={`w-4 h-4 ${check.passed ? 'text-success' : 'text-warning'}`} />
                      <span className="text-sm font-medium text-foreground">{check.name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      check.passed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>{check.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/student">
                  View Your CV
                  <FileText className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="w-4 h-4" />
                Share Certificate
              </Button>
            </div>

            <div className="mt-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/verify">
                  Verify Another
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default UploadSuccess;

import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { XCircle, RefreshCw, Headphones, ArrowRight, Shield, CheckCircle } from "lucide-react";

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
}

const UploadFailed = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  
  const trustScore = state?.trustScore ?? 0;
  const checks = state?.checks ?? [
    { name: "Certificate ID Lookup", passed: false, score: 0, details: "Certificate not found in institutional database" },
  ];
  const explanation = state?.explanation ?? "Certificate Not Found. Please check the ID and try again.";

  const failedChecks = checks.filter(c => !c.passed);

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto text-center">
            {/* Failed Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Verification Failed
            </h1>
            <p className="text-muted-foreground mb-8">
              The certificate could not be verified. Review the details below.
            </p>

            {/* Trust Score */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Trust Score</span>
                <span className="font-display text-3xl font-bold text-destructive">
                  {trustScore}<span className="text-base text-muted-foreground font-normal">/100</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full rounded-full bg-destructive transition-all duration-500"
                  style={{ width: `${Math.max(trustScore, 2)}%` }}
                />
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
                <Shield className="w-3 h-3" />
                NOT FOUND
              </div>
              <p className="text-sm text-muted-foreground mt-3">{explanation}</p>
            </div>

            {/* Checks */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-8 text-left">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">
                Verification Checks ({failedChecks.length} failed)
              </h3>
              <div className="space-y-2">
                {checks.map((check, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      check.passed ? 'bg-success/5 border border-success/10' : 'bg-destructive/5 border border-destructive/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {check.passed ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium text-foreground">{check.name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      check.passed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>{check.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/verify">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/support">
                  <Headphones className="w-4 h-4" />
                  Contact Support
                </Link>
              </Button>
            </div>

            <div className="mt-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  Back to Home
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

export default UploadFailed;

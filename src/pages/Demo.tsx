import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Gauge,
  Info
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DemoResult {
  verified: boolean;
  trustScore: number;
  status: "verified" | "partial" | "high-risk";
  checks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  explanation: string;
}

const demoResults: Record<string, DemoResult> = {
  "AWS-12345": {
    verified: true,
    trustScore: 95,
    status: "verified",
    checks: [
      { name: "User/Candidate ID", passed: true, details: "Credential ID AWS-12345 detected" },
      { name: "Duplicate Check", passed: true, details: "No duplicate certificates found" },
    ],
    explanation: "GENUINE CERTIFICATE: Credential ID verified. AWS provides verification codes on their certificates.",
  },
  "COURSE-67890": {
    verified: true,
    trustScore: 88,
    status: "verified",
    checks: [
      { name: "User/Candidate ID", passed: true, details: "Certificate ID COURSE-67890 detected" },
      { name: "Duplicate Check", passed: true, details: "No duplicate certificates found" },
    ],
    explanation: "GENUINE CERTIFICATE: Certificate ID verified. Coursera provides verification codes on their certificates.",
  },
  "FAKE-00000": {
    verified: false,
    trustScore: 0,
    status: "high-risk",
    checks: [
      { name: "User/Candidate ID", passed: false, details: "No User ID, Candidate ID, or similar identifier found" },
      { name: "Duplicate Check", passed: false, details: "Check skipped - primary verification failed" },
    ],
    explanation: "FAKE CERTIFICATE: No User ID, Candidate ID, or similar personal identifier was detected. Genuine certificates always include a unique identifier.",
  },
  "DUP-11111": {
    verified: false,
    trustScore: 65,
    status: "partial",
    checks: [
      { name: "User/Candidate ID", passed: true, details: "Student ID DUP-11111 detected" },
      { name: "Duplicate Check", passed: false, details: "Duplicate found: This certificate was already submitted" },
    ],
    explanation: "VERIFICATION ISSUE: While the certificate has valid identifiers, it appears to be a duplicate submission.",
  },
};

const Demo = () => {
  const [certificateCode, setCertificateCode] = useState("");
  const [result, setResult] = useState<DemoResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (!certificateCode.trim()) return;
    
    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      const demoResult = demoResults[certificateCode.toUpperCase()] || demoResults["FAKE-00000"];
      setResult(demoResult);
      setIsVerifying(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "success";
      case "partial": return "accent";
      case "high-risk": return "destructive";
      default: return "muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return CheckCircle;
      case "partial": return AlertTriangle;
      case "high-risk": return XCircle;
      default: return Info;
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Gauge className="w-4 h-4" />
              Interactive Demo
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Verification Dashboard Demo
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Try our verification system with sample certificate codes. See how EduProof provides 
              transparent, actionable verification results.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Interface */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Input Form */}
            <div className="bg-card rounded-2xl p-8 shadow-medium border border-border/50 mb-8">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Enter Certificate Code
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="code" className="text-sm font-medium text-foreground mb-2 block">
                    Certificate / Credential ID
                  </Label>
                  <Input
                    id="code"
                    placeholder="e.g., AWS-12345, COURSE-67890"
                    value={certificateCode}
                    onChange={(e) => setCertificateCode(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleVerify}
                  disabled={isVerifying || !certificateCode.trim()}
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Verify Credential
                    </>
                  )}
                </Button>
              </div>

              {/* Demo Codes Hint */}
              <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Try these demo codes:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(demoResults).map((code) => (
                    <button
                      key={code}
                      onClick={() => setCertificateCode(code)}
                      className="text-xs font-mono bg-background px-2 py-1 rounded border border-border hover:border-primary transition-colors"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div className="bg-card rounded-2xl p-8 shadow-medium border border-border/50 animate-fade-in">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                      Verification Result
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Code: <span className="font-mono">{certificateCode.toUpperCase()}</span>
                    </p>
                  </div>
                  {(() => {
                    const StatusIcon = getStatusIcon(result.status);
                    const color = getStatusColor(result.status);
                    return (
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        color === 'success' ? 'bg-success/10' :
                        color === 'accent' ? 'bg-accent/10' :
                        'bg-destructive/10'
                      }`}>
                        <StatusIcon className={`w-7 h-7 ${
                          color === 'success' ? 'text-success' :
                          color === 'accent' ? 'text-accent' :
                          'text-destructive'
                        }`} />
                      </div>
                    );
                  })()}
                </div>

                {/* Trust Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Trust Score</span>
                    <span className={`font-display font-bold text-2xl ${
                      result.status === 'verified' ? 'text-success' :
                      result.status === 'partial' ? 'text-accent' :
                      'text-destructive'
                    }`}>{result.trustScore}%</span>
                  </div>
                  <Progress value={result.trustScore} className="h-3" />
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                  result.status === 'verified' ? 'bg-success/10 text-success' :
                  result.status === 'partial' ? 'bg-accent/10 text-accent' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  {result.status === 'verified' && "✓ Verified"}
                  {result.status === 'partial' && "⚠ Partially Verified"}
                  {result.status === 'high-risk' && "✗ High Risk"}
                </div>

                {/* Individual Checks */}
                <div className="space-y-3 mb-6">
                  {result.checks.map((check, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        check.passed 
                          ? 'bg-success/5 border-success/20' 
                          : 'bg-destructive/5 border-destructive/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck className={`w-5 h-5 ${check.passed ? 'text-success' : 'text-destructive'}`} />
                        <div>
                          <span className="text-sm font-medium text-foreground block">{check.name}</span>
                          <span className="text-xs text-muted-foreground">{check.details}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        check.passed 
                          ? 'bg-success/20 text-success' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {check.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className={`p-4 rounded-lg border ${
                  result.status === 'verified' ? 'bg-success/5 border-success/20' :
                  result.status === 'partial' ? 'bg-accent/5 border-accent/20' :
                  'bg-destructive/5 border-destructive/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <Shield className={`w-5 h-5 mt-0.5 ${
                      result.status === 'verified' ? 'text-success' :
                      result.status === 'partial' ? 'text-accent' :
                      'text-destructive'
                    }`} />
                    <div>
                      <div className="font-medium text-foreground mb-1">Explanation</div>
                      <p className="text-sm text-muted-foreground">{result.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Verify Real Credentials?
            </h2>
            <p className="text-muted-foreground mb-6">
              Sign up to verify your actual certificates and build your verified credential portfolio.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Demo;
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  UserCheck, 
  FileText, 
  Search, 
  Gauge,
  ArrowRight,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Upload,
  FileCheck,
  Copy,
  Database
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const workflowSteps = [
  {
    step: 1,
    icon: UserCheck,
    title: "Identity & KYC Validation",
    description: "Before any verification begins, users must authenticate and verify their identity. This ensures that only legitimate users can submit credentials for verification.",
    details: [
      "Secure email/password authentication",
      "Role-based access (Candidate or Recruiter)",
      "Session management and security tokens",
    ],
  },
  {
    step: 2,
    icon: FileText,
    title: "Certificate Code & Document Upload",
    description: "Users upload their certificate PDF along with the certificate title and issuing organization. Our system accepts only PDF files to ensure document integrity.",
    details: [
      "PDF-only upload (no image manipulation)",
      "Certificate title and issuer metadata",
      "Secure file storage in encrypted buckets",
    ],
  },
  {
    step: 3,
    icon: Search,
    title: "Automated Verification Checks",
    description: "Our AI-powered system performs multiple verification checks to assess the authenticity of the credential.",
    details: [
      "User/Candidate ID Detection - Checks for Student ID, Certificate ID, or similar identifiers",
      "Duplicate Detection - Scans database for previously submitted credentials",
      "Issuer Recognition - Validates the issuing organization",
    ],
  },
  {
    step: 4,
    icon: Gauge,
    title: "Trust Score & Verification Output",
    description: "The system generates a transparent trust score with detailed explanations for each check, enabling informed decision-making.",
    details: [
      "Weighted trust score (0-100%)",
      "Individual check results with pass/fail status",
      "Clear explanation of verification outcome",
    ],
  },
];

const verificationExamples = [
  {
    status: "verified",
    title: "Verified",
    description: "Certificate passed all checks",
    color: "success",
    icon: CheckCircle,
    trustScore: 95,
    checks: [
      { name: "User/Candidate ID", passed: true },
      { name: "Duplicate Check", passed: true },
    ],
  },
  {
    status: "partial",
    title: "Partially Verified",
    description: "Some concerns detected",
    color: "accent",
    icon: AlertTriangle,
    trustScore: 65,
    checks: [
      { name: "User/Candidate ID", passed: true },
      { name: "Duplicate Check", passed: false },
    ],
  },
  {
    status: "high-risk",
    title: "High Risk",
    description: "Failed primary verification",
    color: "destructive",
    icon: XCircle,
    trustScore: 15,
    checks: [
      { name: "User/Candidate ID", passed: false },
      { name: "Duplicate Check", passed: false },
    ],
  },
];

const HowItWorks = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Transparent Verification Process
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              How EduProof Works
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A four-step verification process inspired by financial trust systems and KYC protocols. 
              Every check is transparent, every result is explainable.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {workflowSteps.map((step, index) => (
              <div key={step.step} className="relative mb-16 last:mb-0">
                {/* Connector Line */}
                {index < workflowSteps.length - 1 && (
                  <div className="absolute left-8 top-24 w-0.5 h-[calc(100%-3rem)] bg-border hidden md:block" />
                )}

                <div className="flex gap-8">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-glow-primary">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        Step {step.step}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                      {step.title}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>
                    <div className="bg-card rounded-xl p-6 border border-border/50">
                      <ul className="space-y-3">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Outcomes */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Verification Outcomes
            </h2>
            <p className="text-muted-foreground text-lg">
              Our system provides three possible outcomes, each with transparent reasoning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {verificationExamples.map((example) => (
              <div
                key={example.status}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border/50"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  example.color === 'success' ? 'bg-success/10' :
                  example.color === 'accent' ? 'bg-accent/10' :
                  'bg-destructive/10'
                }`}>
                  <example.icon className={`w-7 h-7 ${
                    example.color === 'success' ? 'text-success' :
                    example.color === 'accent' ? 'text-accent' :
                    'text-destructive'
                  }`} />
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {example.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {example.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Trust Score</span>
                    <span className={`font-bold ${
                      example.color === 'success' ? 'text-success' :
                      example.color === 'accent' ? 'text-accent' :
                      'text-destructive'
                    }`}>{example.trustScore}%</span>
                  </div>
                  <Progress value={example.trustScore} className="h-2" />
                </div>

                <div className="space-y-2">
                  {example.checks.map((check) => (
                    <div key={check.name} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{check.name}</span>
                      {check.passed ? (
                        <span className="text-success font-medium">✓</span>
                      ) : (
                        <span className="text-destructive font-medium">✗</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Verify Your Credentials?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Experience our transparent verification process firsthand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/demo">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;
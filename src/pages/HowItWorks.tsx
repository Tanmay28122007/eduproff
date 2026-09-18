import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  UserCheck, 
  FileText, 
  Gauge,
  ArrowRight,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Cpu,
  Globe,
  Lock,
  Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const workflowSteps = [
  {
    step: 1,
    icon: FileText,
    title: "1. Upload Achievement & Evidence Files",
    description: "Upload your certificate PDF or image along with supporting evidence—event registration emails, winner announcements, GitHub repositories, or team lists.",
    details: [
      "Accepts PDF, PNG, JPG files up to 15MB",
      "Multi-evidence URL attachments (GitHub, LinkedIn, Portfolio)",
      "Independent of institution onboarding or pre-partnerships",
    ],
  },
  {
    step: 2,
    icon: Cpu,
    title: "2. AI Tamper Forensic & OCR Scan",
    description: "Our AI engine inspects raw layout structures, font table consistency, metadata headers, and OCR text to flag edited elements or spliced signatures.",
    details: [
      "Detects font alignment & compression anomalies",
      "Validates dates, issuer names, and text logic",
      "Calculates an AI Tamper Probability Score",
    ],
  },
  {
    step: 3,
    icon: Globe,
    title: "3. Public Web & Registry Cross-Matching",
    description: "The system searches independent public web sources—GitHub code commits, Kaggle leaderboards, university winner lists, and publication registries.",
    details: [
      "Cross-verifies commit dates against event timelines",
      "Indexes public winner listings and organizer records",
      "Verifies digital QR codes and SHA-256 hashes",
    ],
  },
  {
    step: 4,
    icon: Gauge,
    title: "4. Explainable Verification Trust Report",
    description: "Generates an overall 0–100% Verification Confidence Score accompanied by transparent positive signals (✔) and risk alerts (⚠).",
    details: [
      "Weighted 6-pillar trust score composition",
      "Clear explanation of why score increased or decreased",
      "Shareable public trust link for recruiters & portfolio",
    ],
  },
];

const verificationExamples = [
  {
    status: "verified",
    title: "Exceptional Trust (96%)",
    description: "Clean forensics, GitHub commits, & public web match found",
    color: "success",
    icon: CheckCircle,
    trustScore: 96,
    checks: [
      { name: "AI Forensic Tamper Scan", passed: true },
      { name: "Public Web Match", passed: true },
      { name: "Cross-Evidence Alignment", passed: true },
    ],
  },
  {
    status: "partial",
    title: "Moderate Confidence (68%)",
    description: "Document readable, missing secondary evidence links",
    color: "accent",
    icon: AlertTriangle,
    trustScore: 68,
    checks: [
      { name: "AI Forensic Tamper Scan", passed: true },
      { name: "Public Web Match", passed: false },
      { name: "Cross-Evidence Alignment", passed: true },
    ],
  },
  {
    status: "high-risk",
    title: "High Risk (25%)",
    description: "Font anomalies or unverified metadata detected",
    color: "destructive",
    icon: XCircle,
    trustScore: 25,
    checks: [
      { name: "AI Forensic Tamper Scan", passed: false },
      { name: "Public Web Match", passed: false },
      { name: "Cross-Evidence Alignment", passed: false },
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
              <Sparkles className="w-4 h-4" />
              Multi-Layer Trust Engine Architecture
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              How EduProof Works
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Never rely on editable PDFs alone. EduProof verifies authentic achievements across 6 independent trust pillars to calculate an explainable Confidence Score.
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

                <div className="flex gap-8 group">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-glow-primary group-hover:scale-115 group-hover:rotate-6 transition-all duration-300">
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
                    <h2 className="font-display text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                      {step.title}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>
                    <div className="bg-card rounded-2xl p-6 border border-border/70 shadow-soft hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
                      <ul className="space-y-3">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
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
              Explainable Verification Ratings
            </h2>
            <p className="text-muted-foreground text-lg">
              Every score comes with transparent reasons, evidence counts, and positive/risk signals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {verificationExamples.map((example) => (
              <div
                key={example.status}
                className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-7 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-3 hover:border-primary/70 transition-all duration-300 overflow-hidden hover-card-shine cursor-pointer"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-120 group-hover:rotate-6 transition-all duration-300 ${
                  example.color === 'success' ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' :
                  example.color === 'accent' ? 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white' :
                  'bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white'
                }`}>
                  <example.icon className="w-7 h-7 transition-transform group-hover:scale-110" />
                </div>

                <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                  {example.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {example.description}
                </p>

                <div className="mb-5 p-3 rounded-xl bg-secondary/40 border border-border/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence Score</span>
                    <span className={`font-bold font-display ${
                      example.color === 'success' ? 'text-emerald-500' :
                      example.color === 'accent' ? 'text-amber-500' :
                      'text-destructive'
                    }`}>{example.trustScore}%</span>
                  </div>
                  <Progress value={example.trustScore} className="h-2" />
                </div>

                <div className="space-y-2.5">
                  {example.checks.map((check) => (
                    <div key={check.name} className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">{check.name}</span>
                      {check.passed ? (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">✓ Passed</span>
                      ) : (
                        <span className="text-destructive bg-destructive/10 px-2 py-0.5 rounded-full font-bold">✗ Failed</span>
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
              Ready to Build Your Verified Achievement Profile?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Analyze your achievements with multi-source evidence and showcase verified confidence scores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/verify">
                  Verify Achievement Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;
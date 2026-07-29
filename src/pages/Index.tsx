import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { 
  CheckCircle, 
  Shield, 
  Users, 
  ArrowRight, 
  FileCheck,
  TrendingUp,
  Building2,
  GraduationCap,
  Briefcase,
  Search,
  UserCheck,
  FileText,
  Gauge,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const workflowSteps = [
  {
    icon: UserCheck,
    title: "Identity Validation",
    description: "Secure identity verification ensures only legitimate users access the system.",
  },
  {
    icon: FileText,
    title: "Certificate Upload",
    description: "Upload your certificate PDF with the institution-issued Certificate ID.",
  },
  {
    icon: Search,
    title: "Automated Verification",
    description: "Database-driven checks validate the certificate against institutional records.",
  },
  {
    icon: Gauge,
    title: "Trust Score",
    description: "Receive a transparent trust score with clear verified or not-found status.",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Risk Reduction",
    description: "Eliminate credential fraud with automated verification that catches inconsistencies humans miss.",
  },
  {
    icon: TrendingUp,
    title: "Scalable Trust",
    description: "From startups to enterprises, our system scales with your verification needs.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get verification results in seconds, not days. No manual review delays.",
  },
];

const audiences = [
  {
    icon: GraduationCap,
    title: "Students & Professionals",
    description: "Verify and showcase your credentials to stand out in competitive job markets.",
    cta: "Verify Your Credentials",
    to: "/auth",
  },
  {
    icon: Building2,
    title: "Educational Institutions",
    description: "Protect your institution's reputation with verified certificate issuance.",
    cta: "Partner With Us",
    to: "/support",
  },
  {
    icon: Briefcase,
    title: "Recruiters & Employers",
    description: "Make confident hiring decisions with verified candidate credentials.",
    cta: "Find Verified Talent",
    to: "/auth",
  },
];

const Index = () => {
  const { user, role } = useAuth();

  const primaryCta = user 
    ? { 
        to: role === "recruiter" ? "/recruiter" : "/student", 
        label: "Go to Dashboard" 
      }
    : { to: "/auth", label: "Get Started Free" };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium mb-8">
              <Shield className="w-3.5 h-3.5" />
              Credential Verification Platform
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
              Verified Credential{" "}
              <span className="text-primary">Trust System</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              Build trust in credential-based hiring and institutional decisions with secure verification and transparent risk signals.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to={primaryCta.to}>
                  {primaryCta.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline-hero" size="xl" asChild>
                <Link to="/how-it-works">
                  How It Works
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-10 mt-16 pt-8 border-t border-border">
              <div>
                <div className="font-display text-3xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground mt-1">Verification Accuracy</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-foreground">&lt;3s</div>
                <div className="text-sm text-muted-foreground mt-1">Average Check Time</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground mt-1">Verified Credentials</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Verification Result */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              See Verification in Action
            </h2>
            <p className="text-muted-foreground">
              Our transparent system provides clear, actionable results.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Certificate</p>
                  <p className="font-display font-semibold text-foreground text-lg">AWS Solutions Architect</p>
                  <p className="text-sm text-muted-foreground">Amazon Web Services</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Trust Score</span>
                  <span className="font-display font-bold text-lg text-success">100%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/10">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-foreground">Certificate ID Lookup</span>
                  </div>
                  <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">PASSED</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/10">
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-foreground">Database Match</span>
                  </div>
                  <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">PASSED</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Verified.</span> Certificate found in institutional database. No issues detected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              How EduProof Works
            </h2>
            <p className="text-muted-foreground">
              A transparent, four-step verification process.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative bg-card rounded-2xl p-6 shadow-card border border-border text-center hover:shadow-medium transition-shadow"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </div>

                <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4 mt-2">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to="/how-it-works">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Who It Helps */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Who EduProof Helps
            </h2>
            <p className="text-muted-foreground">
              Building trust across the credential ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="bg-card rounded-2xl p-8 shadow-card border border-border hover:shadow-medium transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <audience.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {audience.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {audience.description}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={audience.to}>
                    {audience.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why EduProof */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Why Choose EduProof?
            </h2>
            <p className="text-muted-foreground">
              Enterprise-grade verification for the education sector.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-card rounded-2xl p-8 shadow-card border border-border hover:shadow-medium transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Build Trust in Credentials?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join EduProof today and experience enterprise-grade verification for your credentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to={primaryCta.to}>
                  {user ? "Go to Dashboard" : "Verify Credential"}
                  <ArrowRight className="w-4 h-4" />
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

export default Index;

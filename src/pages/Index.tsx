import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { 
  CheckCircle, 
  Shield, 
  ArrowRight, 
  TrendingUp,
  GraduationCap,
  Briefcase,
  Search,
  UserCheck,
  FileText,
  Gauge,
  Zap,
  Sparkles,
  Cpu,
  Globe,
  Lock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const workflowSteps = [
  {
    icon: FileText,
    title: "1. Upload Achievement & Evidence",
    description: "Upload certificate PDF/image along with GitHub repos, LinkedIn posts, or event emails.",
  },
  {
    icon: Cpu,
    title: "2. AI Forensic & OCR Analysis",
    description: "Detect image tampering, font anomalies, and extract metadata with OCR consistency logic.",
  },
  {
    icon: Globe,
    title: "3. Cross-Evidence Web Match",
    description: "Match commits, publication registries, and winner lists across independent public sources.",
  },
  {
    icon: Gauge,
    title: "4. Explainable Trust Score",
    description: "Generate a 0–100% Verification Confidence Score with detailed signal reasoning.",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Tamper Risk Detection",
    description: "AI forensics catch edited fonts, spliced signatures, compression shifts, and fake stamps.",
  },
  {
    icon: TrendingUp,
    title: "Independent Verification",
    description: "Works seamlessly even if the issuing organization or university is not registered on EduProof.",
  },
  {
    icon: Zap,
    title: "Multi-Signal Confidence",
    description: "Combines 6 trust pillars into an explainable 0–100% confidence rating with verified signals.",
  },
];

const audiences = [
  {
    icon: GraduationCap,
    title: "Students & Candidates",
    description: "Verify your authentic achievements with multi-source proof and build a shareable verified portfolio.",
    cta: "Verify Your Achievement",
    to: "/auth",
  },
  {
    icon: Briefcase,
    title: "Recruiters & Employers",
    description: "Make hiring decisions with confidence using multi-layer evidence screening and tamper risk reports.",
    cta: "Screen Verified Talent",
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
      <section className="relative py-24 lg:py-32 bg-gradient-to-b from-secondary/30 via-background to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Achievement Trust Platform
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-foreground leading-[1.1] mb-6 tracking-tight">
              Verify Genuine Achievements With{" "}
              <span className="text-primary">Multi-Source Trust</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              EduProof verifies whether an achievement was genuinely earned by analyzing multiple independent evidence signals—AI forensics, OCR logic, GitHub repos, winner lists, and public registries—generating an explainable Verification Confidence Score.
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
                  How Trust Engine Works
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-10 mt-16 pt-8 border-t border-border">
              <div>
                <div className="font-display text-3xl font-bold text-foreground">0–100%</div>
                <div className="text-sm text-muted-foreground mt-1">Confidence Scoring</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-foreground">6 Pillars</div>
                <div className="text-sm text-muted-foreground mt-1">Independent Signals</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground mt-1">Institution Independent</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Trust Score Result */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              See Achievement Trust Engine in Action
            </h2>
            <p className="text-muted-foreground">
              Multi-layered analysis providing explainable positive signals and risk warnings.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Verified Achievement</p>
                  <p className="font-display font-bold text-foreground text-xl">Global Hackathon First Place</p>
                  <p className="text-sm text-muted-foreground">Stanford AI Innovation Challenge</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Verification Confidence Score</span>
                  <span className="font-display font-bold text-emerald-600 dark:text-emerald-400 text-lg">96% Exceptional Trust</span>
                </div>
                <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "96%" }}></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/40 border border-border/40 text-xs space-y-2">
                <span className="font-bold text-foreground block">✔ Verified Signals:</span>
                <p className="text-muted-foreground">· Document image forensics show 0% font tampering</p>
                <p className="text-muted-foreground">· GitHub project commits match event timeframe</p>
                <p className="text-muted-foreground">· Winner announcement indexed on organizer portal</p>
              </div>

              <Button className="w-full" asChild>
                <Link to="/verify">Try Verification Hub</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              4 Steps to Verifiable Trust
            </h2>
            <p className="text-muted-foreground">
              How EduProof evaluates authentic achievements from raw evidence to confidence scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Built for Students & Recruiters
            </h2>
            <p className="text-muted-foreground">
              EduProof empowers candidates to verify achievements and recruiters to screen with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {audiences.map((audience, index) => {
              const Icon = audience.icon;
              return (
                <div key={index} className="bg-card rounded-2xl p-8 shadow-card border border-border flex flex-col justify-between">
                  <div className="space-y-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-foreground text-xl">
                      {audience.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {audience.description}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link to={audience.to}>
                      {audience.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

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
      <section className="py-20 bg-secondary/40 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              See Achievement Trust Engine in Action
            </h2>
            <p className="text-muted-foreground">
              Multi-layered analysis providing explainable positive signals and risk warnings.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="group relative bg-card/90 backdrop-blur-md rounded-3xl p-8 shadow-card hover:shadow-2xl hover:shadow-emerald-500/20 border border-border/80 hover:border-emerald-500/70 hover:-translate-y-3 transition-all duration-300 space-y-6 overflow-hidden hover-card-shine cursor-pointer">
              {/* Corner ambient light glow */}
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/35 group-hover:scale-125 transition-all duration-500 pointer-events-none" />
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-xs text-primary uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Achievement
                  </p>
                  <p className="font-display font-bold text-foreground text-xl group-hover:text-primary transition-colors duration-200">Global Hackathon First Place</p>
                  <p className="text-sm text-muted-foreground">Stanford AI Innovation Challenge</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-120 group-hover:rotate-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Verification Confidence Score</span>
                  <span className="font-display font-bold text-emerald-600 dark:text-emerald-400 text-lg">96% Exceptional Trust</span>
                </div>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden p-0.5 border border-border/40">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 group-hover:brightness-110" style={{ width: "96%" }}></div>
                </div>
              </div>

              <div className="p-4.5 rounded-2xl bg-secondary/50 border border-border/60 text-xs space-y-2 relative z-10 group-hover:border-emerald-500/40 transition-colors">
                <span className="font-bold text-foreground block flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified Signals:
                </span>
                <p className="text-muted-foreground">· Document image forensics show 0% font tampering</p>
                <p className="text-muted-foreground">· GitHub project commits match event timeframe</p>
                <p className="text-muted-foreground">· Winner announcement indexed on organizer portal</p>
              </div>

              <Button className="w-full shadow-md group-hover:shadow-lg transition-all duration-300" size="lg" asChild>
                <Link to="/verify" className="flex items-center justify-center gap-2">
                  <span>Try Verification Hub</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Subtle background ambient circles */}
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Simple & Transparent
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              4 Steps to Verifiable Trust
            </h2>
            <p className="text-muted-foreground text-base">
              How EduProof evaluates authentic achievements from raw evidence to confidence scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={index} 
                  className="group relative bg-card/80 backdrop-blur-sm rounded-2xl p-7 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-primary/25 hover:-translate-y-3 hover:border-primary/80 hover:bg-card transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden hover-card-shine cursor-pointer"
                >
                  {/* Top glowing gradient line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                  
                  {/* Ambient corner blur glow */}
                  <div className="absolute -right-8 -top-8 w-28 h-28 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/25 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  <div>
                    <div className="w-13 h-13 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-115 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
                      <Icon className="w-6.5 h-6.5 transition-transform duration-300 group-hover:rotate-6" />
                    </div>
                    
                    <h3 className="font-display font-bold text-foreground text-lg mb-2.5 group-hover:text-primary transition-colors duration-200 leading-snug">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                    <span className="group-hover:translate-x-1 transition-transform">Explore step</span>
                    <div className="w-6 h-6 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center group-hover:scale-110 group-hover:shadow-sm transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index} 
                  className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-7 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-3 hover:border-emerald-500/80 hover:bg-card transition-all duration-300 ease-out overflow-hidden flex flex-col justify-between hover-card-shine cursor-pointer"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-emerald-500/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                  <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/25 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-115 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-foreground text-xl mb-2.5 group-hover:text-primary transition-colors duration-200">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
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
                <div 
                  key={index} 
                  className="group relative bg-card/90 backdrop-blur-md rounded-3xl p-8 shadow-card border border-border/70 hover:shadow-2xl hover:shadow-primary/25 hover:-translate-y-3 hover:border-primary/80 transition-all duration-300 flex flex-col justify-between overflow-hidden hover-card-shine cursor-pointer"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-2 transition-all duration-300" />
                  <div className="absolute -right-12 -top-12 w-36 h-36 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/25 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  <div className="space-y-4 mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-115 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display font-bold text-foreground text-2xl group-hover:text-primary transition-colors duration-200">
                      {audience.title}
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {audience.description}
                    </p>
                  </div>

                  <Button variant="outline" className="w-full gap-2 border-border/80 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-lg transition-all duration-300" size="lg" asChild>
                    <Link to={audience.to} className="flex items-center justify-center">
                      <span>{audience.cta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
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

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
    description: "Verify your authentic achievements with multi-source proof, generate ATS-friendly CVs, and build a shareable verified portfolio.",
    cta: "Verify Your Achievement",
    to: "/auth",
    image: "/images/candidate-verified.jpg",
    badge: "ATS-Compliant & Verified Commits",
  },
  {
    icon: Briefcase,
    title: "Recruiters & Employers",
    description: "Make hiring decisions with confidence using multi-layer evidence screening, cryptographic checks, and tamper risk reports.",
    cta: "Screen Verified Talent",
    to: "/auth",
    image: "/images/recruiter-screening.jpg",
    badge: "98% Confidence Multi-Signal Audit",
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
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-secondary/30 via-background to-background overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-1/4 right-10 w-[550px] h-[550px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Text & CTA */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6 border border-primary/20 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Achievement Trust Platform
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-foreground leading-[1.1] mb-6 tracking-tight">
                Verify Genuine Achievements With{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-violet-500">
                  Multi-Source Trust
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
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
              <div className="flex flex-wrap gap-8 sm:gap-12 mt-12 pt-8 border-t border-border">
                <div>
                  <div className="font-display text-3xl font-bold text-foreground">0–100%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">Confidence Scoring</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-foreground">6 Pillars</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">Independent Signals</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-foreground">100%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">Institution Independent</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Interactive Glass Badges */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="relative w-full max-w-[480px] lg:max-w-none">
                {/* Ambient glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-violet-500/20 rounded-3xl blur-2xl transform scale-95 -z-10" />

                {/* Main Card Wrapper */}
                <div className="relative rounded-3xl p-2.5 bg-card/60 backdrop-blur-md border border-primary/25 shadow-2xl shadow-primary/10 overflow-hidden group hover:border-primary/50 transition-all duration-500">
                  <img
                    src="/hero-trust-visual.jpg"
                    alt="EduProof Holographic Credential Verification"
                    className="w-full h-auto aspect-square object-cover rounded-2xl shadow-inner transition-transform duration-700 group-hover:scale-[1.02]"
                    loading="eager"
                  />

                  {/* Floating Glassmorphic Badge 1: Top Right */}
                  <div className="absolute top-5 right-5 bg-card/90 backdrop-blur-md border border-primary/30 shadow-lg px-3.5 py-2 rounded-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="text-[11px] font-bold text-foreground leading-none">SHA-256 Anchored</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Tamper-Proof Ledger</p>
                    </div>
                  </div>

                  {/* Floating Glassmorphic Badge 2: Bottom Left */}
                  <div className="absolute bottom-5 left-5 bg-card/90 backdrop-blur-md border border-primary/30 shadow-lg px-3.5 py-2.5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-foreground">98% Trust Score</span>
                        <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1 rounded">High</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground">Multi-Signal Corroborated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Trust Score Result */}
      <section className="py-20 bg-secondary/40 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Live Evidence Engine
            </div>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              See Achievement Trust Engine in Action
            </h2>
            <p className="text-muted-foreground text-base">
              Multi-layered analysis providing explainable positive signals, tamper forensics, and risk warnings.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual AI Forensic Scanner Showcase */}
            <div className="lg:col-span-7 group relative bg-card/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-card hover:shadow-2xl hover:shadow-primary/20 border border-border/80 hover:border-primary/60 transition-all duration-500 overflow-hidden hover-card-shine">
              <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-muted/30">
                <img
                  src="/images/forensic-scanner.jpg"
                  alt="AI Forensic Document Analysis"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent pointer-events-none" />
                
                {/* Floating telemetry pills */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/90 backdrop-blur-md border border-border/70 text-xs font-semibold text-foreground shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    AI Optical Forensics: 99.8% Clean
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/90 backdrop-blur-md border border-border/70 text-xs font-semibold text-foreground shadow-sm">
                    <Lock className="w-3 h-3 text-primary" />
                    SHA-256 Anchored
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md rounded-xl p-3 border border-border/70 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Stanford AI Innovation Challenge 2026</p>
                    <p className="text-[11px] text-muted-foreground">Original PDF · 0% Font Splicing · Metadata Matching</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    PASSED
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Trust Score Card */}
            <div className="lg:col-span-5">
              <div className="group relative bg-card/90 backdrop-blur-md rounded-3xl p-8 shadow-card hover:shadow-2xl hover:shadow-emerald-500/20 border border-border/80 hover:border-emerald-500/70 hover:-translate-y-2 transition-all duration-300 space-y-6 overflow-hidden hover-card-shine cursor-pointer">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {audiences.map((audience, index) => {
              const Icon = audience.icon;
              return (
                <div 
                  key={index} 
                  className="group relative bg-card/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-card border border-border/70 hover:shadow-2xl hover:shadow-primary/25 hover:-translate-y-2.5 hover:border-primary/80 transition-all duration-300 flex flex-col justify-between overflow-hidden hover-card-shine cursor-pointer"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-2 transition-all duration-300" />
                  <div className="absolute -right-12 -top-12 w-36 h-36 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/25 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                  {/* Image Preview Banner */}
                  <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/60 shadow-sm group-hover:border-primary/50 transition-colors">
                    <img 
                      src={audience.image} 
                      alt={audience.title} 
                      className="w-full h-52 sm:h-60 object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/25 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/85 backdrop-blur-md text-xs font-semibold text-foreground border border-border/60 shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-primary" />
                        {audience.badge}
                      </span>
                    </div>
                  </div>

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

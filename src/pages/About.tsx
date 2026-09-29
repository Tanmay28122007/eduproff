import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  ArrowRight,
  CheckCircle,
  Building2,
  Globe,
  Sparkles
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust First",
    description: "Every decision we make prioritizes building and maintaining trust through multi-source evidence.",
  },
  {
    icon: Lightbulb,
    title: "Explainable AI",
    description: "Our verification process provides transparent signals. Users always understand why a score was calculated.",
  },
  {
    icon: TrendingUp,
    title: "Institution Independent",
    description: "Works seamlessly even if an issuing institution or organizer has never integrated with EduProof.",
  },
  {
    icon: Users,
    title: "Student Centric",
    description: "Empowers students to verify and showcase their authentic achievements to recruiters.",
  },
];

const fintechConnections = [
  {
    title: "Multi-Source Evidence Cross-Validation",
    description: "Cross-checks emails, GitHub code commits, winner lists, and public registries to verify genuine achievement.",
  },
  {
    title: "AI Forensic Tamper Detection",
    description: "Scans font rendering, metadata structures, and compression artifacts to catch edited or forged PDFs.",
  },
  {
    title: "0–100% Verification Confidence Score",
    description: "Outputs a transparent confidence score backed by 6 weighted trust pillars rather than binary pass/fail labels.",
  },
  {
    title: "Audit Trail & Cryptographic Anchors",
    description: "Generates SHA-256 achievement hashes and shareable public trust links for instant recruiter verification.",
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Our Core Philosophy
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              About EduProof
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              An AI-powered Achievement Trust Platform that verifies achievements using multiple independent evidence sources and generates an explainable Verification Confidence Score.
            </p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                  Our Philosophy
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Certificates can easily be edited using Photoshop or AI tools. Requiring institutions to join a platform before credentials can be verified creates a major adoption barrier.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Instead of asking <em>"Is this PDF authentic?"</em>, EduProof asks: <strong>"Did this person genuinely earn this achievement?"</strong>
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  By evaluating achievements across AI forensics, OCR logic, code commits, winner lists, and public registries, EduProof provides immediate value independently of educational institutions.
                </p>
              </div>
              <div className="group relative bg-card/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-medium hover:shadow-2xl hover:shadow-primary/20 border border-border/70 hover:border-primary/70 hover:-translate-y-2.5 transition-all duration-300 overflow-hidden hover-card-shine cursor-pointer">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                
                {/* Visual Banner */}
                <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/60">
                  <img
                    src="/images/candidate-verified.jpg"
                    alt="Verified Student Credential"
                    className="w-full h-44 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/90 backdrop-blur-md text-xs font-semibold text-foreground border border-border/60 shadow-sm">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      98% Verification Trust
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shadow-glow-primary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shrink-0">
                    <Shield className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Why Multi-Signal Trust Matters
                  </h3>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">PDFs can be modified in minutes without detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">Institutional onboarding takes months or years</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">Cross-evidence (repos, emails, winner lists) provides proof</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">Explainable scores give recruiters actionable confidence</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Showcase */}
      <section className="py-12 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto group relative rounded-3xl overflow-hidden border border-border/80 bg-card/90 shadow-2xl p-4 sm:p-6 hover:border-primary/60 transition-all duration-500 hover-card-shine">
            <div className="relative rounded-2xl overflow-hidden border border-border/60">
              <img
                src="/images/pipeline-architecture.jpg"
                alt="EduProof Verification Pipeline Architecture"
                className="w-full h-72 sm:h-96 md:h-[420px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-xs font-semibold text-primary mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Autonomous Optical & Cryptographic Engine
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                    Next-Gen Autonomous Verification Pipeline
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Multi-signal telemetry correlating OCR glyph consistency, Git commit history, and cryptographic ledger proofs in real-time.
                  </p>
                </div>
                <Button className="shrink-0 shadow-lg" asChild>
                  <Link to="/verify" className="flex items-center gap-2">
                    <span>Test Document</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Connections */}
      <section className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Multi-Layer Trust Engine Features
            </h2>
            <p className="text-muted-foreground text-lg">
              Combining 6 independent pillars into an explainable verification confidence score.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {fintechConnections.map((item) => (
              <div
                key={item.title}
                className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-7 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2.5 hover:border-primary/70 transition-all duration-300 overflow-hidden hover-card-shine cursor-pointer"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-115 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md transition-all duration-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground text-lg">
              Guiding principles behind the EduProof Trust Engine.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value) => (
              <div
                key={value.title}
                className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-7 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2.5 hover:border-primary/70 transition-all duration-300 text-center overflow-hidden hover-card-shine cursor-pointer"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 group-hover:scale-115 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xl group-hover:shadow-primary/25 transition-all duration-300">
                  <value.icon className="w-7 h-7 transition-transform group-hover:rotate-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Start Verifying Achievements Today
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Verify achievements with multi-source evidence and build a verified profile recruiters trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/verify">
                  Verify Achievement
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/support">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
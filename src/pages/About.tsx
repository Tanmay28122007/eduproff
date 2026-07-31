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
      <section className="py-24">
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
              <div className="bg-card rounded-2xl p-8 shadow-medium border border-border/50">
                <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mb-6 shadow-glow-primary">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  Why Multi-Signal Trust Matters
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">PDFs can be modified in minutes without detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Institutional onboarding takes months or years</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Cross-evidence (repos, emails, winner lists) provides proof</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Explainable scores give recruiters actionable confidence</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Connections */}
      <section className="py-24 bg-secondary/30">
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
                className="bg-card rounded-2xl p-6 shadow-soft border border-border/50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
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
      <section className="py-24">
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
                className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">
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
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
  Globe
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust First",
    description: "Every decision we make prioritizes building and maintaining trust in the credential ecosystem.",
  },
  {
    icon: Lightbulb,
    title: "Transparency",
    description: "Our verification process is fully transparent. Users always understand why a decision was made.",
  },
  {
    icon: TrendingUp,
    title: "Scalability",
    description: "Built to scale from individual verification to enterprise-level credential management.",
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Making credential verification accessible to everyone, regardless of technical expertise.",
  },
];

const fintechConnections = [
  {
    title: "KYC-Inspired Verification",
    description: "Our identity validation process is inspired by financial Know Your Customer (KYC) protocols, ensuring only legitimate users access the system.",
  },
  {
    title: "Risk-Based Scoring",
    description: "Similar to credit scoring in finance, our trust scores provide a quantifiable measure of credential reliability.",
  },
  {
    title: "Automated Trust Signals",
    description: "Like fraud detection in banking, our automated checks identify inconsistencies and potential risks in real-time.",
  },
  {
    title: "Audit Trail & Compliance",
    description: "Every verification is logged with a complete audit trail, supporting compliance and accountability requirements.",
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
              <Target className="w-4 h-4" />
              Our Mission
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              About EduProof
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Building the infrastructure for trusted credentials in education and employment.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                  Our Vision
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  In a world where credentials drive opportunities, trust is everything. 
                  EduProof was created to solve a critical problem: how do we know if a credential is genuine?
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  We're building a FinTech-grade trust system for the education sector—applying the same 
                  rigorous verification standards used in financial services to academic and professional credentials.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our goal is simple: eliminate credential fraud and create a more trustworthy 
                  ecosystem for students, institutions, and employers alike.
                </p>
              </div>
              <div className="bg-card rounded-2xl p-8 shadow-medium border border-border/50">
                <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mb-6 shadow-glow-primary">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  The Trust Problem
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">1 in 3 resumes contain inaccurate credential information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Manual verification takes days or weeks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Employers lack reliable verification tools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Students struggle to prove authentic achievements</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FinTech Connection */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              The FinTech Connection
            </h2>
            <p className="text-muted-foreground text-lg">
              How financial trust systems inspire our approach to credential verification.
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
                    <p className="text-muted-foreground">
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
              Our Values
            </h2>
            <p className="text-muted-foreground text-lg">
              The principles that guide everything we build.
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

      {/* Global Impact */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-8 shadow-glow-primary">
              <Globe className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Building Global Trust
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Our vision extends beyond individual verification. We're building the infrastructure 
              for a global credential trust network that connects students, institutions, and 
              employers worldwide.
            </p>
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="font-display text-4xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Credentials Verified</div>
              </div>
              <div>
                <div className="font-display text-4xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Issuers Recognized</div>
              </div>
              <div>
                <div className="font-display text-4xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Join the Trust Revolution
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Whether you're a student, institution, or employer—we're here to help you build trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth">
                  Get Started
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
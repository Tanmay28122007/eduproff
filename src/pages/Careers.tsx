import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Rocket, Heart, Lightbulb, Users, Briefcase, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "User-Focused",
    description: "We put our users first in everything we do. Their success is our success.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We're constantly pushing boundaries and exploring new ways to verify credentials.",
  },
  {
    icon: Users,
    title: "Team Spirit",
    description: "We believe great things happen when passionate people work together.",
  },
];

const Careers = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Rocket className="w-4 h-4" />
              Careers at EduProof
            </div>
            
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
              Join Our Mission 🚀
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              At EduProof, we're building the future of multi-source achievement verification.
            </p>
            <Button variant="hero" size="xl" asChild>
              <a href="#positions">
                View Open Positions
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground">
              What drives us every day at EduProof
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-border/70 text-center hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-3 hover:border-primary/70 transition-all duration-300 overflow-hidden hover-card-shine cursor-pointer"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6 group-hover:scale-115 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
                  <value.icon className="w-7 h-7 text-primary-foreground transition-transform group-hover:rotate-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-16 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-muted-foreground">
              Explore opportunities to grow with us
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl p-12 shadow-soft border border-border/50 text-center space-y-4 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto text-muted-foreground">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                No Open Positions Right Now
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                We currently don't have any active job openings. Check back later or reach out to us with your resume for future opportunities.
              </p>
            </div>
          </div>

          {/* Don't see a fit */}
          <div className="max-w-3xl mx-auto mt-12 text-center">
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Want to stay in touch?
              </h3>
              <p className="text-muted-foreground mb-6">
                Send us your resume and profile links—we will reach out when new roles open up!
              </p>
              <Button variant="hero" asChild>
                <Link to="/support">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Careers;

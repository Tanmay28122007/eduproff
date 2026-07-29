import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Rocket, Heart, Lightbulb, Users, MapPin, Clock, ArrowRight } from "lucide-react";

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

const openPositions = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Remote / San Francisco",
    type: "Full-time",
  },
  {
    id: 2,
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    id: 3,
    title: "Product Designer",
    department: "Design",
    location: "San Francisco",
    type: "Full-time",
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "Operations",
    location: "Remote / New York",
    type: "Full-time",
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
              We're Hiring!
            </div>
            
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
              Join Our Fun, Innovative Team! 🚀
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              At EduProof, we're on a mission to revolutionize credential verification. 
              We're looking for passionate, creative people who want to make a real impact in education.
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
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 text-center hover:shadow-medium transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
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

      {/* Benefits Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
              Why You'll Love Working Here 💜
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Competitive salary & equity",
                "Remote-first culture",
                "Flexible working hours",
                "Health & wellness benefits",
                "Learning & development budget",
                "Team retreats & events",
                "Latest tech stack",
                "Make a real impact",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-soft border border-border/50"
                >
                  <div className="w-2 h-2 rounded-full gradient-hero" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
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
              Find your next adventure with us
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {openPositions.map((position) => (
              <div
                key={position.id}
                className="bg-card rounded-xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-primary/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="flex-shrink-0">
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Don't see a fit */}
          <div className="max-w-3xl mx-auto mt-12 text-center">
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Don't see the right role?
              </h3>
              <p className="text-muted-foreground mb-6">
                We're always looking for talented people. Send us your resume and tell us how you can contribute!
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { Send, MessageCircle, Mail, Phone, MapPin, CheckCircle, Loader2, ExternalLink, ArrowRight, HelpCircle, Bot, Sparkles, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const TARGET_EMAIL = "tanmayanand200@gmail.com";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    value: "coming soon",
    description: "Support desk launched soon",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "coming soon",
    description: "Helpline available soon",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: "location will be revealed soon",
    description: "Headquarters location coming soon",
  },
];

const Support = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const mailtoSubject = encodeURIComponent(`EduProof Contact Form: Message from ${formData.name}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

    try {
      // 1. Post to FormSubmit service to deliver directly to tanmayanand200@gmail.com
      const response = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `EduProof Contact Form Message from ${formData.name}`,
          _replyto: formData.email,
        }),
      });

      if (!response.ok) {
        throw new Error("API dispatch failed");
      }

      toast({
        title: "Message Sent! 📩",
        description: `Your message was forwarded to support.`,
      });
    } catch (error) {
      console.warn("Direct POST fallback to mailto redirect:", error);
      window.location.href = mailtoUrl;
      
      toast({
        title: "Redirecting to Mail Client ✉️",
        description: `Opening email client to send message.`,
      });
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const triggerDirectMailto = () => {
    const mailtoSubject = encodeURIComponent(`EduProof Contact Form: Message from ${formData.name || 'User'}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:${TARGET_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/60 via-background to-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 shadow-sm">
              <MessageCircle className="w-4 h-4" />
              Support Center
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              We Love Helping Our Users! 😊
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have a question, feedback, or need assistance? We're here for you. 
              Reach out anytime and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 pb-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            
            {/* Contact Form */}
            <div className="group relative bg-card/90 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-card border border-border/80 hover:shadow-2xl hover:border-primary/40 transition-all duration-300 overflow-hidden hover-card-shine">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-80" />
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-all duration-500 pointer-events-none" />

              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-2.5">
                <span>Send Us a Message</span>
              </h2>

              {isSubmitted ? (
                <div className="text-center py-12 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Message Sent! 🎉
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto text-base leading-relaxed">
                    Thanks for reaching out. We'll review your query and get back to you within 24 hours.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" size="lg" onClick={triggerDirectMailto} className="gap-2 border-border/80 hover:border-primary">
                      <ExternalLink className="w-4 h-4" />
                      Open Email App
                    </Button>
                    <Button variant="ghost" size="lg" onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: "", email: "", message: "" });
                    }}>
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      required
                      className="bg-background/60 border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl py-6"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="bg-background/60 border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl py-6"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Your Message
                    </label>
                    <Textarea
                      placeholder="Tell us how we can help..."
                      rows={5}
                      required
                      className="bg-background/60 border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <Button variant="hero" size="xl" className="w-full shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info Side */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Get in Touch
                </h2>

                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <div
                      key={info.title}
                      className="group relative bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-border/70 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2.5 hover:border-primary/70 hover:bg-card transition-all duration-300 ease-out flex items-start gap-5 overflow-hidden hover-card-shine cursor-pointer"
                    >
                      {/* Top glowing line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                      
                      {/* Ambient corner glow */}
                      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/25 transition-all duration-500 pointer-events-none" />

                      <div className="w-13 h-13 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-115 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xl group-hover:shadow-primary/25 transition-all duration-300">
                        <info.icon className="w-6 h-6 transition-transform group-hover:rotate-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors duration-200">
                          {info.title}
                        </h3>
                        <p className="text-foreground font-semibold text-base mb-0.5">{info.value}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instant Gemini AI Box */}
              <div 
                onClick={() => window.dispatchEvent(new CustomEvent("open-eduproof-chat"))}
                className="group relative bg-gradient-to-tr from-primary/10 via-primary/5 to-sky-500/10 backdrop-blur-sm rounded-2xl p-6 border border-primary/30 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-sky-500 to-primary" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-sky-500 text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        EduProof AI Assistant
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        24/7 Live
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      Get immediate answers to any question about credential verification, student CVs, recruiter tools, or platform features.
                    </p>
                    <Button size="sm" className="gap-2 shadow-sm group-hover:shadow-md">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Start Chat</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* FAQ Box */}
              <div className="group relative bg-secondary/50 backdrop-blur-sm rounded-2xl p-7 border border-border/80 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden mt-2 cursor-pointer">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-115 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-lg mb-1.5 group-hover:text-primary transition-colors">
                      Looking for quick answers?
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      Check out our detailed guide and how-it-works overview for instant help.
                    </p>
                    <Button variant="outline" size="sm" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all" asChild>
                      <Link to="/how-it-works">
                        <span>How It Works</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Support;

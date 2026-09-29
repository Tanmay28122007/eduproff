import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Lock, 
  Cpu, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  Clock, 
  Globe, 
  Share2, 
  Database,
  UserCheck,
  Search,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Eye,
  FileCheck,
  Building,
  KeyRound,
  Trash2,
  DownloadCloud,
  LucideIcon
} from "lucide-react";
import { toast } from "sonner";

interface SectionMeta {
  id: string;
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  summary: string;
}

const SECTIONS: SectionMeta[] = [
  {
    id: "section-1",
    title: "1. Introduction & Governance",
    shortTitle: "Introduction",
    icon: Shield,
    summary: "EduProof protects data integrity and user privacy under decentralized credential standards."
  },
  {
    id: "section-2",
    title: "2. Information We Collect",
    shortTitle: "Data Collected",
    icon: Database,
    summary: "Account credentials, uploaded certificates, verification telemetry, and forensic metadata."
  },
  {
    id: "section-3",
    title: "3. How We Use Your Information",
    shortTitle: "Data Usage",
    icon: FileText,
    summary: "Processing credential verification, generating trust scores, and preventing credential fraud."
  },
  {
    id: "section-4",
    title: "4. AI & Automated Processing",
    shortTitle: "AI & Models",
    icon: Cpu,
    summary: "OCR and multi-modal models parse certificates in isolated memory without public model retraining."
  },
  {
    id: "section-5",
    title: "5. Information From Public Sources",
    shortTitle: "Public Evidence",
    icon: Globe,
    summary: "Cross-validating against public institutional registries, GitHub, and hackathon leaderboards."
  },
  {
    id: "section-6",
    title: "6. Data Sharing & Processors",
    shortTitle: "Data Sharing",
    icon: Share2,
    summary: "Zero sale of personal data. Limited sharing with cloud providers and approved recruiters only."
  },
  {
    id: "section-7",
    title: "7. Cryptographic Data Security",
    shortTitle: "Security & Encryption",
    icon: Lock,
    summary: "TLS 1.3 in transit, AES-256 at rest, and SHA-256 immutable trust hashes."
  },
  {
    id: "section-8",
    title: "8. Data Retention & Deletion",
    shortTitle: "Retention",
    icon: Clock,
    summary: "Records retained only while your account is active, with instant full deletion upon request."
  },
  {
    id: "section-9",
    title: "9. Your Privacy Rights (GDPR & CCPA)",
    shortTitle: "Your Rights",
    icon: UserCheck,
    summary: "Right to access, portable download, rectification, and complete erasure of personal data."
  },
  {
    id: "section-10",
    title: "10. Cookies & Local Storage",
    shortTitle: "Cookies & Storage",
    icon: KeyRound,
    summary: "Used strictly for secure session persistence, dark mode preference, and offline caching."
  },
  {
    id: "section-11",
    title: "11. Third-Party Integrations",
    shortTitle: "Third Parties",
    icon: ExternalLink,
    summary: "Third-party services (Firebase, Supabase) operate under their respective enterprise security standards."
  },
  {
    id: "section-12",
    title: "12. International Data Transfers",
    shortTitle: "International",
    icon: Globe,
    summary: "Cross-border transfers protected by Standard Contractual Clauses (SCCs) and strong encryption."
  },
  {
    id: "section-13",
    title: "13. Children & Education Privacy",
    shortTitle: "Children's Privacy",
    icon: Building,
    summary: "Compliant with FERPA & COPPA guidelines; not targeted at children under 13 without consent."
  },
  {
    id: "section-14",
    title: "14. Policy Updates & History",
    shortTitle: "Policy Updates",
    icon: Clock,
    summary: "Changes posted with version timestamps. Material changes announced via in-app notification."
  },
  {
    id: "section-15",
    title: "15. Contact Data Protection Officer",
    shortTitle: "Contact DPO",
    icon: Mail,
    summary: "Direct contact channel for privacy inquiries and data subject requests (SLA: 48 hours)."
  },
  {
    id: "section-16",
    title: "16. Important Disclaimers",
    shortTitle: "Disclaimers",
    icon: AlertTriangle,
    summary: "Confidence scores reflect multi-signal algorithmic assessments, not official government degrees."
  },
  {
    id: "section-17",
    title: "17. Consent & Acknowledgment",
    shortTitle: "Consent",
    icon: CheckCircle2,
    summary: "By accessing EduProof, you agree to this transparent data processing framework."
  }
];

const EXECUTIVE_HIGHLIGHTS = [
  {
    icon: Shield,
    title: "Zero Data Selling",
    desc: "We will never sell, rent, or monetize your personal identity, resume credentials, or verification results to third-party data brokers.",
    badge: "Guaranteed"
  },
  {
    icon: Lock,
    title: "Cryptographic Ownership",
    desc: "Every verified certificate receives an immutable SHA-256 cryptographic digest. You maintain full ownership of your credentials.",
    badge: "Decentralized"
  },
  {
    icon: Cpu,
    title: "Ethical & Isolated AI",
    desc: "Our verification models analyze certificates in isolated environments. User files are never used to train public generative AI corpuses.",
    badge: "Privacy-Preserving"
  },
  {
    icon: UserCheck,
    title: "Universal User Control",
    desc: "Export your complete credential audit trail as JSON/PDF or permanently delete your account and records with one request.",
    badge: "GDPR & CCPA"
  }
];

const Privacy = () => {
  const [activeSection, setActiveSection] = useState("section-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"standard" | "summary">("standard");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress and active section
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Detect active section
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const copySectionLink = (id: string) => {
    const url = `${window.location.origin}/privacy#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Section link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSections = SECTIONS.filter(s => 
    !searchQuery.trim() ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-16 left-0 right-0 h-1 bg-primary/20 z-40 transition-all duration-150"
      >
        <div 
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Header */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-primary/5 via-secondary/20 to-background border-b border-border/60">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold mb-4 border border-primary/20 shadow-xs">
              <Shield className="w-4 h-4" />
              <span>Official Legal Policy & Data Protection</span>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <span className="hidden sm:inline text-foreground font-mono">v2.4 (2026)</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight mb-4">
              Privacy Policy & Security
            </h1>
            
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              EduProof is dedicated to the highest standards of data privacy, algorithmic transparency, and cryptographic ownership for students, professionals, and recruiters.
            </p>

            {/* Meta & Quick Action Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-2">
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-full border border-border/60">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Last Updated: February 2026</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-full border border-border/60">
                <Building className="w-3.5 h-3.5 text-primary" />
                <span>Created & Owned by Tanmay Anand</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-1.5 rounded-full"
                onClick={handlePrint}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </Button>
            </div>

            {/* Quick Search & Summary Toggle */}
            <div className="max-w-xl mx-auto mt-8 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search privacy topics (e.g., AI, cookies, retention, GDPR)..."
                  className="pl-9 pr-4 text-xs sm:text-sm h-10 rounded-xl bg-card border-border/80 shadow-xs"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border/60 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setViewMode("standard")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === "standard" 
                      ? "bg-background text-foreground shadow-xs font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Full Policy
                </button>
                <button
                  onClick={() => setViewMode("summary")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === "summary" 
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Key Highlights
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* At A Glance Highlights Section */}
      <section className="py-8 bg-secondary/20 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                At a Glance: Our Privacy Commitments
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXECUTIVE_HIGHLIGHTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground text-sm mb-1.5">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Body with Sticky Sidebar Layout */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sticky Navigation Sidebar (Desktop) */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-3 space-y-4">
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
                  <span className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary" />
                    Table of Contents
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {SECTIONS.length} Sections
                  </span>
                </div>

                <nav className="space-y-1">
                  {filteredSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all group ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5 shadow-xs"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                          <span className="truncate">{section.shortTitle}</span>
                        </div>
                        <ChevronRight className={`w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100 text-primary" : ""}`} />
                      </button>
                    );
                  })}
                </nav>

                {/* Quick DSR Box */}
                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-primary" />
                      Exercising Rights?
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Request data export or erasure by contacting our privacy compliance desk.
                    </p>
                    <a
                      href="mailto:privacy@eduproof.com?subject=Data%20Subject%20Request%20-%20EduProof"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline pt-1"
                    >
                      <Mail className="w-3 h-3" />
                      Email privacy@eduproof.com
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Policy Content Area */}
            <main className="lg:col-span-8 space-y-8">
              
              {/* If Summary Mode is Enabled */}
              {viewMode === "summary" && (
                <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 text-sm text-foreground space-y-2 mb-6">
                  <div className="flex items-center gap-2 font-bold text-primary text-base">
                    <Eye className="w-5 h-5" />
                    Plain English Policy Digest
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Here is an easy-to-understand breakdown of what our privacy policy means for you as a student, professional, or recruiter. You can switch back to the Full Policy view at any time.
                  </p>
                </div>
              )}

              {/* 1. Introduction */}
              <div id="section-1" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">1. Introduction & Governance</h2>
                  </div>
                  <button 
                    onClick={() => copySectionLink("section-1")}
                    className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    title="Copy section link"
                  >
                    {copiedId === "section-1" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  EduProof (“EduProof,” “we,” “our,” or “us”), created and owned by <strong>Tanmay Anand</strong>, is committed to safeguarding the privacy, cryptographic integrity, and confidentiality of all credentials entrusted to our decentralized trust platform.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  EduProof is an AI-Powered Achievement Trust Platform engineered to verify academic certificates, competitive hackathons, licenses, and professional credentials through multi-source evidence cross-validation and explainable trust scores.
                </p>
                <div className="p-4 rounded-xl bg-secondary/40 border border-border/60 text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">Scope:</strong> This Privacy Policy governs all interactions with the EduProof web application, verification APIs, candidate portfolios, recruiter dashboards, and AI-assisted forensic tooling (collectively, the “Services”).
                </div>
              </div>

              {/* 2. Information We Collect */}
              <div id="section-2" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">2. Information We Collect</h2>
                  </div>
                  <button 
                    onClick={() => copySectionLink("section-2")}
                    className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    title="Copy section link"
                  >
                    {copiedId === "section-2" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  We collect only the minimum required information necessary to provide tamper-proof credential verification:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-primary" />
                      2.1 Account Profile Data
                    </h3>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Full Name and Contact Email</li>
                      <li>Role type (Candidate, Recruiter, Admin)</li>
                      <li>Encrypted authentication credentials</li>
                      <li>Profile avatar and preferences</li>
                      <li>Associated institution or organization</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-primary" />
                      2.2 Certificate & Evidence Files
                    </h3>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Uploaded certificate PDFs and images</li>
                      <li>Issuing organization & date of award</li>
                      <li>Unique credential ID numbers</li>
                      <li>Public verification reference URLs</li>
                      <li>Supporting portfolio links & repositories</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-primary" />
                      2.3 Verification Telemetry
                    </h3>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Cryptographic SHA-256 evidence hashes</li>
                      <li>Multi-signal confidence score breakdowns</li>
                      <li>OCR text extraction logs</li>
                      <li>Explanations of trust corroborations</li>
                      <li>Timestamped audit log trail</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-primary" />
                      2.4 Technical & Device Logs
                    </h3>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                      <li>IP address and approximate location</li>
                      <li>Browser version and device environment</li>
                      <li>Platform interactions and error logs</li>
                      <li>Page load performance diagnostics</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3. How We Use Information */}
              <div id="section-3" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
                  </div>
                  <button onClick={() => copySectionLink("section-3")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                    {copiedId === "section-3" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>We process collected data under lawful bases (Contract Performance, Legitimate Interest, and Consent) for:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong className="text-foreground">Cross-Validation:</strong> Validating digital certificates against public records and authentic issuing authority databases.</li>
                    <li><strong className="text-foreground">Trust Scoring:</strong> Computing multi-dimensional trust ratings (cryptographic anchor, OCR coherence, public presence).</li>
                    <li><strong className="text-foreground">Fraud Detection:</strong> Identifying manipulated dates, fabricated seal graphics, or contradictory metadata across documents.</li>
                    <li><strong className="text-foreground">Verified CV Generation:</strong> Rendering verified PDF resumes with embedded cryptographic QR links for candidate applications.</li>
                    <li><strong className="text-foreground">System Reliability:</strong> Monitoring API response times, preventing DDoS abuse, and safeguarding account access.</li>
                  </ul>
                </div>
              </div>

              {/* 4. AI & Automated Processing */}
              <div id="section-4" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">4. AI & Automated Processing</h2>
                  </div>
                  <button onClick={() => copySectionLink("section-4")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                    {copiedId === "section-4" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  EduProof integrates state-of-the-art vision and multimodal models (including Google Gemini) to accelerate certificate analysis:
                </p>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs md:text-sm text-muted-foreground">
                  <p>• <strong>Strict Privacy Boundaries:</strong> User document uploads and private certificates are processed through secure API endpoints with ephemeral memory. They are <strong>never</strong> ingested to train publicly available AI foundation models.</p>
                  <p>• <strong>Human-in-the-Loop:</strong> AI assessments serve as decision-support signals. Recruiters, candidates, and issuing administrators can inspect the exact evidence backing any score.</p>
                  <p>• <strong>Continuous Chatbot Learning:</strong> When you interact with our on-site AI assistant, preferences and corrections are stored locally in your browser to personalize future assistance.</p>
                </div>
              </div>

              {/* 5. Public Sources */}
              <div id="section-5" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">5. Information From Public Sources</h2>
                  </div>
                  <button onClick={() => copySectionLink("section-5")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                    {copiedId === "section-5" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  To strengthen confidence in submitted credentials, EduProof cross-references public registries, official tournament archives, competition leaderboards, and verified open-source contributions. We do not claim intellectual property over public third-party archives.
                </p>
              </div>

              {/* 6. Data Sharing */}
              <div id="section-6" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">6. Data Sharing & Processors</h2>
                  </div>
                  <button onClick={() => copySectionLink("section-6")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                    {copiedId === "section-6" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
                  We have never sold, and will never sell, your personal data.
                </div>
                <p className="text-sm text-muted-foreground">Information is shared strictly under the following scopes:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                    <strong className="text-foreground block mb-1">Approved Recruiters</strong>
                    Only organizations to which you explicitly send your verified portfolio or applications.
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                    <strong className="text-foreground block mb-1">Infrastructure Providers</strong>
                    Enterprise cloud providers (Firebase, Supabase, Google Cloud) under confidentiality agreements.
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                    <strong className="text-foreground block mb-1">Legal Mandates</strong>
                    When strictly compelled by subpoena, court order, or applicable statutory laws.
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                    <strong className="text-foreground block mb-1">Business Continuity</strong>
                    In the event of a merger, subject to the buyer adhering to identical privacy standards.
                  </div>
                </div>
              </div>

              {/* 7. Security */}
              <div id="section-7" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">7. Cryptographic Data Security</h2>
                  </div>
                  <button onClick={() => copySectionLink("section-7")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                    {copiedId === "section-7" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  EduProof employs enterprise-grade safeguards designed to exceed industry norms:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-muted-foreground">
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <strong className="text-foreground block">TLS 1.3</strong> In-Transit Protection
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <strong className="text-foreground block">AES-256</strong> At-Rest Encryption
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <strong className="text-foreground block">SHA-256</strong> Immutable Proofs
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <strong className="text-foreground block">RBAC</strong> Role Controls
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <strong className="text-foreground block">SOC-2</strong> Readiness Alignment
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <strong className="text-foreground block">Audit</strong> Forensic Logs
                  </div>
                </div>
              </div>

              {/* 8. Retention */}
              <div id="section-8" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">8. Data Retention & Deletion</h2>
                  </div>
                  <button onClick={() => copySectionLink("section-8")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                    {copiedId === "section-8" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We retain user records only as long as you maintain an active account on EduProof. When you choose to delete your account, your certificate files, personal metadata, and verification history are purged from primary storage within 30 days, unless statutory preservation is legally mandated.
                </p>
              </div>

              {/* 9. Your Rights */}
              <div id="section-9" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">9. Your Privacy Rights (GDPR & CCPA)</h2>
                  </div>
                  <button onClick={() => copySectionLink("section-9")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                    {copiedId === "section-9" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Regardless of jurisdiction, EduProof affords all users comprehensive privacy prerogatives:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
                    <strong className="text-foreground flex items-center gap-1.5">
                      <DownloadCloud className="w-3.5 h-3.5 text-primary" />
                      Right to Data Portability
                    </strong>
                    <p className="text-muted-foreground">Request a machine-readable JSON/CSV export of your complete credential verification logs.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
                    <strong className="text-foreground flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      Right to Erasure ("Be Forgotten")
                    </strong>
                    <p className="text-muted-foreground">Permanently delete your profile and certificates from EduProof database servers.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
                    <strong className="text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      Right of Rectification
                    </strong>
                    <p className="text-muted-foreground">Correct inaccurate or outdated achievement records and institution linkages.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
                    <strong className="text-foreground flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      Right to Restriction
                    </strong>
                    <p className="text-muted-foreground">Revoke recruiter access to individual credentials with a single toggle.</p>
                  </div>
                </div>
              </div>

              {/* 10. Cookies */}
              <div id="section-10" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">10. Cookies & Local Storage</h2>
                  </div>
                  <button onClick={() => copySectionLink("section-10")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                    {copiedId === "section-10" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We use cookies and localStorage strictly for functional necessities: maintaining your secure authenticated session, remembering theme preferences, and caching self-learning chatbot memories. We do not use third-party behavioral advertising tracking cookies.
                </p>
              </div>

              {/* 11. Third Parties */}
              <div id="section-11" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-3">
                <h2 className="font-display text-xl font-bold text-foreground">11. Third-Party Services & Links</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  EduProof may present links to verified external institutions, competitive hackathons, or credential registries. Each third party operates independently under their own privacy standards. We advise reviewing their policies before sharing external data.
                </p>
              </div>

              {/* 12. International Transfers */}
              <div id="section-12" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-3">
                <h2 className="font-display text-xl font-bold text-foreground">12. International Data Transfers</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our cloud servers and verification nodes may operate across multiple international regions. Cross-border data flows are safeguarded through standard contractual clauses and rigorous transport encryption.
                </p>
              </div>

              {/* 13. Children's Privacy */}
              <div id="section-13" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-3">
                <h2 className="font-display text-xl font-bold text-foreground">13. Children's & Educational Privacy</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  EduProof aligns with FERPA standards for educational records and does not knowingly collect personal data from minors under 13 without verified parental or institutional educator consent. Inquiries regarding student accounts can be directed to our compliance team.
                </p>
              </div>

              {/* 14. Changes */}
              <div id="section-14" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-3">
                <h2 className="font-display text-xl font-bold text-foreground">14. Policy Updates & Revision History</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  As our platform introduces new cryptographic checks or compliance mechanisms, we update this policy with explicit date stamps. Continued use of EduProof after published modifications signifies acceptance of the revised policy.
                </p>
              </div>

              {/* 15. Contact DPO */}
              <div id="section-15" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">15. Contact Data Protection Officer (DPO)</h2>
                  </div>
                  <button onClick={() => copySectionLink("section-15")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                    {copiedId === "section-15" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  For any privacy questions, data export inquiries, or regulatory compliance requests, our Data Protection Officer is directly reachable:
                </p>
                <div className="p-5 rounded-2xl bg-secondary/40 border border-border/70 space-y-3 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-foreground text-base">Tanmay Anand</p>
                      <p className="text-xs text-muted-foreground">Founder & Data Controller • EduProof Platform</p>
                    </div>
                    <Button asChild size="sm" className="gap-2">
                      <a href="mailto:privacy@eduproof.com?subject=Privacy%20Inquiry%20-%20EduProof">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Privacy Desk</span>
                      </a>
                    </Button>
                  </div>
                  <div className="pt-2 border-t border-border/60 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Direct: <strong className="text-foreground">privacy@eduproof.com</strong></span>
                    <span>•</span>
                    <span>Response Time: <strong className="text-foreground">Within 48 hours</strong></span>
                  </div>
                </div>
              </div>

              {/* 16. Disclaimers */}
              <div id="section-16" className="scroll-mt-24 bg-amber-500/10 rounded-2xl p-6 sm:p-8 shadow-xs border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400">16. Important Disclaimers</h2>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  EduProof is an algorithmic and evidence-matching assistance system. Confidence scores reflect mathematical and semantic verification signals, and do not constitute legal government degrees or direct institutional warranties. Users are encouraged to cross-confirm sensitive credentials with the primary issuing entity.
                </p>
              </div>

              {/* 17. Consent */}
              <div id="section-17" className="scroll-mt-24 bg-card rounded-2xl p-6 sm:p-8 shadow-xs border border-border/70 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">17. Consent & Authorization</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By utilizing the EduProof website, candidate verification portals, and recruiter verification tools, you acknowledge and consent to the data governance practices established in this Privacy Policy.
                </p>
              </div>

              {/* Bottom Copyright and Verification Link */}
              <div className="pt-8 text-center border-t border-border/60 text-xs text-muted-foreground space-y-2">
                <p>© {new Date().getFullYear()} Tanmay Anand. All rights reserved.</p>
                <p className="font-semibold text-foreground">EduProof — AI-Powered Achievement Trust Platform</p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a href="/terms" className="text-primary hover:underline">Terms of Use</a>
                  <span>•</span>
                  <a href="/support" className="text-primary hover:underline">Support & Help</a>
                  <span>•</span>
                  <a href="/how-it-works" className="text-primary hover:underline">How It Works</a>
                </div>
              </div>

            </main>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
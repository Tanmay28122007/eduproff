import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { FileText, Download, Award, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCertificates } from "@/hooks/useCertificates";
import { toast } from "sonner";
import jsPDF from "jspdf";

const GenerateCV = () => {
  const { user } = useAuth();
  const { certificates, loading } = useCertificates();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");

  const verifiedCerts = certificates.filter(c => c.verification_status === "verified");

  const generatePDF = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = 20;

      // Header with name
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(fullName, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      // Contact info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const contactInfo = [email, phone].filter(Boolean).join(" | ");
      if (contactInfo) {
        doc.text(contactInfo, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 10;
      }

      // Divider line
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Professional Summary
      if (summary.trim()) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        doc.text("PROFESSIONAL SUMMARY", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const summaryLines = doc.splitTextToSize(summary, contentWidth);
        doc.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 5 + 10;
      }

      // Verified Certificates Section
      if (verifiedCerts.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        doc.text("VERIFIED CERTIFICATIONS", margin, yPosition);
        yPosition += 8;

        doc.setTextColor(0, 0, 0);
        
        verifiedCerts.forEach((cert) => {
          // Check for page break
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`✓ ${cert.title}`, margin, yPosition);
          yPosition += 5;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          const certDate = cert.issue_date 
            ? new Date(cert.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "long" })
            : new Date(cert.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" });
          doc.text(`${cert.issuer} | ${certDate}`, margin + 5, yPosition);
          yPosition += 8;
          doc.setTextColor(0, 0, 0);
        });
        yPosition += 5;
      }

      // Experience
      if (experience.trim()) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        doc.text("WORK EXPERIENCE", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const expLines = doc.splitTextToSize(experience, contentWidth);
        doc.text(expLines, margin, yPosition);
        yPosition += expLines.length * 5 + 10;
      }

      // Education
      if (education.trim()) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        doc.text("EDUCATION", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const eduLines = doc.splitTextToSize(education, contentWidth);
        doc.text(eduLines, margin, yPosition);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated by EduProof | Verified Credentials`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Download the PDF
      doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
      toast.success("CV generated successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate CV");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              CV Generator
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Generate Your Professional CV
            </h1>
            <p className="text-lg text-muted-foreground">
              Create a beautiful CV featuring your verified certificates. 
              Stand out with authenticated credentials! 📄✨
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Verified Certificates Summary */}
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Verified Certificates
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These will be included in your CV
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : verifiedCerts.length > 0 ? (
                <div className="space-y-2">
                  {verifiedCerts.map((cert) => (
                    <div 
                      key={cert.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                    >
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {cert.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="mb-3">No verified certificates yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/verify">Upload Certificate</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* CV Form */}
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <h3 className="font-display text-lg font-semibold text-foreground mb-6">
                Your Information
              </h3>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="A brief summary of your professional background and career objectives..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Work Experience</Label>
                  <Textarea
                    id="experience"
                    placeholder="List your work experience, roles, and key achievements..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    placeholder="Your educational background, degrees, and institutions..."
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={generatePDF}
                  disabled={isGenerating || !fullName.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating CV...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download CV as PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GenerateCV;

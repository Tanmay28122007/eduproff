import { Layout } from "@/components/layout/Layout";
import { FileText } from "lucide-react";

const Terms = () => {
  return (
    <Layout>
      <section className="pt-24 pb-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Legal
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Terms of Use
            </h1>
            <p className="text-muted-foreground">
              Last updated: February 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using EduProof ("the Platform"), you agree to be bound by these Terms of Use. 
                  If you do not agree to these terms, please do not use the Platform.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EduProof provides an AI-powered credential verification platform that allows users to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Upload and verify educational and professional certificates</li>
                  <li>Receive trust scores and verification results</li>
                  <li>Share verified credentials with recruiters and employers</li>
                  <li>Access a database of verified candidates (for recruiters)</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">To use the Platform, you must:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Be at least 16 years of age</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized account access</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">4. Acceptable Use</h2>
                <p className="text-muted-foreground leading-relaxed">You agree NOT to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Upload fraudulent, falsified, or misleading credentials</li>
                  <li>Attempt to manipulate verification results</li>
                  <li>Use the Platform for any illegal purpose</li>
                  <li>Interfere with or disrupt the Platform's operation</li>
                  <li>Scrape, harvest, or collect user data without authorization</li>
                  <li>Impersonate another person or entity</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">5. Verification Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EduProof's verification system uses AI and automated checks to assess credential authenticity. 
                  While we strive for accuracy, we cannot guarantee 100% accuracy in all cases. Verification 
                  results should be used as one factor in decision-making, not as the sole determinant.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Platform and its original content, features, and functionality are owned by EduProof 
                  and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EduProof shall not be liable for any indirect, incidental, special, consequential, or 
                  punitive damages resulting from your use of or inability to use the Platform.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">8. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to terminate or suspend your account at any time for violations of 
                  these Terms or for any other reason at our discretion.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">9. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may modify these Terms at any time. Continued use of the Platform after changes 
                  constitutes acceptance of the modified Terms.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">10. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms, contact us at:
                </p>
                <p className="text-foreground font-medium mt-4">
                  legal@eduproof.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;
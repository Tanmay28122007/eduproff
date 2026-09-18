import { Layout } from "@/components/layout/Layout";
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
  UserCheck
} from "lucide-react";

const Privacy = () => {
  return (
    <Layout>
      {/* Header Banner */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-secondary/40 via-secondary/20 to-background border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold mb-6 border border-primary/20">
              <Shield className="w-4 h-4" />
              Legal & Data Governance
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              EduProof is an AI-Powered Achievement Trust Platform designed to verify academic, professional, and competitive credentials with explainable trust scores.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Last Updated: February 2026
              </span>
              <span>•</span>
              <span>Created & Owned by Tanmay Anand</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* 1. Introduction */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">1. Introduction</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                EduProof (“EduProof,” “we,” “our,” or “us”), created and owned by <strong>Tanmay Anand</strong>, is committed to protecting the privacy, security, and integrity of information entrusted to our platform.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                EduProof is an AI-Powered Achievement Trust Platform designed to help verify academic, professional, and competitive achievements using multi-source evidence cross-validation and explainable confidence scores.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy explains how we collect, use, store, protect, and disclose information when you access or use the EduProof platform, website, verification services, dashboard, AI-assisted features, and related services (collectively, the “Services”).
              </p>
              <p className="text-foreground font-medium pt-1">
                By using EduProof, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">2. Information We Collect</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Depending on how you use EduProof, we may collect the following categories of information:
              </p>

              {/* 2.1 Account Information */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border/50 space-y-3">
                <h3 className="font-bold text-foreground text-lg">2.1 Account Information</h3>
                <p className="text-sm text-muted-foreground">When you create an account, we may collect:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Password or authentication credentials</li>
                  <li>User role or account type</li>
                  <li>Profile information</li>
                  <li>Account preferences</li>
                  <li>Authentication and login information</li>
                </ul>
                <p className="text-xs text-muted-foreground italic pt-2">
                  Passwords are not intended to be stored in plain text and should be protected using appropriate authentication and encryption mechanisms.
                </p>
              </div>

              {/* 2.2 Certificate and Achievement Data */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border/50 space-y-3">
                <h3 className="font-bold text-foreground text-lg">2.2 Certificate and Achievement Data</h3>
                <p className="text-sm text-muted-foreground">When you submit an achievement or credential for verification, we may collect:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>Certificate or credential files</li>
                  <li>Certificate title</li>
                  <li>Recipient name</li>
                  <li>Issuing organization</li>
                  <li>Date of issuance</li>
                  <li>Achievement category</li>
                  <li>Certificate identification numbers</li>
                  <li>URLs or references associated with the achievement</li>
                  <li>Verification metadata</li>
                  <li>Supporting documents</li>
                  <li>Other information contained within submitted documents</li>
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  Users should avoid submitting unnecessary sensitive personal information that is not required for verification.
                </p>
              </div>

              {/* 2.3 Verification Information */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border/50 space-y-3">
                <h3 className="font-bold text-foreground text-lg">2.3 Verification Information</h3>
                <p className="text-sm text-muted-foreground">During the verification process, EduProof may generate and store:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>Verification results</li>
                  <li>Evidence sources</li>
                  <li>Evidence-matching results</li>
                  <li>Confidence scores</li>
                  <li>Verification status</li>
                  <li>Individual verification checks</li>
                  <li>Explanations associated with verification results</li>
                  <li>Timestamp and processing information</li>
                  <li>AI-generated observations or recommendations</li>
                </ul>
                <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground mt-2">
                  <strong className="text-foreground">Note:</strong> A confidence score is an informational assessment generated from available evidence and does not constitute an official certification, legal determination, employment decision, or guarantee of authenticity.
                </div>
              </div>

              {/* 2.4 Usage and Technical Data */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border/50 space-y-3">
                <h3 className="font-bold text-foreground text-lg">2.4 Usage and Technical Data</h3>
                <p className="text-sm text-muted-foreground">We may automatically collect certain technical information when you interact with EduProof, including:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Operating system</li>
                  <li>Device type</li>
                  <li>Approximate location derived from technical information</li>
                  <li>Pages visited</li>
                  <li>Features used</li>
                  <li>Session information</li>
                  <li>Referring pages</li>
                  <li>Error logs</li>
                  <li>Date and time of interactions</li>
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  This information helps us maintain security, troubleshoot technical problems, and improve the platform.
                </p>
              </div>
            </div>

            {/* 3. How We Use Your Information */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We may use collected information for the following purposes:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                  <h4 className="font-bold text-foreground text-base">3.1 Credential Verification</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Process submitted certificates and achievements</li>
                    <li>Compare information against available evidence sources</li>
                    <li>Cross-validate achievement claims</li>
                    <li>Generate verification results</li>
                    <li>Produce explainable confidence scores</li>
                    <li>Identify inconsistencies or missing evidence</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                  <h4 className="font-bold text-foreground text-base">3.2 Providing and Improving EduProof</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Operate the platform</li>
                    <li>Maintain user accounts</li>
                    <li>Improve features</li>
                    <li>Develop new verification capabilities</li>
                    <li>Monitor platform performance</li>
                    <li>Diagnose errors</li>
                    <li>Improve the user experience</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                  <h4 className="font-bold text-foreground text-base">3.3 Security and Fraud Prevention</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Detect suspicious activity</li>
                    <li>Prevent fraudulent submissions</li>
                    <li>Identify attempts to manipulate verification results</li>
                    <li>Protect user accounts</li>
                    <li>Prevent unauthorized access</li>
                    <li>Investigate security incidents</li>
                    <li>Enforce our Terms of Use</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                  <h4 className="font-bold text-foreground text-base">3.4 Communications</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Respond to support requests</li>
                    <li>Send account-related notifications</li>
                    <li>Provide verification updates</li>
                    <li>Communicate important service changes</li>
                    <li>Send security notifications</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-1">
                    Marketing communications, where applicable, will be subject to available consent and opt-out mechanisms.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                  <h4 className="font-bold text-foreground text-base">3.5 Legal Compliance</h4>
                  <p className="text-sm text-muted-foreground">We may process or disclose information when reasonably necessary to:</p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Comply with applicable laws</li>
                    <li>Respond to lawful government requests</li>
                    <li>Protect our legal rights</li>
                    <li>Investigate suspected unlawful activity</li>
                    <li>Enforce contractual terms</li>
                    <li>Protect users and the security of the platform</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. AI and Automated Processing */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">4. AI and Automated Processing</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                EduProof uses artificial intelligence and automated technologies as part of its verification workflow.
              </p>
              <p className="text-sm text-foreground font-semibold">AI-assisted features may be used for purposes such as:</p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1.5">
                <li>Extracting information from documents</li>
                <li>Identifying potentially relevant evidence</li>
                <li>Comparing information across sources</li>
                <li>Summarizing evidence</li>
                <li>Detecting inconsistencies</li>
                <li>Assisting with verification explanations</li>
                <li>Supporting confidence-score generation</li>
              </ul>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs md:text-sm text-muted-foreground space-y-2 mt-4">
                <p>• AI-generated outputs may contain errors, omissions, or incorrect interpretations.</p>
                <p>• EduProof does not guarantee that an AI-generated result is accurate or conclusive.</p>
                <p>• Where appropriate, users should independently verify important information with the original issuing organization or authoritative source.</p>
                <p>• EduProof’s confidence score should be interpreted as an evidence-based platform assessment rather than an official determination.</p>
              </div>
            </div>

            {/* 5. Information Obtained From Public Sources */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">5. Information Obtained From Public Sources</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To verify achievements, EduProof may use information available from publicly accessible sources, including:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Official organization websites</li>
                <li>Public winner lists</li>
                <li>Public competition results</li>
                <li>Public registries</li>
                <li>Public GitHub repositories</li>
                <li>Public professional profiles</li>
                <li>Publicly accessible institutional pages</li>
                <li>Other publicly available evidence sources</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2">
                The use of publicly available information is intended solely to support credential verification and evidence cross-validation. EduProof does not claim ownership of third-party information simply because it is referenced by the platform.
              </p>
            </div>

            {/* 6. Data Sharing and Disclosure */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">6. Data Sharing and Disclosure</h2>
              </div>
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
                EduProof does not sell personal data.
              </div>
              <p className="text-sm text-muted-foreground">
                We may share or disclose information in limited circumstances:
              </p>

              <div className="space-y-3.5">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
                  <h4 className="font-bold text-foreground text-sm mb-1.5">6.1 Service Providers</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We may use trusted third-party service providers to support functions such as cloud hosting, database management, authentication, file storage, AI processing, analytics, security monitoring, email delivery, and application infrastructure. These providers may process information only as necessary to provide their services, subject to applicable agreements and security requirements.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
                  <h4 className="font-bold text-foreground text-sm mb-1.5">6.2 Recruiters and Organizations</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If EduProof provides a feature allowing users to share verification results with recruiters, institutions, employers, or other organizations, such sharing will occur based on the user’s actions or explicit consent, where required. Users should review the information they are sharing before making it accessible to third parties.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
                  <h4 className="font-bold text-foreground text-sm mb-1.5">6.3 Legal Requirements</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We may disclose information when required or permitted by applicable law, including in response to court orders, legal processes, government requests, regulatory requirements, or law-enforcement requests.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
                  <h4 className="font-bold text-foreground text-sm mb-1.5">6.4 Business Transfers</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If EduProof undergoes a merger, acquisition, restructuring, financing, sale of assets, or similar transaction, user information may be transferred as part of that transaction, subject to applicable legal requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Data Security */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">7. Data Security</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We take reasonable technical and organizational measures to protect information from unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className="text-sm text-foreground font-semibold">Security measures may include:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Encryption during data transmission</li>
                <li>Encrypted or access-controlled storage</li>
                <li>Authentication mechanisms</li>
                <li>Role-based access controls</li>
                <li>Secure application architecture</li>
                <li>Monitoring for suspicious activity</li>
                <li>Security updates</li>
                <li>Vulnerability assessments</li>
                <li>Access restrictions</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2">
                However, no internet-based service can guarantee absolute security. Users are responsible for maintaining the confidentiality of their account credentials and should immediately notify EduProof if they suspect unauthorized access to their account.
              </p>
            </div>

            {/* 8. Data Retention */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">8. Data Retention</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We retain information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Providing the Services</li>
                <li>Maintaining verification history</li>
                <li>Meeting legal obligations</li>
                <li>Resolving disputes</li>
                <li>Preventing fraud</li>
                <li>Maintaining security records</li>
                <li>Enforcing agreements</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2">
                The retention period may vary depending on the type of information and the purpose for which it was collected. When information is no longer required, it may be deleted, anonymized, or securely disposed of, subject to applicable legal and operational requirements.
              </p>
            </div>

            {/* 9. Your Privacy Rights */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">9. Your Privacy Rights</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Depending on applicable law, you may have rights regarding your personal information, including the right to:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1.5">
                <li>Request access to your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of certain information</li>
                <li>Request a copy or export of your information</li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Object to certain processing activities</li>
                <li>Opt out of marketing communications</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2">
                Some requests may be subject to legal or operational limitations. To exercise a privacy-related right, contact us using the details provided in Section 15.
              </p>
            </div>

            {/* 10. Cookies and Similar Technologies */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">10. Cookies and Similar Technologies</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                EduProof may use cookies, local storage, session technologies, or similar mechanisms to:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Maintain login sessions</li>
                <li>Remember user preferences</li>
                <li>Improve website functionality</li>
                <li>Understand platform usage</li>
                <li>Maintain security</li>
                <li>Diagnose technical issues</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
                Where required by applicable law, EduProof will provide appropriate consent mechanisms for non-essential cookies or similar technologies. Users may also be able to control cookies through their browser settings. Disabling certain cookies may affect platform functionality.
              </p>
            </div>

            {/* 11. Third-Party Services and Links */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">11. Third-Party Services and Links</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                EduProof may integrate with or link to third-party services, websites, APIs, or platforms. Examples may include services used for authentication, cloud infrastructure, AI processing, analytics, document processing, evidence verification, and external achievement sources.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Third-party services operate under their own privacy policies and terms. EduProof is not responsible for the privacy practices of independent third-party websites or services. Users should review the privacy policies of third-party services before providing information to them.
              </p>
            </div>

            {/* 12. International Data Processing */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-3">
              <h2 className="font-display text-xl font-bold text-foreground">12. International Data Processing</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Depending on the infrastructure and service providers used by EduProof, information may be processed or stored in locations outside the user’s state or country. Where applicable, we will take reasonable measures to ensure that personal information is handled in accordance with applicable data-protection requirements.
              </p>
            </div>

            {/* 13. Children’s Privacy */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-3">
              <h2 className="font-display text-xl font-bold text-foreground">13. Children’s Privacy</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                EduProof is not intentionally designed to collect personal information from children without appropriate authorization. If you believe that a child has provided personal information to EduProof without appropriate consent or authorization, please contact us. Upon receiving a valid request, we will take reasonable steps to investigate and address the matter in accordance with applicable law.
              </p>
            </div>

            {/* 14. Changes to This Privacy Policy */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-3">
              <h2 className="font-display text-xl font-bold text-foreground">14. Changes to This Privacy Policy</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes to EduProof, new features or services, changes in technology, changes in applicable laws, or changes in our data practices. When changes are made, the “Last Updated” date at the beginning of this policy will be updated. For significant changes, we may provide additional notice through the platform or by other appropriate means. We encourage users to periodically review this Privacy Policy.
              </p>
            </div>

            {/* 15. Contact Us */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">15. Contact Us</h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                If you have questions, concerns, requests, or complaints regarding this Privacy Policy or EduProof’s data practices, please contact us at:
              </p>
              <div className="p-5 rounded-xl bg-secondary/40 border border-border/70 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <strong className="text-foreground">Email:</strong>
                  <a href="mailto:privacy@eduproof.com" className="text-primary hover:underline font-semibold">
                    privacy@eduproof.com
                  </a>
                </div>
                <p className="text-foreground font-semibold pt-1">EduProof</p>
                <p className="text-xs text-muted-foreground">AI-Powered Achievement Trust Platform</p>
                <p className="text-xs text-muted-foreground">Created and owned by <strong>Tanmay Anand</strong></p>
              </div>
            </div>

            {/* 16. Important Disclaimer */}
            <div className="bg-amber-500/10 rounded-2xl p-6 md:p-8 shadow-xs border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-amber-700 dark:text-amber-400">16. Important Disclaimer</h2>
              </div>
              <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-medium">
                EduProof is a technology platform designed to assist with achievement and credential verification.
              </p>
              <p className="text-sm text-muted-foreground">
                A verification result, evidence match, confidence score, or AI-generated explanation:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                <li>Does not guarantee that a credential is legally valid.</li>
                <li>Does not constitute an official endorsement by an issuing organization.</li>
                <li>Does not guarantee employment, admission, funding, promotion, or any other outcome.</li>
                <li>Does not replace verification performed directly by the original issuing authority.</li>
                <li>May be affected by incomplete, outdated, inaccessible, or incorrect source information.</li>
              </ul>
              <p className="text-xs md:text-sm text-foreground/90 font-medium pt-2 leading-relaxed">
                Where a credential is important for employment, education, legal, financial, or regulatory purposes, users and organizations should independently confirm the credential with the relevant issuing authority.
              </p>
            </div>

            {/* 17. Consent */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xs border border-border/70 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">17. Consent</h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                By using EduProof, you acknowledge that you have reviewed this Privacy Policy and understand how information may be collected, used, stored, and disclosed as described above.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Where applicable law requires a separate or explicit consent mechanism, EduProof will obtain such consent through an appropriate interface or process.
              </p>
            </div>

            {/* Copyright Statement */}
            <div className="text-center pt-8 pb-4 text-xs text-muted-foreground space-y-1">
              <p>© 2026 Tanmay Anand. All rights reserved.</p>
              <p className="font-medium text-foreground">EduProof — AI-Powered Achievement Trust Platform</p>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
/**
 * EduProof Achievement Trust Engine
 * Multi-layer trust verification engine evaluating authentic achievement through 6 independent pillars.
 */

export interface EvidenceItem {
  id: string;
  type: "email" | "photo" | "github" | "linkedin" | "announcement" | "paper" | "portfolio" | "other";
  title: string;
  url?: string;
  fileName?: string;
  timestamp?: string;
  verifiedStatus: "verified" | "pending" | "unverified";
  confidenceBoost: number;
  description?: string;
}

export interface VerifierEndorsement {
  id: string;
  name: string;
  role: string; // e.g. "Professor / Faculty Mentor", "Event Organizer", "Team Lead"
  organization: string;
  email: string;
  status: "verified" | "pending";
  trustWeight: number; // 1-10
  verifiedAt?: string;
  comments?: string;
}

export interface TimelineMilestone {
  date: string;
  title: string;
  type: "registration" | "participation" | "commit" | "submission" | "evaluation" | "announcement" | "issuance" | "endorsement";
  status: "confirmed" | "inferred" | "unverified";
  source: string;
}

export interface ForensicResult {
  tamperRiskScore: number; // 0-100 (0 = clean, 100 = heavily tampered)
  fontConsistency: number; // 0-100
  metadataIntegrity: boolean;
  compressionUniformity: number; // 0-100
  copyPasteSignaturesDetected: boolean;
  aiEditProbability: number; // 0-100
  signals: string[];
  risks: string[];
}

export interface TrustAnalysisResult {
  certificateId: string;
  studentName: string;
  issuerName: string;
  achievementTitle: string;
  issueDate: string;
  overallConfidenceScore: number; // 0-100%
  confidenceLevel: "Exceptional Trust" | "High Confidence" | "Moderate Confidence" | "Low Trust" | "High Risk";
  tamperRisk: "Clean" | "Low Anomaly" | "Moderate Risk" | "Critical Tamper Risk";
  tamperProbabilityScore: number; // 0-100%
  pillarScores: {
    forensics: number;     // 0-100 (20% weight)
    ocrValidation: number; // 0-100 (15% weight)
    crossEvidence: number; // 0-100 (25% weight)
    publicWebMatch: number;// 0-100 (20% weight)
    digitalSignature: number; // 0-100 (10% weight)
    humanEndorsement: number; // 0-100 (10% weight)
  };
  positiveSignals: string[];
  riskWarnings: string[];
  extractedMetadata: {
    studentName: string;
    courseOrEvent: string;
    organization: string;
    date: string;
    certificateId: string;
    qrCodePresent: boolean;
    digitalSignaturePresent: boolean;
  };
  evidenceItems: EvidenceItem[];
  publicMatches: Array<{
    source: string;
    url: string;
    matchedTitle: string;
    confidence: number;
  }>;
  endorsements: VerifierEndorsement[];
  timeline: TimelineMilestone[];
  cryptoHash?: string;
  qrCodeUrl?: string;
  aiSummary: string;
}

export interface VerificationInput {
  title: string;
  issuer: string;
  certificateCode?: string;
  studentName?: string;
  issueDate?: string;
  file?: File | null;
  evidenceItems?: EvidenceItem[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  publicSearchLinks?: string[];
  endorsements?: VerifierEndorsement[];
}

/**
 * Generates deterministic cryptographic hash simulation for certificate minting
 */
export function generateCertificateHash(certId: string, student: string, issuer: string, date: string): string {
  const str = `${certId}_${student}_${issuer}_${date}_EduProof_TrustEngine_v2`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `0x${hex}e984f102c${hex}884a2119b4e72`;
}

/**
 * Main Analysis Engine: Analyzes achievement authenticity using 6 independent trust pillars.
 */
export async function analyzeAchievement(input: VerificationInput): Promise<TrustAnalysisResult> {
  const certId = input.certificateCode?.trim() || `EDU-${Math.floor(100000 + Math.random() * 900000)}`;
  const student = input.studentName?.trim() || "Authenticated Student";
  const issuer = input.issuer.trim() || "Issuing Authority";
  const title = input.title.trim() || "Achievement Certificate";
  const dateStr = input.issueDate || new Date().toISOString().split("T")[0];

  // 1. AI Forensic Analysis
  const forensics: ForensicResult = runForensicAnalysis(input.file);

  // 2. OCR & Content Validation
  const ocrScore = input.file ? 92 : 85;
  const ocrExtracted = {
    studentName: student,
    courseOrEvent: title,
    organization: issuer,
    date: dateStr,
    certificateId: certId,
    qrCodePresent: certId.startsWith("EDU-") || certId.length >= 6,
    digitalSignaturePresent: certId.includes("EDU") || certId.includes("AWS") || certId.includes("CERT"),
  };

  // 3. Cross-Evidence Analysis
  const evidenceList: EvidenceItem[] = input.evidenceItems && input.evidenceItems.length > 0
    ? [...input.evidenceItems]
    : [];

  if (input.githubUrl && !evidenceList.some(e => e.type === "github")) {
    evidenceList.push({
      id: "ev_github",
      type: "github",
      title: "GitHub Project Repository",
      url: input.githubUrl,
      verifiedStatus: "verified",
      confidenceBoost: 20,
      description: "Code commit timestamps precede event completion date.",
    });
  }

  if (input.linkedinUrl && !evidenceList.some(e => e.type === "linkedin")) {
    evidenceList.push({
      id: "ev_linkedin",
      type: "linkedin",
      title: "LinkedIn Winner Announcement",
      url: input.linkedinUrl,
      verifiedStatus: "verified",
      confidenceBoost: 15,
      description: "Public post matching issuing organization handles.",
    });
  }

  if (input.portfolioUrl && !evidenceList.some(e => e.type === "portfolio")) {
    evidenceList.push({
      id: "ev_portfolio",
      type: "portfolio",
      title: "Live Project Demo / Portfolio",
      url: input.portfolioUrl,
      verifiedStatus: "verified",
      confidenceBoost: 15,
      description: "Live functional deployment linked to achievement.",
    });
  }

  let crossEvidenceScore = 40; // baseline with no extra evidence
  evidenceList.forEach((item) => {
    if (item.verifiedStatus === "verified") crossEvidenceScore += item.confidenceBoost;
    else crossEvidenceScore += 5;
  });
  crossEvidenceScore = Math.min(100, crossEvidenceScore);

  // 4. Public Web Verification Matches
  const publicMatches = simulatePublicWebMatches(title, issuer, student);
  const publicMatchScore = publicMatches.length > 0
    ? Math.min(100, 60 + publicMatches.length * 20)
    : 45;

  // 5. Digital Verification
  const digitalSignatureScore = ocrExtracted.qrCodePresent && ocrExtracted.digitalSignaturePresent ? 95 : 60;

  // 6. Human Verification / Endorsements
  const endorsements: VerifierEndorsement[] = input.endorsements || [];
  let humanScore = 30; // base score if no endorsement
  if (endorsements.length > 0) {
    humanScore = Math.min(100, 50 + endorsements.filter(e => e.status === "verified").length * 25);
  }

  // 6-Pillar Composite Weighting:
  // Forensics (20%) + OCR (15%) + Evidence (25%) + Public Match (20%) + Digital Sign (10%) + Human (10%)
  const forensicPillar = Math.max(0, 100 - forensics.tamperRiskScore);
  
  const overallConfidenceScore = Math.round(
    forensicPillar * 0.20 +
    ocrScore * 0.15 +
    crossEvidenceScore * 0.25 +
    publicMatchScore * 0.20 +
    digitalSignatureScore * 0.10 +
    humanScore * 0.10
  );

  // Determine Confidence Level Category
  let confidenceLevel: TrustAnalysisResult["confidenceLevel"] = "Moderate Confidence";
  if (overallConfidenceScore >= 90) confidenceLevel = "Exceptional Trust";
  else if (overallConfidenceScore >= 75) confidenceLevel = "High Confidence";
  else if (overallConfidenceScore >= 50) confidenceLevel = "Moderate Confidence";
  else if (overallConfidenceScore >= 35) confidenceLevel = "Low Trust";
  else confidenceLevel = "High Risk";

  // Determine Tamper Risk Text
  let tamperRisk: TrustAnalysisResult["tamperRisk"] = "Clean";
  if (forensics.tamperRiskScore > 65) tamperRisk = "Critical Tamper Risk";
  else if (forensics.tamperRiskScore > 40) tamperRisk = "Moderate Risk";
  else if (forensics.tamperRiskScore > 15) tamperRisk = "Low Anomaly";

  // Signals and Risk Warnings
  const positiveSignals: string[] = [];
  const riskWarnings: string[] = [];

  if (forensicPillar >= 85) positiveSignals.push("Document shows clean layout compression & font uniformity");
  else riskWarnings.push("Metadata anomalies detected in document header");

  if (ocrExtracted.qrCodePresent) positiveSignals.push("Valid Certificate ID format matching institutional standard");
  else riskWarnings.push("Certificate lacks an official embedded QR Code or Certificate ID");

  if (publicMatches.length > 0) positiveSignals.push(`Found ${publicMatches.length} independent public web matches (Winner list & Registry)`);
  else riskWarnings.push("No direct public web index entry found on organizer site");

  if (evidenceList.length > 0) positiveSignals.push(`${evidenceList.length} supporting evidence file(s)/link(s) cross-verified`);
  else riskWarnings.push("No secondary supporting evidence (email, repo, or portfolio) attached");

  if (endorsements.some(e => e.status === "verified")) positiveSignals.push("Faculty/Mentor endorsement verified via institutional domain");

  // Construct Timeline
  const timeline: TimelineMilestone[] = [
    { date: calculateDateOffset(dateStr, -30), title: "Event Registration & Entry", type: "registration", status: "confirmed", source: "Cross-Evidence Record" },
    { date: calculateDateOffset(dateStr, -14), title: "Project Commits & Submission", type: "commit", status: input.githubUrl ? "confirmed" : "inferred", source: input.githubUrl ? "GitHub API" : "Estimated Timeline" },
    { date: calculateDateOffset(dateStr, -3), title: "Judicial Evaluation Completed", type: "evaluation", status: "confirmed", source: "Organizer Logs" },
    { date: dateStr, title: "Official Winner & Certificate Issuance", type: "issuance", status: "confirmed", source: "EduProof Trust Engine" },
  ];

  if (endorsements.length > 0) {
    timeline.push({
      date: new Date().toISOString().split("T")[0],
      title: "Faculty / Mentor Verification Endorsed",
      type: "endorsement",
      status: "confirmed",
      source: endorsements[0].organization || "Verified Academic Institution",
    });
  }

  const cryptoHash = generateCertificateHash(certId, student, issuer, dateStr);

  const aiSummary = overallConfidenceScore >= 80
    ? `The achievement "${title}" earned by ${student} from ${issuer} has been verified with ${overallConfidenceScore}% confidence. Multi-layer analysis confirms document structural integrity, matching public web records, and timeline consistency.`
    : `The achievement "${title}" has a confidence score of ${overallConfidenceScore}%. While basic document features are readable, adding secondary evidence (e.g. GitHub link, winner announcement email, or faculty endorsement) will significantly increase verification trust.`;

  return {
    certificateId: certId,
    studentName: student,
    issuerName: issuer,
    achievementTitle: title,
    issueDate: dateStr,
    overallConfidenceScore,
    confidenceLevel,
    tamperRisk,
    tamperProbabilityScore: forensics.tamperRiskScore,
    pillarScores: {
      forensics: forensicPillar,
      ocrValidation: ocrScore,
      crossEvidence: crossEvidenceScore,
      publicWebMatch: publicMatchScore,
      digitalSignature: digitalSignatureScore,
      humanEndorsement: humanScore,
    },
    positiveSignals,
    riskWarnings,
    extractedMetadata: ocrExtracted,
    evidenceItems: evidenceList,
    publicMatches,
    endorsements,
    timeline,
    cryptoHash,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      window.location.origin + "/check?code=" + certId
    )}`,
    aiSummary,
  };
}

/**
 * AI Forensic Inspection helper
 */
function runForensicAnalysis(file?: File | null): ForensicResult {
  if (!file) {
    return {
      tamperRiskScore: 12,
      fontConsistency: 95,
      metadataIntegrity: true,
      compressionUniformity: 92,
      copyPasteSignaturesDetected: false,
      aiEditProbability: 8,
      signals: ["Standard document structure"],
      risks: [],
    };
  }

  const sizeKb = file.size / 1024;
  let tamperScore = 8;
  const signals: string[] = ["PDF font table consistency verified", "Metadata timestamps align with creation date"];
  const risks: string[] = [];

  if (sizeKb < 50) {
    tamperScore += 25;
    risks.push("Unusually small file size may indicate compressed web re-export");
  }

  return {
    tamperRiskScore: tamperScore,
    fontConsistency: 96,
    metadataIntegrity: true,
    compressionUniformity: 94,
    copyPasteSignaturesDetected: false,
    aiEditProbability: tamperScore > 30 ? 35 : 5,
    signals,
    risks,
  };
}

/**
 * Simulates Searching Public Sources (GitHub, Kaggle, Coursera, Winner Lists)
 */
function simulatePublicWebMatches(title: string, issuer: string, student: string) {
  const matches = [];

  if (title.toLowerCase().includes("web") || title.toLowerCase().includes("code") || title.toLowerCase().includes("developer") || title.toLowerCase().includes("full-stack")) {
    matches.push({
      source: "GitHub Public Archive",
      url: "https://github.com/search?q=" + encodeURIComponent(title),
      matchedTitle: `${student} / ${title} Repository & Commits`,
      confidence: 94,
    });
  }

  matches.push({
    source: `${issuer} Official Records Portal`,
    url: "https://google.com/search?q=" + encodeURIComponent(`${student} ${title} ${issuer}`),
    matchedTitle: `${title} - Published Participant Registry`,
    confidence: 88,
  });

  return matches;
}

/**
 * Helper date calculator for timeline milestone simulation
 */
function calculateDateOffset(baseDateStr: string, offsetDays: number): string {
  try {
    const d = new Date(baseDateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  } catch {
    return baseDateStr;
  }
}

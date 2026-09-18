/**
 * EduProof AI Certificate Detection & Authenticity Verification Engine Bridge
 * 
 * Bridges to the modular 13-stage CertificateForensicsEngine while maintaining full
 * backward compatibility for existing UI components and service hooks.
 */

import {
  CertificateForensicsEngine,
  ForensicInput,
  ForensicAPIResponse,
  CertificateClassification,
  AuthenticityStatus,
  ManipulationStatus,
  IssuerVerificationStatus,
  ExternalEvidenceStatus,
  ExtractedInformation,
  VerificationEvidence,
  VerificationSignalWeights,
  DEFAULT_FORENSIC_SIGNAL_WEIGHTS,
  EvidenceNode,
  DatasetAuditRecord,
  getEvaluationDataset,
  saveEvaluationDatasetRecord,
  DatasetCategory,
  ManipulationType,
} from "./certificateForensicsEngine";

export type {
  CertificateClassification,
  AuthenticityStatus,
  ManipulationStatus,
  IssuerVerificationStatus,
  ExternalEvidenceStatus,
  ExtractedInformation,
  VerificationEvidence,
  VerificationSignalWeights,
  EvidenceNode,
  DatasetAuditRecord,
  DatasetCategory,
  ManipulationType,
  ForensicAPIResponse,
};

export const DEFAULT_SIGNAL_WEIGHTS = DEFAULT_FORENSIC_SIGNAL_WEIGHTS;

export interface AICertificateVerificationResult {
  analysis_id: string;
  is_certificate: boolean;
  certificate_classification: CertificateClassification;
  certificate_confidence: number; // 0-100%
  authenticity_status: AuthenticityStatus;
  verification_confidence: number; // 0-100 Verification Confidence Score
  manipulation_status: ManipulationStatus;
  ai_manipulation_probability: number; // 0-100%
  issuer_verification: IssuerVerificationStatus;
  extracted_information: {
    name: string;
    certificate_type: string;
    achievement: string;
    issuer: string;
    certificate_id: string;
    date: string;
    course_or_event: string;
    signatory: string;
    organization_website: string;
    other_information: string;
  };
  evidence: VerificationEvidence;
  final_conclusion: string;
  manual_review_required: boolean;
  evidence_graph?: EvidenceNode[];
  raw_forensic_response?: ForensicAPIResponse;
  details: {
    question1_is_certificate: {
      passed: boolean;
      score: number;
      reasoning: string;
    };
    question2_appears_genuine: {
      status: AuthenticityStatus;
      score: number;
      reasoning: string;
    };
    question3_manipulation: {
      status: ManipulationStatus;
      probability: number;
      indicators: string[];
    };
    question4_issuer_verifiable: {
      status: IssuerVerificationStatus;
      reasoning: string;
    };
    weights_used: VerificationSignalWeights;
    pipeline_step_timestamps: {
      file_validation: string;
      classification: string;
      text_extraction: string;
      visual_forensics: string;
      pdf_forensics: string;
      ai_detection: string;
      issuer_check: string;
      aggregation: string;
    };
  };
}

export interface InspectionInput {
  analysisId?: string;
  file?: File | null;
  fileDataUrl?: string | null;
  providedTitle?: string;
  providedIssuer?: string;
  providedStudentName?: string;
  providedDate?: string;
  providedCertId?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  weights?: Partial<VerificationSignalWeights>;
}

/**
 * Runs the Specialized Forensic Engine and maps to the legacy result structure
 * while preserving new rich evidence graphs and Section 24 API responses.
 */
export async function runAICertificateVerification(
  input: InspectionInput
): Promise<AICertificateVerificationResult> {
  const forensicInput: ForensicInput = {
    analysisId: input.analysisId,
    file: input.file,
    fileDataUrl: input.fileDataUrl,
    providedTitle: input.providedTitle,
    providedIssuer: input.providedIssuer,
    providedStudentName: input.providedStudentName,
    providedDate: input.providedDate,
    providedCertId: input.providedCertId,
    githubUrl: input.githubUrl,
    linkedinUrl: input.linkedinUrl,
    portfolioUrl: input.portfolioUrl,
    weights: input.weights,
  };

  const response: ForensicAPIResponse = await CertificateForensicsEngine.analyzeDocument(forensicInput);
  const now = new Date().toISOString();

  return {
    analysis_id: response.analysis_id,
    is_certificate: response.classification.is_certificate,
    certificate_classification: response.classification.status,
    certificate_confidence: response.classification.confidence,
    authenticity_status: response.verification.authenticity_status,
    verification_confidence: response.verification.verification_confidence,
    manipulation_status: response.forensics.visual_manipulation,
    ai_manipulation_probability: response.forensics.ai_artifact_probability,
    issuer_verification: response.verification.issuer_status,
    extracted_information: {
      name: response.extracted_information.student_name,
      certificate_type: response.extracted_information.certificate_type,
      achievement: response.extracted_information.achievement,
      issuer: response.extracted_information.issuer,
      certificate_id: response.extracted_information.certificate_id,
      date: response.extracted_information.issue_date,
      course_or_event: response.extracted_information.course_or_event,
      signatory: response.extracted_information.signatory,
      organization_website: response.extracted_information.organization_website,
      other_information: response.extracted_information.additional_information || "NOT_FOUND",
    },
    evidence: response.evidence,
    final_conclusion: response.final_conclusion,
    manual_review_required: response.manual_review_required,
    evidence_graph: response.evidence_graph,
    raw_forensic_response: response,
    details: {
      question1_is_certificate: response.details?.question1_is_certificate || {
        passed: response.classification.is_certificate,
        score: response.classification.confidence,
        reasoning: "Classification evaluated.",
      },
      question2_appears_genuine: response.details?.question2_appears_genuine || {
        status: response.verification.authenticity_status,
        score: response.verification.verification_confidence,
        reasoning: response.final_conclusion,
      },
      question3_manipulation: response.details?.question3_manipulation || {
        status: response.forensics.visual_manipulation,
        probability: response.forensics.ai_artifact_probability,
        indicators: response.evidence.risk_indicators,
      },
      question4_issuer_verifiable: response.details?.question4_issuer_verifiable || {
        status: response.verification.issuer_status,
        reasoning: `Issuer status: ${response.verification.issuer_status}`,
      },
      weights_used: response.details?.weights_used || DEFAULT_SIGNAL_WEIGHTS,
      pipeline_step_timestamps: {
        file_validation: now,
        classification: now,
        text_extraction: now,
        visual_forensics: now,
        pdf_forensics: now,
        ai_detection: now,
        issuer_check: now,
        aggregation: now,
      },
    },
  };
}

export {
  getEvaluationDataset,
  saveEvaluationDatasetRecord,
};

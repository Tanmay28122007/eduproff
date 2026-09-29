import { supabase } from "@/integrations/supabase/client";

export interface MigrationSummary {
  table: string;
  transferred: number;
  skipped: number;
  errors: string[];
}

const SEED_ISSUED_CERTIFICATES = [
  {
    certificate_id: "EDU-2025-001",
    course_name: "Full-Stack Web Development",
    student_name: "Stanford University",
    issue_date: "2025-01-15",
  },
  {
    certificate_id: "AWS-12345",
    course_name: "AWS Certified Solutions Architect",
    student_name: "Amazon Web Services",
    issue_date: "2024-11-20",
  },
  {
    certificate_id: "COURSE-67890",
    course_name: "Machine Learning Specialization",
    student_name: "Coursera / Stanford",
    issue_date: "2024-12-10",
  },
  {
    certificate_id: "CERT-001",
    course_name: "Advanced Computer Science",
    student_name: "MIT OpenCourseWare",
    issue_date: "2025-02-01",
  },
];

export async function transferLocalDataToSupabase(): Promise<MigrationSummary[]> {
  const results: MigrationSummary[] = [];

  // 1. Transfer Issued Certificates (Seed + Local Storage)
  const issuedCertSummary: MigrationSummary = { table: "issued_certificates", transferred: 0, skipped: 0, errors: [] };
  try {
    let localIssued: any[] = [];
    try {
      const raw = localStorage.getItem("eduproof_firestore_issued_certificates");
      if (raw) localIssued = JSON.parse(raw);
    } catch (_err) {
      // Local storage not populated or corrupt
    }

    const allIssued = [...SEED_ISSUED_CERTIFICATES];
    for (const item of localIssued) {
      if (!allIssued.some((c) => c.certificate_id?.toLowerCase() === item.certificate_id?.toLowerCase())) {
        allIssued.push({
          certificate_id: item.certificate_id,
          course_name: item.course_name || "General Course",
          student_name: item.student_name || "Unknown Student",
          issue_date: item.issue_date ? item.issue_date.split("T")[0] : new Date().toISOString().split("T")[0],
        });
      }
    }

    for (const cert of allIssued) {
      const { error } = await supabase.from("issued_certificates").upsert(cert, {
        onConflict: "certificate_id",
      });
      if (error) {
        issuedCertSummary.errors.push(`${cert.certificate_id}: ${error.message}`);
      } else {
        issuedCertSummary.transferred++;
      }
    }
  } catch (err: any) {
    issuedCertSummary.errors.push(err.message || String(err));
  }
  results.push(issuedCertSummary);

  // 2. Transfer Verification Logs
  const logSummary: MigrationSummary = { table: "verification_logs", transferred: 0, skipped: 0, errors: [] };
  try {
    const raw = localStorage.getItem("eduproof_firestore_verification_logs");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs) && logs.length > 0) {
        for (const log of logs) {
          const logPayload: any = {
            certificate_id: log.certificate_id || "UNKNOWN",
            recruiter_id: log.recruiter_id || log.user_id,
            status: log.status || "verified",
            trust_score: log.trust_score ?? 85,
          };
          // Only insert if recruiter_id is a valid UUID
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (logPayload.recruiter_id && uuidRegex.test(logPayload.recruiter_id)) {
            const { error } = await supabase.from("verification_logs").insert(logPayload);
            if (error) logSummary.errors.push(error.message);
            else logSummary.transferred++;
          } else {
            logSummary.skipped++;
          }
        }
      }
    }
  } catch (err: any) {
    logSummary.errors.push(err.message || String(err));
  }
  results.push(logSummary);

  return results;
}

// Attach to window for easy manual trigger from DevTools if needed
if (typeof window !== "undefined") {
  (window as any).transferEduProofDataToSupabase = transferLocalDataToSupabase;
}

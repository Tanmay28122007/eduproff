-- =========================================================
-- EDUPROOF SEED DATA
-- Run this in Supabase SQL Editor after consolidated_schema.sql
-- =========================================================

INSERT INTO public.issued_certificates (certificate_id, course_name, student_name, issue_date)
VALUES
  ('EDU-2025-001', 'Full-Stack Web Development', 'Stanford University', '2025-01-15'),
  ('AWS-12345', 'AWS Certified Solutions Architect', 'Amazon Web Services', '2024-11-20'),
  ('COURSE-67890', 'Machine Learning Specialization', 'Coursera / Stanford', '2024-12-10'),
  ('CERT-001', 'Advanced Computer Science', 'MIT OpenCourseWare', '2025-02-01')
ON CONFLICT (certificate_id) DO UPDATE SET
  course_name = EXCLUDED.course_name,
  student_name = EXCLUDED.student_name,
  issue_date = EXCLUDED.issue_date;

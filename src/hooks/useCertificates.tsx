import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  certificate_url: string | null;
  verification_status: "pending" | "verified" | "failed";
  verification_message: string | null;
  created_at: string;
  updated_at: string;
}

export const useCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    if (!user) {
      setCertificates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setCertificates((data as Certificate[]) || []);
      }
    } catch (err) {
      console.error("Fetch certificates error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const addCertificate = async (
    title: string,
    issuer: string,
    issueDate?: string,
    certificateUrl?: string
  ): Promise<{ data: Certificate | null; error: string | null }> => {
    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    try {
      const { data, error } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          title,
          issuer,
          issue_date: issueDate || null,
          certificate_url: certificateUrl || null,
          verification_status: "pending",
          verification_message: null,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      await fetchCertificates();
      return { data: data as Certificate, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : "Failed to add certificate" 
      };
    }
  };

  const updateCertificateStatus = async (
    certificateId: string,
    status: "pending" | "verified" | "failed",
    message?: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from("certificates")
        .update({
          verification_status: status,
          verification_message: message || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", certificateId);

      if (error) {
        return { error: error.message };
      }

      await fetchCertificates();
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : "Failed to update certificate" 
      };
    }
  };

  const deleteCertificate = async (certificateId: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", certificateId);

      if (error) {
        return { error: error.message };
      }

      await fetchCertificates();
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : "Failed to delete certificate" 
      };
    }
  };

  return {
    certificates,
    loading,
    error,
    refetch: fetchCertificates,
    addCertificate,
    updateCertificateStatus,
    deleteCertificate,
  };
};

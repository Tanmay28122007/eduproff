import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Clock, Shield, Award, Building, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerificationResult {
  found: boolean;
  message?: string;
  certificate?: {
    id: string;
    title: string;
    issuer: string;
    status: string;
    issueDate: string | null;
    verifiedAt: string;
  };
}

export default function PublicVerify() {
  const [searchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setCertificateId(idFromUrl);
      handleVerifyById(idFromUrl);
    }
  }, [searchParams]);

  const handleVerifyById = async (id: string) => {
    if (!id.trim()) return;
    
    setIsLoading(true);
    setResult(null);

    try {
      const searchId = id.trim();

      // Check issued_certificates table
      const { data: issuedData } = await supabase
        .from("issued_certificates")
        .select("*")
        .eq("certificate_id", searchId)
        .single();

      if (issuedData) {
        setResult({
          found: true,
          certificate: {
            id: issuedData.certificate_id || searchId,
            title: issuedData.course_name || "Issued Certificate",
            issuer: "Verified Institution",
            status: "verified",
            issueDate: issuedData.issue_date || null,
            verifiedAt: issuedData.issued_at || new Date().toISOString()
          }
        });
        return;
      }

      // Check certificates table
      const { data: certData } = await supabase
        .from("certificates")
        .select("*")
        .eq("id", searchId)
        .single();

      if (certData) {
        setResult({
          found: true,
          certificate: {
            id: certData.id,
            title: certData.title,
            issuer: certData.issuer,
            status: certData.verification_status || "pending",
            issueDate: certData.issue_date || null,
            verifiedAt: certData.updated_at || new Date().toISOString()
          }
        });
        return;
      }

      setResult({
        found: false,
        message: "No certificate found with this ID."
      });
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = () => {
    if (!certificateId.trim()) {
      toast({
        title: "Enter Certificate ID",
        description: "Please enter a certificate ID to verify.",
        variant: "destructive",
      });
      return;
    }
    handleVerifyById(certificateId);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          icon: CheckCircle,
          label: "Verified",
          variant: "default" as const,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950/30",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "failed":
        return {
          icon: XCircle,
          label: "Verification Failed",
          variant: "destructive" as const,
          color: "text-destructive",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          icon: Clock,
          label: "Pending Verification",
          variant: "secondary" as const,
          color: "text-amber-600",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-200 dark:border-amber-800",
        };
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-secondary/20 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-hero mb-4 shadow-glow-primary">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Verify Certificate
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a certificate ID to verify its authenticity on the EduProof platform.
            </p>
          </div>

          {/* Search Card */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Certificate Lookup</CardTitle>
              <CardDescription>
                Enter the unique certificate ID provided by the certificate holder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., EDU-2025-001"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={handleVerify} 
                  disabled={isLoading}
                  className="gradient-hero text-primary-foreground shadow-glow-primary"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className={`shadow-lg transition-all duration-300 ${
              result.found && result.certificate 
                ? getStatusConfig(result.certificate.status).bgColor + " " + getStatusConfig(result.certificate.status).borderColor
                : "bg-muted/50"
            }`}>
              <CardContent className="pt-6">
                {result.found && result.certificate ? (
                  <div className="space-y-6">
                    {/* Status Banner */}
                    {(() => {
                      const config = getStatusConfig(result.certificate.status);
                      const StatusIcon = config.icon;
                      return (
                        <div className={`flex items-center gap-3 p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                          <StatusIcon className={`w-8 h-8 ${config.color}`} />
                          <div>
                            <Badge variant={config.variant} className="mb-1">
                              {config.label}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {result.certificate.status === "verified" 
                                ? "This certificate has been verified by EduProof"
                                : result.certificate.status === "failed"
                                ? "This certificate could not be verified"
                                : "This certificate is awaiting verification"
                              }
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Certificate Details */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Certificate Title</p>
                          <p className="font-semibold text-foreground">{result.certificate.title}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Issuing Organization</p>
                          <p className="font-semibold text-foreground">{result.certificate.issuer}</p>
                        </div>
                      </div>

                      {result.certificate.issueDate && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Issue Date</p>
                            <p className="font-semibold text-foreground">
                              {new Date(result.certificate.issueDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Certificate ID: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{result.certificate.id}</code>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Certificate Not Found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      No certificate exists with this ID. Please check the ID and try again.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              EduProof uses AI-powered verification to validate educational credentials.
              <br />
              If you have questions, visit our{" "}
              <a href="/support" className="text-primary hover:underline">Support</a> page.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageInbox } from "@/components/messaging/MessageInbox";
import { toast } from "sonner";
import { safeFormatDate } from "@/lib/utils";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  ShieldCheck,
  Calendar,
  Save,
  Loader2,
  CheckCircle,
  Award,
} from "lucide-react";

export function RecruiterProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [stats, setStats] = useState({
    verifiedCertsViewed: 0,
    messagesCount: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Fetch profile from supabase
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || user?.user_metadata?.full_name || "");
      } else {
        setFullName(user?.user_metadata?.full_name || user?.email?.split("@")[0] || "");
      }

      // Fetch metadata or local storage for company/designation
      const meta = user?.user_metadata || {};
      setCompany(meta.company || "EduProof Talent Partner");
      setDesignation(meta.designation || "Technical Recruiter");

      // Fetch count of total verified certificates & messages
      const [certsRes, msgsRes] = await Promise.all([
        supabase.from("certificates").select("id", { count: "exact" }).eq("verification_status", "verified"),
        supabase.from("messages").select("id", { count: "exact" }).eq("sender_id", user?.id),
      ]);

      setStats({
        verifiedCertsViewed: certsRes.count || 0,
        messagesCount: msgsRes.count || 0,
      });

    } catch (err) {
      console.error("Error fetching recruiter profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);

      // 1. Update Supabase profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Error updating profile:", profileError);
        toast.error("Failed to update profile name");
        return;
      }

      // 2. Update Auth Metadata for company and designation
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          company: company.trim(),
          designation: designation.trim(),
        },
      });

      toast.success("Recruiter profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("An unexpected error occurred while saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initialLetter = (fullName || user?.email || "R")[0].toUpperCase();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center text-primary-foreground font-display text-3xl font-bold flex-shrink-0 shadow-medium">
            {initialLetter}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {fullName || "Recruiter Profile"}
              </h1>
              <Badge className="bg-success/10 text-success border-success/20">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Recruiter
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              {user?.email}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Member since {safeFormatDate(user?.created_at || new Date().toISOString())}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-soft">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.verifiedCertsViewed}</p>
              <p className="text-xs text-muted-foreground">Available Verified Credentials</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-soft">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.messagesCount}</p>
              <p className="text-xs text-muted-foreground">Direct Messages Sent</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-soft sm:col-span-2 md:col-span-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Talent Access</p>
              <p className="text-xs text-muted-foreground">Full Candidate Inspection Unlocked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Form */}
      <Card className="border-border/50 shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal & Organization Information
          </CardTitle>
          <CardDescription>
            Update your public recruiter details visible when messaging candidates or inspecting verified profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="h-11 bg-muted/50 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Company / Organization
                </Label>
                <Input
                  id="company"
                  placeholder="e.g. Acme Tech Solutions"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation" className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  Title / Position
                </Label>
                <Input
                  id="designation"
                  placeholder="e.g. Senior Talent Acquisition Specialist"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving} className="h-11 px-6 gap-2">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Managed Candidate Conversations */}
      <div className="mt-8">
        <MessageInbox canMessageRoles={["candidate"]} />
      </div>
    </div>
  );
}

export default RecruiterProfile;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: "looking_for_internship", label: "Looking for Internship" },
  { value: "looking_for_fulltime", label: "Looking for Full-Time Role" },
  { value: "open_to_both", label: "Open to Both" },
] as const;

export function getRolePreferenceLabel(value: string | null) {
  return ROLE_OPTIONS.find(o => o.value === value)?.label || null;
}

export function RolePreferenceBadge({ preference }: { preference: string | null }) {
  const label = getRolePreferenceLabel(preference);
  if (!label) return null;

  const colorClass =
    preference === "looking_for_internship"
      ? "bg-accent/10 text-accent border-accent/20"
      : preference === "looking_for_fulltime"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-success/10 text-success border-success/20";

  return (
    <Badge className={colorClass}>
      <Briefcase className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

export function RolePreferenceSelector() {
  const { user } = useAuth();
  const [preference, setPreference] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("role_preference")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.role_preference) setPreference(data.role_preference);
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user || !preference) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role_preference: preference } as Record<string, unknown>)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update preference");
    } else {
      toast.success("Role preference updated!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading preference...
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
      <h3 className="font-display text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-primary" />
        Role Preference
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Let recruiters know what you're looking for.
      </p>
      <div className="flex gap-3 items-center">
        <Select value={preference} onValueChange={setPreference}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSave} disabled={saving || !preference} size="sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
          Save
        </Button>
      </div>
      {preference && (
        <div className="mt-3">
          <RolePreferenceBadge preference={preference} />
        </div>
      )}
    </div>
  );
}

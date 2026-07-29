import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface FlagRow {
  id: string;
  user_id: string;
  reason: string;
  flag_type: string;
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
  user_name: string | null;
  user_role: string;
}

const AdminFlaggedReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchFlags = async () => {
    setLoading(true);
    const { data: flagData } = await supabase.from("account_flags").select("*").order("created_at", { ascending: false });
    if (!flagData?.length) { setFlags([]); setLoading(false); return; }

    const userIds = [...new Set(flagData.map(f => f.user_id))];
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
      supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
    ]);

    const nameMap: Record<string, string> = {};
    (profilesRes.data || []).forEach(p => { nameMap[p.user_id] = p.full_name || "Unknown"; });
    const roleMap: Record<string, string> = {};
    (rolesRes.data || []).forEach(r => { roleMap[r.user_id] = r.role; });

    setFlags(flagData.map(f => ({
      ...f,
      user_name: nameMap[f.user_id] || "Unknown",
      user_role: roleMap[f.user_id] || "unknown",
    })));
    setLoading(false);
  };

  useEffect(() => { fetchFlags(); }, []);

  const resolveFlag = async (flagId: string) => {
    setActing(flagId);
    await supabase.from("account_flags").update({ resolved: true, resolved_at: new Date().toISOString(), resolved_by: user?.id }).eq("id", flagId);
    toast({ title: "Flag resolved" });
    fetchFlags();
    setActing(null);
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case "candidate": return <Badge variant="outline">Candidate</Badge>;
      case "recruiter": return <Badge variant="secondary">Recruiter</Badge>;
      case "institution": return <Badge className="bg-primary/10 text-primary border-primary/20">Institution</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const activeFlags = flags.filter(f => !f.resolved);
  const resolvedFlags = flags.filter(f => f.resolved);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Active Flags ({activeFlags.length})</CardTitle></CardHeader>
        <CardContent>
          {activeFlags.length === 0 ? <p className="text-sm text-muted-foreground">No active flags</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeFlags.map(f => (
                  <TableRow key={f.id} className="bg-destructive/5">
                    <TableCell className="font-medium">{f.user_name}</TableCell>
                    <TableCell>{roleBadge(f.user_role)}</TableCell>
                    <TableCell className="max-w-xs truncate">{f.reason}</TableCell>
                    <TableCell>{new Date(f.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => resolveFlag(f.id)} disabled={acting === f.id}>
                        {acting === f.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-emerald-500" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {resolvedFlags.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Resolved ({resolvedFlags.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead>Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedFlags.map(f => (
                  <TableRow key={f.id} className="opacity-60">
                    <TableCell className="font-medium">{f.user_name}</TableCell>
                    <TableCell>{roleBadge(f.user_role)}</TableCell>
                    <TableCell className="max-w-xs truncate">{f.reason}</TableCell>
                    <TableCell>{new Date(f.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{f.resolved_at ? new Date(f.resolved_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminFlaggedReports;

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Loader2, Search, Flag, Eye, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface InstitutionRow {
  user_id: string;
  full_name: string | null;
  created_at: string;
  cert_count: number;
  is_flagged: boolean;
}

const AdminInstitutions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const [viewUser, setViewUser] = useState<InstitutionRow | null>(null);
  const [viewCerts, setViewCerts] = useState<{ certificate_id: string; student_name: string; course_name: string; issue_date: string }[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [editUser, setEditUser] = useState<InstitutionRow | null>(null);
  const [editName, setEditName] = useState("");
  const [flagUser, setFlagUser] = useState<InstitutionRow | null>(null);
  const [flagReason, setFlagReason] = useState("");

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "institution");
      if (!roles?.length) { setInstitutions([]); setLoading(false); return; }

      const ids = roles.map(r => r.user_id);

      const [profilesRes, certsRes, flagsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, created_at").in("user_id", ids),
        supabase.from("issued_certificates").select("institution_id").in("institution_id", ids),
        supabase.from("account_flags").select("user_id").eq("resolved", false).in("user_id", ids),
      ]);

      const certMap: Record<string, number> = {};
      (certsRes.data || []).forEach(c => {
        certMap[c.institution_id] = (certMap[c.institution_id] || 0) + 1;
      });

      const flaggedIds = new Set((flagsRes.data || []).map(f => f.user_id));

      const merged: InstitutionRow[] = (profilesRes.data || []).map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        created_at: p.created_at,
        cert_count: certMap[p.user_id] || 0,
        is_flagged: flaggedIds.has(p.user_id),
      }));

      setInstitutions(merged);
    } catch (err) {
      console.error("Error fetching institutions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInstitutions(); }, []);

  const handleView = async (inst: InstitutionRow) => {
    setViewUser(inst);
    setViewLoading(true);
    try {
      const { data } = await supabase
        .from("issued_certificates")
        .select("certificate_id, student_name, course_name, issue_date")
        .eq("institution_id", inst.user_id)
        .order("issued_at", { ascending: false });

      setViewCerts(data || []);
    } catch (err) {
      console.error("Error loading view certs:", err);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this institution and all their data?")) return;
    setActing(userId);
    try {
      await Promise.all([
        supabase.from("issued_certificates").delete().eq("institution_id", userId),
        supabase.from("account_flags").delete().eq("user_id", userId),
        supabase.from("user_roles").delete().eq("user_id", userId),
        supabase.from("profiles").delete().eq("user_id", userId),
      ]);

      toast({ title: "Institution deleted" });
      fetchInstitutions();
    } catch (err) {
      toast({ title: "Error deleting institution", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setActing(editUser.user_id);
    try {
      await supabase.from("profiles").update({ full_name: editName }).eq("user_id", editUser.user_id);
      toast({ title: "Institution updated" });
      setEditUser(null);
      fetchInstitutions();
    } catch (err) {
      toast({ title: "Error updating institution", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const handleFlag = async () => {
    if (!flagUser || !flagReason.trim() || !user) return;
    setActing(flagUser.user_id);
    try {
      await supabase.from("account_flags").insert({
        user_id: flagUser.user_id,
        flagged_by: user.id,
        reason: flagReason.trim(),
        flag_type: "suspicious",
      });
      toast({ title: "Institution flagged" });
      setFlagUser(null);
      setFlagReason("");
      fetchInstitutions();
    } catch (err) {
      toast({ title: "Error flagging account", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const filtered = institutions.filter(i => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (i.full_name || "").toLowerCase().includes(q) || i.user_id.toLowerCase().includes(q);
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Institutions ({institutions.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search institutions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Certs Issued</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(i => (
                <TableRow key={i.user_id} className={i.is_flagged ? "bg-destructive/5" : ""}>
                  <TableCell className="font-mono text-xs">{i.user_id.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{i.full_name || "—"}</TableCell>
                  <TableCell>{i.cert_count}</TableCell>
                  <TableCell>{new Date(i.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{i.is_flagged ? <Badge variant="destructive">Flagged</Badge> : <Badge variant="outline">Clean</Badge>}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleView(i)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditUser(i); setEditName(i.full_name || ""); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setFlagUser(i); setFlagReason(""); }}><Flag className="h-4 w-4 text-orange-500" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(i.user_id)} disabled={acting === i.user_id}>
                      {acting === i.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{viewUser?.full_name || "Institution"} — Issued Certificates</DialogTitle></DialogHeader>
          {viewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : viewCerts.length === 0 ? <p className="text-sm text-muted-foreground">No certificates issued</p> : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {viewCerts.map(c => (
                <div key={c.certificate_id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div>
                    <p className="font-medium">{c.course_name}</p>
                    <p className="text-xs text-muted-foreground">{c.student_name} · {new Date(c.issue_date).toLocaleDateString()}</p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{c.certificate_id.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Institution</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Institution Name</Label>
            <Input value={editName} onChange={e => setEditName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={!!flagUser} onOpenChange={() => setFlagUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Flag: {flagUser?.full_name || "Unknown"}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder="Describe why..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleFlag} disabled={!flagReason.trim()}>Flag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminInstitutions;

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
import { safeFormatDate } from "@/lib/utils";

interface RecruiterRow {
  user_id: string;
  full_name: string | null;
  created_at: string;
  verification_count: number;
  is_flagged: boolean;
}

const AdminRecruiters = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recruiters, setRecruiters] = useState<RecruiterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const [viewUser, setViewUser] = useState<RecruiterRow | null>(null);
  const [editUser, setEditUser] = useState<RecruiterRow | null>(null);
  const [editName, setEditName] = useState("");
  const [flagUser, setFlagUser] = useState<RecruiterRow | null>(null);
  const [flagReason, setFlagReason] = useState("");

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "recruiter");
      if (!roles?.length) { setRecruiters([]); setLoading(false); return; }

      const ids = roles.map(r => r.user_id);

      const [profilesRes, logsRes, flagsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, created_at").in("user_id", ids),
        supabase.from("verification_logs").select("recruiter_id").in("recruiter_id", ids),
        supabase.from("account_flags").select("user_id").eq("resolved", false).in("user_id", ids),
      ]);

      const logMap: Record<string, number> = {};
      (logsRes.data || []).forEach(l => {
        logMap[l.recruiter_id] = (logMap[l.recruiter_id] || 0) + 1;
      });

      const flaggedIds = new Set((flagsRes.data || []).map(f => f.user_id));

      const merged: RecruiterRow[] = (profilesRes.data || []).map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        created_at: p.created_at,
        verification_count: logMap[p.user_id] || 0,
        is_flagged: flaggedIds.has(p.user_id),
      }));

      setRecruiters(merged);
    } catch (err) {
      console.error("Error fetching recruiters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecruiters(); }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this recruiter and all their data?")) return;
    setActing(userId);
    try {
      await Promise.all([
        supabase.from("verification_logs").delete().eq("recruiter_id", userId),
        supabase.from("account_flags").delete().eq("user_id", userId),
        supabase.from("user_roles").delete().eq("user_id", userId),
        supabase.from("profiles").delete().eq("user_id", userId),
      ]);

      toast({ title: "Recruiter deleted" });
      fetchRecruiters();
    } catch (err) {
      toast({ title: "Error deleting recruiter", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setActing(editUser.user_id);
    try {
      await supabase.from("profiles").update({ full_name: editName }).eq("user_id", editUser.user_id);
      toast({ title: "Recruiter updated" });
      setEditUser(null);
      fetchRecruiters();
    } catch (err) {
      toast({ title: "Error updating recruiter", variant: "destructive" });
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
      toast({ title: "Account flagged" });
      setFlagUser(null);
      setFlagReason("");
      fetchRecruiters();
    } catch (err) {
      toast({ title: "Error flagging account", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const filtered = recruiters.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (r.full_name || "").toLowerCase().includes(q) || (r.user_id || "").toLowerCase().includes(q);
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recruiters ({recruiters.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search recruiters..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Verifications</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.user_id || `rec_${Math.random()}`} className={r.is_flagged ? "bg-destructive/5" : ""}>
                  <TableCell className="font-mono text-xs">{(r.user_id || "—").slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{r.full_name || "—"}</TableCell>
                  <TableCell>{r.verification_count}</TableCell>
                  <TableCell>{safeFormatDate(r.created_at)}</TableCell>
                  <TableCell>{r.is_flagged ? <Badge variant="destructive">Flagged</Badge> : <Badge variant="outline">Clean</Badge>}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setViewUser(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditUser(r); setEditName(r.full_name || ""); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setFlagUser(r); setFlagReason(""); }}><Flag className="h-4 w-4 text-orange-500" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.user_id)} disabled={acting === r.user_id}>
                      {acting === r.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
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
        <DialogContent>
          <DialogHeader><DialogTitle>Recruiter Profile</DialogTitle></DialogHeader>
          {viewUser && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{viewUser.full_name || "—"}</span></div>
              <div><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{(viewUser.user_id || "—").slice(0, 12)}</span></div>
              <div><span className="text-muted-foreground">Verifications:</span> {viewUser.verification_count}</div>
              <div><span className="text-muted-foreground">Joined:</span> {safeFormatDate(viewUser.created_at)}</div>
              <div><span className="text-muted-foreground">Status:</span> {viewUser.is_flagged ? "Flagged" : "Clean"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Recruiter</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Full Name</Label>
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

export default AdminRecruiters;

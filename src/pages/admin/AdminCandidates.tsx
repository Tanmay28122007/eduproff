import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Loader2, Search, Flag, Eye, Pencil, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { safeFormatDate } from "@/lib/utils";

interface CandidateRow {
  user_id: string;
  full_name: string | null;
  role_preference: string | null;
  created_at: string;
  cert_count: number;
  verified_count: number;
  is_flagged: boolean;
}

interface CertEntry {
  id: string;
  title: string;
  issuer: string;
  verification_status: string;
  created_at: string;
}

const AdminCandidates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  // View profile dialog
  const [viewUser, setViewUser] = useState<CandidateRow | null>(null);
  const [viewCerts, setViewCerts] = useState<CertEntry[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit dialog
  const [editUser, setEditUser] = useState<CandidateRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editPref, setEditPref] = useState("");

  // Flag dialog
  const [flagUser, setFlagUser] = useState<CandidateRow | null>(null);
  const [flagReason, setFlagReason] = useState("");

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "candidate");
      if (!roles?.length) { setCandidates([]); setLoading(false); return; }

      const ids = roles.map(r => r.user_id);
      const [profilesRes, certsRes, flagsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, role_preference, created_at").in("user_id", ids),
        supabase.from("certificates").select("user_id, verification_status").in("user_id", ids),
        supabase.from("account_flags").select("user_id").eq("resolved", false).in("user_id", ids),
      ]);

      const certMap: Record<string, { total: number; verified: number }> = {};
      (certsRes.data || []).forEach(c => {
        if (!certMap[c.user_id]) certMap[c.user_id] = { total: 0, verified: 0 };
        certMap[c.user_id].total++;
        if (c.verification_status === "verified") certMap[c.user_id].verified++;
      });

      const flaggedIds = new Set((flagsRes.data || []).map(f => f.user_id));

      const merged = (profilesRes.data || []).map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        role_preference: p.role_preference,
        created_at: p.created_at,
        cert_count: certMap[p.user_id]?.total || 0,
        verified_count: certMap[p.user_id]?.verified || 0,
        is_flagged: flaggedIds.has(p.user_id),
      }));

      setCandidates(merged);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidates(); }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this candidate and all their data?")) return;
    setActing(userId);
    try {
      await Promise.all([
        supabase.from("certificates").delete().eq("user_id", userId),
        supabase.from("account_flags").delete().eq("user_id", userId),
        supabase.from("user_roles").delete().eq("user_id", userId),
        supabase.from("profiles").delete().eq("user_id", userId),
      ]);
      toast({ title: "Candidate deleted" });
      fetchCandidates();
    } catch (err) {
      toast({ title: "Error deleting candidate", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const handleViewProfile = async (c: CandidateRow) => {
    setViewUser(c);
    setViewLoading(true);
    try {
      const { data } = await supabase
        .from("certificates")
        .select("id, title, issuer, verification_status, created_at")
        .eq("user_id", c.user_id)
        .order("created_at", { ascending: false });

      setViewCerts(data || []);
    } catch (err) {
      console.error("Error fetching candidate certs:", err);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (c: CandidateRow) => {
    setEditUser(c);
    setEditName(c.full_name || "");
    setEditPref(c.role_preference || "");
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setActing(editUser.user_id);
    try {
      await supabase.from("profiles").update({ full_name: editName, role_preference: editPref || null }).eq("user_id", editUser.user_id);
      toast({ title: "Profile updated" });
      setEditUser(null);
      fetchCandidates();
    } catch (err) {
      toast({ title: "Error updating profile", variant: "destructive" });
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
      fetchCandidates();
    } catch (err) {
      toast({ title: "Error flagging account", variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const prefLabel = (p: string | null) => {
    switch (p) {
      case "looking_for_internship": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Internship</Badge>;
      case "looking_for_fulltime": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Full-Time</Badge>;
      case "open_to_both": return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Both</Badge>;
      default: return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  const filtered = candidates.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.full_name || "").toLowerCase().includes(q) || (c.user_id || "").toLowerCase().includes(q);
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Candidates ({candidates.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Preference</TableHead>
                <TableHead>Certs</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.user_id || `cand_${Math.random()}`} className={c.is_flagged ? "bg-destructive/5" : ""}>
                  <TableCell className="font-mono text-xs">{(c.user_id || "—").slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                  <TableCell>{prefLabel(c.role_preference)}</TableCell>
                  <TableCell>{c.verified_count}/{c.cert_count}</TableCell>
                  <TableCell>{safeFormatDate(c.created_at)}</TableCell>
                  <TableCell>{c.is_flagged ? <Badge variant="destructive">Flagged</Badge> : <Badge variant="outline">Clean</Badge>}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewProfile(c)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setFlagUser(c); setFlagReason(""); }}><Flag className="h-4 w-4 text-orange-500" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.user_id)} disabled={acting === c.user_id}>
                      {acting === c.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Profile Dialog */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Candidate Profile</DialogTitle></DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{viewUser.full_name || "—"}</span></div>
                <div><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{viewUser.user_id.slice(0, 12)}</span></div>
                <div><span className="text-muted-foreground">Preference:</span> {prefLabel(viewUser.role_preference)}</div>
                <div><span className="text-muted-foreground">Joined:</span> {safeFormatDate(viewUser.created_at)}</div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Award className="w-4 h-4" /> Certificates ({viewCerts.length})</h4>
                {viewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : viewCerts.length === 0 ? <p className="text-sm text-muted-foreground">No certificates</p> : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {viewCerts.map(cert => (
                      <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                        <div>
                          <p className="font-medium">{cert.title}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                        </div>
                        <Badge variant={cert.verification_status === "verified" ? "default" : cert.verification_status === "invalid" ? "destructive" : "secondary"}>
                          {cert.verification_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Candidate</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Role Preference</Label>
              <select value={editPref} onChange={e => setEditPref(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Not Set</option>
                <option value="looking_for_internship">Internship</option>
                <option value="looking_for_fulltime">Full-Time</option>
                <option value="open_to_both">Open to Both</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={acting === editUser?.user_id}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={!!flagUser} onOpenChange={() => setFlagUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Flag Account: {flagUser?.full_name || "Unknown"}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason for flagging</Label>
            <Textarea value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder="Describe why this account is suspicious..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleFlag} disabled={!flagReason.trim()}>Flag Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminCandidates;

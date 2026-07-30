import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeFormatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UserRow {
  user_id: string;
  full_name: string | null;
  created_at: string;
  role: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      const roleMap: Record<string, string> = {};
      (rolesRes.data || []).forEach((r) => {
        roleMap[r.user_id] = r.role;
      });

      const merged: UserRow[] = (profilesRes.data || []).map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        created_at: p.created_at,
        role: roleMap[p.user_id] || "unknown",
      }));

      setUsers(merged);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user's data?")) return;
    setDeleting(userId);
    try {
      await Promise.all([
        supabase.from("certificates").delete().eq("user_id", userId),
        supabase.from("account_flags").delete().eq("user_id", userId),
        supabase.from("user_roles").delete().eq("user_id", userId),
        supabase.from("profiles").delete().eq("user_id", userId),
      ]);

      toast({ title: "User data deleted" });
      fetchUsers();
    } catch (err) {
      toast({ title: "Error deleting user", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "institution": return "default";
      case "recruiter": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                </TableCell>
                <TableCell>{safeFormatDate(u.created_at)}</TableCell>
                <TableCell className="text-right">
                  {u.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(u.user_id)}
                      disabled={deleting === u.user_id}
                    >
                      {deleting === u.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Search, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { safeFormatDateTime } from "@/lib/utils";

interface UserEntry {
  user_id: string;
  full_name: string | null;
  role: string;
}

interface MessageEntry {
  id: string;
  content: string;
  receiver_id: string;
  created_at: string;
  receiver_name: string | null;
}

const AdminMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sentMessages, setSentMessages] = useState<MessageEntry[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchSentMessages();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      const roleMap: Record<string, string> = {};
      (rolesRes.data || []).forEach(r => {
        roleMap[r.user_id] = r.role;
      });

      const merged: UserEntry[] = [];
      (profilesRes.data || []).forEach(p => {
        if (roleMap[p.user_id] !== "admin") {
          merged.push({
            user_id: p.user_id,
            full_name: p.full_name,
            role: roleMap[p.user_id] || "unknown",
          });
        }
      });

      setUsers(merged);
    } catch (err) {
      console.error("Error fetching users for admin messaging:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSentMessages = async () => {
    if (!user) return;
    try {
      const { data: msgsData } = await supabase
        .from("messages")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!msgsData?.length) {
        setSentMessages([]);
        return;
      }

      const receiverIds = [...new Set(msgsData.map(m => m.receiver_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", receiverIds);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach(p => {
        nameMap[p.user_id] = p.full_name || "Unknown";
      });

      setSentMessages(
        msgsData.map(m => ({
          ...m,
          receiver_name: nameMap[m.receiver_id] || "Unknown"
        }))
      );
    } catch (err) {
      console.error("Error fetching sent messages:", err);
    }
  };

  const handleSend = async () => {
    if (!selectedUser || !message.trim() || !user) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedUser,
        content: message.trim(),
        read: false,
      });

      if (error) {
        toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Message sent" });
        setMessage("");
        fetchSentMessages();
      }
    } catch (err) {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (u.full_name || "").toLowerCase().includes(q) || u.user_id.toLowerCase().includes(q);
    }
    return true;
  });

  const roleBadge = (role: string) => {
    switch (role) {
      case "candidate": return <Badge variant="outline" className="text-xs">Candidate</Badge>;
      case "recruiter": return <Badge variant="secondary" className="text-xs">Recruiter</Badge>;
      case "institution": return <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Institution</Badge>;
      default: return <Badge variant="outline" className="text-xs">{role}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Compose */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Message</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="candidate">Candidates</SelectItem>
                <SelectItem value="recruiter">Recruiters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
            {loadingUsers ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : filteredUsers.length === 0 ? <p className="text-sm text-muted-foreground text-center py-2">No users found</p> : (
              filteredUsers.map(u => (
                <button
                  key={u.user_id}
                  onClick={() => setSelectedUser(u.user_id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors ${selectedUser === u.user_id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"}`}
                >
                  <span className="font-medium truncate">{u.full_name || "Unnamed"}</span>
                  {roleBadge(u.role)}
                </button>
              ))
            )}
          </div>

          {selectedUser && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">To: {users.find(u => u.user_id === selectedUser)?.full_name || "Unknown"}</p>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message..." rows={3} />
              <Button onClick={handleSend} disabled={sending || !message.trim()} className="w-full">
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                Send
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Messages */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Sent Messages</CardTitle></CardHeader>
        <CardContent>
          {sentMessages.length === 0 ? <p className="text-sm text-muted-foreground">No messages sent yet</p> : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {sentMessages.map(m => (
                <div key={m.id} className="p-3 rounded-lg border text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">To: {m.receiver_name}</span>
                    <span className="text-xs text-muted-foreground">{safeFormatDateTime(m.created_at, undefined, 'N/A')}</span>
                  </div>
                  <p className="text-muted-foreground">{m.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessaging;

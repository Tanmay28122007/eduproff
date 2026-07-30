import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, User, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  role?: string;
}

interface MessageInboxProps {
  canMessageRoles?: string[];
}

export function MessageInbox({ canMessageRoles }: MessageInboxProps) {
  const { user } = useAuth();
  const { messages, loading: loadingMessages, sendMessage, markAsRead } = useMessages();
  const [conversations, setConversations] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch users that can be messaged or have sent messages
  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user, messages]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      // Find all unique user IDs from messages
      const partnerIds = new Set<string>();
      messages.forEach(m => {
        if (m.sender_id === user.id) partnerIds.add(m.receiver_id);
        if (m.receiver_id === user.id) partnerIds.add(m.sender_id);
      });

      // If canMessageRoles specified, fetch users with those roles
      if (canMessageRoles && canMessageRoles.length > 0) {
        const { data: roleUsers } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("role", canMessageRoles as any);

        if (roleUsers) {
          roleUsers.forEach(r => {
            if (r.user_id !== user.id) partnerIds.add(r.user_id);
          });
        }
      }

      if (partnerIds.size === 0) {
        setConversations([]);
        setLoadingUsers(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", Array.from(partnerIds));

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", Array.from(partnerIds));

      const roleMap: Record<string, string> = {};
      (roles || []).forEach(r => { roleMap[r.user_id] = r.role; });

      const usersList: UserProfile[] = (profiles || []).map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        role: roleMap[p.user_id] || "user",
      }));

      setConversations(usersList);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const currentChat = selectedUser
    ? messages.filter(
        m =>
          (m.sender_id === user?.id && m.receiver_id === selectedUser.user_id) ||
          (m.sender_id === selectedUser.user_id && m.receiver_id === user?.id)
      )
    : [];

  const handleSelectUser = (u: UserProfile) => {
    setSelectedUser(u);
    // Mark unread messages from this user as read
    messages
      .filter(m => m.sender_id === u.user_id && !m.read)
      .forEach(m => markAsRead(m.id));
  };

  const handleSend = async () => {
    if (!selectedUser || !replyText.trim()) return;
    setSending(true);
    const { error } = await sendMessage(selectedUser.user_id, replyText.trim());
    setSending(false);
    if (error) {
      toast.error(error);
    } else {
      setReplyText("");
    }
  };

  const getUnreadCount = (partnerId: string) => {
    return messages.filter(m => m.sender_id === partnerId && m.receiver_id === user?.id && !m.read).length;
  };

  const roleBadge = (role?: string) => {
    switch (role) {
      case "candidate": return <Badge variant="outline" className="text-xs">Candidate</Badge>;
      case "recruiter": return <Badge variant="secondary" className="text-xs">Recruiter</Badge>;
      case "institution": return <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Institution</Badge>;
      case "admin": return <Badge variant="destructive" className="text-xs">Admin</Badge>;
      default: return null;
    }
  };

  if (loadingMessages || loadingUsers) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 shadow-soft overflow-hidden">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <CardTitle className="font-display text-lg font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Messages
          </span>
          {selectedUser && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to list
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!selectedUser ? (
          /* Conversation List */
          <div className="divide-y max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              conversations.map(u => {
                const unread = getUnreadCount(u.user_id);
                const lastMsg = messages.find(
                  m =>
                    (m.sender_id === user?.id && m.receiver_id === u.user_id) ||
                    (m.sender_id === u.user_id && m.receiver_id === user?.id)
                );

                return (
                  <button
                    key={u.user_id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground truncate">
                            {u.full_name || "Unnamed User"}
                          </span>
                          {roleBadge(u.role)}
                        </div>
                        {lastMsg && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {lastMsg.sender_id === user?.id ? "You: " : ""}{lastMsg.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs ml-2">
                        {unread}
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          /* Chat Window */
          <div className="flex flex-col h-96">
            {/* Chat header */}
            <div className="p-3 px-4 border-b bg-muted/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{selectedUser.full_name || "Unnamed User"}</p>
                {roleBadge(selectedUser.role)}
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {currentChat.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">
                  Start the conversation with {selectedUser.full_name || "this user"}
                </p>
              ) : (
                currentChat.map(m => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p>{m.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {(() => {
                            if (!m.created_at) return '';
                            try {
                              const d = new Date(m.created_at);
                              return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            } catch {
                              return '';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t flex gap-2">
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type a message..."
                rows={1}
                className="min-h-[40px] resize-none"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button onClick={handleSend} disabled={sending || !replyText.trim()} size="icon" className="shrink-0">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

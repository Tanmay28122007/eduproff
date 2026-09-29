import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages, Message } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Send, 
  User, 
  Loader2, 
  ArrowLeft, 
  Download, 
  Trash2, 
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCheck,
  Search
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  role?: string;
  last_message?: string;
  last_time?: string;
  unread_count?: number;
}

interface MessageInboxProps {
  canMessageRoles?: string[];
  initialUserId?: string;
}

export function MessageInbox({ canMessageRoles, initialUserId }: MessageInboxProps) {
  const { user, role: userRole } = useAuth();
  const { 
    conversations: hookConversations, 
    messages: currentThread, 
    loading: loadingHook, 
    fetchThread, 
    sendMessage, 
    endChat 
  } = useMessages();

  const [contactList, setContactList] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [endChatDialogOpen, setEndChatDialogOpen] = useState(false);
  const [isEndingChat, setIsEndingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRecruiter = userRole === "recruiter" || (user && localStorage.getItem(`eduproof_cached_role_${user.id}`) === "recruiter");

  // Sync contacts from hook conversations or discover available contacts for recruiters
  useEffect(() => {
    if (!user) return;
    loadContacts();
  }, [user, loadContacts]);

  // When selectedUser changes, load their thread
  useEffect(() => {
    if (selectedUser) {
      fetchThread(selectedUser.user_id);
    }
  }, [selectedUser, fetchThread]);

  // Scroll to bottom when thread updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentThread]);

  const loadContacts = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingContacts(true);
      const contactsMap = new Map<string, UserProfile>();

      // 1. Add all users from active conversations
      hookConversations.forEach((c) => {
        contactsMap.set(c.user_id, {
          user_id: c.user_id,
          full_name: c.full_name,
          role: c.role || "user",
          last_message: c.last_message,
          last_time: c.last_time,
          unread_count: c.unread_count,
        });
      });

      // 2. If an initialUserId was provided, ensure it's in the list and selected
      if (initialUserId && !contactsMap.has(initialUserId)) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .eq("user_id", initialUserId)
          .maybeSingle();

        const newContact: UserProfile = {
          user_id: initialUserId,
          full_name: prof?.full_name || "Candidate",
          role: "candidate",
        };
        contactsMap.set(initialUserId, newContact);
        setSelectedUser(newContact);
      } else if (initialUserId && contactsMap.has(initialUserId) && !selectedUser) {
        setSelectedUser(contactsMap.get(initialUserId)!);
      }

      // 3. If recruiter, optionally allow finding candidates to message
      if (isRecruiter && canMessageRoles?.includes("candidate")) {
        const { data: candidates } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .eq("role", "candidate")
          .limit(20);

        if (candidates && candidates.length > 0) {
          const candidateIds = candidates.map(c => c.user_id).filter(id => !contactsMap.has(id));
          if (candidateIds.length > 0) {
            const { data: profs } = await supabase
              .from("profiles")
              .select("user_id, full_name")
              .in("user_id", candidateIds);

            (profs || []).forEach(p => {
              if (p.user_id !== user.id) {
                contactsMap.set(p.user_id, {
                  user_id: p.user_id,
                  full_name: p.full_name || "Candidate",
                  role: "candidate",
                });
              }
            });
          }
        }
      }

      setContactList(Array.from(contactsMap.values()));
    } catch (err) {
      console.error("Error loading contacts:", err);
    } finally {
      setLoadingContacts(false);
    }
  }, [user, hookConversations, initialUserId, isRecruiter, canMessageRoles, selectedUser]);

  const handleSend = async () => {
    if (!selectedUser || !replyText.trim() || sending) return;

    try {
      setSending(true);
      const text = replyText.trim();
      const { error } = await sendMessage(selectedUser.user_id, text);
      if (error) {
        toast.error("Failed to send message: " + error);
      } else {
        setReplyText("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleExportDoc = (partner: UserProfile) => {
    if (!currentThread || currentThread.length === 0) {
      toast.error("No messages to export in this conversation.");
      return;
    }

    const title = `EduProof Official Communication Transcript`;
    const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: "full" });
    const timeStr = new Date().toLocaleTimeString();
    const myName = user?.user_metadata?.full_name || user?.email || "User";
    const partnerName = partner.full_name || "Participant";

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; margin: 30px; color: #1e293b; line-height: 1.5; font-size: 11pt; }
          h1 { color: #059669; font-size: 18pt; margin-bottom: 4px; border-bottom: 2px solid #059669; padding-bottom: 6px; }
          .subtitle { color: #64748b; font-size: 10pt; margin-bottom: 20px; font-weight: 500; }
          .meta-card { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; }
          .meta-item { margin-bottom: 5px; font-size: 10pt; }
          .meta-label { font-weight: bold; color: #334155; }
          .thread-box { margin-top: 20px; }
          .msg-item { margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; }
          .msg-me { background-color: #ecfdf5; border-left: 4px solid #10b981; margin-left: 30px; }
          .msg-them { background-color: #f1f5f9; border-left: 4px solid #64748b; margin-right: 30px; }
          .sender-name { font-weight: bold; font-size: 10.5pt; color: #0f172a; }
          .timestamp { font-size: 8.5pt; color: #94a3b8; font-weight: normal; margin-left: 10px; }
          .content-body { margin-top: 6px; font-size: 10.5pt; white-space: pre-wrap; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 9pt; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <h1>EduProof Verified Communication Record</h1>
        <div class="subtitle">Official Verification &amp; Recruitment Dialogue Transcript</div>
        
        <div class="meta-card">
          <div class="meta-item"><span class="meta-label">Participants:</span> ${myName} &amp; ${partnerName} (${partner.role || "Contact"})</div>
          <div class="meta-item"><span class="meta-label">Export Timestamp:</span> ${dateStr} at ${timeStr}</div>
          <div class="meta-item"><span class="meta-label">Message Count:</span> ${currentThread.length} messages</div>
          <div class="meta-item"><span class="meta-label">Security Status:</span> Authenticated by EduProof Protocol</div>
        </div>

        <div class="thread-box">
          ${currentThread
            .map((m) => {
              const isMe = m.sender_id === user?.id;
              const sender = isMe ? myName : partnerName;
              const time = new Date(m.created_at).toLocaleString();
              return `
                <div class="msg-item ${isMe ? "msg-me" : "msg-them"}">
                  <div>
                    <span class="sender-name">${sender}</span>
                    <span class="timestamp">${time}</span>
                  </div>
                  <div class="content-body">${m.content}</div>
                </div>
              `;
            })
            .join("")}
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} EduProof Platform &bull; Confidential Candidate-Recruiter Communication Document
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([docContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = partnerName.replace(/[^a-zA-Z0-9_-]/g, "_");
    link.href = url;
    link.download = `EduProof_Chat_${safeName}_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Chat exported as Word (.doc) document!");
  };

  const handleConfirmEndChat = async () => {
    if (!selectedUser) return;
    try {
      setIsEndingChat(true);
      const { error } = await endChat(selectedUser.user_id);
      if (error) {
        toast.error("Failed to end chat: " + error);
      } else {
        toast.success(`Chat with ${selectedUser.full_name || "Candidate"} permanently ended.`);
        setSelectedUser(null);
        setEndChatDialogOpen(false);
        loadContacts();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred while ending the chat.");
    } finally {
      setIsEndingChat(false);
    }
  };

  const filteredContacts = contactList.filter((c) =>
    (c.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleBadge = (role?: string) => {
    switch (role) {
      case "candidate":
        return <Badge variant="outline" className="text-[11px] font-medium border-primary/30 text-primary">Candidate</Badge>;
      case "recruiter":
        return <Badge variant="secondary" className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600">Recruiter</Badge>;
      case "admin":
        return <Badge variant="destructive" className="text-[11px]">Admin</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden bg-card">
      <CardHeader className="border-b border-border/80 bg-muted/20 px-6 py-4">
        <CardTitle className="text-base md:text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <span>Messages &amp; Direct Communication</span>
          </div>
          {selectedUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUser(null)}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              All Conversations
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {!selectedUser ? (
          /* CONVERSATIONS DIRECTORY */
          <div className="p-5 space-y-4 min-h-[380px]">
            {contactList.length > 3 && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search participants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-secondary/30 border border-border/70 rounded-xl text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            )}

            {loadingContacts && contactList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs">Loading conversations...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary/60 text-muted-foreground flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 opacity-60" />
                </div>
                <h4 className="text-base font-semibold text-foreground">No messages yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {isRecruiter
                    ? "Reach out to verified candidates directly from the Candidate Directory to start a conversation."
                    : "When a recruiter reviews your verified achievements and contacts you, your messages will appear here."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50 border border-border/60 rounded-xl overflow-hidden bg-card">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.user_id}
                    onClick={() => setSelectedUser(contact)}
                    className="p-4 hover:bg-secondary/40 transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                        {contact.full_name ? contact.full_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">
                            {contact.full_name || "Candidate"}
                          </span>
                          {roleBadge(contact.role)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[280px] sm:max-w-md">
                          {contact.last_message || "Click to start conversation..."}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      {contact.last_time && (
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {new Date(contact.last_time).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      )}
                      {(contact.unread_count || 0) > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                          {contact.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE CHAT THREAD */
          <div className="flex flex-col h-[520px]">
            {/* Thread Header with Actions */}
            <div className="px-5 py-3.5 border-b border-border/80 bg-secondary/15 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                  {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : <User className="w-4.5 h-4.5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">
                      {selectedUser.full_name || "Participant"}
                    </span>
                    {roleBadge(selectedUser.role)}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Active Thread</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Export DOC & Permanently End Chat */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportDoc(selectedUser)}
                  className="h-8 text-xs gap-1.5 border-border hover:bg-secondary"
                  title="Export conversation transcript as a Microsoft Word DOC file"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Export</span> DOC
                </Button>

                {isRecruiter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEndChatDialogOpen(true)}
                    className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    title="Permanently end and close this conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">End Chat</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Message Bubbles Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-secondary/10">
              {currentThread.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-2 text-muted-foreground">
                  <Clock className="w-6 h-6 opacity-50" />
                  <p className="text-sm font-medium">No messages exchanged yet</p>
                  <p className="text-xs max-w-xs">Type a message below to start this conversation.</p>
                </div>
              ) : (
                currentThread.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-2xs ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-xs"
                            : "bg-card border border-border/80 text-foreground rounded-tl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground px-1">
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isMe && (
                          <CheckCheck className={`w-3 h-3 ${msg.read ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3.5 border-t border-border/80 bg-card flex items-center gap-2.5">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${selectedUser.full_name || "participant"}... (Press Enter to send)`}
                rows={1}
                className="resize-none min-h-[44px] max-h-[100px] text-sm py-2.5 px-3.5 rounded-xl bg-secondary/30 border-border/80 focus:border-primary"
              />
              <Button
                onClick={handleSend}
                disabled={sending || !replyText.trim()}
                className="h-11 px-4 rounded-xl bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 flex-shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Permanently End Chat Confirmation Modal */}
      <Dialog open={endChatDialogOpen} onOpenChange={setEndChatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Permanently End Chat?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              Are you sure you want to permanently end the conversation with{" "}
              <strong>{selectedUser?.full_name || "this candidate"}</strong>? This will permanently close the thread.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 text-xs text-muted-foreground space-y-2">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Recommendation:
            </p>
            <p>You can export the complete conversation transcript as a DOC file before terminating.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selectedUser && handleExportDoc(selectedUser)}
              className="w-full text-xs gap-1.5 h-8 mt-1"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              Export Transcript to DOC First
            </Button>
          </div>

          <DialogFooter className="flex sm:justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEndChatDialogOpen(false)}
              disabled={isEndingChat}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmEndChat}
              disabled={isEndingChat}
              className="text-xs gap-1.5"
            >
              {isEndingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Confirm &amp; End Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

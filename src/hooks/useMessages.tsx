import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_profile?: { full_name: string | null };
  receiver_profile?: { full_name: string | null };
}

export interface Conversation {
  user_id: string;
  full_name: string | null;
  role?: string;
  last_message: string;
  last_time: string;
  unread_count: number;
  is_terminated?: boolean;
}

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const activePartnerRef = useRef<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const timeoutPromise = new Promise<any>((resolve) => 
        setTimeout(() => resolve({ data: [] }), 2000)
      );
      const queryPromise = supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const res = await Promise.race([queryPromise, timeoutPromise]);
      const rawMsgs = (res?.data as Message[]) || [];

      // Group by conversation partner
      const convMap = new Map<string, { msgs: Message[]; unread: number }>();
      rawMsgs.forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, { msgs: [], unread: 0 });
        }
        const entry = convMap.get(partnerId)!;
        entry.msgs.push(msg);
        if (!msg.read && msg.receiver_id === user.id) entry.unread++;
      });

      const partnerIds = [...convMap.keys()];
      const profileMap = new Map<string, { name: string | null; role?: string }>();

      if (partnerIds.length > 0) {
        const [profRes, roleRes] = await Promise.all([
          supabase.from("profiles").select("user_id, full_name").in("user_id", partnerIds),
          supabase.from("user_roles").select("user_id, role").in("user_id", partnerIds),
        ]);

        const rolesObj: Record<string, string> = {};
        (roleRes.data || []).forEach((r) => { rolesObj[r.user_id] = r.role; });

        (profRes.data || []).forEach((p) => {
          profileMap.set(p.user_id, {
            name: p.full_name,
            role: rolesObj[p.user_id] || "user",
          });
        });
      }

      const convList: Conversation[] = partnerIds.map((pid) => {
        const entry = convMap.get(pid)!;
        const latest = entry.msgs[0];
        const isTerminated = localStorage.getItem(`eduproof_ended_chat_${user.id}_${pid}`) === "true";
        return {
          user_id: pid,
          full_name: profileMap.get(pid)?.name || null,
          role: profileMap.get(pid)?.role || "user",
          last_message: latest.content,
          last_time: latest.created_at,
          unread_count: entry.unread,
          is_terminated: isTerminated,
        };
      });

      convList.sort((a, b) => new Date(b.last_time || 0).getTime() - new Date(a.last_time || 0).getTime());
      setConversations(convList);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchThread = useCallback(async (partnerId: string) => {
    if (!user) return [];
    activePartnerRef.current = partnerId;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching thread:", error);
        return [];
      }

      const thread = (data as Message[]) || [];
      setMessages(thread);

      // Mark unread messages as read
      const unreadIds = thread
        .filter((m) => m.receiver_id === user.id && !m.read)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        supabase
          .from("messages")
          .update({ read: true })
          .in("id", unreadIds)
          .then(() => {
            setConversations((prev) =>
              prev.map((c) => (c.user_id === partnerId ? { ...c, unread_count: 0 } : c))
            );
          });
      }

      return thread;
    } catch (error) {
      console.error("Error fetching thread:", error);
      return [];
    }
  }, [user]);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user || !content.trim()) return { error: "Empty message" };

    try {
      const payload = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        read: false,
      };

      const { data, error } = await supabase.from("messages").insert(payload).select().single();

      if (error) return { error: error.message };

      if (data) {
        setMessages((prev) => [...prev, data as Message]);
      }

      await fetchConversations();
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to send message" };
    }
  }, [user, fetchConversations]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await supabase.from("messages").update({ read: true }).eq("id", messageId);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
    } catch (e) {
      console.error("Error marking as read:", e);
    }
  }, []);

  const endChat = useCallback(async (partnerId: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      localStorage.setItem(`eduproof_ended_chat_${user.id}_${partnerId}`, "true");

      // Delete messages between user and partner in Supabase
      const { error } = await supabase
        .from("messages")
        .delete()
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
        );

      setMessages([]);
      await fetchConversations();
      return { error: error ? error.message : null };
    } catch (err: any) {
      console.error("Error ending chat:", err);
      return { error: err.message || "Failed to end chat" };
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Realtime subscription using Supabase Channel
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          fetchConversations();
          if (activePartnerRef.current) {
            fetchThread(activePartnerRef.current);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations, fetchThread]);

  return { 
    conversations, 
    messages, 
    loading, 
    fetchConversations, 
    fetchThread, 
    sendMessage, 
    markAsRead, 
    endChat 
  };
}

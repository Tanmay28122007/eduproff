import { useState, useEffect, useCallback } from "react";
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
  last_message: string;
  last_time: string;
  unread_count: number;
}

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        setLoading(false);
        return;
      }

      const rawMsgs = (data as Message[]) || [];

      // Group by conversation partner
      const convMap = new Map<string, { msgs: Message[]; unread: number }>();
      rawMsgs.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, { msgs: [], unread: 0 });
        }
        const entry = convMap.get(partnerId)!;
        entry.msgs.push(msg);
        if (!msg.read && msg.receiver_id === user.id) entry.unread++;
      });

      const partnerIds = [...convMap.keys()];
      let profileMap = new Map<string, string | null>();

      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", partnerIds);

        (profiles || []).forEach(p => {
          profileMap.set(p.user_id, p.full_name);
        });
      }

      const convList: Conversation[] = partnerIds.map(pid => {
        const entry = convMap.get(pid)!;
        const latest = entry.msgs[0];
        return {
          user_id: pid,
          full_name: profileMap.get(pid) || null,
          last_message: latest.content,
          last_time: latest.created_at,
          unread_count: entry.unread,
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
    if (!user) return;

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
        return;
      }

      const thread = (data as Message[]) || [];
      setMessages(thread);

      // Mark unread messages as read
      const unreadIds = thread
        .filter(m => m.receiver_id === user.id && !m.read)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("messages")
          .update({ read: true })
          .in("id", unreadIds);
      }
    } catch (error) {
      console.error("Error fetching thread:", error);
    }
  }, [user]);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user || !content.trim()) return { error: "Empty message" };

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        read: false,
      });

      if (error) return { error: error.message };

      await fetchConversations();
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to send message" };
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription using Supabase Channel
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  return { conversations, messages, loading, fetchConversations, fetchThread, sendMessage };
}

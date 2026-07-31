import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const AdminChatbot = () => {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hello! I'm your admin assistant. I can help you inspect platform statistics, user management, and achievement trust logs. What would you like to do?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userQuery = input.trim();
    const userMsg: Msg = { role: "user", content: userQuery };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      let reply = "I can assist you with managing candidate & recruiter accounts, inspecting achievement trust logs, or sending direct admin notifications.";
      const lower = userQuery.toLowerCase();

      if (lower.includes("user") || lower.includes("account")) {
        reply = "You can manage all registered candidate and recruiter accounts in the **Users** tab.";
      } else if (lower.includes("recruiter") || lower.includes("verify")) {
        reply = "Recruiter accounts and candidate screening activity can be inspected under **Recruiters** and **Activity Logs**.";
      } else if (lower.includes("message") || lower.includes("send")) {
        reply = "You can send direct messages to candidates or recruiters in the **Messaging** section.";
      }

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /> Admin Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me anything..." disabled={isLoading} className="flex-1" />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminChatbot;

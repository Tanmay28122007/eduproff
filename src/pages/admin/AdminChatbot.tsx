import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2, Sparkles, Trash2, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { sendGeminiChatMessage, ChatMessage, getGeminiApiKey } from "@/services/gemini";

const ADMIN_INITIAL_MSG: ChatMessage = {
  role: "assistant",
  content: "Hello Admin! 🛡️ I'm your **EduProof Admin Assistant**, connected to **Google Gemini**.\n\nI can help you review system architecture, analyze credential verification logs, draft broadcast notifications, or answer any technical or general query. What would you like to explore?",
};

const ADMIN_QUICK_CHIPS = [
  "How are certificates cryptographically validated?",
  "Draft a broadcast message announcing new recruiter verification features",
  "Explain the difference between candidate and recruiter permissions",
  "Summarize key administrative security workflows",
];

const AdminChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([ADMIN_INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (customQuery?: string) => {
    const query = (customQuery || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: query };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      if (!getGeminiApiKey()) {
        // Fallback with informative prompt if API key not entered yet
        setTimeout(() => {
          let reply = "I can assist you with managing candidate & recruiter accounts, inspecting achievement trust logs, or sending direct admin notifications.";
          const lower = query.toLowerCase();

          if (lower.includes("user") || lower.includes("account")) {
            reply = "You can manage all registered candidate and recruiter accounts in the **Users** tab.";
          } else if (lower.includes("recruiter") || lower.includes("verify")) {
            reply = "Recruiter accounts and candidate screening activity can be inspected under **Recruiters** and **Activity Logs**.";
          } else if (lower.includes("message") || lower.includes("send")) {
            reply = "You can send direct messages to candidates or recruiters in the **Messaging** section.";
          }

          setMessages([...nextMessages, { role: "assistant", content: reply }]);
          setIsLoading(false);
        }, 400);
        return;
      }

      const reply = await sendGeminiChatMessage(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (error: any) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: `⚠️ **Gemini Error:** ${error.message || "Failed to reach Gemini API."}\n\n*Please ensure your VITE_GEMINI_API_KEY is configured in your .env file.*`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col shadow-card border-border/80">
      <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <span>Admin Assistant</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          onClick={() => setMessages([ADMIN_INITIAL_MSG])}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-3 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group/msg`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground border border-border/60"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {msg.role === "assistant" && (
                  <div className="flex justify-end mt-1 pt-1">
                    <button
                      onClick={() => handleCopy(msg.content, i)}
                      className="opacity-0 group-hover/msg:opacity-100 transition-opacity text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {copiedIndex === i ? (
                        <span className="text-emerald-500 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Copy className="w-3 h-3" /> Copy
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border/60 rounded-2xl px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Gemini is thinking...</span>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Quick Admin Prompts:
              </p>
              <div className="flex flex-wrap gap-2">
                {ADMIN_QUICK_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(chip)}
                    className="text-xs bg-secondary/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border px-3 py-1.5 rounded-full transition-all text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2 pt-2 border-t border-border">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ask anything about admin logs, users, or platform operations..." 
            disabled={isLoading} 
            className="flex-1 rounded-xl py-5" 
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-xl w-11 h-11 flex-shrink-0">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminChatbot;

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bot, 
  Send, 
  Loader2, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Volume2, 
  VolumeX, 
  Brain, 
  Download,
  GraduationCap
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { sendGeminiChatMessage, ChatMessage } from "@/services/gemini";
import { 
  getLearnedMemories, 
  recordFeedback, 
  LearnedMemoryItem 
} from "@/services/chatbotLearningEngine";
import { toast } from "sonner";

const ADMIN_INITIAL_MSG: ChatMessage = {
  role: "assistant",
  content: "Hello Admin! 🛡️ I'm your **EduProof Admin Assistant**, equipped with **Continuous Learning & Gemini AI**.\n\nI can help you review system architecture, analyze credential verification logs, draft broadcast notifications, or answer technical and platform queries. What would you like to explore?",
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
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, "up" | "down">>({});
  const [correctionTarget, setCorrectionTarget] = useState<number | null>(null);
  const [correctionInput, setCorrectionInput] = useState("");
  const [memories, setMemories] = useState<LearnedMemoryItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMemories(getLearnedMemories());
    const handleMemoryUpdate = () => setMemories(getLearnedMemories());
    window.addEventListener("eduproof-bot-memory-updated", handleMemoryUpdate);
    return () => window.removeEventListener("eduproof-bot-memory-updated", handleMemoryUpdate);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, correctionTarget]);

  const handleToggleSpeech = (text: string, index: number) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[#*_`~>-]/g, " ")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleThumbsUp = (index: number, msg: ChatMessage) => {
    const prevUserMsg = messages[index - 1]?.content || "Admin task/query";
    recordFeedback(prevUserMsg, msg.content, true);
    setFeedbackGiven(prev => ({ ...prev, [index]: "up" }));
    toast.success("🧠 Assistant reinforced! Saved response pattern to learning memory.");
    setMemories(getLearnedMemories());
  };

  const handleThumbsDown = (index: number) => {
    setFeedbackGiven(prev => ({ ...prev, [index]: "down" }));
    setCorrectionTarget(index);
    setCorrectionInput("");
  };

  const submitCorrection = (index: number) => {
    if (!correctionInput.trim()) {
      setCorrectionTarget(null);
      return;
    }

    const prevUserMsg = messages[index - 1]?.content || "Admin query";
    const oldAnswer = messages[index].content;
    recordFeedback(prevUserMsg, oldAnswer, false, correctionInput.trim());

    toast.success("✨ Self-trained! Assistant memory updated with your correction.");
    setCorrectionTarget(null);
    setCorrectionInput("");
    setMemories(getLearnedMemories());
  };

  const sendMessage = async (customQuery?: string) => {
    const query = (customQuery || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: query };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendGeminiChatMessage(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
      setMemories(getLearnedMemories());
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to process query.";
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: `⚠️ **Assistant Error:** ${errorMsg}`
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

  const exportConversation = () => {
    const transcript = messages.map(m => `### ${m.role === 'user' ? 'Admin' : 'Assistant'}\n\n${m.content}\n`).join("\n---\n\n");
    const blob = new Blob([transcript], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eduproof-admin-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transcript exported successfully!");
  };

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col shadow-card border-border/80">
      <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2.5 text-base font-display">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span>Admin Assistant</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Brain className="w-3 h-3" />
                {memories.length} Memories Learned
              </span>
            </div>
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-8"
            onClick={exportConversation}
            title="Export conversation"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
            onClick={() => setMessages([ADMIN_INITIAL_MSG])}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </Button>
        </div>
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
                  <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleSpeech(msg.content, i)}
                        className={`p-1 rounded hover:bg-background/80 transition-colors ${
                          speakingIndex === i ? "text-primary font-semibold" : "hover:text-foreground"
                        }`}
                        title={speakingIndex === i ? "Stop speaking" : "Read aloud"}
                      >
                        {speakingIndex === i ? <VolumeX className="w-3.5 h-3.5 text-primary animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.content, i)}
                        className="p-1 rounded hover:bg-background/80 hover:text-foreground transition-colors"
                        title="Copy message"
                      >
                        {copiedIndex === i ? (
                          <span className="text-emerald-500 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground/70 hidden sm:inline mr-1">Train:</span>
                      <button
                        onClick={() => handleThumbsUp(i, msg)}
                        disabled={feedbackGiven[i] !== undefined}
                        className={`p-1 rounded hover:bg-background/80 transition-colors ${
                          feedbackGiven[i] === "up" ? "text-emerald-500 font-bold bg-emerald-500/10" : "hover:text-emerald-500"
                        }`}
                        title="Thumbs up (reinforce memory)"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleThumbsDown(i)}
                        disabled={feedbackGiven[i] !== undefined}
                        className={`p-1 rounded hover:bg-background/80 transition-colors ${
                          feedbackGiven[i] === "down" ? "text-rose-500 font-bold bg-rose-500/10" : "hover:text-rose-500"
                        }`}
                        title="Thumbs down (teach correct answer)"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Correction Form */}
                {correctionTarget === i && (
                  <div className="mt-3 pt-3 border-t border-rose-500/20 bg-rose-500/5 p-3 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Train the assistant with the correct answer:
                    </p>
                    <Input
                      value={correctionInput}
                      onChange={e => setCorrectionInput(e.target.value)}
                      placeholder="What should the assistant have answered?"
                      className="text-xs bg-background h-8"
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitCorrection(i);
                        }
                      }}
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setCorrectionTarget(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                        onClick={() => submitCorrection(i)}
                        disabled={!correctionInput.trim()}
                      >
                        Teach & Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border/60 rounded-2xl px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Assistant is thinking & referencing learned memory...</span>
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

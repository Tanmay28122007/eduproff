import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChatMessage, 
  sendGeminiChatMessage, 
} from "@/services/gemini";

const QUICK_PROMPTS = [
  "How does certificate verification work on EduProof?",
  "How do I create an ATS-friendly CV with verified credentials?",
  "What is the difference between a student and recruiter account?",
  "Explain quantum computing in simple words",
  "Write a clean React hook for debouncing input",
];

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hello! Welcome to **EduProof**.\n\nI can help you verify credentials, build an ATS-friendly CV, explore student and recruiter workflows, or answer any technical and general questions. How can I assist you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const EduProofChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("eduproof_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [INITIAL_MESSAGE];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem("eduproof_chat_history", JSON.stringify(messages));
    } catch {}
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Listen to custom open event from anywhere in the app
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        setInput(customEvent.detail.prompt);
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    };

    window.addEventListener("open-eduproof-chat", handleOpenChat);
    return () => window.removeEventListener("open-eduproof-chat", handleOpenChat);
  }, []);

  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendGeminiChatMessage(nextMessages);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...nextMessages, assistantMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `I encountered an issue processing your request.\n\n${error.message || "Please check your network connection."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...nextMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2.5 bg-card/95 backdrop-blur-md px-5 py-3 rounded-full border border-border shadow-md text-sm font-semibold text-foreground hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            <Shield className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span>EduProof Assistant</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Assistant"
            className="group relative w-15 h-15 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <Shield className="w-7 h-7 transition-transform group-hover:scale-110 duration-200" />
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-primary rounded-full" />
          </button>
        </div>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-card border border-border shadow-2xl rounded-3xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 ${
            isExpanded 
              ? "bottom-4 right-4 left-4 sm:left-auto sm:w-[720px] top-4 sm:top-auto sm:h-[86vh]" 
              : "bottom-4 right-4 left-4 sm:left-auto sm:w-[460px] h-[640px] max-h-[92vh]"
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-card border-b border-border flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-base tracking-tight leading-tight">
                  EduProof Assistant
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>Online • Ready to help</span>
                </div>
              </div>
            </div>

            {/* Header Controls: Expand, Close */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary hidden sm:flex transition-colors"
                title={isExpanded ? "Restore Size" : "Expand"}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Close"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4.5 h-4.5" />
              </Button>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={scrollAreaRef} 
            className="flex-1 overflow-y-auto p-5 space-y-4.5 min-h-0 bg-secondary/20"
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div 
                  key={index} 
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} group/msg`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-4.5 h-4.5" />
                    </div>
                  )}

                  <div className={`relative max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] shadow-xs ${
                    isUser 
                      ? "bg-primary text-primary-foreground rounded-tr-xs" 
                      : "bg-card text-foreground border border-border/80 rounded-tl-xs"
                  }`}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground leading-relaxed break-words">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                    <div className={`flex items-center justify-between mt-1.5 pt-1 text-[11px] ${isUser ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      <span>{msg.timestamp || ""}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.content, index)}
                          className="opacity-0 group-hover/msg:opacity-100 transition-opacity ml-2 hover:text-foreground flex items-center gap-1"
                          title="Copy text"
                        >
                          {copiedIndex === index ? (
                            <span className="flex items-center text-emerald-600 font-medium">
                              <Check className="w-3.5 h-3.5 mr-0.5" /> Copied
                            </span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div className="bg-card border border-border/80 rounded-2xl rounded-tl-xs px-5 py-3.5 text-sm text-muted-foreground flex items-center gap-2.5 shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Assistant is typing...</span>
                </div>
              </div>
            )}

            {/* Suggested Prompts */}
            {messages.length <= 2 && (
              <div className="pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Suggested Questions:
                </p>
                <div className="space-y-2">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left text-sm bg-card hover:bg-primary/5 hover:border-primary/50 text-foreground border border-border/80 px-4 py-3 rounded-xl transition-all duration-200 shadow-2xs block font-medium"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clean Input Area */}
          <div className="p-4 border-t border-border bg-card">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any question about EduProof or general topics..."
                disabled={isLoading}
                className="bg-secondary/40 border-border/80 focus:border-primary text-base rounded-xl py-6 flex-1 px-4"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

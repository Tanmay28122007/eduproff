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
  Brain,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  MessageSquare,
  MoreHorizontal,
  ArrowLeft,
  GraduationCap,
  SlidersHorizontal,
  CornerDownLeft
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  ChatMessage, 
  sendGeminiChatMessage, 
} from "@/services/gemini";
import {
  getLearnedMemories,
  addOrReinforceMemory,
  deleteLearnedMemory,
  resetLearnedMemories,
  recordFeedback,
  LearnedMemoryItem,
  MemoryCategory
} from "@/services/chatbotLearningEngine";

const QUICK_PROMPTS = [
  "How does certificate verification work?",
  "How do I create an ATS-friendly CV with badges?",
  "Candidate vs Recruiter account differences",
  "Remember that my target role is Senior Engineer",
  "Explain quantum computing in simple words",
];

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hello! Welcome to **EduProof**.\n\nI am your **Self-Learning AI Assistant**. I continuously retain conversation facts, adapt to your preferences, and train directly on your feedback and corrections.\n\nWhat would you like to explore today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const EduProofChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "memory">("chat");
  const [showTeachModal, setShowTeachModal] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("eduproof_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_err) {
      // Storage access issue
    }
    return [INITIAL_MESSAGE];
  });
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Self-Learning & Training State
  const [memories, setMemories] = useState<LearnedMemoryItem[]>(() => getLearnedMemories());
  const [memorySearch, setMemorySearch] = useState("");
  const [memoryFilter, setMemoryFilter] = useState<string>("all");
  const [newTeachFact, setNewTeachFact] = useState("");
  const [newTeachCategory, setNewTeachCategory] = useState<MemoryCategory>("platform_fact");
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, "up" | "down">>({});
  const [correctionTargetIdx, setCorrectionTargetIdx] = useState<number | null>(null);
  const [correctionInput, setCorrectionInput] = useState("");
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem("eduproof_chat_history", JSON.stringify(messages));
    } catch (_err) {
      // Storage quota or storage disabled
    }
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, correctionTargetIdx]);

  // Sync memories when updated
  useEffect(() => {
    const handleMemoryUpdate = () => {
      setMemories(getLearnedMemories());
    };
    window.addEventListener("eduproof-bot-memory-updated", handleMemoryUpdate);
    return () => window.removeEventListener("eduproof-bot-memory-updated", handleMemoryUpdate);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && viewMode === "chat") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, viewMode]);

  // Listen to custom open event from anywhere in the app
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setViewMode("chat");
      if (customEvent.detail?.prompt) {
        setInput(customEvent.detail.prompt);
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    };

    window.addEventListener("open-eduproof-chat", handleOpenChat);
    return () => window.removeEventListener("open-eduproof-chat", handleOpenChat);
  }, []);

  // Handle TTS Read Aloud
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
      setMemories(getLearnedMemories());
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Network error";
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `I encountered an issue processing your request.\n\n${errorMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...nextMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbsUp = (index: number, msg: ChatMessage) => {
    const prevUserMsg = messages[index - 1]?.content || "general query";
    recordFeedback(prevUserMsg, msg.content, true);
    setFeedbackGiven(prev => ({ ...prev, [index]: "up" }));
    toast.success("🧠 Assistant reinforced! Saved pattern to memory.");
    setMemories(getLearnedMemories());
  };

  const handleOpenCorrection = (index: number) => {
    setCorrectionTargetIdx(index);
    setFeedbackGiven(prev => ({ ...prev, [index]: "down" }));
    setCorrectionInput("");
  };

  const handleSaveCorrection = (index: number, msg: ChatMessage) => {
    if (!correctionInput.trim()) {
      setCorrectionTargetIdx(null);
      return;
    }

    const prevUserMsg = messages[index - 1]?.content || "unknown query";
    recordFeedback(prevUserMsg, msg.content, false, correctionInput.trim());
    toast.success("✨ Self-trained! Assistant memory updated with your correction.");
    setCorrectionTargetIdx(null);
    setCorrectionInput("");
    setMemories(getLearnedMemories());
  };

  const handleTeachAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeachFact.trim()) return;

    const keywords = newTeachFact.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    addOrReinforceMemory(newTeachFact.trim(), newTeachCategory, "manual", keywords);
    toast.success("🧠 Knowledge stored into assistant memory!");
    setNewTeachFact("");
    setShowTeachModal(false);
    setMemories(getLearnedMemories());
  };

  const handleDeleteMemoryItem = (id: string) => {
    deleteLearnedMemory(id);
    setMemories(getLearnedMemories());
    toast.success("Memory item removed.");
  };

  const handleResetMemories = () => {
    if (confirm("Reset learned memory to original defaults?")) {
      resetLearnedMemories();
      setMemories(getLearnedMemories());
      toast.success("Memories reset to baseline knowledge.");
    }
  };

  const handleClearChat = () => {
    if (confirm("Clear current conversation history?")) {
      window.speechSynthesis?.cancel();
      setSpeakingIndex(null);
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem("eduproof_chat_history");
      toast.success("Chat history cleared.");
    }
  };

  const handleExportTranscript = () => {
    const lines = messages.map(m => `### ${m.role === "user" ? "👤 User" : "🛡️ EduProof Assistant"} (${m.timestamp || ""})\n\n${m.content}\n\n---\n`);
    const blob = new Blob([`# EduProof AI Assistant Conversation\nExported on: ${new Date().toLocaleString()}\n\n` + lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eduproof-chat-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat transcript downloaded!");
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredMemories = memories.filter(m => {
    if (memoryFilter !== "all" && m.category !== memoryFilter) return false;
    if (memorySearch.trim()) {
      const q = memorySearch.toLowerCase();
      return m.fact.toLowerCase().includes(q) || m.keywords.some(k => k.includes(q));
    }
    return true;
  });

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2.5 bg-background/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-border/80 shadow-lg text-xs font-semibold text-foreground hover:border-primary/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span>EduProof AI</span>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Brain className="w-3 h-3" />
              {memories.length}
            </span>
          </button>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Assistant"
            className="group relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-primary/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <Shield className="w-6 h-6 transition-transform group-hover:scale-110 duration-200" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-background rounded-full animate-pulse" />
          </button>
        </div>
      )}

      {/* Main Chat Architecture */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-background/95 backdrop-blur-xl border border-border/70 shadow-2xl rounded-3xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            isExpanded 
              ? "bottom-4 right-4 left-4 sm:left-auto sm:w-[760px] top-4 sm:top-auto sm:h-[88vh]" 
              : "bottom-4 right-4 left-4 sm:left-auto sm:w-[460px] h-[640px] max-h-[92vh]"
          }`}
        >
          {/* Refined Glassmorphic Header */}
          <header className="px-4 py-3 bg-card/60 backdrop-blur-md border-b border-border/60 flex items-center justify-between flex-shrink-0">
            {/* Left: Brand & Status */}
            <div className="flex items-center gap-2.5">
              {viewMode === "memory" ? (
                <button
                  onClick={() => setViewMode("chat")}
                  className="w-8 h-8 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground flex items-center justify-center transition-all"
                  title="Back to Chat"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/20 to-primary/5 text-primary flex items-center justify-center font-bold border border-primary/20">
                    <Shield className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full animate-pulse" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-foreground text-sm tracking-tight">
                    {viewMode === "memory" ? "Memory & Training" : "EduProof AI"}
                  </h3>
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Self-Learning
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {viewMode === "memory" 
                    ? `${memories.length} facts in persistent memory` 
                    : "Gemini 2.5 • Continuous Training"}
                </p>
              </div>
            </div>

            {/* Right: Controls & Memory Pill */}
            <div className="flex items-center gap-1.5">
              {/* Memory Drawer Trigger Pill */}
              <button
                onClick={() => setViewMode(viewMode === "chat" ? "memory" : "chat")}
                className={`h-7 px-2.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all ${
                  viewMode === "memory"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-secondary/70 hover:bg-secondary text-foreground border-border/60 hover:border-primary/40"
                }`}
                title="View & manage learned memories"
              >
                <Brain className="w-3.5 h-3.5 text-primary group-hover:scale-110" />
                <span className="font-semibold">{memories.length}</span>
              </button>

              {/* More Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-xs">
                  <DropdownMenuItem onClick={() => setShowTeachModal(true)} className="gap-2 cursor-pointer">
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    <span>Teach New Knowledge</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportTranscript} className="gap-2 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Transcript</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleResetMemories} className="gap-2 cursor-pointer text-muted-foreground">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Memory Defaults</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleClearChat} className="gap-2 cursor-pointer text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Chat History</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Expand / Minimize */}
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hidden sm:flex"
                title={isExpanded ? "Restore Size" : "Expand Size"}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>

              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground"
                title="Close Assistant"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* VIEW 1: CHAT INTERFACE */}
          {viewMode === "chat" && (
            <>
              {/* Message Stream */}
              <div 
                ref={scrollAreaRef} 
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 min-h-0 bg-secondary/10"
              >
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div 
                      key={index} 
                      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} group/msg`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/20">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className={`relative max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-xs transition-all ${
                        isUser 
                          ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-tr-xs" 
                          : "bg-card text-foreground border border-border/70 rounded-tl-xs"
                      }`}>
                        {isUser ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed break-words">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}

                        {/* Action Bar (Assistant Only) */}
                        {!isUser && (
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground">
                            <span>{msg.timestamp || ""}</span>

                            <div className="flex items-center gap-1">
                              {/* Read Aloud */}
                              <button
                                onClick={() => handleToggleSpeech(msg.content, index)}
                                className={`p-1 rounded hover:bg-secondary transition-colors ${
                                  speakingIndex === index ? "text-primary font-bold bg-primary/10" : "hover:text-foreground"
                                }`}
                                title={speakingIndex === index ? "Stop voice" : "Read aloud"}
                              >
                                {speakingIndex === index ? (
                                  <VolumeX className="w-3.5 h-3.5 text-primary animate-pulse" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Thumbs Up (Reinforce Memory) */}
                              <button
                                onClick={() => handleThumbsUp(index, msg)}
                                disabled={feedbackGiven[index] !== undefined}
                                className={`p-1 rounded hover:bg-secondary transition-colors ${
                                  feedbackGiven[index] === "up" ? "text-emerald-500 font-bold bg-emerald-500/10" : "hover:text-emerald-500"
                                }`}
                                title="Reinforce: Good response (bot learns this pattern)"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>

                              {/* Thumbs Down (Inline Correction) */}
                              <button
                                onClick={() => handleOpenCorrection(index)}
                                disabled={feedbackGiven[index] !== undefined}
                                className={`p-1 rounded hover:bg-secondary transition-colors ${
                                  feedbackGiven[index] === "down" ? "text-rose-500 font-bold bg-rose-500/10" : "hover:text-rose-500"
                                }`}
                                title="Correction: Teach the bot the correct answer"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Copy */}
                              <button
                                onClick={() => handleCopy(msg.content, index)}
                                className="p-1 rounded hover:bg-secondary hover:text-foreground transition-colors"
                                title="Copy text"
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* User Timestamp */}
                        {isUser && (
                          <div className="flex justify-end mt-1 text-[10px] text-primary-foreground/70">
                            <span>{msg.timestamp || ""}</span>
                          </div>
                        )}

                        {/* Inline Correction Form */}
                        {correctionTargetIdx === index && (
                          <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 bg-rose-500/5 p-2.5 rounded-xl space-y-2 animate-in fade-in">
                            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" />
                              Train Assistant: What should it have answered?
                            </span>
                            <div className="flex gap-1.5">
                              <Input
                                value={correctionInput}
                                onChange={(e) => setCorrectionInput(e.target.value)}
                                placeholder="Enter correct facts to train memory..."
                                className="h-7 text-xs bg-background"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveCorrection(index, msg);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveCorrection(index, msg)}
                                className="h-7 text-xs px-2.5 bg-rose-600 hover:bg-rose-700 text-white flex-shrink-0"
                              >
                                Teach
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setCorrectionTargetIdx(null)}
                                className="h-7 text-xs px-2"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading Bubble */}
                {isLoading && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/20">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-card border border-border/70 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-muted-foreground flex items-center gap-2 shadow-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>Thinking & referencing learned memory...</span>
                    </div>
                  </div>
                )}

                {/* Prompt Suggestions */}
                {messages.length <= 2 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Suggested Queries & Prompts:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {QUICK_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(prompt)}
                          className="w-full text-left text-xs bg-card hover:bg-primary/5 hover:border-primary/40 text-foreground border border-border/60 px-3 py-2 rounded-xl transition-all shadow-2xs font-medium"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Dock */}
              <div className="p-3 border-t border-border/60 bg-card/60 backdrop-blur-md">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center gap-2 bg-secondary/50 rounded-2xl border border-border/70 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1.5 pl-3"
                >
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything or teach me (e.g., 'Remember that...')..."
                    disabled={isLoading}
                    className="border-0 shadow-none focus-visible:ring-0 text-xs sm:text-sm bg-transparent p-0 h-9 flex-1 placeholder:text-muted-foreground/70"
                  />

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowTeachModal(true)}
                      className="h-8 px-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-1 transition-colors"
                      title="Teach new knowledge"
                    >
                      <Brain className="w-3.5 h-3.5 text-primary" />
                      <span className="hidden sm:inline text-[11px]">Teach</span>
                    </button>

                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !input.trim()}
                      className="w-8 h-8 rounded-xl bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-all flex-shrink-0"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* VIEW 2: DEDICATED MEMORY & SELF-TRAINING CENTER */}
          {viewMode === "memory" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/15">
              {/* Overview & Reset Banner */}
              <div className="bg-card rounded-2xl p-4 border border-border/70 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Brain className="w-4 h-4" />
                    </div>
                    <span className="font-display font-bold text-foreground text-sm">
                      Autonomous Learned Knowledge
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetMemories}
                    className="text-[11px] h-7 text-muted-foreground hover:text-foreground gap-1 px-2.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Defaults
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Facts, user profile preferences, and corrections learned from chats are automatically injected into the model prompt to personalize and refine responses.
                </p>
              </div>

              {/* Quick Teach Box */}
              <form onSubmit={handleTeachAssistant} className="bg-card rounded-2xl p-4 border border-primary/20 shadow-xs space-y-2.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-primary" /> Teach Assistant Directly
                </span>
                <Input
                  value={newTeachFact}
                  onChange={(e) => setNewTeachFact(e.target.value)}
                  placeholder="e.g. EduProof issues cryptographic SHA-256 anchors for CVs..."
                  className="text-xs bg-secondary/30 h-8"
                />
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={newTeachCategory}
                    onChange={(e) => setNewTeachCategory(e.target.value as MemoryCategory)}
                    className="text-xs h-8 px-2.5 rounded-lg border border-border bg-secondary/30 text-foreground"
                  >
                    <option value="platform_fact">Platform Knowledge</option>
                    <option value="user_profile">User Preference / Role</option>
                    <option value="instruction">Special Instruction</option>
                    <option value="correction">Verified Correction</option>
                    <option value="custom_qa">Custom Q&A</option>
                  </select>

                  <Button type="submit" size="sm" disabled={!newTeachFact.trim()} className="h-8 text-xs gap-1">
                    <Brain className="w-3 h-3" />
                    Train
                  </Button>
                </div>
              </form>

              {/* Search & Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={memorySearch}
                    onChange={(e) => setMemorySearch(e.target.value)}
                    placeholder="Search memories..."
                    className="pl-8 text-xs h-8 bg-card"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {["all", "platform_fact", "user_profile", "correction", "instruction"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMemoryFilter(cat)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-lg font-medium transition-colors ${
                        memoryFilter === cat
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-card border border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat === "all" ? "All" : cat.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memories List */}
              <div className="space-y-2">
                {filteredMemories.length === 0 ? (
                  <div className="bg-card rounded-xl p-6 text-center text-muted-foreground border border-dashed border-border text-xs">
                    No memories found matching your search.
                  </div>
                ) : (
                  filteredMemories.map((m) => (
                    <div 
                      key={m.id}
                      className="bg-card rounded-xl p-3 border border-border/70 shadow-2xs space-y-1.5 flex items-start justify-between gap-2.5 group"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {m.category.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Reinforced {m.reinforcementCount}x
                          </span>
                        </div>
                        <p className="text-xs text-foreground font-medium leading-relaxed">
                          {m.fact}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMemoryItem(m.id)}
                        className="w-6 h-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TEACH MODAL OVERLAY */}
          {showTeachModal && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border shadow-2xl rounded-2xl p-5 w-full max-w-sm space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-sm text-foreground">Teach Assistant Knowledge</h4>
                  </div>
                  <button onClick={() => setShowTeachModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Fact or Instruction</label>
                    <Input
                      value={newTeachFact}
                      onChange={(e) => setNewTeachFact(e.target.value)}
                      placeholder="e.g. Always format certificate dates in YYYY-MM-DD..."
                      className="text-xs"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
                    <select
                      value={newTeachCategory}
                      onChange={(e) => setNewTeachCategory(e.target.value as MemoryCategory)}
                      className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="platform_fact">Platform Knowledge</option>
                      <option value="user_profile">User Preference / Target Role</option>
                      <option value="instruction">Special Formatting Instruction</option>
                      <option value="correction">Verified Correction</option>
                      <option value="custom_qa">Custom Q&A Pair</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                  <Button variant="ghost" size="sm" onClick={() => setShowTeachModal(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleTeachAssistant} 
                    disabled={!newTeachFact.trim()}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    Save & Train
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

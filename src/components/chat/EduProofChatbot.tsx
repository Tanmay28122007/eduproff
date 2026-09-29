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
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  "How does certificate verification work on EduProof?",
  "How do I create an ATS-friendly CV with verified credentials?",
  "What is the difference between a student and recruiter account?",
  "Remember that my target role is Full-Stack Engineer",
  "Explain quantum computing in simple words",
  "Write a clean React hook for debouncing input",
];

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hello! Welcome to **EduProof**.\n\nI am your **Self-Learning AI Assistant**. I remember our conversations, adapt to your preferences, and learn directly from your feedback and corrections.\n\nHow can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const EduProofChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "memory">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("eduproof_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_err) {
      // Storage access or JSON parse issue
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
  }, [messages, isLoading]);

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
    if (isOpen && activeTab === "chat") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab]);

  // Listen to custom open event from anywhere in the app
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setActiveTab("chat");
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
    // Clean markdown formatting for smoother voice synthesis
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
      // Update local memory list in case new facts were learned from prompt
      setMemories(getLearnedMemories());
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

  // Feedback Handling
  const handleThumbsUp = (index: number, msg: ChatMessage) => {
    const prevUserMsg = messages[index - 1]?.content || "general query";
    recordFeedback(prevUserMsg, msg.content, true);
    setFeedbackGiven(prev => ({ ...prev, [index]: "up" }));
    toast.success("🧠 Memory reinforced! I've noted this as a high-quality answer.");
    setMemories(getLearnedMemories());
  };

  const handleOpenCorrection = (index: number) => {
    setCorrectionTargetIdx(index);
    setCorrectionInput("");
  };

  const handleSaveCorrection = (index: number, msg: ChatMessage) => {
    if (!correctionInput.trim()) return;
    const prevUserMsg = messages[index - 1]?.content || "general query";
    recordFeedback(prevUserMsg, msg.content, false, correctionInput.trim());
    setFeedbackGiven(prev => ({ ...prev, [index]: "down" }));
    setCorrectionTargetIdx(null);
    setCorrectionInput("");
    toast.success("🧠 Learned! I've updated my internal memory with your correction.");
    setMemories(getLearnedMemories());
  };

  // Manual Direct Teaching
  const handleTeachAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeachFact.trim()) return;

    addOrReinforceMemory(newTeachFact.trim(), newTeachCategory, "manual_teach");
    setNewTeachFact("");
    toast.success("🧠 New knowledge taught and permanently stored!");
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
      toast.success("Memories reset to foundational platform knowledge.");
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
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2.5 bg-card/95 backdrop-blur-md px-5 py-3 rounded-full border border-border shadow-md text-sm font-semibold text-foreground hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            <Shield className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span>EduProof Assistant</span>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              <Brain className="w-3 h-3" />
              {memories.length}
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Assistant"
            className="group relative w-15 h-15 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <Shield className="w-7 h-7 transition-transform group-hover:scale-110 duration-200" />
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-primary rounded-full animate-pulse" />
          </button>
        </div>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-card border border-border shadow-2xl rounded-3xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 ${
            isExpanded 
              ? "bottom-4 right-4 left-4 sm:left-auto sm:w-[740px] top-4 sm:top-auto sm:h-[88vh]" 
              : "bottom-4 right-4 left-4 sm:left-auto sm:w-[480px] h-[660px] max-h-[92vh]"
          }`}
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-card border-b border-border flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-foreground text-base tracking-tight leading-tight">
                    EduProof Assistant
                  </h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5">
                    Self-Learning AI
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>Online • Continuously Training</span>
                </div>
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="flex items-center gap-1">
              {/* Tab Switcher: Chat vs Brain */}
              <div className="flex items-center bg-secondary rounded-xl p-0.5 mr-1 border border-border/60">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === "chat" 
                      ? "bg-card text-foreground shadow-xs" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Chat with Assistant"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setActiveTab("memory")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === "memory" 
                      ? "bg-primary text-primary-foreground shadow-xs" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Learned Memory & Training Center"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Memory ({memories.length})</span>
                </button>
              </div>

              {/* Export transcript */}
              {activeTab === "chat" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary hidden sm:flex"
                  title="Download Chat Transcript"
                  onClick={handleExportTranscript}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}

              {/* Clear chat */}
              {activeTab === "chat" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 hidden sm:flex"
                  title="Clear Chat History"
                  onClick={handleClearChat}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              {/* Expand / Minimize */}
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary hidden sm:flex"
                title={isExpanded ? "Restore Size" : "Expand"}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                title="Close"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* TAB 1: INTERACTIVE CHAT */}
          {activeTab === "chat" && (
            <>
              {/* Active Learning Banner */}
              <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-between text-xs text-primary">
                <span className="flex items-center gap-1.5 font-medium">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                  <span>Self-Learning Active: Retaining facts & feedback automatically.</span>
                </span>
                <button 
                  onClick={() => setActiveTab("memory")}
                  className="underline hover:text-primary/80 font-semibold"
                >
                  View Memory ({memories.length})
                </button>
              </div>

              {/* Messages Container */}
              <div 
                ref={scrollAreaRef} 
                className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 bg-secondary/15"
              >
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div 
                      key={index} 
                      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} group/msg`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                          <Shield className="w-4 h-4" />
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

                        {/* Message Actions Bar (for Assistant) */}
                        <div className={`flex items-center justify-between mt-2 pt-1.5 border-t ${
                          isUser ? "border-primary-foreground/20 text-primary-foreground/75" : "border-border/40 text-muted-foreground"
                        } text-xs`}>
                          <span>{msg.timestamp || ""}</span>

                          {!isUser && (
                            <div className="flex items-center gap-1.5">
                              {/* Read Aloud button */}
                              <button
                                onClick={() => handleToggleSpeech(msg.content, index)}
                                className={`p-1 rounded-md transition-colors ${
                                  speakingIndex === index 
                                    ? "text-primary bg-primary/10 font-medium" 
                                    : "hover:text-foreground hover:bg-secondary/60"
                                }`}
                                title={speakingIndex === index ? "Stop voice" : "Read aloud"}
                              >
                                {speakingIndex === index ? (
                                  <VolumeX className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Thumbs Up (Reinforce) */}
                              <button
                                onClick={() => handleThumbsUp(index, msg)}
                                className={`p-1 rounded-md transition-colors ${
                                  feedbackGiven[index] === "up"
                                    ? "text-emerald-600 bg-emerald-500/10 font-bold"
                                    : "hover:text-emerald-600 hover:bg-secondary/60"
                                }`}
                                title="Reinforce: Good answer (helps bot learn)"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>

                              {/* Thumbs Down (Correction) */}
                              <button
                                onClick={() => handleOpenCorrection(index)}
                                className={`p-1 rounded-md transition-colors ${
                                  feedbackGiven[index] === "down"
                                    ? "text-destructive bg-destructive/10 font-bold"
                                    : "hover:text-destructive hover:bg-secondary/60"
                                }`}
                                title="Teach Correction: Fix this answer"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Copy Text */}
                              <button
                                onClick={() => handleCopy(msg.content, index)}
                                className="p-1 rounded-md hover:text-foreground hover:bg-secondary/60 transition-colors"
                                title="Copy text"
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Inline Correction Box if Thumbs Down clicked */}
                        {correctionTargetIdx === index && (
                          <div className="mt-3 p-3 bg-secondary/50 rounded-xl border border-primary/20 space-y-2 animate-in fade-in">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                              <Brain className="w-3 h-3 text-primary" />
                              Train Assistant: What is the correct information?
                            </span>
                            <div className="flex gap-2">
                              <Input
                                value={correctionInput}
                                onChange={(e) => setCorrectionInput(e.target.value)}
                                placeholder="e.g. Actually, EduProof also supports bulk CSV upload..."
                                className="h-8 text-xs bg-background"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveCorrection(index, msg)}
                                className="h-8 text-xs px-3"
                              >
                                Train Bot
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setCorrectionTargetIdx(null)}
                                className="h-8 text-xs px-2"
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

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="bg-card border border-border/80 rounded-2xl rounded-tl-xs px-5 py-3.5 text-sm text-muted-foreground flex items-center gap-2.5 shadow-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Assistant is thinking & learning...</span>
                    </div>
                  </div>
                )}

                {/* Suggested Prompts */}
                {messages.length <= 2 && (
                  <div className="pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Suggested Questions & Training Prompts:
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

              {/* Input Area */}
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
                    placeholder="Ask anything or teach me (e.g., 'Remember that...')..."
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
            </>
          )}

          {/* TAB 2: SELF-TRAINING & LEARNED MEMORY CENTER */}
          {activeTab === "memory" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-secondary/15">
              {/* Header Box */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Brain className="w-4 h-4" />
                    </div>
                    <h4 className="font-display font-bold text-foreground text-base">
                      Learned Knowledge & Self-Training
                    </h4>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetMemories}
                    className="text-xs h-7 text-muted-foreground hover:text-foreground gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Defaults
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The assistant stores insights, corrections, and instructions learned from your conversations. You can also directly teach it new platform facts or personal preferences below.
                </p>
              </div>

              {/* Direct Teaching Form */}
              <form onSubmit={handleTeachAssistant} className="bg-card rounded-2xl p-5 border border-primary/20 shadow-xs space-y-3">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Plus className="w-3.5 h-3.5 text-primary" /> Teach Assistant New Knowledge
                </span>
                <Input
                  value={newTeachFact}
                  onChange={(e) => setNewTeachFact(e.target.value)}
                  placeholder="e.g. EduProof has partnered with Stanford Online for 2026..."
                  className="text-sm bg-secondary/30 h-10"
                />
                <div className="flex items-center justify-between gap-3">
                  <select
                    value={newTeachCategory}
                    onChange={(e) => setNewTeachCategory(e.target.value as MemoryCategory)}
                    className="text-xs h-9 px-3 rounded-lg border border-border bg-secondary/30 text-foreground"
                  >
                    <option value="platform_fact">Platform Knowledge</option>
                    <option value="user_profile">User Profile / Preference</option>
                    <option value="instruction">Special Instruction</option>
                    <option value="correction">Verified Correction</option>
                    <option value="custom_qa">Custom Q&A</option>
                  </select>

                  <Button type="submit" size="sm" disabled={!newTeachFact.trim()} className="gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    Train Assistant
                  </Button>
                </div>
              </form>

              {/* Search & Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={memorySearch}
                      onChange={(e) => setMemorySearch(e.target.value)}
                      placeholder="Search learned facts..."
                      className="pl-8 text-xs h-8 bg-card"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {["all", "platform_fact", "user_profile", "correction", "instruction"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMemoryFilter(cat)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
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

              {/* Learned Memories List */}
              <div className="space-y-2.5">
                {filteredMemories.length === 0 ? (
                  <div className="bg-card rounded-xl p-8 text-center text-muted-foreground border border-dashed border-border">
                    <AlertCircle className="w-6 h-6 mx-auto mb-1 opacity-60" />
                    <p className="text-xs">No learned memories found matching your filter.</p>
                  </div>
                ) : (
                  filteredMemories.map((m) => (
                    <div 
                      key={m.id}
                      className="bg-card rounded-xl p-4 border border-border/70 shadow-2xs space-y-2 flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {m.category.replace("_", " ")}
                          </Badge>
                          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                            Reinforced {m.reinforcementCount}x
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            via {m.source.replace("_", " ")}
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
                        className="w-7 h-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
        </div>
      )}
    </>
  );
};

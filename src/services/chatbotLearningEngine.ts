// EduProof Chatbot Continuous Self-Learning & Training Engine

export type MemoryCategory = 
  | "user_profile" 
  | "platform_fact" 
  | "correction" 
  | "instruction" 
  | "custom_qa";

export type MemorySource = "auto_chat" | "user_feedback" | "manual_teach";

export interface LearnedMemoryItem {
  id: string;
  category: MemoryCategory;
  fact: string;
  keywords: string[];
  learnedAt: string;
  source: MemorySource;
  reinforcementCount: number;
}

export interface ChatFeedbackRecord {
  id: string;
  query: string;
  answer: string;
  isPositive: boolean;
  correction?: string;
  timestamp: string;
}

const STORAGE_KEY_MEMORIES = "eduproof_bot_learned_memory";
const STORAGE_KEY_FEEDBACK = "eduproof_bot_chat_feedback";

// Base foundational knowledge the bot starts with
const SEED_MEMORIES: LearnedMemoryItem[] = [
  {
    id: "seed_1",
    category: "platform_fact",
    fact: "EduProof was founded and created by Tanmay Anand as a tamper-proof decentralized credential verification network.",
    keywords: ["founder", "creator", "tanmay", "anand", "who built", "who created", "who founded"],
    learnedAt: new Date().toISOString(),
    source: "auto_chat",
    reinforcementCount: 10,
  },
  {
    id: "seed_2",
    category: "platform_fact",
    fact: "EduProof issues cryptographic SHA-256 anchors and QR codes for every verified certificate, preventing counterfeit degrees and diplomas.",
    keywords: ["cryptographic", "sha256", "qr", "verification", "tamper", "counterfeit"],
    learnedAt: new Date().toISOString(),
    source: "auto_chat",
    reinforcementCount: 5,
  },
  {
    id: "seed_3",
    category: "platform_fact",
    fact: "Students can generate clean, ATS-compliant Verified CVs with authenticated achievement badges directly at /generate-cv.",
    keywords: ["cv", "resume", "ats", "generate-cv", "student", "badges"],
    learnedAt: new Date().toISOString(),
    source: "auto_chat",
    reinforcementCount: 5,
  },
  {
    id: "seed_4",
    category: "platform_fact",
    fact: "Recruiters can use the Candidate Directory at /recruiter and Trust Screening at /recruiter/verify to audit multi-signal credentials.",
    keywords: ["recruiter", "directory", "screening", "hire", "verify candidates"],
    learnedAt: new Date().toISOString(),
    source: "auto_chat",
    reinforcementCount: 5,
  }
];

/**
 * Get all learned memories from local storage
 */
export function getLearnedMemories(): LearnedMemoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_err) {
    // Storage access issue
  }
  return SEED_MEMORIES;
}

/**
 * Save all learned memories to local storage
 */
export function saveLearnedMemories(memories: LearnedMemoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
    // Dispatch custom event so UI components update instantly
    window.dispatchEvent(new CustomEvent("eduproof-bot-memory-updated", { detail: { count: memories.length } }));
  } catch (_err) {
    // Storage quota or storage disabled
  }
}

/**
 * Add or reinforce a learned memory
 */
export function addOrReinforceMemory(
  fact: string,
  category: MemoryCategory = "custom_qa",
  source: MemorySource = "manual_teach",
  extraKeywords: string[] = []
): LearnedMemoryItem {
  const cleanedFact = fact.trim();
  const currentMemories = getLearnedMemories();

  // Extract keywords from the fact
  const extractedKeywords = cleanedFact
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !["the", "and", "for", "with", "this", "that", "from", "have"].includes(w));

  const mergedKeywords = Array.from(new Set([...extractedKeywords, ...extraKeywords.map(k => k.toLowerCase())]));

  // Check if an existing memory is very similar
  const existingIdx = currentMemories.findIndex(
    (m) => m.fact.toLowerCase() === cleanedFact.toLowerCase() ||
           m.fact.toLowerCase().includes(cleanedFact.toLowerCase()) ||
           cleanedFact.toLowerCase().includes(m.fact.toLowerCase())
  );

  if (existingIdx >= 0) {
    currentMemories[existingIdx].reinforcementCount += 1;
    currentMemories[existingIdx].keywords = Array.from(
      new Set([...currentMemories[existingIdx].keywords, ...mergedKeywords])
    );
    saveLearnedMemories(currentMemories);
    return currentMemories[existingIdx];
  }

  const newItem: LearnedMemoryItem = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    category,
    fact: cleanedFact,
    keywords: mergedKeywords,
    learnedAt: new Date().toISOString(),
    source,
    reinforcementCount: 1,
  };

  const updated = [newItem, ...currentMemories];
  saveLearnedMemories(updated);
  return newItem;
}

/**
 * Delete a specific learned memory
 */
export function deleteLearnedMemory(id: string): void {
  const current = getLearnedMemories();
  const filtered = current.filter((m) => m.id !== id);
  saveLearnedMemories(filtered);
}

/**
 * Reset memories to base initial state
 */
export function resetLearnedMemories(): void {
  saveLearnedMemories(SEED_MEMORIES);
}

/**
 * Pattern-based self-learning extractor
 * Inspects what the user said and extracts user preferences, platform rules, and corrections
 */
export function autoLearnFromChat(userMessage: string, _assistantReply?: string): LearnedMemoryItem[] {
  const text = userMessage.trim();
  const learnedItems: LearnedMemoryItem[] = [];

  // 1. "Remember that ..." or "Keep in mind that ..." or "Note that ..."
  const rememberMatch = text.match(/(?:remember\s+that|keep\s+in\s+mind\s+that|note\s+that|please\s+remember)\s+([^.!?\n]+)/i);
  if (rememberMatch && rememberMatch[1]) {
    const fact = rememberMatch[1].trim();
    if (fact.length > 5) {
      const item = addOrReinforceMemory(
        `User instruction: ${fact}`,
        "instruction",
        "auto_chat",
        ["instruction", "preference"]
      );
      learnedItems.push(item);
    }
  }

  // 2. "My name is ..."
  const nameMatch = text.match(/(?:my\s+name\s+is|i\s+am\s+called|call\s+me)\s+([A-Za-z\s]+?)(?:[.,!?]|$)/i);
  if (nameMatch && nameMatch[1]) {
    const name = nameMatch[1].trim();
    if (name.length > 1 && name.length < 35 && !name.toLowerCase().includes("a student") && !name.toLowerCase().includes("user")) {
      const item = addOrReinforceMemory(
        `The current user's name is ${name}. Address them personally when appropriate.`,
        "user_profile",
        "auto_chat",
        ["user", "name", name.toLowerCase()]
      );
      learnedItems.push(item);
    }
  }

  // 3. "I am a [role/developer/student/recruiter]"
  const roleMatch = text.match(/i\s+am\s+(?:a|an)\s+([A-Za-z0-9\s-]+?)(?:at\s+([A-Za-z0-9\s]+?))?(?:[.,!?]|$)/i);
  if (roleMatch && roleMatch[1]) {
    const userRole = roleMatch[1].trim();
    const company = roleMatch[2]?.trim();
    const commonRoles = ["student", "recruiter", "developer", "engineer", "designer", "professor", "teacher", "candidate", "founder", "manager"];
    if (commonRoles.some(r => userRole.toLowerCase().includes(r))) {
      const fact = company 
        ? `The user is a ${userRole} at ${company}.`
        : `The user is a ${userRole}.`;
      const item = addOrReinforceMemory(fact, "user_profile", "auto_chat", ["user", "role", userRole.toLowerCase()]);
      learnedItems.push(item);
    }
  }

  // 4. "I work at ..." or "I study at ..."
  const workMatch = text.match(/(?:i\s+work\s+at|i\s+study\s+at|i\s+am\s+from)\s+([A-Za-z0-9\s]+?)(?:[.,!?]|$)/i);
  if (workMatch && workMatch[1]) {
    const org = workMatch[1].trim();
    if (org.length > 2 && org.length < 40) {
      const item = addOrReinforceMemory(
        `The user is affiliated with ${org}.`,
        "user_profile",
        "auto_chat",
        ["user", "organization", org.toLowerCase()]
      );
      learnedItems.push(item);
    }
  }

  // 5. Corrections: "Actually, it is ..." or "No, the correct answer is ..."
  const correctionMatch = text.match(/(?:actually|no\s*,\s*|that's\s+wrong\s*,\s*|the\s+correct\s+(?:info|answer)\s+is)\s+([^.!?\n]+)/i);
  if (correctionMatch && correctionMatch[1]) {
    const correction = correctionMatch[1].trim();
    if (correction.length > 8) {
      const item = addOrReinforceMemory(
        `User correction: ${correction}`,
        "correction",
        "user_feedback",
        ["correction", "verified_fact"]
      );
      learnedItems.push(item);
    }
  }

  return learnedItems;
}

/**
 * Record user rating/feedback and train the memory
 */
export function recordFeedback(
  query: string,
  answer: string,
  isPositive: boolean,
  correction?: string
): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEEDBACK);
    const history: ChatFeedbackRecord[] = raw ? JSON.parse(raw) : [];

    const record: ChatFeedbackRecord = {
      id: `fb_${Date.now()}`,
      query,
      answer,
      isPositive,
      correction,
      timestamp: new Date().toISOString(),
    };

    history.unshift(record);
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(history.slice(0, 100)));

    // If user provided a correction, learn from it immediately!
    if (correction && correction.trim()) {
      addOrReinforceMemory(
        `When asked "${query.trim()}", remember this correction: ${correction.trim()}`,
        "correction",
        "user_feedback",
        query.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      );
    } else if (isPositive) {
      // Reinforce keywords from query
      addOrReinforceMemory(
        `Preferred high-quality answer for "${query.trim()}": ${answer.slice(0, 180)}...`,
        "custom_qa",
        "user_feedback",
        query.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      );
    }
  } catch (_err) {
    // Storage issue
  }
}

/**
 * Builds the dynamic system prompt snippet containing all self-trained memories and rules
 */
export function buildLearnedMemoryContext(currentQuery?: string): string {
  const memories = getLearnedMemories();
  if (!memories.length) return "";

  // Prioritize memories matching query keywords
  const queryWords = (currentQuery || "").toLowerCase().split(/\s+/);
  
  const sorted = [...memories].sort((a, b) => {
    const aMatch = a.keywords.some(k => queryWords.includes(k));
    const bMatch = b.keywords.some(k => queryWords.includes(k));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return b.reinforcementCount - a.reinforcementCount;
  });

  const topMemories = sorted.slice(0, 12);

  const formattedLines = topMemories.map(m => {
    const categoryTag = m.category === "user_profile" 
      ? "[USER PROFILE]" 
      : m.category === "correction" 
      ? "[USER CORRECTION]" 
      : m.category === "instruction" 
      ? "[SPECIAL INSTRUCTION]" 
      : "[VERIFIED KNOWLEDGE]";
    return `- ${categoryTag} ${m.fact} (Reinforced: ${m.reinforcementCount}x)`;
  });

  return `\n=== DYNAMICALLY LEARNED MEMORY & CONTINUOUS TRAINING ===\nYou continuously learn from user interactions, direct teaching, and feedback. Incorporate the following verified facts, corrections, and user preferences into your responses:\n${formattedLines.join("\n")}\nAlways honor corrections and user preferences over general knowledge.\n=======================================================\n`;
}

/**
 * Check if learned memory has an immediate exact match for offline fallback
 */
export function findLearnedFallbackMatch(query: string): string | null {
  const q = query.toLowerCase().trim();
  const memories = getLearnedMemories();
  if (!memories.length) return null;

  const qWords = q.split(/\s+/).filter(w => w.length > 2);

  const scored = memories.map(m => {
    let score = 0;
    const factLower = m.fact.toLowerCase();

    for (const kw of m.keywords) {
      const kwLower = kw.toLowerCase();
      if (q.includes(kwLower)) {
        score += 4;
      }
    }

    for (const word of qWords) {
      if (factLower.includes(word)) {
        score += 2;
      }
    }

    // Small bonus for highly reinforced facts
    score += Math.min(m.reinforcementCount * 0.2, 3);

    return { memory: m, score };
  }).filter(item => item.score >= 3);

  if (!scored.length) return null;

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0].memory;

  return `Based on learned knowledge:\n\n**${best.fact}**\n\n*(Learned directly from user training & reinforced ${best.reinforcementCount}x)*`;
}

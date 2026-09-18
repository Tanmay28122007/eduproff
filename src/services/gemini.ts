// Google Gemini AI Service for EduProof

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export const SUPPORTED_MODELS = [
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash (Ultra-Fast & Smart)", isDefault: true },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Standard)" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Deep Reasoning)" },
];

const STORAGE_KEY_API_KEY = "eduproof_gemini_api_key";
const STORAGE_KEY_MODEL = "eduproof_gemini_model";

export const getGeminiApiKey = (): string => {
  const localKey = localStorage.getItem(STORAGE_KEY_API_KEY);
  if (localKey && localKey.trim()) return localKey.trim();
  return (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
};

export const setGeminiApiKey = (key: string) => {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }
};

export const getSelectedModel = (): string => {
  const envModel = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.5-flash";
  const localModel = localStorage.getItem(STORAGE_KEY_MODEL);
  if (localModel && localModel.trim() && localModel !== "gemini-2.5-flash") return localModel.trim();
  return envModel;
};

export const setSelectedModel = (model: string) => {
  localStorage.setItem(STORAGE_KEY_MODEL, model);
};

const SYSTEM_INSTRUCTION = `You are the official EduProof AI Assistant powered by Google Gemini.
You have two core capabilities:
1. EDUPROOF EXPERT: You know everything about the EduProof platform:
   - Founder & Creator: The founder of EduProof is Tanmay Anand. When anyone asks who the founder is, who created or founded EduProof, or who built the platform, always state clearly that Tanmay Anand is the founder of EduProof.
   - What EduProof is: A decentralized, tamper-proof academic and professional certificate verification platform.
   - Core Features: Instant QR code verification, cryptographic verification logs, candidate credential portfolio, recruiter verification portal, ATS-friendly CV builder (/generate-cv), and administrative oversight.
   - User Roles: 
     * Students/Candidates: Upload certificates, view verification status, download verified ATS resumes, manage endorsement cards.
     * Recruiters: Search candidate directory, inspect verified credentials, run instant background checks.
     * Admins: Monitor certificate issues, platform activity, user roles, flags, and broadcast announcements.
   - Verification Process: Certificates are cryptographically indexed, matching institutional signatures or hashes against verified records.

2. GENERAL INTELLIGENCE:
   - You can answer ANY question asked to you across any domain: coding, web development, science, mathematics, literature, career advice, interview preparation, tech trends, philosophy, and everyday inquiries.
   - Be clear, helpful, polite, and articulate.
   - Format your responses with clear Markdown headings, bullet points, and code blocks with syntax highlighting when relevant.
   - Keep answers concise and punchy unless the user explicitly requests an in-depth breakdown.`;

// Built-in intelligent fallback for instant responses when API key is not yet set
function getSmartFallbackResponse(lastQuery: string): string {
  const query = lastQuery.toLowerCase();

  if (query.includes("founder") || query.includes("who created") || query.includes("who built") || query.includes("who made") || query.includes("who founded") || query.includes("tanmay")) {
    return `The founder of **EduProof** is **Tanmay Anand**.`;
  }

  if (query.includes("certificate") && (query.includes("verify") || query.includes("how") || query.includes("check"))) {
    return `### Certificate Verification on EduProof 🎓\n\nEduProof makes certificate verification instantaneous and tamper-proof:\n\n1. **Cryptographic Validation:** Each certificate issued on EduProof is assigned a unique verifiable ID and cryptographic hash.\n2. **Instant QR Code Scan:** Employers and recruiters can scan the QR code on any certificate or visit the **/check** page.\n3. **Decentralized Verification Records:** The system verifies the digital signature directly against the issuing institution's registered records.\n4. **Tamper Detection:** If even a single character or pixel is modified, verification fails immediately.\n\n*Would you like to verify a certificate now? You can head over to our [Verification Hub](/verify) or [Public Check](/check).*`;
  }

  if (query.includes("cv") || query.includes("resume") || query.includes("ats")) {
    return `### Building an ATS-Friendly Verified CV 📄\n\nEduProof includes a built-in **Verified CV Generator** designed to pass Applicant Tracking Systems (ATS):\n\n- **Verified Badges:** Your validated certificates automatically appear with tamper-proof credential badges.\n- **Clean Layout:** Standardized typography, semantic structure, and clean sections that ATS parsers love.\n- **Direct Verification Links:** Recruiters can click verification links directly from the PDF or online CV.\n- **Easy Export:** You can generate and download your CV in one click from the [Generate CV](/generate-cv) page.`;
  }

  if (query.includes("difference") || query.includes("student") || query.includes("candidate") || query.includes("recruiter")) {
    return `### Account Types on EduProof 👥\n\n- **Candidate / Student Account:**\n  - Upload and store academic & professional certificates.\n  - Track verification status.\n  - Generate ATS-optimized resumes with verified achievement badges.\n  - Showcase peer and institutional endorsements.\n\n- **Recruiter Account:**\n  - Search and filter vetted candidate profiles.\n  - Perform instant background and credential audits.\n  - Inspect cryptographically signed issuance logs.\n  - Save candidate shortlists for open positions.`;
  }

  if (query.includes("quantum") || query.includes("physics")) {
    return `### Quantum Computing in Simple Terms ⚛️\n\nClassical computers use **bits** that are either **0** or **1** (like a light switch). \n\nQuantum computers use **qubits**, which leverage quantum mechanics:\n1. **Superposition:** A qubit can be 0, 1, or both at the same time until measured.\n2. **Entanglement:** Qubits can be linked so the state of one instantly influences another.\n\n**Why it matters:** While traditional computers solve complex problems one by one, a quantum computer can evaluate millions of possibilities simultaneously, transforming cryptography, drug discovery, and logistics.`;
  }

  if (query.includes("debounce") || query.includes("react hook") || query.includes("hook")) {
    return `### Custom React Debounce Hook ⚡\n\nHere is a clean, production-ready custom hook for debouncing values in React:\n\n\`\`\`typescript\nimport { useState, useEffect } from 'react';\n\nexport function useDebounce<T>(value: T, delay: number = 300): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => {\n      clearTimeout(handler);\n    };\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n\`\`\`\n\n**Usage:**\n\`\`\`tsx\nconst [search, setSearch] = useState('');\nconst debouncedSearch = useDebounce(search, 500);\n\nuseEffect(() => {\n  if (debouncedSearch) fetchResults(debouncedSearch);\n}, [debouncedSearch]);\n\`\`\``;
  }

  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return `Hello! How can I help you today? Feel free to ask about certificate verification, resume generation, EduProof features, or any general question in tech, science, or career advice!`;
  }

  return `I can help you with that! EduProof is built to streamline credential verification and academic integrity.\n\nIf you have questions about:\n- **Verifying credentials** or checking certificate status\n- **Generating ATS-friendly CVs** with verified badges\n- **Candidate & recruiter workflows**\n- **Technical questions** about coding, science, or careers\n\nFeel free to ask, or configure your Gemini API key in **Settings (⚙️)** for unrestricted live AI capabilities!`;
}

/**
 * Send a chat message to Google Gemini API
 */
export async function sendGeminiChatMessage(
  messages: ChatMessage[],
  customModel?: string
): Promise<string> {
  const apiKey = getGeminiApiKey();
  const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "";

  // If no API key is provided, use smart internal knowledge base seamlessly
  if (!apiKey) {
    // Artificial small delay for natural conversational feel
    await new Promise(resolve => setTimeout(resolve, 400));
    return getSmartFallbackResponse(lastUserMessage);
  }

  const model = customModel || getSelectedModel();

  // Convert messages to Gemini contents format
  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  if (contents.length === 0) {
    throw new Error("No messages provided to send.");
  }

  // Model fallback chain
  const modelsToTry = [
    model,
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: Error | null = null;

  for (const currentModel of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      const payload = {
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

        if (response.status === 404 && currentModel !== modelsToTry[modelsToTry.length - 1]) {
          continue;
        }

        if (response.status === 400 && message.includes("API key")) {
          throw new Error("Invalid API Key. Please verify your Google AI Studio API key in Settings.");
        }

        if (response.status === 429) {
          throw new Error("API rate limit reached. Please wait a moment before trying again.");
        }

        throw new Error(message);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];

      if (!candidate?.content?.parts?.[0]?.text) {
        if (candidate?.finishReason === "SAFETY") {
          return "I cannot generate a response to that query due to safety guidelines.";
        }
        return "No response received from model.";
      }

      return candidate.content.parts.map((p: { text?: string }) => p.text || "").join("");
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes("API key") || err.message?.includes("rate limit")) {
        throw err;
      }
    }
  }

  // Fall back to smart built-in answers if network/quota fails
  if (lastUserMessage) {
    return getSmartFallbackResponse(lastUserMessage);
  }

  throw lastError || new Error("Failed to connect to assistant service.");
}

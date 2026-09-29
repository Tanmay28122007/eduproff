import { describe, it, expect, beforeEach } from "vitest";
import {
  getLearnedMemories,
  addOrReinforceMemory,
  autoLearnFromChat,
  recordFeedback,
  deleteLearnedMemory,
  resetLearnedMemories,
  buildLearnedMemoryContext,
  findLearnedFallbackMatch,
} from "@/services/chatbotLearningEngine";

describe("Chatbot Learning Engine", () => {
  beforeEach(() => {
    localStorage.clear();
    resetLearnedMemories();
  });

  it("should initialize with default baseline platform memories", () => {
    const memories = getLearnedMemories();
    expect(memories.length).toBeGreaterThan(0);
    const hasEduProofFact = memories.some(m => m.fact.includes("EduProof") || m.fact.includes("verification"));
    expect(hasEduProofFact).toBe(true);
  });

  it("should automatically learn user name and role from natural conversation", () => {
    const userMessage = "Hello! My name is Jordan, and I am a software engineer looking to verify my certificates.";
    const learned = autoLearnFromChat(userMessage);

    expect(learned.length).toBeGreaterThanOrEqual(1);

    const memories = getLearnedMemories();
    const hasNameOrRole = memories.some(
      m => m.fact.includes("Jordan") || m.fact.toLowerCase().includes("engineer")
    );
    expect(hasNameOrRole).toBe(true);
  });

  it("should record feedback and learn from corrections", () => {
    const userPrompt = "Where do I upload credentials?";
    const badBotAnswer = "Go to the profile settings tab.";
    const correctedAnswer = "Go directly to the Credentials page and click 'Upload Certificate'.";

    recordFeedback(userPrompt, badBotAnswer, false, correctedAnswer);

    const memories = getLearnedMemories();
    const foundCorrection = memories.find(m => m.fact.includes(correctedAnswer));
    expect(foundCorrection).toBeDefined();
    expect(foundCorrection?.category).toBe("correction");
  });

  it("should reinforce memory confidence on repeated facts", () => {
    const item1 = addOrReinforceMemory("Students can export verified resume badges.", "platform_fact", "manual", ["resume", "badge"]);
    expect(item1.reinforcementCount).toBe(1);

    const item2 = addOrReinforceMemory("Students can export verified resume badges.", "platform_fact", "manual", ["resume", "badge"]);
    expect(item2.reinforcementCount).toBe(2);
  });

  it("should inject learned memory into system prompt context", () => {
    addOrReinforceMemory("The company hackathon starts on Friday.", "platform_fact", "manual", ["hackathon"]);
    const contextPrompt = buildLearnedMemoryContext();
    expect(contextPrompt).toContain("The company hackathon starts on Friday.");
    expect(contextPrompt).toContain("DYNAMICALLY LEARNED MEMORY");
  });

  it("should match fallback query to learned knowledge", () => {
    addOrReinforceMemory("The recruiter verification badge turns green upon admin approval.", "platform_fact", "manual", ["recruiter", "badge", "green"]);
    
    const match = findLearnedFallbackMatch("How do I know when the recruiter badge is approved?");
    expect(match).not.toBeNull();
    expect(match).toContain("turns green");
  });

  it("should allow deleting individual memories", () => {
    const item = addOrReinforceMemory("Temporary test note to be deleted.", "instruction", "manual");
    const beforeCount = getLearnedMemories().length;
    
    deleteLearnedMemory(item.id);
    const afterCount = getLearnedMemories().length;
    expect(afterCount).toBe(beforeCount - 1);
  });
});

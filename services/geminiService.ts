import { GoogleGenAI, Type, FunctionDeclaration, Tool, Schema } from "@google/genai";
import { CaseAnalysisResult, ResearchResult, TrialPersona, Jurisdiction } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a legal case using the advanced thinking model for deep reasoning.
 */
export const analyzeCase = async (caseDetails: string): Promise<CaseAnalysisResult> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "A professional executive summary of the case." },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key legal strengths." },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key legal weaknesses." },
      verdictProbability: { type: Type.INTEGER, description: "Estimated probability of success (0-100)." },
      keyPrecedents: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant case law or precedents." },
      strategy: { type: Type.STRING, description: "Comprehensive legal strategy recommendation." }
    },
    required: ["summary", "strengths", "weaknesses", "verdictProbability", "keyPrecedents", "strategy"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Act as a senior partner at a top-tier law firm. Analyze the following case details. Provide a strategic, objective assessment suitable for client review.
      
      Case Details:
      ${caseDetails}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 2048 },
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CaseAnalysisResult;
    }
    throw new Error("No response generated");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * Performs legal research using Google Search Grounding with Jurisdiction context.
 */
export const conductLegalResearch = async (query: string, jurisdiction: Jurisdiction): Promise<ResearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are a legal researcher. Find relevant case law, statutes, or legal news.
      
      Jurisdiction: ${jurisdiction}
      Query: "${query}"
      
      Prioritize recent and authoritative sources within the specified jurisdiction. Be precise.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "No results found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract URIs from grounding chunks
    const sources = chunks
      .map(chunk => chunk.web)
      .filter(web => web !== undefined && web.uri)
      .map(web => ({ title: web!.title, uri: web!.uri }));

    // Remove duplicates
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

    return { text, sources: uniqueSources };
  } catch (error) {
    console.error("Research failed:", error);
    throw error;
  }
};

/**
 * Generates a legal argument (Opening/Closing/Motion).
 */
export const generateLegalArgument = async (type: string, facts: string, keyPoints: string, jurisdiction: string, tone: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Draft a professional ${type}.
      
      Jurisdiction: ${jurisdiction}
      Tone: ${tone}
      
      Facts: ${facts}
      
      Key Arguments to Emphasize: ${keyPoints}
      
      Format the output using clear headings and standard legal formatting where appropriate.`,
      config: {
        maxOutputTokens: 4000,
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Generation failed:", error);
    throw error;
  }
};

/**
 * Critiques a specific argument or question during mock trial.
 */
export const critiqueArgument = async (context: string, lastUserMessage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a senior trial advocacy coach. Briefly critique the following statement/question made by an attorney in a mock trial.
      
      Case Context: ${context}
      Attorney Statement: "${lastUserMessage}"
      
      Provide 1-2 sentences of constructive feedback on effectiveness, objection risks, or phrasing.`,
    });
    return response.text || "No critique available.";
  } catch (error) {
    return "Analysis unavailable.";
  }
};

/**
 * Initializes a chat session for mock trials.
 */
export const createMockTrialSession = (persona: TrialPersona, context: string) => {
  let systemInstruction = "";
  
  switch (persona) {
    case TrialPersona.JUDGE:
      systemInstruction = `You are a strict Judge. Rules of Evidence apply. Rule on objections immediately. Context: ${context}`;
      break;
    case TrialPersona.OPPOSING_COUNSEL:
      systemInstruction = `You are Opposing Counsel. Aggressive, objects frequently (Hearsay, Speculation, Foundation). Context: ${context}`;
      break;
    case TrialPersona.WITNESS:
      systemInstruction = `You are a Hostile Witness. Do not volunteer info. Be evasive but do not lie directly if cornered. Context: ${context}`;
      break;
  }

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: { systemInstruction }
  });
};

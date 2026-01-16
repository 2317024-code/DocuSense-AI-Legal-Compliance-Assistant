
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeDocument = async (
  query: string,
  context: string,
  history: { role: string; content: string }[]
): Promise<string> => {
  const ai = getAI();
  
  const systemInstruction = `
    You are DocuSense, a high-level Legal & Compliance AI Assistant. 
    Your goal is to help small business owners understand complex legal documents.
    
    CRITICAL RULES:
    1. Base your answers ONLY on the provided document context below.
    2. If the information is not in the context, clearly state that you cannot find it in the uploaded document.
    3. Use plain English to explain complex legalese.
    4. Provide specific clause references if available.
    5. Do not provide actual legal advice; include a disclaimer when necessary.
    
    CONTEXT:
    ---
    ${context}
    ---
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.2, // Lower temperature for factual accuracy
        topP: 0.8,
        topK: 40,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

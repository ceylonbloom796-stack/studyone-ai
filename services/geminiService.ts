
import { GoogleGenAI, Type } from "@google/genai";
import { StudySet, Language, SearchSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchSources = async (query: string, lang: Language): Promise<SearchSource[]> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Find high-quality educational PDFs, books, or academic resources related to: "${query}". 
    Return a list of specific sources with their titles and brief descriptions of what they cover.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const sources: SearchSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "Educational Resource",
          uri: chunk.web.uri,
          snippet: "Highly relevant study material found via Google Search grounding."
        });
      }
    });
  }

  // If no chunks found, try to parse from text as fallback
  if (sources.length === 0) {
     // Fallback if grounding is sparse but text has info
     return [{ title: "General Search Result", uri: "https://google.com/search?q=" + encodeURIComponent(query), snippet: "View more resources on the web." }];
  }

  return sources;
};

export const generateStudySet = async (
  content: string | { data: string; mimeType: string }[] | { topic: string, sourceUri: string }, 
  lang: Language,
  numMcqs: number = 5
): Promise<StudySet> => {
  const model = 'gemini-3-flash-preview';
  
  let languageInstruction = "";
  if (lang === 'si') {
    languageInstruction = "Generate all content in talkative/colloquial Sinhala (as spoken naturally in everyday conversation). Avoid formal literary Sinhala. Use friendly, easy-to-understand spoken terms.";
  } else if (lang === 'ta') {
    languageInstruction = "Generate all content in talkative/colloquial Tamil (as spoken naturally in everyday conversation). Avoid formal literary/pure Tamil. Use casual, spoken Tamil terms.";
  } else {
    languageInstruction = "Generate all content in English.";
  }

  let prompt = `Analyze the provided content and generate a comprehensive study set.
    REQUIRED OUTPUT:
    1. A title for the study set.
    2. A detailed summary.
    3. 8-10 flashcards for key concepts.
    4. EXACTLY ${numMcqs} multiple-choice questions. No more, no less than ${numMcqs}.
    
    LANGUAGE INSTRUCTION: ${languageInstruction}`;

  const parts: any[] = [];
  
  if (typeof content === 'string') {
    parts.push({ text: `${prompt}\n\nCONTENT:\n${content}` });
  } else if (Array.isArray(content)) {
    content.forEach(img => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      });
    });
    parts.push({ text: prompt });
  } else {
    // Topic/Source based search study
    prompt += `\n\nStudy this specific topic: "${content.topic}" using information from the following source: ${content.sourceUri}. If needed, use Google Search to get deeper details about this specific resource to ensure the study set is accurate.`;
    parts.push({ text: prompt });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction: `You are an expert educational tutor. Your job is to transform raw input or search topics into structured study materials. You MUST generate exactly ${numMcqs} multiple-choice questions.`,
      tools: (content as any).topic ? [{ googleSearch: {} }] : [], // Only use search tool if topic-based
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          },
          mcqs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswerIndex", "explanation"]
            }
          }
        },
        required: ["title", "summary", "flashcards", "mcqs"]
      }
    }
  });

  const result = JSON.parse(response.text || '{}');
  return result;
};

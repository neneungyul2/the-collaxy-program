import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NodeType, ExpansionResult, BattleScenario, DifficultyLevel, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

// --- HELPERS ---

const getDifficultyPrompt = (level: DifficultyLevel) => {
  switch (level) {
    case 'ELEMENTARY': return "Ensure all words are suitable for Elementary School students (Grade 1-6). Very basic and fundamental vocabulary only.";
    case 'MIDDLE': return "Ensure all words are suitable for Middle School students. Common daily vocabulary.";
    case 'HIGH': return "Ensure all words are suitable for High School students (Academic/Exam prep level).";
    case 'NATIVE': default: return "Use natural, frequent collocations used by native speakers. Range from daily to professional.";
  }
};

const getLanguageInstruction = (lang: Language) => {
  if (lang === 'KO') {
    return "Provide user-facing explanations, hints, feedback, or connection reasons in Korean (Hangul). However, keep the target English vocabulary words in English.";
  }
  return "Provide all content in English.";
};

// --- INITIALIZATION LOGIC ---

export const getStartingWord = async (level: DifficultyLevel, lang: Language = 'EN'): Promise<string> => {
  try {
    const prompt = `
      Suggest a SINGLE, interesting, high-frequency English root word to start a vocabulary map.
      ${getDifficultyPrompt(level)}
      Return JSON: { "word": "string" }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { word: { type: Type.STRING } },
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return json.word || "Dream";
  } catch (error) {
    return "Start";
  }
};

// --- EXPANSION LOGIC ---

export const expandTerritory = async (centerWord: string, level: DifficultyLevel, lang: Language = 'EN'): Promise<ExpansionResult[]> => {
  try {
    const prompt = `
      I am building a vocabulary knowledge graph. 
      The user is focusing on the word "${centerWord}".
      Generate 4-6 highly relevant English collocations or related concept words that connect to "${centerWord}".
      
      STRICT CONSTRAINTS: 
      1. ${getDifficultyPrompt(level)}
      2. If the word is too difficult for this level, choose a simpler related concept.
      3. The result words must NOT contain the center word "${centerWord}" as a substring. (e.g. if center is 'run', do not return 'runner').
      
      Language Instruction: ${getLanguageInstruction(lang)}
      If the language is Korean, the 'connectionReason' MUST be in Korean.
      
      Rules:
      1. Vary the types (Verbs that go with the noun, Adjectives that describe it, etc.).
      2. Return ONLY valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["NOUN", "VERB", "ADJECTIVE", "PHRASE"] },
              connectionReason: { type: Type.STRING }
            },
            required: ["word", "type", "connectionReason"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const data = JSON.parse(jsonText);
    
    // Map string types to Enum
    return data.map((item: any) => ({
      word: item.word,
      type: item.type as NodeType,
      connectionReason: item.connectionReason
    }));

  } catch (error) {
    console.error("Expansion Error:", error);
    return [];
  }
};

// --- BATTLE SCENARIO LOGIC ---

export const generateBattleScenario = async (sourceWord: string, targetWord: string, level: DifficultyLevel, lang: Language = 'EN'): Promise<BattleScenario> => {
  try {
    const prompt = `
      Create a fill-in-the-blank language learning scenario.
      The user knows "${sourceWord}" and is trying to learn/connect "${targetWord}".
      
      ${getDifficultyPrompt(level)}
      The sentence context should be understandable for this level.
      
      Language Instruction: ${getLanguageInstruction(lang)}
      If the language is Korean, the 'hint' MUST be in Korean. The context sentence should stay in English.
      
      Constraints:
      1. Create a short context sentence where "${targetWord}" is the missing word (or part of the missing phrase) that connects naturally with "${sourceWord}".
      2. The 'hint' MUST NOT contain the answer word "${targetWord}" (or parts of it). It should describe it or give a synonym/antonym clue without giving away the answer.
      
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetWord: { type: Type.STRING, description: "The word to be filled in" },
            contextSentence: { type: Type.STRING, description: "The sentence with a blank (use _____ for blank)" },
            correctAnswer: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["EASY", "MEDIUM", "HARD"] },
            hint: { type: Type.STRING }
          },
          required: ["targetWord", "contextSentence", "correctAnswer", "difficulty", "hint"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as BattleScenario;

  } catch (error) {
    console.error("Battle Gen Error:", error);
    // Fallback scenario
    return {
      targetWord: targetWord,
      contextSentence: `Please type the word related to ${sourceWord}: _____`,
      correctAnswer: targetWord,
      difficulty: 'EASY',
      hint: lang === 'KO' ? `${targetWord.charAt(0)}로 시작합니다` : `It starts with ${targetWord.charAt(0)}`
    };
  }
};

// --- VALIDATION LOGIC ---

export const validateAnswer = async (userAnswer: string, context: string, expected: string, lang: Language = 'EN'): Promise<{ isCorrect: boolean; feedback: string }> => {
  try {
    const prompt = `
      Context: "${context}"
      Expected Answer: "${expected}"
      User Answer: "${userAnswer}"
      
      Task: Verify if the User Answer matches the Expected Answer.
      
      Strictness Level: HIGH. 
      1. Accept exact matches (case-insensitive).
      2. Accept valid inflections (e.g., 'run' vs 'running' if it fits the grammar).
      3. REJECT synonyms that are different root words (e.g., if expected is 'obtain', reject 'get').
      4. REJECT if the meaning is correct but it doesn't fit the collocation/phrase structure.
      
      Language Instruction: ${getLanguageInstruction(lang)}
      If the language is Korean, the 'feedback' MUST be in Korean.
      
      CRITICAL INSTRUCTION:
      If the user's answer is INCORRECT, do NOT reveal the correct answer in the 'feedback'.
      Instead, provide a helpful hint about *why* it is wrong (e.g., "Wrong part of speech", "Close, but we need a formal word", "Think about the preposition").
      
      Return JSON: { "isCorrect": boolean, "feedback": string }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isCorrect", "feedback"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    // Simple fallback
    const isCorrect = userAnswer.toLowerCase().trim() === expected.toLowerCase().trim();
    return {
      isCorrect,
      feedback: isCorrect ? (lang === 'KO' ? "정답입니다!" : "Correct!") : (lang === 'KO' ? "다시 시도해보세요." : "Not quite right.")
    };
  }
};
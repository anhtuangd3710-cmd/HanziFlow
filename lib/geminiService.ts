import { GoogleGenAI, Type } from "@google/genai";
import { getApiKey } from './api';

// Custom error to signal that the API key is missing or invalid.
export const API_KEY_FAILURE = 'API_KEY_FAILURE';

// Cache for API key to avoid repeated backend calls
let cachedApiKey: string | null = null;
let apiKeyFetched = false;

// Helper to get the correct API client (user's or developer's)
const getApiClient = async () => {
    let apiKey: string | null = null;

    // Use cached key if already fetched
    if (apiKeyFetched) {
        apiKey = cachedApiKey;
    } else {
        // Try to get user's API key from backend (only once)
        if (typeof window !== 'undefined') {
            try {
                const response = await getApiKey();
                apiKey = response.apiKey;
                cachedApiKey = apiKey;
                apiKeyFetched = true;
            } catch (error) {
                console.warn("Could not fetch user API key from backend:", error);
                apiKeyFetched = true; // Mark as fetched even on error to avoid retries
            }
        }
    }

    // Fallback to environment variable if no user key
    if (!apiKey) {
        apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
    }

    if (!apiKey) {
        console.warn("No API key found. Prompting user.");
        throw new Error(API_KEY_FAILURE);
    }
    return new GoogleGenAI({ apiKey });
};

// Function to clear API key cache (useful after user updates their key)
export const clearApiKeyCache = () => {
    cachedApiKey = null;
    apiKeyFetched = false;
};

// --- Text-to-Speech using Web Speech API ---
export const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Sorry, your browser does not support text-to-speech.");
    }
};

// --- Gemini API ---
export const generateExampleSentence = async (word: { hanzi: string, pinyin: string, meaning: string }): Promise<string | null> => {
    const prompt = `Create a simple and clear example sentence in Chinese for a beginner learning the word "${word.hanzi}" (pinyin: ${word.pinyin}), which means "${word.meaning}". The sentence should use common vocabulary. Provide only the Chinese sentence with its pinyin and the English translation below it, like this:
Chinese sentence (Pinyin)
English Translation`;

    try {
        const ai = await getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text ? response.text.trim() : null;
    } catch (error) {
        console.error("Error generating example sentence:", error);
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            if (message.includes('api key not valid') || message.includes('permission denied') || message.includes('quota') || message.includes('api_key')) {
                throw new Error(API_KEY_FAILURE);
            }
        }
        alert("Failed to generate an example sentence. The AI model may be temporarily unavailable.");
        return null;
    }
};

const extractJsonFromMarkdown = (text: string): any => {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = match ? match[1] : text;
    try {
        return JSON.parse(jsonString.trim());
    } catch (e) {
        console.error("Failed to parse JSON from model response:", e);
        console.error("Original text from model:", text);
        throw new Error("Model returned invalid JSON format.");
    }
};

export const generateVocabSet = async (topic: string, count: number): Promise<any[] | null> => {
    const prompt = `Generate a list of ${count} Chinese vocabulary words related to the topic "${topic}".
The words should be suitable for a beginner to intermediate learner.
For each word, provide the Hanzi, standard Pinyin with correct tone marks, a concise English meaning, and a simple example sentence in Chinese.
IMPORTANT: Respond ONLY with a valid JSON array of objects inside a single markdown code block (\`\`\`json ... \`\`\`). Do not include any other text, explanation, or introductory phrases.
Each object in the array must have these exact keys: "hanzi", "pinyin", "meaning", "exampleSentence".`;

    try {
        const ai = await getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        if (response.promptFeedback?.blockReason) {
            console.error("AI response was blocked:", response.promptFeedback);
            throw new Error(`The request was blocked for safety reasons: ${response.promptFeedback.blockReasonMessage || response.promptFeedback.blockReason}`);
        }

        if (!response.text) {
            throw new Error("No response text received from AI model");
        }

        const jsonResponse = extractJsonFromMarkdown(response.text);
        if (!Array.isArray(jsonResponse)) {
            console.error("Parsed JSON is not an array:", jsonResponse);
            throw new Error("AI did not return the expected list format.");
        }
        return jsonResponse;

    } catch (error) {
        console.error("Error generating vocab set:", error);
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            if (message.includes('api key not valid') || message.includes('permission denied') || message.includes('quota') || message.includes('api_key')) {
                throw new Error(API_KEY_FAILURE);
            }

            let errorMessage = "Failed to generate a vocabulary set with AI. The model may be temporarily unavailable. Please try again later.";
            if (error.message.startsWith("Model returned") || error.message.startsWith("AI did not return")) {
                errorMessage = "Failed to generate a valid vocabulary set with AI. The AI's response was not in the correct format. Please try a different topic or try again later.";
            } else if (error.message.startsWith("The request was blocked")) {
                errorMessage = `AI generation failed: ${error.message}. Please try a different topic.`;
            }
            alert(errorMessage);
        } else {
             alert("An unknown error occurred while generating the vocabulary set.");
        }
        return null;
    }
};

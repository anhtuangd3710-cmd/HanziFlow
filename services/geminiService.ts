
import { GoogleGenAI } from "@google/genai";

// --- Text-to-Speech using Web Speech API ---
// This is a browser-native feature, more reliable than external APIs.
export const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
        // Cancel any previous speech to avoid overlap
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN'; // Set language to Chinese
        utterance.rate = 0.9; // Slightly slower for clarity
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
        // FIX: Per guidelines, API key must be from process.env.API_KEY.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating example sentence:", error);
        // FIX: Updated alert message to not mention API key, per guidelines.
        alert("Failed to generate an example sentence. Please try again later.");
        return null;
    }
};



// import { GoogleGenAI, Type } from "@google/genai";

// // --- Text-to-Speech using Web Speech API ---
// // This is a browser-native feature, more reliable than external APIs.
// export const speakText = (text: string) => {
//     if ('speechSynthesis' in window) {
//         // Cancel any previous speech to avoid overlap
//         window.speechSynthesis.cancel();
        
//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.lang = 'zh-CN'; // Set language to Chinese
//         utterance.rate = 0.9; // Slightly slower for clarity
//         window.speechSynthesis.speak(utterance);
//     } else {
//         alert("Sorry, your browser does not support text-to-speech.");
//     }
// };

// // --- Gemini API ---
// export const generateExampleSentence = async (word: { hanzi: string, pinyin: string, meaning: string }): Promise<string | null> => {
//     const prompt = `Create a simple and clear example sentence in Chinese for a beginner learning the word "${word.hanzi}" (pinyin: ${word.pinyin}), which means "${word.meaning}". The sentence should use common vocabulary. Provide only the Chinese sentence with its pinyin and the English translation below it, like this:
// Chinese sentence (Pinyin)
// English Translation`;

//     try {
//         // FIX: Per guidelines, API key must be from process.env.API_KEY.
//         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
//         const response = await ai.models.generateContent({
//             model: 'gemini-2.5-flash',
//             contents: prompt,
//         });

//         return response.text.trim();
//     } catch (error) {
//         console.error("Error generating example sentence:", error);
//         // FIX: Updated alert message to not mention API key, per guidelines.
//         alert("Failed to generate an example sentence. Please try again later.");
//         return null;
//     }
// };

// const extractJsonFromMarkdown = (text: string): any => {
//     const match = text.match(/```json\s*([\s\S]*?)\s*```/);
//     const jsonString = match ? match[1] : text;
//     try {
//         return JSON.parse(jsonString.trim());
//     } catch (e) {
//         console.error("Failed to parse JSON from model response:", e);
//         console.error("Original text from model:", text);
//         throw new Error("Model returned invalid JSON format.");
//     }
// };


// export const generateVocabSet = async (topic: string, count: number): Promise<any[] | null> => {
//     const prompt = `Generate a list of ${count} Chinese vocabulary words related to the topic "${topic}". The words should be suitable for a beginner to intermediate learner. For each word, provide the Hanzi, standard Pinyin with correct tone marks, a concise English meaning, and a simple example sentence in Chinese.`;

//     try {
//         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
//         const response = await ai.models.generateContent({
//             model: 'gemini-2.5-flash',
//             contents: prompt,
//             config: {
//                 responseMimeType: "application/json",
//                 responseSchema: {
//                     type: Type.ARRAY,
//                     description: "A list of generated vocabulary words.",
//                     items: {
//                         type: Type.OBJECT,
//                         properties: {
//                             hanzi: { type: Type.STRING, description: "The word in Chinese characters." },
//                             pinyin: { type: Type.STRING, description: "The Pinyin pronunciation with tone marks." },
//                             meaning: { type: Type.STRING, description: "The English meaning of the word." },
//                             exampleSentence: { type: Type.STRING, description: "A simple example sentence in Chinese." }
//                         },
//                         required: ["hanzi", "pinyin", "meaning", "exampleSentence"]
//                     }
//                 },
//             },
//         });

//         if (response.promptFeedback?.blockReason) {
//             console.error("AI response was blocked:", response.promptFeedback);
//             throw new Error(`The request was blocked for safety reasons: ${response.promptFeedback.blockReasonMessage || response.promptFeedback.blockReason}`);
//         }

//         const jsonResponse = extractJsonFromMarkdown(response.text);
//         if (!Array.isArray(jsonResponse)) {
//             console.error("Parsed JSON is not an array:", jsonResponse);
//             throw new Error("AI did not return the expected list format.");
//         }
//         return jsonResponse;

//     } catch (error) {
//         console.error("Error generating vocab set:", error);
//         let errorMessage = "Failed to generate a vocabulary set with AI. The model may be temporarily unavailable. Please try again later.";
//         if (error instanceof Error) {
//             if (error.message.startsWith("Model returned") || error.message.startsWith("AI did not return")) {
//                 errorMessage = "Failed to generate a valid vocabulary set with AI. The AI's response was not in the correct format. Please try a different topic or try again later.";
//             } else if (error.message.startsWith("The request was blocked")) {
//                 errorMessage = `AI generation failed: ${error.message}. Please try a different topic.`;
//             }
//         }
//         alert(errorMessage);
//         return null;
//     }
// };




import { GoogleGenAI, Type } from "@google/genai";

// Custom error to signal that the API key is missing or invalid.
export const API_KEY_FAILURE = 'API_KEY_FAILURE';

// Helper to get the correct API client (user's or developer's)
const getApiClient = () => {
    const userApiKey = localStorage.getItem('gemini_api_key');
    // Use user's key if available, otherwise fall back to the environment variable.
    const apiKey = userApiKey || process.env.API_KEY;

    if (!apiKey) {
        console.warn("No API key found. Prompting user.");
        throw new Error(API_KEY_FAILURE);
    }
    return new GoogleGenAI({ apiKey });
};

// --- Text-to-Speech using Web Speech API ---
export const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
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
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
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
    const prompt = `Generate a list of ${count} Chinese vocabulary words related to the topic "${topic}". The words should be suitable for a beginner to intermediate learner. For each word, provide the Hanzi, standard Pinyin with correct tone marks, a concise English meaning, and a simple example sentence in Chinese.`;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    description: "A list of generated vocabulary words.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            hanzi: { type: Type.STRING, description: "The word in Chinese characters." },
                            pinyin: { type: Type.STRING, description: "The Pinyin pronunciation with tone marks." },
                            meaning: { type: Type.STRING, description: "The English meaning of the word." },
                            exampleSentence: { type: Type.STRING, description: "A simple example sentence in Chinese." }
                        },
                        required: ["hanzi", "pinyin", "meaning", "exampleSentence"]
                    }
                },
            },
        });

        if (response.promptFeedback?.blockReason) {
            console.error("AI response was blocked:", response.promptFeedback);
            throw new Error(`The request was blocked for safety reasons: ${response.promptFeedback.blockReasonMessage || response.promptFeedback.blockReason}`);
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

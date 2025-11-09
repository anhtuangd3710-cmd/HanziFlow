import { GoogleGenAI } from "@google/genai";

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



export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
    try {
        const encodedText = encodeURIComponent(text);
        // Using the web's unofficial Google Translate TTS endpoint. No API key needed.
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=zh-CN&client=tw-ob`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        // The browser's native decodeAudioData can handle the MP3 format from this endpoint.
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        return audioBuffer;
    } catch (error) {
        console.error("Error generating speech with Google Translate:", error);
        alert("Failed to generate pronunciation. Please try again.");
        return null;
    }
};

export const playAudioBuffer = (buffer: AudioBuffer) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
};

export const generateExampleSentence = async (word: { hanzi: string, pinyin: string, meaning: string }): Promise<string | null> => {
    console.log(process.env.API_KEY)
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        alert("Gemini API key is not configured. AI features are disabled.");
        return null;
    }

    const prompt = `Create a simple and clear example sentence in Chinese for a beginner learning the word "${word.hanzi}" (pinyin: ${word.pinyin}), which means "${word.meaning}". The sentence should use common vocabulary. Provide only the Chinese sentence with its pinyin and the English translation below it, like this:
Chinese sentence (Pinyin)
Vietnamese Translation`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating example sentence:", error);
        alert("Failed to generate an example sentence. Please try again.");
        return null;
    }
};
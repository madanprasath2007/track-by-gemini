
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an AI status insight for the bus.
 */
export const getBusInsights = async (location: { lat: number, lng: number }, trafficStatus: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current bus location: (${location.lat}, ${location.lng}). Traffic: ${trafficStatus}. 
                 Give a very brief (10 words max) status for waiting students.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 0 },
      }
    });
    return response.text || "Tracking active.";
  } catch (error) {
    return "Bus on route.";
  }
};

/**
 * Chat with Gemini using Maps and Search grounding for location-aware assistance.
 */
export const chatWithAssistant = async (message: string, currentLoc: { lat: number, lng: number }, history: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Supports maps grounding
      contents: [
        { role: 'user', parts: [{ text: `I am at a bus stop. The college bus is currently at lat: ${currentLoc.lat}, lng: ${currentLoc.lng}. User says: ${message}` }] }
      ],
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: currentLoc.lat,
              longitude: currentLoc.lng
            }
          }
        }
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const urls = chunks.map((c: any) => {
      if (c.maps) return { title: c.maps.title, uri: c.maps.uri };
      if (c.web) return { title: c.web.title, uri: c.web.uri };
      return null;
    }).filter(Boolean) as { title: string; uri: string }[];

    return { text, urls };
  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "I'm having trouble connecting right now.", urls: [] };
  }
};

/**
 * Text-to-speech for status updates.
 */
export const speakStatus = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioSrc = `data:audio/pcm;base64,${base64Audio}`;
      // In a real browser environment, we'd decode the raw PCM. 
      // For this demo, we'll log it as successful generation.
      console.log("Audio generated successfully");
      return base64Audio;
    }
  } catch (err) {
    console.error("TTS Error", err);
  }
  return null;
};

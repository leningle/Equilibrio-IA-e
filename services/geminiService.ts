
import { GoogleGenAI, Modality } from "@google/genai";
import { ModelType } from "../types";

// Initialize the client
// API key is guaranteed to be in process.env.API_KEY per instructions
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateTextParams {
  prompt: string;
  modelType: ModelType;
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
}

export const generateTextResponse = async ({ prompt, modelType, history }: GenerateTextParams): Promise<string> => {
  // Using guidelines for flash lite: 'gemini-flash-lite-latest'
  let modelName = 'gemini-flash-lite-latest';
  let config: any = {};

  switch (modelType) {
    case ModelType.FLASH_LITE:
      modelName = 'gemini-flash-lite-latest';
      break;
    case ModelType.PRO:
      // Using guidelines for gemini pro: 'gemini-3-pro-preview'
      modelName = 'gemini-3-pro-preview';
      break;
    case ModelType.THINKING:
      // Using guidelines for gemini pro: 'gemini-3-pro-preview'
      modelName = 'gemini-3-pro-preview';
      config = {
        thinkingConfig: { thinkingBudget: 32768 },
      };
      // Important: Do not set maxOutputTokens when using thinking
      break;
  }

  try {
    // If we have history, use chat
    if (history && history.length > 0) {
      const chat = ai.chats.create({
        model: modelName,
        config: config,
        history: history,
      });
      
      const result = await chat.sendMessage({ message: prompt });
      return result.text || "No response generated.";
    } 
    // Otherwise single generation
    else {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: config,
      });
      return response.text || "No response generated.";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateTTS = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say calmly and soothingly for a meditation guide: ${text}` }] }],
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
    return base64Audio;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return undefined;
  }
};

export const generateAvatarImage = async (description: string, referenceImageBase64?: string): Promise<string | null> => {
  try {
    const parts: any[] = [];

    // If a reference image is provided (User's current photo), we use it to guide the generation
    if (referenceImageBase64) {
      // Remove data URL header if present to get raw base64
      const base64Data = referenceImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg', // Standardizing on jpeg for API simplicity, normally should match source
        },
      });

      // The prompt changes to be an instruction to TRANSFORM the image
      parts.push({
        text: `Based on this person, generate a photorealistic "Future Self" version of them. 
        They should look exactly like this person but slightly older, wiser, more charismatic, healthy, fit, and successful. 
        The expression should be calm, confident, and motivating. 
        Lighting should be cinematic and warm (golden hour). 
        The background should be clean and professional or professional nature. 
        Maintain facial identity but enhance the "aura" to be inspiring.`
      });
    } else {
      // Text-only generation fallback
      parts.push({ 
        text: `Generate a high-quality, inspiring, realistic profile portrait of a person matching this description: "${description}". 
        The style should be cinematic, professional, and motivating. 
        The person should look confident and successful. 
        Focus on the face and upper body, suitable for a circular avatar.` 
      });
    }

    // Using gemini-2.5-flash-image which supports image editing/variation via prompting per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
    });

    // Parse response for image data
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

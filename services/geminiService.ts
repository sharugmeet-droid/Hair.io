
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { HairstyleSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Analyzes the uploaded face and suggests hairstyles based on facial features.
 */
export const suggestHairstyles = async (base64Image: string): Promise<HairstyleSuggestion[]> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = "Analyze the person's face shape and features in the image. Suggest 3-4 diverse hairstyles that would look good on them. Provide the name of the style, a short description, and the reason why it fits their face shape/features.";

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            styleName: { type: Type.STRING },
            description: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ["styleName", "description", "reason"],
        },
      },
    },
  });

  try {
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse suggestions:", error);
    return [];
  }
};

/**
 * Edits the image to apply the requested hairstyle.
 */
export const applyHairstyle = async (base64Image: string, hairstyle: string): Promise<string | null> => {
  const model = 'gemini-2.5-flash-image';
  
  const prompt = `Change the person's hair in this image to the following style: ${hairstyle}. Ensure the face, clothing, and background remain exactly as they are in the original photo. Only the hair should be modified to appear as the specified style in a realistic way.`;

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  return null;
};

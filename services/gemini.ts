import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateEditedImage = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Remove data URL prefix if present to get raw base64
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png', // Gemini handles standard formats well; defaulting to PNG for consistency
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error("No image generated.");
    }

    const generatedPart = parts.find(p => p.inlineData);
    if (generatedPart && generatedPart.inlineData) {
      return `data:image/png;base64,${generatedPart.inlineData.data}`;
    }

    throw new Error("Unexpected response format from Gemini.");

  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

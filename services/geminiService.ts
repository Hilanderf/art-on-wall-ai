// FIX: Implemented the Gemini API service to generate artwork from an image.
import { GoogleGenAI, Modality, Part } from "@google/genai";
import { ArtworkType, FrameType } from '../types';
import { fileToGenerativePart } from '../utils/fileUtils';

// Per guidelines, initialize once and assume API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const getPrompt = (artworkType: ArtworkType, frameType: FrameType): string => {
  if (artworkType === ArtworkType.Statue) {
    // This prompt is very specific to ensure the AI understands the task.
    // It asks to isolate the statue, place it on a pedestal in a specific environment, and frame the shot correctly.
    return "Tâche impérative : Isoler la statue de l'image d'origine. Ignorer complètement l'arrière-plan. Placer la statue sur un socle blanc épuré. Le tout doit être dans une pièce blanche vide et très lumineuse. Le plus important : le cadrage doit être un plan très rapproché (gros plan) de la statue sur son socle. La statue doit remplir la quasi-totalité de la hauteur de l'image. Le but est de voir les détails de la sculpture, pas la pièce. L'image finale doit être photoréaliste.";
  }

  // Default to Painting
  let prompt = "Tâche impérative : Prenez le tableau de cette image, redressez-le parfaitement et placez-le sur un mur blanc, propre et plat. La prise de vue doit être parfaitement frontale. L'éclairage doit être doux et uniforme. Rendez également les couleurs du tableau plus vives et éclatantes. Le plus important : le cadrage doit être serré sur le tableau. Le tableau (avec son cadre s'il est demandé) doit occuper la majeure partie de l'image, ne laissant qu'une petite marge de mur blanc visible tout autour.";

  switch (frameType) {
    case FrameType.Black:
      prompt += " Ajoutez un cadre fin et noir autour du tableau.";
      break;
    case FrameType.White:
      prompt += " Ajoutez un cadre fin et blanc autour du tableau.";
      break;
    case FrameType.None:
      // No frame needed.
      break;
  }

  prompt += " L'image finale doit être une photo photoréaliste et de haute qualité.";
  return prompt;
};

export const generateArtwork = async (
  imageFile: File,
  artworkType: ArtworkType,
  frameType: FrameType
): Promise<{ imageUrl: string | null; text: string | null }> => {
  try {
    const imagePart: Part = await fileToGenerativePart(imageFile);
    const promptText = getPrompt(artworkType, frameType);
    const textPart = { text: promptText };

    // As per guidelines for image editing, use 'gemini-2.5-flash-image-preview'.
    const model = 'gemini-2.5-flash-image-preview';

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        // As per guidelines, both Modality.IMAGE and Modality.TEXT must be included for image editing.
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let imageUrl: string | null = null;
    let text: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
      // Check for safety blocks
      if (response.candidates[0].finishReason === 'SAFETY') {
        throw new Error("L'image générée a été bloquée pour des raisons de sécurité. Essayez avec une autre image.");
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
        } else if (part.text) {
          text = part.text;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("Aucune image n'a été trouvée dans la réponse de l'API.");
    }

    return { imageUrl, text };
  } catch (error) {
    console.error("Error processing image:", error);
    if (error instanceof Error) {
      // Re-throw the error to be handled by the UI component.
      throw new Error(error.message || 'Une erreur est survenue lors de la génération.');
    }
    throw new Error('Une erreur inconnue est survenue lors de la génération.');
  }
};

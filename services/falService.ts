import { fal } from "@fal-ai/client";
import { ArtworkType, FrameType, WallType, RoomType, PedestalType, ModelType, AspectRatio } from '../types';

export interface ArtworkGenerationResult {
  imageUrl: string | null;
  text: string | null;
  downloadName: string | null;
  blob: Blob | null;
  sourceUrl: string | null;
}

export interface LastFrameGenerationResult {
  imageUrl: string | null;
  sourceUrl: string | null;
}

export interface VideoGenerationResult {
  videoUrl: string | null;
  sourceUrl: string | null;
}

// Configure FAL client with API key using environment variable
const FAL_API_KEY = process.env.FAL_API_KEY;

// Verify API key is properly loaded
console.log("FAL API Key configured:", !!FAL_API_KEY);
console.log("FAL API Key length:", FAL_API_KEY?.length);

const getPrompt = (artworkType: ArtworkType, frameType: FrameType, wallType: WallType, roomType: RoomType, pedestalType: PedestalType): string => {
  if (artworkType === ArtworkType.Statue) {
    const roomColor = roomType === RoomType.Black ? "pièce noire" : roomType === RoomType.Gray ? "pièce grise" : "pièce blanche";
    const pedestalColor = pedestalType === PedestalType.Black ? "socle noir" : pedestalType === PedestalType.Gray ? "socle gris" : "socle blanc";
    return `Tâche impérative : Isoler la statue de l'image d'origine. Ignorer complètement l'arrière-plan. Placer la statue sur un ${pedestalColor} épuré. Le tout doit être dans une ${roomColor} vide et très lumineuse. Le plus important : le cadrage doit être un plan très rapproché (gros plan) de la statue sur son socle. La statue doit remplir la quasi-totalité de la hauteur de l'image. Le but est de voir les détails de la sculpture, pas la pièce. L'image finale doit être photoréaliste.`;
  }

  // Default to Painting
  const wallColor = wallType === WallType.Black ? "mur noir" : wallType === WallType.Gray ? "mur gris" : "mur blanc";
  let prompt = `Tâche impérative : Prenez le tableau de cette image, redressez-le parfaitement et placez-le sur un ${wallColor}, propre et plat. La prise de vue doit être parfaitement frontale. L'éclairage doit être doux et uniforme. Rendez également les couleurs du tableau plus vives et éclatantes. Le plus important : le cadrage doit être serré sur le tableau. Le tableau (avec son cadre s'il est demandé) doit occuper la majeure partie de l'image, ne laissant qu'une petite marge de ${wallColor} visible tout autour.`;

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

// Function to upload image to FAL and get URL
const uploadImageToFal = async (imageFile: File): Promise<string> => {
  try {
    console.log("Uploading file with name:", imageFile.name, "size:", imageFile.size);

    if (!FAL_API_KEY) {
      throw new Error("FAL API Key non configurée");
    }

    // Configure authentication for this specific request
    fal.config({
      credentials: FAL_API_KEY
    });

    const imageUrl = await fal.storage.upload(imageFile);
    console.log("Upload result URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading image to FAL:", error);
    throw new Error(`Erreur lors de l'upload de l'image: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// GPT Image 1.5 only supports: auto, 1024x1024, 1536x1024, 1024x1536
// Uses fixed 1024x1536 (2:3 portrait)
const getImageSizeForGptImage = (): string => {
  return '1024x1536';
};

// Seedream uses image_size with {width, height} or "auto_4K"
// Dimensions must be between 1920-4096, total pixels between 2560*1440 and 4096*4096
const getImageSizeForSeedream = (ratio: AspectRatio): { width: number; height: number } => {
  if (ratio === AspectRatio.Portrait) {
    // 9:16 ratio - portrait
    return { width: 1920, height: 3413 }; // ~9:16
  }
  // 3:4 ratio
  return { width: 2048, height: 2730 }; // ~3:4
};

// Qwen uses image_size with {width, height}
const getImageSizeForQwen = (ratio: AspectRatio): { width: number; height: number } => {
  if (ratio === AspectRatio.Portrait) {
    // 9:16 ratio - portrait
    return { width: 768, height: 1365 }; // ~9:16
  }
  // 3:4 ratio
  return { width: 1024, height: 1365 }; // ~3:4
};

export const generateArtwork = async (
  imageFile: File,
  artworkType: ArtworkType,
  frameType: FrameType,
  wallType: WallType,
  roomType: RoomType,
  pedestalType: PedestalType = PedestalType.White,
  modelType: ModelType = ModelType.NanoBananaNew,
  aspectRatio: AspectRatio = AspectRatio.Portrait
): Promise<ArtworkGenerationResult> => {
  try {
    console.log("Starting artwork generation with FAL...");
    console.log("API Key configured:", !!FAL_API_KEY);

    if (!FAL_API_KEY) {
      throw new Error("FAL API Key non configurée");
    }

    // Configure authentication
    fal.config({
      credentials: FAL_API_KEY
    });

    // Upload image to FAL storage
    console.log("Uploading image to FAL storage...");
    const imageUrl = await uploadImageToFal(imageFile);
    console.log("Image uploaded successfully:", imageUrl);

    // Get the prompt based on artwork, frame, wall, room and pedestal type
    const promptText = getPrompt(artworkType, frameType, wallType, roomType, pedestalType);
    console.log("Generated prompt:", promptText);

    // Determine model endpoint based on modelType
    let modelEndpoint: string;
    if (modelType === ModelType.NanoBananaNew) {
      modelEndpoint = "fal-ai/gemini-3-pro-image-preview/edit";
    } else if (modelType === ModelType.GptImage15) {
      modelEndpoint = "fal-ai/gpt-image-1.5/edit";
    } else if (modelType === ModelType.Seedream) {
      modelEndpoint = "fal-ai/bytedance/seedream/v4.5/edit";
    } else {
      modelEndpoint = "fal-ai/qwen-image-edit-2511";
    }

    // Build input based on model type
    let input: Record<string, unknown>;

    if (modelType === ModelType.NanoBananaNew) {
      // Nano Banana New (Gemini 3 Pro) input format
      input = {
        prompt: promptText,
        image_urls: [imageUrl],
        num_images: 1,
        aspect_ratio: aspectRatio,
        output_format: "png",
        resolution: "1K"
      };
    } else if (modelType === ModelType.GptImage15) {
      // GPT Image 1.5 input format - fixed ratio
      input = {
        prompt: promptText,
        image_urls: [imageUrl],
        num_images: 1,
        image_size: getImageSizeForGptImage(),
        quality: "high",
        input_fidelity: "high",
        output_format: "png"
      };
    } else if (modelType === ModelType.Seedream) {
      // Seedream 4.5 input format
      input = {
        prompt: promptText,
        image_urls: [imageUrl],
        num_images: 1,
        image_size: getImageSizeForSeedream(aspectRatio),
        enable_safety_checker: true
      };
    } else {
      // Qwen 2511 input format
      input = {
        prompt: promptText,
        image_urls: [imageUrl],
        num_images: 1,
        image_size: getImageSizeForQwen(aspectRatio),
        output_format: "png",
        enable_safety_checker: true
      };
    }

    // Call FAL API for image editing
    console.log("Calling FAL API for image editing...");
    console.log("Model:", modelEndpoint);
    console.log("Request payload:", input);

    const result = await fal.subscribe(modelEndpoint, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FAL API response:", result);

    // Extract the result
    const data = result.data as {
      images: Array<{ url: string }>;
      description: string;
    };

    if (!data || !data.images || data.images.length === 0) {
      console.error("No images in FAL response:", data);
      throw new Error("Aucune image n'a été générée par l'API FAL.");
    }

    const generatedImageUrl = data.images[0].url;
    console.log("Successfully generated artwork:", generatedImageUrl);

    let normalizedImageUrl = generatedImageUrl;
    let downloadName: string | null = null;
    let imageBlob: Blob | null = null;

    try {
      const imageResponse = await fetch(generatedImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Statut de reponse inattendu: ${imageResponse.status}`);
      }
      imageBlob = await imageResponse.blob();
      const mimeType = imageBlob.type || imageResponse.headers.get("content-type") || "image/jpeg";
      const extension = mimeType.includes("png") ? "png" : "jpg";
      downloadName = `artwork.${extension}`;

      if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
        normalizedImageUrl = URL.createObjectURL(imageBlob);
      }

      console.log("Normalized generated image:", { mimeType, downloadName });
    } catch (normalisationError) {
      console.warn("Could not normalise generated image for download:", normalisationError);
      downloadName = "artwork.jpg";
      imageBlob = null;
    }

    return {
      imageUrl: normalizedImageUrl,
      text: data.description || null,
      downloadName,
      blob: imageBlob,
      sourceUrl: generatedImageUrl
    };

  } catch (error) {
    console.error("Error processing image with FAL:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Une erreur est survenue lors de la génération.');
    }
    throw new Error('Une erreur inconnue est survenue lors de la génération.');
  }
};

// Generate last frame for statue animation using Qwen
// Takes the generated mockup (first frame) and the back of the sculpture to create the last frame
export const generateLastFrame = async (
  firstFrameUrl: string,
  backImageFile: File
): Promise<LastFrameGenerationResult> => {
  try {
    console.log("Starting last frame generation with Qwen...");

    if (!FAL_API_KEY) {
      throw new Error("FAL API Key non configurée");
    }

    fal.config({
      credentials: FAL_API_KEY
    });

    // Upload the back image to FAL storage
    console.log("Uploading back image to FAL storage...");
    console.log("Back image file:", backImageFile.name, "size:", backImageFile.size, "type:", backImageFile.type);
    const backImageUrl = await fal.storage.upload(backImageFile);
    console.log("Back image uploaded successfully:", backImageUrl);

    if (!backImageUrl) {
      throw new Error("Échec de l'upload de l'image du dos");
    }

    const prompt = "Change the statue in the image 1 with the statue in the image 2";

    console.log("First frame URL (image 1 - mockup face):", firstFrameUrl);
    console.log("Back image URL (image 2 - photo dos):", backImageUrl);

    const input = {
      prompt,
      image_urls: [firstFrameUrl, backImageUrl],
      num_images: 1,
      aspect_ratio: "9:16",
      output_format: "png",
      resolution: "1K"
    };

    console.log("Calling Nano Banana Pro API for last frame generation...");
    console.log("Request payload:", input);

    const result = await fal.subscribe("fal-ai/gemini-3-pro-image-preview/edit", {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Nano Banana Pro API response:", result);

    const data = result.data as {
      images: Array<{ url: string }>;
    };

    if (!data || !data.images || data.images.length === 0) {
      throw new Error("Aucune image n'a été générée pour la dernière frame.");
    }

    const lastFrameUrl = data.images[0].url;
    console.log("Successfully generated last frame:", lastFrameUrl);

    return {
      imageUrl: lastFrameUrl,
      sourceUrl: lastFrameUrl
    };

  } catch (error) {
    console.error("Error generating last frame:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Une erreur est survenue lors de la génération de la dernière frame.');
    }
    throw new Error('Une erreur inconnue est survenue lors de la génération de la dernière frame.');
  }
};

// Generate video from first and last frames using Veo 3.1
export const generateStatueVideo = async (
  firstFrameUrl: string,
  lastFrameUrl: string,
  prompt: string = "A smooth rotation of the sculpture, showing its details from different angles"
): Promise<VideoGenerationResult> => {
  try {
    console.log("Starting video generation with Veo 3.1...");

    if (!FAL_API_KEY) {
      throw new Error("FAL API Key non configurée");
    }

    fal.config({
      credentials: FAL_API_KEY
    });

    const input = {
      prompt,
      first_frame_url: firstFrameUrl,
      last_frame_url: lastFrameUrl,
      aspect_ratio: "9:16",
      duration: "4s",
      resolution: "720p",
      generate_audio: false
    };

    console.log("Calling Veo 3.1 API for video generation...");
    console.log("Request payload:", input);

    const result = await fal.subscribe("fal-ai/veo3.1/fast/first-last-frame-to-video", {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Veo API response:", result);

    const data = result.data as {
      video: { url: string };
    };

    if (!data || !data.video || !data.video.url) {
      throw new Error("Aucune vidéo n'a été générée.");
    }

    const videoUrl = data.video.url;
    console.log("Successfully generated video:", videoUrl);

    return {
      videoUrl,
      sourceUrl: videoUrl
    };

  } catch (error) {
    console.error("Error generating video:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Une erreur est survenue lors de la génération de la vidéo.');
    }
    throw new Error('Une erreur inconnue est survenue lors de la génération de la vidéo.');
  }
};

// Generate painting animation using Wan 2.6 Image-to-Video API
// Creates a slow zoom + pan from left to right effect
export const generatePaintingVideo = async (
  imageUrl: string
): Promise<VideoGenerationResult> => {
  console.log("=== generatePaintingVideo called ===");
  console.log("Image URL received:", imageUrl);
  try {
    console.log("Starting painting animation with Wan 2.6...");

    if (!FAL_API_KEY) {
      throw new Error("FAL API Key non configurée");
    }

    fal.config({
      credentials: FAL_API_KEY
    });

    const input = {
      image_url: imageUrl,
      prompt: "A slow, cinematic camera movement. The camera slowly pans from left to right while gently zooming in on the painting. The movement is smooth and elegant, like in a museum documentary. The painting remains static and still, only the camera moves.",
      resolution: "720p",
      duration: "5"
    };

    console.log("Calling Wan 2.6 API for painting animation...");
    console.log("Request payload:", input);

    const result = await fal.subscribe("fal-ai/wan-25-preview/image-to-video", {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Wan 2.6 API response:", result);

    const data = result.data as {
      video: { url: string };
    };

    if (!data || !data.video || !data.video.url) {
      throw new Error("Aucune vidéo n'a été générée.");
    }

    const videoUrl = data.video.url;
    console.log("Successfully generated painting video:", videoUrl);

    return {
      videoUrl,
      sourceUrl: videoUrl
    };

  } catch (error) {
    console.error("Error generating painting video:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Une erreur est survenue lors de la génération de la vidéo du tableau.');
    }
    throw new Error('Une erreur inconnue est survenue lors de la génération de la vidéo du tableau.');
  }
};

export enum FrameType {
  None = 'none',
  Black = 'black',
  White = 'white',
}

export enum WallType {
  White = 'white',
  Black = 'black',
  Gray = 'gray',
}

export enum RoomType {
  White = 'white',
  Black = 'black',
  Gray = 'gray',
}

export enum PedestalType {
  White = 'white',
  Black = 'black',
  Gray = 'gray',
}

export enum ArtworkType {
  Painting = 'painting',
  Statue = 'statue',
}

export enum ModelType {
  NanoBananaNew = 'nano_banana_new',
  GptImage15 = 'gpt_image_15',
  Seedream = 'seedream',
  Qwen = 'qwen',
}

export enum AspectRatio {
  Portrait = '9:16',
  Square34 = '3:4',
}

// Video effects for animations
export enum VideoEffect {
  // For statues
  Orbit = 'orbit',           // Current effect: rotation with first/last frame from back image
  // For paintings
  Basic = 'basic',           // Current effect: slow pan/zoom with Wan 2.6
  // For both statues and paintings (using Veo 3.1 with same image as first and last frame)
  YoyoZoom = 'yoyo_zoom',    // Yoyo zoom effect
  DutchAngle = 'dutch_angle', // Dutch angle camera movement
}

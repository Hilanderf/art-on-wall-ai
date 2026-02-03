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
  QwenMax = 'qwen_max',
  Flux2 = 'flux_2',
  Qwen = 'qwen',
}

export enum AspectRatio {
  Portrait = '9:16',
  Square34 = '3:4',
}

// Video effects for animations
export enum VideoEffect {
  // For statues
  Orbit = 'orbit',           // Rotation with first/last frame from back image
  // For paintings
  Basic = 'basic',           // Slow pan/zoom
  // For both statues and paintings
  YoyoZoom = 'yoyo_zoom',    // Yoyo zoom effect
  DutchAngle = 'dutch_angle', // Zoom in with tilted camera
}

// Video generation engines
export enum VideoEngine {
  Veo = 'veo',     // Google Veo 3.1 (first/last frame)
  Wan = 'wan',     // Wan 2.6 (image-to-video)
  Grok = 'grok',   // xAI Grok Imagine Video
}

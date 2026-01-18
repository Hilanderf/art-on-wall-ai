import React, { useState, useCallback, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import ArtworkTypeSelector from './components/ArtworkTypeSelector';
import FrameSelector from './components/FrameSelector';
import WallSelector from './components/WallSelector';
import RoomSelector from './components/RoomSelector';
import PedestalSelector from './components/PedestalSelector';
import ModelSelector from './components/ModelSelector';
import AspectRatioSelector from './components/AspectRatioSelector';
import ResultDisplay from './components/ResultDisplay';
import { generateArtwork, generateLastFrame, generateStatueVideo, generatePaintingVideo } from './services/falService';
import { ArtworkType, FrameType, WallType, RoomType, PedestalType, ModelType, AspectRatio } from './types';

type ResultState = {
  imageUrl: string | null;
  text: string | null;
  blob: Blob | null;
  downloadName: string | null;
  sourceUrl: string | null;
};

const createEmptyResult = (): ResultState => ({
  imageUrl: null,
  text: null,
  blob: null,
  downloadName: null,
  sourceUrl: null,
});

const releaseResultUrl = (value: ResultState) => {
  if (value.imageUrl && value.imageUrl.startsWith('blob:') && typeof URL !== 'undefined') {
    URL.revokeObjectURL(value.imageUrl);
  }
};

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [artworkType, setArtworkType] = useState<ArtworkType>(ArtworkType.Painting);
  const [frameType, setFrameType] = useState<FrameType>(FrameType.None);
  const [wallType, setWallType] = useState<WallType>(WallType.White);
  const [roomType, setRoomType] = useState<RoomType>(RoomType.White);
  const [pedestalType, setPedestalType] = useState<PedestalType>(PedestalType.White);
  const [modelType, setModelType] = useState<ModelType>(ModelType.Qwen);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Portrait);

  const [result, setResult] = useState<ResultState>(() => createEmptyResult());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const latestResultRef = useRef<ResultState>(result);
  latestResultRef.current = result;

  // Animation state for statues
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<'idle' | 'generating_last_frame' | 'reviewing_last_frame' | 'generating_video' | 'done'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lastFrameUrl, setLastFrameUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      releaseResultUrl(latestResultRef.current);
    };
  }, []);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!imageFile) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult((prev) => {
      releaseResultUrl(prev);
      return createEmptyResult();
    });

    try {
      const response = await generateArtwork(imageFile, artworkType, frameType, wallType, roomType, pedestalType, modelType, aspectRatio);
      setResult((prev) => {
        releaseResultUrl(prev);
        return response;
      });
    } catch (e: any) {
      setError(e.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, artworkType, frameType, wallType, roomType, pedestalType, modelType, aspectRatio]);

  const handleAnimateClick = useCallback(async (backImageFile: File) => {
    if (!result.sourceUrl) {
      setError("Aucune image source disponible pour l'animation.");
      return;
    }

    setIsAnimating(true);
    setAnimationStep('generating_last_frame');
    setError(null);

    try {
      // Step 1: Generate last frame using Nano Banana Pro
      console.log("Generating last frame...");
      const lastFrameResult = await generateLastFrame(result.sourceUrl, backImageFile);

      if (!lastFrameResult.imageUrl) {
        throw new Error("Echec de la generation de la derniere frame.");
      }

      // Store last frame and pause for review
      setLastFrameUrl(lastFrameResult.imageUrl);
      setAnimationStep('reviewing_last_frame');
      setIsAnimating(false);

    } catch (e: any) {
      setError(e.message || "Une erreur est survenue lors de la generation de la last frame.");
      setAnimationStep('idle');
      setIsAnimating(false);
    }
  }, [result.sourceUrl]);

  const handleConfirmLastFrame = useCallback(async () => {
    if (!result.sourceUrl || !lastFrameUrl) {
      setError("Images manquantes pour generer la video.");
      return;
    }

    setIsAnimating(true);
    setAnimationStep('generating_video');
    setError(null);

    try {
      // Step 2: Generate video using Veo
      console.log("Generating video...");
      const videoResult = await generateStatueVideo(
        result.sourceUrl,
        lastFrameUrl,
        "A smooth 180-degree rotation of the sculpture, showing its details from different angles. The camera slowly orbits around the statue."
      );

      if (!videoResult.videoUrl) {
        throw new Error("Echec de la generation de la video.");
      }

      setVideoUrl(videoResult.videoUrl);
      setAnimationStep('done');

    } catch (e: any) {
      setError(e.message || "Une erreur est survenue lors de la generation de la video.");
      setAnimationStep('reviewing_last_frame');
    } finally {
      setIsAnimating(false);
    }
  }, [result.sourceUrl, lastFrameUrl]);

  // Handle painting animation (Wan Move - zoom + pan)
  const handleAnimatePaintingClick = useCallback(async () => {
    if (!result.sourceUrl) {
      setError("Aucune image source disponible pour l'animation.");
      return;
    }

    setIsAnimating(true);
    setAnimationStep('generating_video');
    setError(null);

    try {
      console.log("Generating painting animation...");
      const videoResult = await generatePaintingVideo(result.sourceUrl);

      if (!videoResult.videoUrl) {
        throw new Error("Echec de la generation de la video.");
      }

      setVideoUrl(videoResult.videoUrl);
      setAnimationStep('done');

    } catch (e: any) {
      setError(e.message || "Une erreur est survenue lors de la generation de la video.");
      setAnimationStep('idle');
    } finally {
      setIsAnimating(false);
    }
  }, [result.sourceUrl]);

  const handleReset = () => {
    releaseResultUrl(result);
    setImageFile(null);
    setPreview(null);
    setArtworkType(ArtworkType.Painting);
    setFrameType(FrameType.None);
    setWallType(WallType.White);
    setRoomType(RoomType.White);
    setPedestalType(PedestalType.White);
    setModelType(ModelType.Qwen);
    setAspectRatio(AspectRatio.Portrait);
    setResult(createEmptyResult());
    setIsLoading(false);
    setError(null);
    // Reset animation state
    setIsAnimating(false);
    setAnimationStep('idle');
    setVideoUrl(null);
    setLastFrameUrl(null);
  };

  // Go back to image view without resetting everything
  const handleBackToImage = useCallback(() => {
    setVideoUrl(null);
    setAnimationStep('idle');
    setLastFrameUrl(null);
  }, []);

  // Regenerate with same inputs (optionally with a different model, ratio, room, pedestal, and/or wall)
  const handleRegenerate = useCallback(async (newModel?: ModelType, newRatio?: AspectRatio, newRoom?: RoomType, newPedestal?: PedestalType, newWall?: WallType) => {
    if (!imageFile) {
      setError("Aucune image source disponible pour la regeneration.");
      return;
    }

    // Update model if a new one was selected
    if (newModel && newModel !== modelType) {
      setModelType(newModel);
    }

    // Update ratio if a new one was selected
    if (newRatio && newRatio !== aspectRatio) {
      setAspectRatio(newRatio);
    }

    // Update room if a new one was selected
    if (newRoom && newRoom !== roomType) {
      setRoomType(newRoom);
    }

    // Update pedestal if a new one was selected
    if (newPedestal && newPedestal !== pedestalType) {
      setPedestalType(newPedestal);
    }

    // Update wall if a new one was selected
    if (newWall && newWall !== wallType) {
      setWallType(newWall);
    }

    setIsLoading(true);
    setError(null);
    setResult((prev) => {
      releaseResultUrl(prev);
      return createEmptyResult();
    });
    // Reset animation state
    setVideoUrl(null);
    setAnimationStep('idle');
    setLastFrameUrl(null);

    try {
      const modelToUse = newModel || modelType;
      const ratioToUse = newRatio || aspectRatio;
      const roomToUse = newRoom || roomType;
      const pedestalToUse = newPedestal || pedestalType;
      const wallToUse = newWall || wallType;
      const response = await generateArtwork(imageFile, artworkType, frameType, wallToUse, roomToUse, pedestalToUse, modelToUse, ratioToUse);
      setResult((prev) => {
        releaseResultUrl(prev);
        return response;
      });
    } catch (e: any) {
      setError(e.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, artworkType, frameType, wallType, roomType, pedestalType, modelType, aspectRatio]);

  const isFormComplete = imageFile !== null;

  if (isLoading || error || result.imageUrl || isAnimating || videoUrl || animationStep === 'reviewing_last_frame') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <ResultDisplay
            isLoading={isLoading}
            error={error}
            imageUrl={result.imageUrl}
            text={result.text}
            downloadName={result.downloadName}
            downloadBlob={result.blob}
            sourceUrl={result.sourceUrl}
            onReset={handleReset}
            isStatue={artworkType === ArtworkType.Statue}
            isPainting={artworkType === ArtworkType.Painting}
            onAnimateClick={handleAnimateClick}
            onAnimatePaintingClick={handleAnimatePaintingClick}
            onConfirmLastFrame={handleConfirmLastFrame}
            onBackToImage={handleBackToImage}
            onRegenerate={handleRegenerate}
            currentModel={modelType}
            currentRatio={aspectRatio}
            currentRoom={roomType}
            currentPedestal={pedestalType}
            currentWall={wallType}
            isAnimating={isAnimating}
            videoUrl={videoUrl}
            lastFrameUrl={lastFrameUrl}
            animationStep={animationStep}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      {/* Header */}
      <div className="glass-dark sticky top-0 z-10 animate-slide-down">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-center space-x-4">
            {/* Logo animé */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center animate-float shadow-lg shadow-red-900/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {/* Titre avec effet shimmer */}
            <div className="text-center">
              <h1 className="text-3xl font-black header-title tracking-tight">
                Mockup Benoit Noleemeet
              </h1>
              <p className="text-gray-400 text-sm mt-1 tracking-widest uppercase">Art Display Generator</p>
            </div>
          </div>
        </div>
        {/* Ligne de glow animée en bas du header */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-600 to-transparent animate-glow-pulse"></div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Interface principale */}
        <div className="glass-light rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-scale-in">
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Étape 1: Upload */}
              <div className="space-y-6 animate-fade-in-left animate-delay-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="step-badge w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-900/30">1</div>
                  <h3 className="text-xl font-bold text-gray-800">Votre création</h3>
                </div>
                <ImageUploader onImageChange={handleImageChange} preview={preview} />
              </div>

              {/* Étape 2: Options */}
              <div className="space-y-6 animate-fade-in-up animate-delay-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="step-badge w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-900/30">2</div>
                  <h3 className="text-xl font-bold text-gray-800">Style & Finition</h3>
                </div>

                <div className="bg-white/60 rounded-2xl p-6 border border-red-200 card-hover shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-4">Type d'œuvre</h4>
                  <ArtworkTypeSelector selectedArtworkType={artworkType} onArtworkTypeChange={setArtworkType} />
                </div>

                {artworkType === ArtworkType.Painting && (
                  <>
                    <div className="bg-white/60 rounded-2xl p-6 border border-red-200 card-hover shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-4">Encadrement</h4>
                      <FrameSelector selectedFrame={frameType} onFrameChange={setFrameType} />
                    </div>

                    <div className="bg-white/60 rounded-2xl p-6 border border-red-200 card-hover shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-4">Couleur du mur</h4>
                      <WallSelector selectedWall={wallType} onWallChange={setWallType} />
                    </div>
                  </>
                )}

                {artworkType === ArtworkType.Statue && (
                  <>
                    <div className="bg-white/60 rounded-2xl p-6 border border-red-200 card-hover shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-4">Couleur de la pièce</h4>
                      <RoomSelector selectedRoom={roomType} onRoomChange={setRoomType} />
                    </div>

                    <div className="bg-white/60 rounded-2xl p-6 border border-red-200 card-hover shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-4">Couleur du socle</h4>
                      <PedestalSelector selectedPedestal={pedestalType} onPedestalChange={setPedestalType} />
                    </div>
                  </>
                )}
              </div>

              {/* Étape 3: Action */}
              <div className="space-y-6 animate-fade-in-right animate-delay-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="step-badge w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-900/30">3</div>
                  <h3 className="text-xl font-bold text-gray-800">Génération</h3>
                </div>

                <div className="bg-white/60 rounded-2xl p-6 border border-red-200 card-hover shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-4">Modèle IA</h4>
                  <ModelSelector selectedModel={modelType} onModelChange={setModelType} />
                </div>

                {modelType !== ModelType.GptImage15 && (
                  <div className="bg-white/60 rounded-2xl p-6 border border-red-200 card-hover shadow-sm">
                    <h4 className="font-medium text-gray-700 mb-4">Format de l'image</h4>
                    <AspectRatioSelector selectedRatio={aspectRatio} onRatioChange={setAspectRatio} />
                  </div>
                )}

                <div className="bg-white/60 rounded-2xl p-6 border border-red-200 card-hover shadow-sm">
                  <button
                    onClick={handleGenerateClick}
                    disabled={!isFormComplete || isLoading}
                    className="btn-shine w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 px-6 rounded-2xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-red-900/30 animate-glow-pulse"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Génération en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Générer le mockup</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;

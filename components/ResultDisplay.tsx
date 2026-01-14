import React, { useState } from 'react';
import BackImageUploader from './BackImageUploader';
import { ModelType, AspectRatio, RoomType, PedestalType, WallType } from '../types';

interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
  text: string | null;
  downloadName: string | null;
  downloadBlob: Blob | null;
  sourceUrl: string | null;
  onReset: () => void;
  // Animation props for statues
  isStatue?: boolean;
  isPainting?: boolean;
  onAnimateClick?: (backImageFile: File) => void;
  onAnimatePaintingClick?: () => void;
  onConfirmLastFrame?: () => void;
  onBackToImage?: () => void;
  onRegenerate?: (newModel?: ModelType, newRatio?: AspectRatio, newRoom?: RoomType, newPedestal?: PedestalType, newWall?: WallType) => void;
  currentModel?: ModelType;
  currentRatio?: AspectRatio;
  currentRoom?: RoomType;
  currentPedestal?: PedestalType;
  currentWall?: WallType;
  isAnimating?: boolean;
  videoUrl?: string | null;
  lastFrameUrl?: string | null;
  animationStep?: 'idle' | 'generating_last_frame' | 'reviewing_last_frame' | 'generating_video' | 'done';
}

const LoadingSpinner: React.FC<{ message?: string; subMessage?: string }> = ({
  message = "Generation en cours...",
  subMessage = "L'IA est en train de creer votre chef-d'oeuvre. Cela peut prendre un moment."
}) => (
    <div className="flex flex-col items-center justify-center text-center">
      <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="text-2xl font-semibold text-gray-700 mt-4">{message}</h2>
      <p className="text-gray-500 mt-2">{subMessage}</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onReset: () => void }> = ({ message, onReset }) => (
    <div className="text-center p-8 bg-red-50 border-2 border-red-200 rounded-lg">
      <h2 className="text-2xl font-semibold text-red-700">Oups ! Une erreur est survenue.</h2>
      <p className="text-red-600 mt-2 mb-6">{message}</p>
      <button
        onClick={onReset}
        className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
      >
        Reessayer
      </button>
    </div>
);

// Model labels for display
const modelLabels: Record<ModelType, string> = {
  [ModelType.Qwen]: 'Qwen 2511',
  [ModelType.Seedream]: 'Seedream 4.5',
  [ModelType.NanoBananaNew]: 'Nano Banana Pro',
  [ModelType.GptImage15]: 'GPT Image 1.5',
};

// Ratio labels for display
const ratioLabels: Record<AspectRatio, string> = {
  [AspectRatio.Portrait]: 'Portrait (9:16)',
  [AspectRatio.Square34]: 'Carré (3:4)',
};

// Room labels for display
const roomLabels: Record<RoomType, string> = {
  [RoomType.White]: 'Blanc',
  [RoomType.Black]: 'Noir',
  [RoomType.Gray]: 'Gris',
};

// Pedestal labels for display
const pedestalLabels: Record<PedestalType, string> = {
  [PedestalType.White]: 'Blanc',
  [PedestalType.Black]: 'Noir',
  [PedestalType.Gray]: 'Gris',
};

// Wall labels for display
const wallLabels: Record<WallType, string> = {
  [WallType.White]: 'Blanc',
  [WallType.Black]: 'Noir',
  [WallType.Gray]: 'Gris',
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  isLoading,
  error,
  imageUrl,
  text,
  downloadName,
  downloadBlob,
  sourceUrl,
  onReset,
  isStatue = false,
  isPainting = false,
  onAnimateClick,
  onAnimatePaintingClick,
  onConfirmLastFrame,
  onBackToImage,
  onRegenerate,
  currentModel,
  currentRatio,
  currentRoom,
  currentPedestal,
  currentWall,
  isAnimating = false,
  videoUrl = null,
  lastFrameUrl = null,
  animationStep = 'idle'
}) => {
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null);
  const [showAnimationPanel, setShowAnimationPanel] = useState(false);
  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType | undefined>(currentModel);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio | undefined>(currentRatio);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | undefined>(currentRoom);
  const [selectedPedestal, setSelectedPedestal] = useState<PedestalType | undefined>(currentPedestal);
  const [selectedWall, setSelectedWall] = useState<WallType | undefined>(currentWall);

  const handleBackImageChange = (file: File | null) => {
    setBackImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBackImagePreview(null);
    }
  };

  const handleStartAnimation = () => {
    if (backImageFile && onAnimateClick) {
      onAnimateClick(backImageFile);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) {
      return;
    }

    const filename = downloadName ?? 'artwork.jpg';
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const nav = typeof navigator !== 'undefined'
      ? (navigator as Navigator & { share?: (data: ShareData) => Promise<void>; canShare?: (data: ShareData) => boolean; })
      : undefined;
    const fallbackUrl = sourceUrl ?? imageUrl;

    if (isIOS && downloadBlob && nav?.share && typeof File !== 'undefined') {
      try {
        const file = new File([downloadBlob], filename, { type: downloadBlob.type || 'image/jpeg' });
        const canShare = typeof nav.canShare === 'function' ? nav.canShare({ files: [file] }) : true;
        if (canShare) {
          await nav.share({ files: [file], title: filename });
          return;
        }
      } catch (shareError) {
        console.warn('Sharing image failed, falling back to standard download.', shareError);
      }
    }

    const triggerDownload = (href: string) => {
      const link = document.createElement('a');
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (downloadBlob && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const objectUrl = URL.createObjectURL(downloadBlob);
      if (isIOS) {
        window.open(objectUrl, '_blank');
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 10000);
        return;
      }
      triggerDownload(objectUrl);
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 0);
      return;
    }

    if (isIOS) {
      window.open(fallbackUrl, '_blank');
      return;
    }

    triggerDownload(imageUrl);
  };

  const handleVideoDownload = () => {
    if (!videoUrl) return;

    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'sculpture-animation.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Review last frame before generating video
  if (animationStep === 'reviewing_last_frame' && lastFrameUrl && imageUrl) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Verification de la derniere frame</h1>
          <p className="text-gray-500 mt-2">Verifiez que l'image generee correspond a vos attentes avant de lancer la video.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <p className="font-semibold text-indigo-700 mb-2">First Frame (Face)</p>
            <img
              src={imageUrl}
              alt="Mockup face"
              className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-purple-700 mb-2">Last Frame (Dos) - Generee</p>
            <img
              src={lastFrameUrl}
              alt="Last frame generee"
              className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onReset}
            className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirmLastFrame}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            Generer la video
          </button>
        </div>
      </div>
    );
  }

  // Animation in progress
  if (isAnimating) {
    let message = "Generation en cours...";
    let subMessage = "Preparation de l'animation...";

    if (animationStep === 'generating_last_frame') {
      message = "Generation de la derniere frame...";
      subMessage = "Nano Banana Pro transforme votre sculpture pour creer la vue de dos.";
    } else if (animationStep === 'generating_video') {
      message = "Generation de la video...";
      subMessage = isPainting
        ? "Wan 2.6 cree un mouvement de camera sur votre tableau. Cela peut prendre quelques minutes."
        : "Veo 3.1 cree l'animation de votre sculpture. Cela peut prendre quelques minutes.";
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center h-96">
        <LoadingSpinner message={message} subMessage={subMessage} />
      </div>
    );
  }

  // Video result
  if (videoUrl) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Votre animation est prete !</h1>
          <p className="text-gray-500 mt-2">Telechargez votre video et recommencez si vous le souhaitez.</p>
        </div>
        <div className="flex flex-col items-center">
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="max-w-full max-h-[60vh] rounded-lg shadow-md mb-6"
          />
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={handleVideoDownload}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Telecharger la video
            </button>
            {onBackToImage && (
              <button
                type="button"
                onClick={onBackToImage}
                className="bg-blue-100 text-blue-800 font-bold py-3 px-6 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Retour a l'image</span>
              </button>
            )}
            <button
              type="button"
              onClick={onReset}
              className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
              Recommencer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center h-96">
            <LoadingSpinner />
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <ErrorDisplay message={error} onReset={onReset} />
        </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Voici votre oeuvre !</h1>
          <p className="text-gray-500 mt-2">Telechargez votre image et recommencez si vous le souhaitez.</p>
        </div>
        <div className="flex flex-col items-center">
            <img src={imageUrl} alt="oeuvre generee" className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md mb-6" />

            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <button
                    type="button"
                    onClick={handleDownload}
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    Telecharger
                </button>

                {isStatue && onAnimateClick && (
                  <button
                    type="button"
                    onClick={() => setShowAnimationPanel(!showAnimationPanel)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Animer</span>
                  </button>
                )}

                {isPainting && onAnimatePaintingClick && (
                  <button
                    type="button"
                    onClick={onAnimatePaintingClick}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Animer</span>
                  </button>
                )}

                {onRegenerate && (
                  <button
                    type="button"
                    onClick={() => setShowRegeneratePanel(!showRegeneratePanel)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Regenerer</span>
                  </button>
                )}

                <button
                    type="button"
                    onClick={onReset}
                    className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                >
                    Recommencer
                </button>
            </div>

            {/* Animation Panel for Statues */}
            {isStatue && showAnimationPanel && (
              <div className="w-full max-w-md bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 mt-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 text-center">
                  Animer votre sculpture
                </h3>
                <p className="text-sm text-purple-600 mb-4 text-center">
                  Uploadez une photo du dos de votre sculpture pour creer une animation de rotation.
                </p>

                <BackImageUploader
                  onImageChange={handleBackImageChange}
                  preview={backImagePreview}
                />

                <button
                  type="button"
                  onClick={handleStartAnimation}
                  disabled={!backImageFile}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generer la last frame
                </button>
              </div>
            )}

            {/* Regenerate Panel */}
            {showRegeneratePanel && onRegenerate && (
              <div className="w-full max-w-md bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 mt-4">
                <h3 className="text-lg font-semibold text-amber-800 mb-4 text-center">
                  Regenerer l'image
                </h3>
                <p className="text-sm text-amber-600 mb-4 text-center">
                  Choisissez un modele et un format pour regenerer.
                </p>

                {/* Model selector */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-amber-700 mb-2">Modele IA</p>
                  <div className="space-y-2">
                    {Object.values(ModelType).map((model) => (
                      <div
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedModel === model
                            ? 'border-amber-500 bg-amber-100'
                            : 'border-gray-200 bg-white hover:border-amber-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedModel === model ? 'border-amber-500' : 'border-gray-400'
                        } flex items-center justify-center mr-3`}>
                          {selectedModel === model && (
                            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                          )}
                        </div>
                        <span className={`font-medium ${
                          selectedModel === model ? 'text-amber-800' : 'text-gray-700'
                        }`}>
                          {modelLabels[model]}
                          {model === currentModel && (
                            <span className="ml-2 text-xs text-gray-500">(actuel)</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ratio selector - only show if model is not GPT Image 1.5 */}
                {selectedModel !== ModelType.GptImage15 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-amber-700 mb-2">Format de l'image</p>
                    <div className="flex gap-2">
                      {Object.values(AspectRatio).map((ratio) => (
                        <div
                          key={ratio}
                          onClick={() => setSelectedRatio(ratio)}
                          className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedRatio === ratio
                              ? 'border-amber-500 bg-amber-100'
                              : 'border-gray-200 bg-white hover:border-amber-300'
                          }`}
                        >
                          <span className={`font-medium text-sm ${
                            selectedRatio === ratio ? 'text-amber-800' : 'text-gray-700'
                          }`}>
                            {ratioLabels[ratio]}
                            {ratio === currentRatio && (
                              <span className="ml-1 text-xs text-gray-500">(actuel)</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedModel === ModelType.GptImage15 && (
                  <p className="text-xs text-amber-600 mb-4 italic">
                    GPT Image 1.5 utilise un ratio fixe.
                  </p>
                )}

                {/* Room color selector - only show for statues */}
                {isStatue && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-amber-700 mb-2">Couleur de la piece</p>
                    <div className="flex gap-2">
                      {Object.values(RoomType).map((room) => (
                        <div
                          key={room}
                          onClick={() => setSelectedRoom(room)}
                          className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedRoom === room
                              ? 'border-amber-500 bg-amber-100'
                              : 'border-gray-200 bg-white hover:border-amber-300'
                          }`}
                        >
                          <span className={`font-medium text-sm ${
                            selectedRoom === room ? 'text-amber-800' : 'text-gray-700'
                          }`}>
                            {roomLabels[room]}
                            {room === currentRoom && (
                              <span className="ml-1 text-xs text-gray-500">(actuel)</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedestal color selector - only show for statues */}
                {isStatue && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-amber-700 mb-2">Couleur du socle</p>
                    <div className="flex gap-2">
                      {Object.values(PedestalType).map((pedestal) => (
                        <div
                          key={pedestal}
                          onClick={() => setSelectedPedestal(pedestal)}
                          className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedPedestal === pedestal
                              ? 'border-amber-500 bg-amber-100'
                              : 'border-gray-200 bg-white hover:border-amber-300'
                          }`}
                        >
                          <span className={`font-medium text-sm ${
                            selectedPedestal === pedestal ? 'text-amber-800' : 'text-gray-700'
                          }`}>
                            {pedestalLabels[pedestal]}
                            {pedestal === currentPedestal && (
                              <span className="ml-1 text-xs text-gray-500">(actuel)</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wall color selector - only show for paintings */}
                {isPainting && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-amber-700 mb-2">Couleur du mur</p>
                    <div className="flex gap-2">
                      {Object.values(WallType).map((wall) => (
                        <div
                          key={wall}
                          onClick={() => setSelectedWall(wall)}
                          className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedWall === wall
                              ? 'border-amber-500 bg-amber-100'
                              : 'border-gray-200 bg-white hover:border-amber-300'
                          }`}
                        >
                          <span className={`font-medium text-sm ${
                            selectedWall === wall ? 'text-amber-800' : 'text-gray-700'
                          }`}>
                            {wallLabels[wall]}
                            {wall === currentWall && (
                              <span className="ml-1 text-xs text-gray-500">(actuel)</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onRegenerate(selectedModel, selectedRatio, selectedRoom, selectedPedestal, selectedWall)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                  >
                    Regenerer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegeneratePanel(false)}
                    className="px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }

  return null;
};

export default ResultDisplay;

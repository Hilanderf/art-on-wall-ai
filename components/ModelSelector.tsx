import React from 'react';
import { ModelType } from '../types';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

// Prix: vert (cheap) -> jaune (medium) -> orange (expensive) -> rouge (very expensive)
const getPriceColor = (model: ModelType): string => {
  switch (model) {
    case ModelType.Qwen:
      return 'bg-green-500'; // Vert - le moins cher
    case ModelType.QwenMax:
      return 'bg-yellow-500'; // Jaune
    case ModelType.Flux2:
      return 'bg-orange-500'; // Orange
    case ModelType.NanoBananaNew:
      return 'bg-red-500'; // Rouge - le plus cher
    default:
      return 'bg-gray-500';
  }
};

const ModelOption: React.FC<{
  value: ModelType;
  label: string;
  description: string;
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}> = ({ value, label, description, selectedModel, onModelChange }) => (
  <div
    onClick={() => onModelChange(value)}
    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] ${
      selectedModel === value
        ? 'border-red-600 bg-gradient-to-r from-red-50 to-gray-50 shadow-md shadow-red-900/10'
        : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
    }`}
  >
    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${selectedModel === value ? 'border-red-600' : 'border-gray-300'} flex items-center justify-center mr-4`}>
      {selectedModel === value && <div className="w-3 h-3 bg-red-600 rounded-full animate-scale-in"></div>}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className={`font-semibold transition-colors duration-300 ${selectedModel === value ? 'text-red-700' : 'text-gray-600'}`}>{label}</span>
        <div className={`w-3 h-3 rounded-full ${getPriceColor(value)} transition-transform duration-300 ${selectedModel === value ? 'scale-125' : ''}`} title="Indicateur de prix"></div>
      </div>
      <p className={`text-xs transition-colors duration-300 ${selectedModel === value ? 'text-gray-600' : 'text-gray-400'}`}>{description}</p>
    </div>
  </div>
);

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div className="space-y-3">
      <ModelOption
        value={ModelType.Qwen}
        label="Qwen 2511"
        description="Alibaba - Stylized & transform"
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      <ModelOption
        value={ModelType.QwenMax}
        label="Qwen Max"
        description="Alibaba - Higher quality editing"
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      <ModelOption
        value={ModelType.Flux2}
        label="Flux 2 Pro"
        description="Black Forest Labs - High fidelity editing"
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      <ModelOption
        value={ModelType.NanoBananaNew}
        label="Nano Banana Pro"
        description="Gemini 3 Pro - Realism & typography"
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
    </div>
  );
};

export default ModelSelector;

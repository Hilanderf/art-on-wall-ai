import React from 'react';
import { ModelType } from '../types';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

// Prix: vert (cheap) -> jaune (medium) -> violet (expensive) -> rouge (very expensive)
const getPriceColor = (model: ModelType): string => {
  switch (model) {
    case ModelType.Qwen:
      return 'bg-green-500'; // Vert - le moins cher
    case ModelType.Seedream:
      return 'bg-yellow-500'; // Jaune
    case ModelType.NanoBananaNew:
      return 'bg-purple-500'; // Violet
    case ModelType.GptImage15:
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
    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
      selectedModel === value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'
    }`}
  >
    <div className={`w-6 h-6 rounded-full border-2 ${selectedModel === value ? 'border-indigo-500' : 'border-gray-400'} flex items-center justify-center mr-4`}>
      {selectedModel === value && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700">{label}</span>
        <div className={`w-3 h-3 rounded-full ${getPriceColor(value)}`} title="Indicateur de prix"></div>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
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
        value={ModelType.Seedream}
        label="Seedream 4.5"
        description="ByteDance - Stylized & transform"
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
      <ModelOption
        value={ModelType.GptImage15}
        label="GPT Image 1.5"
        description="High fidelity (ratio fixe)"
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
    </div>
  );
};

export default ModelSelector;

import React from 'react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onRatioChange: (ratio: AspectRatio) => void;
}

const RatioOption: React.FC<{
  value: AspectRatio;
  label: string;
  icon: React.ReactNode;
  selectedRatio: AspectRatio;
  onRatioChange: (ratio: AspectRatio) => void;
}> = ({ value, label, icon, selectedRatio, onRatioChange }) => (
  <div
    onClick={() => onRatioChange(value)}
    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] ${
      selectedRatio === value
        ? 'border-red-600 bg-gradient-to-r from-red-50 to-gray-50 shadow-md shadow-red-900/10'
        : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
    }`}
  >
    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${selectedRatio === value ? 'border-red-600' : 'border-gray-300'} flex items-center justify-center mr-4`}>
      {selectedRatio === value && <div className="w-3 h-3 bg-red-600 rounded-full animate-scale-in"></div>}
    </div>
    <div className="flex items-center gap-3">
      <div className={`transition-transform duration-300 ${selectedRatio === value ? 'scale-110' : ''}`}>{icon}</div>
      <span className={`font-semibold transition-colors duration-300 ${selectedRatio === value ? 'text-red-700' : 'text-gray-600'}`}>{label}</span>
    </div>
  </div>
);

const ModelSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange }) => {
  return (
    <div className="space-y-3">
      <RatioOption
        value={AspectRatio.Portrait}
        label="9:16 (Portrait)"
        icon={
          <div className="w-4 h-7 border-2 border-gray-400 rounded-sm"></div>
        }
        selectedRatio={selectedRatio}
        onRatioChange={onRatioChange}
      />
      <RatioOption
        value={AspectRatio.Square34}
        label="3:4"
        icon={
          <div className="w-5 h-6 border-2 border-gray-400 rounded-sm"></div>
        }
        selectedRatio={selectedRatio}
        onRatioChange={onRatioChange}
      />
    </div>
  );
};

export default ModelSelector;

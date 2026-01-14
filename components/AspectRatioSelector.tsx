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
    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
      selectedRatio === value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'
    }`}
  >
    <div className={`w-6 h-6 rounded-full border-2 ${selectedRatio === value ? 'border-indigo-500' : 'border-gray-400'} flex items-center justify-center mr-4`}>
      {selectedRatio === value && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
    </div>
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-gray-700">{label}</span>
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

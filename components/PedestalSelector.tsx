import React from 'react';
import { PedestalType } from '../types';

interface PedestalSelectorProps {
  selectedPedestal: PedestalType;
  onPedestalChange: (pedestal: PedestalType) => void;
}

const PedestalSelector: React.FC<PedestalSelectorProps> = ({ selectedPedestal, onPedestalChange }) => {
  const pedestalOptions = [
    { type: PedestalType.White, label: 'Socle blanc', color: 'bg-white', border: 'border-gray-300' },
    { type: PedestalType.Gray, label: 'Socle gris', color: 'bg-gray-500', border: 'border-gray-600' },
    { type: PedestalType.Black, label: 'Socle noir', color: 'bg-gray-900', border: 'border-gray-700' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {pedestalOptions.map((option) => (
        <button
          key={option.type}
          onClick={() => onPedestalChange(option.type)}
          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
            selectedPedestal === option.type
              ? 'border-red-600 bg-gray-100 shadow-md'
              : `${option.border} hover:border-red-400 hover:shadow-sm`
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-8 ${option.color} rounded-lg border ${option.border} shadow-sm`}></div>
            <span className={`text-sm font-medium ${
              selectedPedestal === option.type ? 'text-red-700' : 'text-gray-700'
            }`}>
              {option.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PedestalSelector;

import React from 'react';
import { WallType } from '../types';

interface WallSelectorProps {
  selectedWall: WallType;
  onWallChange: (wall: WallType) => void;
}

const WallSelector: React.FC<WallSelectorProps> = ({ selectedWall, onWallChange }) => {
  const wallOptions = [
    { type: WallType.White, label: 'Mur blanc', color: 'bg-white', border: 'border-gray-300' },
    { type: WallType.Gray, label: 'Mur gris', color: 'bg-gray-500', border: 'border-gray-600' },
    { type: WallType.Black, label: 'Mur noir', color: 'bg-gray-900', border: 'border-gray-700' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {wallOptions.map((option) => (
        <button
          key={option.type}
          onClick={() => onWallChange(option.type)}
          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
            selectedWall === option.type
              ? 'border-red-600 bg-gray-100 shadow-md'
              : `${option.border} hover:border-red-400 hover:shadow-sm`
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-8 ${option.color} rounded-lg border ${option.border} shadow-sm`}></div>
            <span className={`text-sm font-medium ${
              selectedWall === option.type ? 'text-red-700' : 'text-gray-700'
            }`}>
              {option.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default WallSelector;
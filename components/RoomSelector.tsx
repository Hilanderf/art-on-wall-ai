import React from 'react';
import { RoomType } from '../types';

interface RoomSelectorProps {
  selectedRoom: RoomType;
  onRoomChange: (room: RoomType) => void;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ selectedRoom, onRoomChange }) => {
  const roomOptions = [
    { type: RoomType.White, label: 'Pièce blanche', color: 'bg-white', border: 'border-gray-300' },
    { type: RoomType.Gray, label: 'Pièce grise', color: 'bg-gray-500', border: 'border-gray-600' },
    { type: RoomType.Black, label: 'Pièce noire', color: 'bg-gray-900', border: 'border-gray-700' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {roomOptions.map((option) => (
        <button
          key={option.type}
          onClick={() => onRoomChange(option.type)}
          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
            selectedRoom === option.type
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : `${option.border} hover:border-purple-300 hover:shadow-sm`
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-8 ${option.color} rounded-lg border ${option.border} shadow-sm`}></div>
            <span className={`text-sm font-medium ${
              selectedRoom === option.type ? 'text-purple-700' : 'text-gray-700'
            }`}>
              {option.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default RoomSelector;
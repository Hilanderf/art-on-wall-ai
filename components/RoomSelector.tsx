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
          className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] ${
            selectedRoom === option.type
              ? 'border-red-600 bg-gradient-to-br from-red-50 to-gray-50 shadow-lg shadow-red-900/10'
              : 'border-gray-200 hover:border-red-300 hover:shadow-md bg-white'
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-8 ${option.color} rounded-lg border ${option.border} shadow-inner transition-transform duration-300 ${selectedRoom === option.type ? 'scale-110' : ''}`}></div>
            <span className={`text-sm font-semibold transition-colors duration-300 ${
              selectedRoom === option.type ? 'text-red-700' : 'text-gray-600'
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
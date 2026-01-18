
import React from 'react';
import { FrameType } from '../types';

interface FrameSelectorProps {
  selectedFrame: FrameType;
  onFrameChange: (frame: FrameType) => void;
}

const FrameOption: React.FC<{
    value: FrameType;
    label: string;
    selectedFrame: FrameType;
    onFrameChange: (frame: FrameType) => void;
    borderColorClass: string;
}> = ({ value, label, selectedFrame, onFrameChange, borderColorClass }) => (
    <div
        onClick={() => onFrameChange(value)}
        className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] ${
            selectedFrame === value
                ? `${borderColorClass} bg-gradient-to-r from-red-50 to-gray-50 shadow-md shadow-red-900/10`
                : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
        }`}
    >
        <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${selectedFrame === value ? `${borderColorClass}` : 'border-gray-300'} flex items-center justify-center mr-4`}>
            {selectedFrame === value && <div className="w-3 h-3 bg-red-600 rounded-full animate-scale-in"></div>}
        </div>
        <span className={`font-semibold transition-colors duration-300 ${selectedFrame === value ? 'text-red-700' : 'text-gray-600'}`}>{label}</span>
    </div>
);


const FrameSelector: React.FC<FrameSelectorProps> = ({ selectedFrame, onFrameChange }) => {
  return (
    <div className="space-y-3">
      <FrameOption
        value={FrameType.None}
        label="Aucun cadre"
        selectedFrame={selectedFrame}
        onFrameChange={onFrameChange}
        borderColorClass="border-red-600"
      />
      <FrameOption
        value={FrameType.Black}
        label="Cadre fin noir"
        selectedFrame={selectedFrame}
        onFrameChange={onFrameChange}
        borderColorClass="border-red-600"
      />
      <FrameOption
        value={FrameType.White}
        label="Cadre fin blanc"
        selectedFrame={selectedFrame}
        onFrameChange={onFrameChange}
        borderColorClass="border-red-600"
      />
    </div>
  );
};

export default FrameSelector;

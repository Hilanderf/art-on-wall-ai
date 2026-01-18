
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
        className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedFrame === value ? `${borderColorClass} bg-gray-100` : 'border-gray-300 bg-white'
        }`}
    >
        <div className={`w-6 h-6 rounded-full border-2 ${selectedFrame === value ? `${borderColorClass}` : 'border-gray-400'} flex items-center justify-center mr-4`}>
            {selectedFrame === value && <div className="w-3 h-3 bg-red-600 rounded-full"></div>}
        </div>
        <span className="font-medium text-gray-700">{label}</span>
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

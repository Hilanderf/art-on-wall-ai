import React from 'react';
import { ArtworkType } from '../types';

interface ArtworkTypeSelectorProps {
  selectedArtworkType: ArtworkType;
  onArtworkTypeChange: (type: ArtworkType) => void;
}

const ArtworkTypeOption: React.FC<{
    value: ArtworkType;
    label: string;
    icon: JSX.Element;
    selectedArtworkType: ArtworkType;
    onArtworkTypeChange: (type: ArtworkType) => void;
}> = ({ value, label, icon, selectedArtworkType, onArtworkTypeChange }) => (
    <div
        onClick={() => onArtworkTypeChange(value)}
        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 w-full h-32 ${
            selectedArtworkType === value ? 'border-red-600 bg-gray-100 shadow-sm' : 'border-gray-300 bg-white hover:border-red-400'
        }`}
    >
        {icon}
        <span className="font-medium text-gray-700 mt-2">{label}</span>
    </div>
);

const PaintingIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const StatueIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.176-5.97M15 21h6m-6-1a6 6 0 00-6-6m6 6v1m0-13a4 4 0 110-5.292" />
    </svg>
);


const ArtworkTypeSelector: React.FC<ArtworkTypeSelectorProps> = ({ selectedArtworkType, onArtworkTypeChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ArtworkTypeOption
        value={ArtworkType.Painting}
        label="Tableau"
        icon={<PaintingIcon />}
        selectedArtworkType={selectedArtworkType}
        onArtworkTypeChange={onArtworkTypeChange}
      />
      <ArtworkTypeOption
        value={ArtworkType.Statue}
        label="Statue"
        icon={<StatueIcon />}
        selectedArtworkType={selectedArtworkType}
        onArtworkTypeChange={onArtworkTypeChange}
      />
    </div>
  );
};

export default ArtworkTypeSelector;

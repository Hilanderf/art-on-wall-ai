import React, { useRef } from "react";

interface BackImageUploaderProps {
  onImageChange: (file: File | null) => void;
  preview: string | null;
}

const UploadIcon: React.FC = () => (
  <svg
    className="w-8 h-8 mb-2 text-red-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    ></path>
  </svg>
);

const BackImageUploader: React.FC<BackImageUploaderProps> = ({ onImageChange, preview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0] || null;
    onImageChange(file);
    resetInputValue();
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleInputClick = () => {
    resetInputValue();
  };

  return (
    <div className="w-full">
      <label
        htmlFor="back-image-file"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center w-full h-48 border-2 border-red-400 border-dashed rounded-xl cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        {preview ? (
          <img
            src={preview}
            alt="Apercu du dos"
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <UploadIcon />
            <p className="mb-1 text-sm text-red-600 font-medium">
              Photo du dos de la sculpture
            </p>
            <p className="text-xs text-gray-500">
              Cliquez ou glissez-deposez
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          id="back-image-file"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onClick={handleInputClick}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default BackImageUploader;

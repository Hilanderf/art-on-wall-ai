import React, { useRef } from "react";

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  preview: string | null;
}

const UploadIcon: React.FC = () => (
  <svg
    className="w-10 h-10 mb-3 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z"
    ></path>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 9v6m3-3H7"
    ></path>
  </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, preview }) => {
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
    <div>
      <label
        htmlFor="dropzone-file"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        {preview ? (
          <img
            src={preview}
            alt="Aperçu"
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 10MB)</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          id="dropzone-file"
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

export default ImageUploader;

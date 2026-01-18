import React, { useRef } from "react";

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  preview: string | null;
}

const UploadIcon: React.FC = () => (
  <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30 animate-float">
    <svg
      className="w-8 h-8 text-white"
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
  </div>
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
        className="upload-zone flex flex-col items-center justify-center w-full h-64 rounded-2xl cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-gray-50 overflow-hidden"
      >
        {preview ? (
          <img
            src={preview}
            alt="Aperçu"
            className="max-h-full max-w-full object-contain rounded-xl image-preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon />
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-bold text-red-600">Cliquez pour télécharger</span> ou glissez-déposez
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP (MAX. 10MB)</p>
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

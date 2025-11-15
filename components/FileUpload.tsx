
import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-brand-surface rounded-lg p-8 shadow-lg">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-md p-12 text-center transition-colors duration-300 ${isDragging ? 'border-brand-primary bg-gray-700' : 'border-brand-secondary'}`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <svg className="mx-auto h-12 w-12 text-brand-text-dark" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4h12l4 4h12a4 4 0 014 4zm-4-4v4m0 0H24m12 0a4 4 0 00-4-4H16m0 0l-4-4m16 28v-4a4 4 0 00-4-4H16a4 4 0 00-4 4v4m16 0H16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2 text-brand-text-light">
            <span className="font-semibold text-brand-primary">Загрузите файл</span> или перетащите сюда
          </p>
          <p className="text-xs text-brand-text-dark mt-1">PDF или DOCX, до 120 страниц</p>
        </label>
      </div>
      {error && <p className="mt-4 text-center text-red-400">{error}</p>}
    </div>
  );
};

export default FileUpload;

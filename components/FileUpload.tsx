import React, { useState } from 'react';
import type { SceneData } from '../types';
import ProcessingView from './ProcessingView';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  fileName: string;
  processedData: SceneData[] | null;
  error: string | null;
}

const FileUploadIcon = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4h12l4 4h12a4 4 0 014 4zm-4-4v4m0 0H24m12 0a4 4 0 00-4-4H16m0 0l-4-4m16 28v-4a4 4 0 00-4-4H16a4 4 0 00-4 4v4m16 0H16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing, fileName, processedData, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };

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

  if (isProcessing) {
      return <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6"><ProcessingView fileName={fileName} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6">
        <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Загрузка сценария</h2>
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Поддерживаются форматы PDF и DOCX до 120 страниц</p>
        
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDragging ? 'border-primary bg-primary-light dark:border-dark-primary dark:bg-dark-primary-light' : 'border-secondary dark:border-dark-secondary'}`}
        >
          <input type="file" id="file-upload" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
          <label htmlFor="file-upload" className="cursor-pointer">
            <FileUploadIcon/>
            <p className="mt-2 text-sm font-medium text-text-primary dark:text-dark-text-primary">
              <span className="text-primary dark:text-dark-primary">Перетащите файл сюда</span> или нажмите для выбора
            </p>
            <div className="flex justify-center gap-2 mt-2">
                <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-dark-text-secondary px-2 py-1 rounded">PDF</span>
                <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-dark-text-secondary px-2 py-1 rounded">DOCX</span>
            </div>
          </label>
        </div>

        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        
        {processedData && (
            <div className="mt-4 p-4 bg-success-bg dark:bg-dark-success-bg border-l-4 border-success dark:border-dark-success rounded-r-lg">
                <p className="text-sm font-semibold text-success dark:text-dark-success">Документ обработан: {fileName}</p>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Найдено сцен: {processedData.length}</p>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Пресеты анализа</h3>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">Выберите набор элементов для распознавания</p>
            {/* This is a decorative dropdown for now */}
            <select className="w-full p-2 border border-secondary dark:border-dark-secondary rounded-md bg-transparent dark:bg-dark-surface focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary outline-none">
                <option>Расширенный</option>
                <option>Базовый</option>
                <option>Полный</option>
            </select>
            <div className="space-y-3 mt-4">
                {['Локации и время суток', 'Персонажи и массовка', 'Реквизит', 'Спецэффекты', 'Транспорт'].map(item => (
                    <label key={item} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-primary focus:ring-primary dark:bg-dark-secondary dark:border-dark-secondary" />
                        {item}
                    </label>
                ))}
            </div>
        </div>
        <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6">
             <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Технические характеристики</h3>
             <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">Параметры обработки</p>
             <ul className="text-sm space-y-3">
                <li className="flex justify-between"><span>Макс. размер документа</span> <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">120 страниц</span></li>
                <li className="flex justify-between"><span>Время обработки</span> <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">до 5 минут</span></li>
                <li className="flex justify-between"><span>Режим работы</span> <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">Офлайн</span></li>
                <li className="flex justify-between"><span>Кодировки</span> <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">UTF-8, CP1251</span></li>
             </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

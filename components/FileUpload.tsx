import React, { useState } from 'react';
import type { SceneData, AnalysisOptions, AnalysisCategory } from '../types';
import ProcessingView from './ProcessingView';

interface FileUploadProps {
  onFileUpload: (file: File, options: AnalysisOptions) => void;
  isProcessing: boolean;
  fileName: string;
  processedData: SceneData[] | null;
  error: string | null;
}

const ArrowUpTrayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500 cursor-pointer">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);


const ALL_CATEGORIES: { id: AnalysisCategory; name: string }[] = [
    { id: 'characters', name: 'Персонажи и массовка' },
    { id: 'props', name: 'Реквизит' },
    { id: 'sfx', name: 'Спецэффекты (SFX/VFX)' },
    { id: 'makeup', name: 'Грим и прически' },
    { id: 'stunts', name: 'Каскадеры' },
    { id: 'transport', name: 'Транспорт' },
];

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing, fileName, processedData, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>({
    preset: 'advanced',
    categories: ['characters', 'extras', 'props', 'sfx', 'transport', 'makeup']
  });

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };

  const handleFileAction = (file: File | null) => {
    if (file) {
      onFileUpload(file, analysisOptions);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFileAction(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFileAction(e.target.files[0]);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };
  
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value as AnalysisOptions['preset'];
    let categories: AnalysisCategory[] = analysisOptions.categories; // Default to current for custom
    switch(preset) {
        case 'basic':
            categories = ['characters', 'props', 'extras'];
            break;
        case 'advanced':
            categories = ['characters', 'extras', 'props', 'sfx', 'transport', 'makeup'];
            break;
        case 'full':
            categories = ['characters', 'extras', 'props', 'sfx', 'makeup', 'stunts', 'transport'];
            break;
    }
    setAnalysisOptions({ preset, categories });
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const category = e.target.name as AnalysisCategory;
      const isChecked = e.target.checked;
      setAnalysisOptions(prev => {
          const newCategories = new Set(prev.categories);
          if (isChecked) {
              newCategories.add(category);
              if (category === 'characters') newCategories.add('extras');
          } else {
              newCategories.delete(category);
              if (category === 'characters') newCategories.delete('extras');
          }
          return { preset: 'custom', categories: Array.from(newCategories) };
      });
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
          <input type="file" id="file-upload" className="hidden" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
          <label htmlFor="file-upload" className="cursor-pointer">
            <ArrowUpTrayIcon/>
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
            <select value={analysisOptions.preset} onChange={handlePresetChange} className="w-full p-2 border border-secondary dark:border-dark-secondary rounded-md bg-transparent dark:bg-dark-surface focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary outline-none">
                <option value="basic">Базовый</option>
                <option value="advanced">Расширенный</option>
                <option value="full">Полный</option>
                <option value="custom">Пользовательский</option>
            </select>
            <div className="space-y-3 mt-4">
                {ALL_CATEGORIES.map(item => (
                    <label key={item.id} className="flex items-center gap-2 text-sm">
                        <input 
                            type="checkbox" 
                            name={item.id}
                            checked={analysisOptions.categories.includes(item.id)}
                            onChange={handleCategoryChange}
                            className="h-4 w-4 rounded text-primary focus:ring-primary dark:bg-dark-secondary dark:border-dark-secondary" 
                        />
                        {item.name}
                    </label>
                ))}
            </div>
        </div>
        <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6">
             <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Технические характеристики</h3>
             <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">Параметры обработки</p>
             <ul className="text-sm space-y-3">
                <li className="flex justify-between items-center"><span>Макс. размер документа</span> <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">120 страниц</span></li>
                <li className="flex justify-between items-center"><span>Время обработки</span> <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">~ 2-5 минут</span></li>
                <li className="flex justify-between items-center">
                    <span>Модель ИИ</span>
                    <div className="relative group flex items-center">
                        <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">Mixtral 8x22B</span>
                        <InfoIcon />
                        <div className="absolute hidden group-hover:block bottom-full right-0 mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-pre-line text-left">
                            <b>Альтернативные модели:</b>
                            {`\n- Llama 3 70B\n- Gemma 7B\n- Phi-3`}
                        </div>
                    </div>
                </li>
                <li className="flex justify-between items-center">
                    <span>Кодировки</span>
                    <div className="relative group flex items-center">
                        <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">UTF-8, CP1251</span>
                        <InfoIcon />
                        <div className="absolute hidden group-hover:block bottom-full right-0 mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-pre-line text-left">
                            <b>Поддерживаемые кодировки:</b>
                            {`\n- UTF-8, UTF-16\n- CP1251 (Windows-1251)\n- KOI8-R, ISO-8859-5\n- MacRoman, ASCII`}
                        </div>
                    </div>
                </li>
             </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
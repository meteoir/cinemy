import React, { useState, useEffect } from 'react';
import type { SceneData } from './types';
import { processScript } from './services/aiService';

import FileUpload from './components/FileUpload';
import ResultsView from './components/ResultsView';
import StatisticsView from './components/StatisticsView';
import ExportView from './components/ExportView';
import ProcessingView from './components/ProcessingView';

type Theme = 'light' | 'dark';
type Tab = 'upload' | 'table' | 'stats' | 'export';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.59-1.59M3 12h2.25m.386-6.364l1.59 1.591M12 12a2.25 2.25 0 00-2.25 2.25 2.25 2.25 0 002.25 2.25 2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 12z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<SceneData[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    setError(null);
    setProcessedData(null);
    setActiveTab('table'); // Switch view immediately to processing view

    try {
      const data = await processScript(file);
      setProcessedData(data);
      setActiveTab('table');
    } catch (err) {
      console.error("Error during script processing:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
       if (errorMessage.includes("Unsupported MIME type") || errorMessage.toLowerCase().includes("file format is not supported")) {
           setError('Этот тип файла не поддерживается для анализа. Пожалуйста, используйте PDF или DOCX.');
      } else {
           setError('Не удалось обработать сценарий. Убедитесь, что файл не поврежден и попробуйте снова.');
      }
      setProcessedData(null);
      setActiveTab('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const TABS = [
    { id: 'upload', name: 'Загрузка' },
    { id: 'table', name: 'Таблица' },
    { id: 'stats', name: 'Статистика' },
    { id: 'export', name: 'Экспорт' },
  ];

  const Placeholder: React.FC<{ title: string, description: string }> = ({ title, description }) => (
    <div className="text-center py-20">
      <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{title}</h3>
      <p className="text-text-secondary dark:text-dark-text-secondary mt-1">{description}</p>
      <button 
        onClick={() => setActiveTab('upload')}
        className="mt-4 px-4 py-2 bg-primary text-text-on-primary rounded-md hover:bg-primary-hover transition-colors text-sm font-semibold"
      >
        Загрузить сценарий
      </button>
    </div>
  );

  const renderContent = () => {
    if (isProcessing) {
        return <ProcessingView fileName={fileName} />;
    }

    switch (activeTab) {
      case 'table':
        return processedData ? <ResultsView data={processedData} /> : <Placeholder title="Данные не найдены" description="Сначала загрузите сценарий для просмотра таблицы."/>;
      case 'stats':
        return processedData ? <StatisticsView data={processedData} /> : <Placeholder title="Данные не найдены" description="Сначала загрузите сценарий для просмотра статистики."/>;
      case 'export':
        return processedData ? <ExportView data={processedData} fileName={fileName} /> : <Placeholder title="Данные не найдены" description="Сначала загрузите сценарий для экспорта данных."/>;
      case 'upload':
      default:
        return <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} fileName={fileName} processedData={processedData} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary dark:bg-dark-background dark:text-dark-text-primary font-sans transition-colors duration-300">
      <header className="bg-surface dark:bg-dark-surface shadow-card sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-2">
            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1">
                    {TABS.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            disabled={!processedData && tab.id !== 'upload'}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === tab.id 
                                ? 'bg-primary-light text-primary dark:bg-dark-primary-light dark:text-dark-primary' 
                                : 'text-text-secondary dark:text-dark-text-secondary hover:bg-gray-500/10'}`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full text-text-secondary dark:text-dark-text-secondary hover:bg-gray-500/10 transition-colors">
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;

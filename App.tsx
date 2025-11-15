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
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<SceneData[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prefers dark theme if user's system is set to dark
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
    try {
      const data = await processScript(file);
      setProcessedData(data);
      setActiveTab('table');
    } catch (err) {
      setError('Не удалось обработать сценарий. Пожалуйста, попробуйте другой файл.');
      setProcessedData(null);
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
    if (isProcessing && activeTab !== 'upload') {
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

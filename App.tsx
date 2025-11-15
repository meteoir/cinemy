
import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import type { SceneData } from './types';
import { processScript } from './services/aiService';

type AppState = 'upload' | 'processing' | 'results';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [processedData, setProcessedData] = useState<SceneData[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setAppState('processing');
    setFileName(file.name);
    setError(null);
    try {
      const data = await processScript(file);
      setProcessedData(data);
      setAppState('results');
    } catch (err) {
      setError('Failed to process the script. Please try another file.');
      setAppState('upload');
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState('upload');
    setProcessedData([]);
    setFileName('');
    setError(null);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'processing':
        return <ProcessingView fileName={fileName} />;
      case 'results':
        return <ResultsView data={processedData} onReset={handleReset} fileName={fileName} />;
      case 'upload':
      default:
        return <FileUpload onFileUpload={handleFileUpload} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-text-light">
          Scenarist <span className="text-brand-primary">AI</span>
        </h1>
        <p className="text-brand-text-dark mt-2">
          Автоматический разбор сценария для препродакшена
        </p>
      </header>
      <main className="w-full max-w-7xl">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;

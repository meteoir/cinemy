
import React from 'react';

interface ProcessingViewProps {
  fileName: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ fileName }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-brand-surface rounded-lg p-8 shadow-lg text-center">
      <div className="animate-pulse">
        <svg className="mx-auto h-16 w-16 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-brand-text-light">Анализируем сценарий...</h2>
      <p className="mt-2 text-brand-text-dark">{fileName}</p>
      <div className="w-full bg-brand-secondary rounded-full h-2.5 mt-8">
        <div className="bg-brand-primary h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
      </div>
       <p className="text-sm text-brand-text-dark mt-4">Это может занять несколько минут.</p>
    </div>
  );
};

export default ProcessingView;

import React, { useState, useEffect } from 'react';

interface ProcessingViewProps {
  fileName: string;
}

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-success dark:text-dark-success flex-shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-primary dark:text-dark-primary flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ProcessingView: React.FC<ProcessingViewProps> = ({ fileName }) => {
  const [currentTask, setCurrentTask] = useState(0);
  const tasks = [
    'Подготовка и загрузка сценария...',
    'Анализ структуры и разбивка на сцены...',
    'Извлечение персонажей и локаций...',
    'Идентификация реквизита и костюмов...',
    'Определение специальных требований (транспорт, трюки, SFX)...',
    'Финализация и форматирование таблицы...',
  ];

  useEffect(() => {
    const taskDuration = 3500; 
    const interval = setInterval(() => {
      setCurrentTask(prev => {
        if (prev < tasks.length -1) {
          return prev + 1;
        }
        return prev; // Stay on the last task
      });
    }, taskDuration);

    return () => clearInterval(interval);
  }, [tasks.length]);

  return (
    <div className="w-full max-w-2xl mx-auto p-8 text-center">
      <div role="status" className="flex justify-center">
        <svg aria-hidden="true" className="w-12 h-12 text-primary dark:text-dark-primary animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" fillOpacity="0.2"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
        </svg>
        <span className="sr-only">Загрузка...</span>
      </div>
      <h2 className="mt-6 text-xl font-semibold text-text-primary dark:text-dark-text-primary">Анализируем сценарий...</h2>
      <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">{fileName}</p>
      <div className="w-full bg-secondary dark:bg-dark-secondary rounded-full h-1.5 mt-6">
        <div className="bg-primary dark:bg-dark-primary h-1.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
      </div>
      
       <div className="mt-6 text-left max-w-md mx-auto">
          <ul className="space-y-3">
              {tasks.map((task, index) => (
                  <li key={index} className={`flex items-center gap-3 transition-opacity duration-500 ${index <= currentTask ? 'opacity-100' : 'opacity-40'}`}>
                      <div className="w-5 h-5 flex items-center justify-center">
                        {index < currentTask ? (
                            <CheckCircleIcon />
                        ) : index === currentTask ? (
                            <SpinnerIcon />
                        ) : (
                            <ClockIcon />
                        )}
                      </div>
                      <span className={`text-sm ${index === currentTask ? 'font-semibold text-text-primary dark:text-dark-text-primary' : 'text-text-secondary dark:text-dark-text-secondary'}`}>
                          {task}
                      </span>
                  </li>
              ))}
          </ul>
      </div>

       <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-8">Это может занять несколько минут. Не закрывайте вкладку.</p>
    </div>
  );
};

export default ProcessingView;

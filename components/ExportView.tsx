import React from 'react';
import type { SceneData } from '../types';

interface ExportViewProps {
  data: SceneData[];
  fileName: string;
}

const ExportView: React.FC<ExportViewProps> = ({ data, fileName }) => {

    const exportToCSV = () => {
        const headers = ['ID', 'Location', 'Time of Day', 'Characters', 'Props', 'SFX', 'Extras', 'Makeup', 'Transport'].join(',');
        const rows = data.map(row => {
            return [
                row.id,
                row.location,
                row.timeOfDay,
                row.characters.join('; '),
                row.props.join('; '),
                row.sfx.join('; '),
                row.extras,
                row.makeup.join('; '),
                row.transport.join('; '),
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        }).join('\n');

        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `breakdown_${fileName.split('.')[0] || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6">
                <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Экспорт данных</h2>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Сохраните результаты анализа в удобном формате</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button className="p-6 border-2 border-primary bg-primary-light dark:bg-dark-primary-light dark:border-dark-primary rounded-lg text-left hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition-colors">
                        <span className="text-lg font-bold text-primary dark:text-dark-primary">Экспорт в XLSX</span>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Рекомендуемый формат</p>
                    </button>
                    <button onClick={exportToCSV} className="p-6 border border-secondary dark:border-dark-secondary rounded-lg text-left hover:bg-gray-500/10 transition-colors">
                        <span className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Экспорт в CSV</span>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Для импорта в другие системы</p>
                    </button>
                </div>
            </div>
            
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Параметры экспорта</h3>
                <ul className="text-sm space-y-3 mt-4">
                    <li className="flex justify-between items-center">
                        <span className="text-text-secondary dark:text-dark-text-secondary">Включить заголовки столбцов</span> 
                        <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">Да</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-text-secondary dark:text-dark-text-secondary">Кодировка</span> 
                        <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">UTF-8</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-text-secondary dark:text-dark-text-secondary">Разделитель CSV</span> 
                        <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">Запятая</span>
                    </li>
                </ul>
            </div>

            <div className="bg-primary-light dark:bg-dark-primary-light p-4 rounded-lg flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary dark:text-dark-primary flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                 <div>
                    <h4 className="font-semibold text-primary dark:text-dark-primary">Совместимость с Excel и Google Sheets</h4>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Экспортированные файлы полностью совместимы с Microsoft Excel, Google Sheets и другими табличными редакторами.</p>
                 </div>
            </div>
        </div>
    );
};

export default ExportView;

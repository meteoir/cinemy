import React from 'react';
import type { SceneData } from '../types';

declare var XLSX: any;

interface ExportViewProps {
  data: SceneData[];
  fileName: string;
}

const ExportView: React.FC<ExportViewProps> = ({ data, fileName }) => {

    const getCleanFileName = () => `breakdown_${fileName.split('.').slice(0, -1).join('.') || 'export'}`;

    const exportToXLSX = () => {
        if (typeof XLSX === 'undefined') {
            alert('Не удалось загрузить библиотеку для экспорта XLSX. Пожалуйста, проверьте ваше интернет-соединение.');
            return;
        }

        const dataForSheet = data.map(row => ({
            '№': row.id,
            'Локация': row.location,
            'Время': row.timeOfDay,
            'Персонажи': row.characters.join(', '),
            'Реквизит': row.props.join(', '),
            'Спецэффекты': row.sfx.join(', '),
            'Грим/Прически': row.makeup.join(', '),
            'Каскадеры': row.stunts.join(', '),
            'Транспорт': row.transport.join(', '),
            'Массовка': row.extras,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown");

        const wscols = [
            { wch: 5 },   // №
            { wch: 30 },  // Локация
            { wch: 10 },  // Время
            { wch: 40 },  // Персонажи
            { wch: 40 },  // Реквизит
            { wch: 25 },  // Спецэффекты
            { wch: 25 },  // Грим/Прически
            { wch: 25 },  // Каскадеры
            { wch: 25 },  // Транспорт
            { wch: 20 },  // Массовка
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, `${getCleanFileName()}.xlsx`);
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Location', 'Time of Day', 'Characters', 'Props', 'SFX', 'Makeup', 'Stunts', 'Transport', 'Extras'].join(',');
        const rows = data.map(row => {
            return [
                row.id,
                row.location,
                row.timeOfDay,
                row.characters.join('; '),
                row.props.join('; '),
                row.sfx.join('; '),
                row.makeup.join('; '),
                row.stunts.join('; '),
                row.transport.join('; '),
                row.extras,
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        }).join('\n');

        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
        const csvContent = `${headers}\n${rows}`;
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${getCleanFileName()}.csv`);
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
                    <button onClick={exportToXLSX} className="p-6 border-2 border-primary bg-primary-light dark:bg-dark-primary-light dark:border-dark-primary rounded-lg text-left hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-background">
                        <span className="text-lg font-bold text-primary dark:text-dark-primary">Экспорт в XLSX</span>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Рекомендуемый формат</p>
                    </button>
                    <button onClick={exportToCSV} className="p-6 border border-secondary dark:border-dark-secondary rounded-lg text-left hover:bg-gray-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-background">
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
                        <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">UTF-8 with BOM</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-text-secondary dark:text-dark-text-secondary">Разделитель CSV</span> 
                        <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">Запятая</span>
                    </li>
                </ul>
            </div>

            <div className="bg-primary-light dark:bg-dark-primary-light p-4 rounded-lg flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-primary dark:text-dark-primary flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                 <div>
                    <h4 className="font-semibold text-primary dark:text-dark-primary">Совместимость с Excel и Google Sheets</h4>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Экспортированные файлы полностью совместимы с Microsoft Excel, Google Sheets и другими табличными редакторами.</p>
                 </div>
            </div>
        </div>
    );
};

export default ExportView;

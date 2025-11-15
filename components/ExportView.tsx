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

        const headers = [
            "Серия", "Сцена", "Режим", "Инт / нат", "Объект", "Подобъект", "Синопсис", 
            "Персонажи", "Массовка / Групповка", "Грим / Костюм", 
            "Реквизит / Животное / Игровые фото", "Игровой транспорт", "Декорация",
            "Спец. оборудование / Администрация /", "Трюк / Пиротехник"
        ];

        const sheetData = data.map(row => ([
            row.series || "",
            row.id,
            row.mode,
            row.int_nat,
            row.object,
            row.sub_object || "",
            row.synopsis,
            row.characters.join('\n'),
            row.extras_grouping,
            [row.makeup, row.costume].filter(Boolean).join('\n'),
            [row.props, row.animals, row.photos].filter(Boolean).join('\n'),
            row.transport,
            row.set_decoration,
            [row.special_equipment, row.administration].filter(Boolean).join('\n'),
            [row.stunts, row.pyrotechnics].filter(Boolean).join('\n'),
        ]));

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sheetData]);

        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F2F7E" } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
        };
        const cellStyle = {
            alignment: { vertical: 'top', wrapText: true }
        };

        const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1");
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (worksheet[headerCellAddress]) {
                worksheet[headerCellAddress].s = headerStyle;
            }

            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (worksheet[cellAddress]) {
                    worksheet[cellAddress].s = cellStyle;
                }
            }
        }

        worksheet['!cols'] = [
            { wch: 8 },  // Серия
            { wch: 8 },  // Сцена
            { wch: 10 }, // Режим
            { wch: 10 }, // Инт / нат
            { wch: 25 }, // Объект
            { wch: 25 }, // Подобъект
            { wch: 45 }, // Синопсис
            { wch: 25 }, // Персонажи
            { wch: 30 }, // Массовка / Групповка
            { wch: 35 }, // Грим / Костюм
            { wch: 40 }, // Реквизит...
            { wch: 25 }, // Игровой транспорт
            { wch: 25 }, // Декорация
            { wch: 35 }, // Спец...
            { wch: 25 }, // Трюк...
        ];
        
        // Set a default row height for better readability with wrapped text
        worksheet['!rows'] = [{ hpt: 30 }]; // Header row
        for(let i=0; i < sheetData.length; i++) {
            worksheet['!rows'][i+1] = { hpt: 80 };
        }


        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown");
        XLSX.writeFile(workbook, `${getCleanFileName()}.xlsx`);
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Series', 'Mode', 'Int/Nat', 'Object', 'Sub-Object', 'Synopsis', 'Characters', 'Extras', 'Makeup', 'Costume', 'Props', 'Animals', 'Photos', 'Transport', 'Set Decoration', 'Special Equipment', 'Admin', 'Stunts', 'Pyrotechnics'].join(',');
        const rows = data.map(row => {
            return [
                row.id, row.series, row.mode, row.int_nat, row.object, row.sub_object, row.synopsis,
                row.characters.join('; '), row.extras_grouping, row.makeup, row.costume, row.props, row.animals,
                row.photos, row.transport, row.set_decoration, row.special_equipment, row.administration,
                row.stunts, row.pyrotechnics
            ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
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

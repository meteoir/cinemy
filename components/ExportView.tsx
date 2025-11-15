import React, { useState } from 'react';
import type { SceneData, FormattedData } from '../types';
import { formatDataForBreakdown } from '../types';

declare var XLSX: any;

interface ExportViewProps {
  data: SceneData[];
  fileName: string;
}

const ExportView: React.FC<ExportViewProps> = ({ data, fileName }) => {
    const [csvDelimiter, setCsvDelimiter] = useState<',' | ';'>(';');

    const getCleanFileName = () => `breakdown_${fileName.split('.').slice(0, -1).join('.') || 'export'}`;

    const exportToXLSX = () => {
        if (typeof XLSX === 'undefined') {
            alert('Не удалось загрузить библиотеку для экспорта XLSX. Пожалуйста, проверьте ваше интернет-соединение.');
            return;
        }

        const formattedData = formatDataForBreakdown(data);

        const headers = [
            "Серия", "Сцена", "Режим", "Инт / нат", "Объект", "Подобъект", "Синопсис",
            "Персонажи", "Массовка / Групповка", "Грим / Костюм",
            "Реквизит / Животное / Игровые фото", "Игровой транспорт", "Декорация",
            "Спец. оборудование / Администрация", "Трюк / Пиротехник"
        ];
        
        let sheetData: (string | null)[][] = [headers];
        const headerRowInfos: { index: number, type: 'day' | 'off-day' }[] = [];

        formattedData.forEach(group => {
            headerRowInfos.push({ index: sheetData.length, type: group.type });
            if (group.type === 'day') {
                const headerRow = [
                    `${group.date} ${group.dayOfWeek} СМЕНА №${group.shiftNumber}`, null, null,
                    group.shiftType, null, null, null,
                    `СМЕНА ${group.shiftTime}`, null, null,
                    group.comments.join('; '), null, null, null, null
                ];
                sheetData.push(headerRow);
                group.scenes.forEach(row => {
                    sheetData.push([
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
                    ]);
                });
            } else { // off-day
                const offDayRow = [`${group.date} | ${group.dayOfWeek}`, group.title, ...Array(headers.length - 2).fill(null)];
                sheetData.push(offDayRow);
            }
        });

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        
        // --- STYLING ---
        const styles = {
            header: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "673AB7" } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } },
            dayHeader: { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: "D1C4E9" } }, alignment: { vertical: 'center' } },
            timeHeader: { font: { bold: true, sz: 12, color: {rgb: "000000"} }, fill: { fgColor: { rgb: "FFEB3B" } }, alignment: { horizontal: 'center', vertical: 'center' } },
            offDayHeader: { font: { bold: true }, fill: { fgColor: { rgb: "E0E0E0" } }, alignment: { horizontal: 'center', vertical: 'center' } },
            cell: { alignment: { vertical: 'top', wrapText: true } },
        };
        
        worksheet['!merges'] = [];
        headerRowInfos.forEach(({ index: r, type }) => {
            if (type === 'day') {
                 worksheet['!merges']?.push({ s: { r, c: 0 }, e: { r, c: 2 } }); // Date, Day, Shift#
                 worksheet['!merges']?.push({ s: { r, c: 3 }, e: { r, c: 6 } }); // Shift Type
                 worksheet['!merges']?.push({ s: { r, c: 7 }, e: { r, c: 9 } }); // Shift Time
                 worksheet['!merges']?.push({ s: { r, c: 10 }, e: { r, c: 14 } }); // Comments
            } else {
                worksheet['!merges']?.push({ s: { r, c: 1 }, e: { r, c: headers.length -1 } });
            }
        });
        
        const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1");
        for (let R = range.s.r; R <= range.e.r; ++R) {
             for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({r:R, c:C});
                let cell = worksheet[cellAddress];
                if (!cell) cell = worksheet[cellAddress] = { t: 's', v: ''};


                const headerInfo = headerRowInfos.find(h => h.index === R);
                
                if (R === 0) cell.s = styles.header;
                else if (headerInfo) {
                    if (headerInfo.type === 'day') {
                        if (C >= 7 && C <= 9) cell.s = styles.timeHeader;
                        else cell.s = styles.dayHeader;
                    } else cell.s = styles.offDayHeader;
                }
                else cell.s = styles.cell;
            }
        }
        
        worksheet['!cols'] = headers.map((h, i) => ({ wch: i === 6 ? 40 : 25 }));
        worksheet['!rows'] = sheetData.map((_, i) => ({ hpt: headerRowInfos.find(h => h.index === i) ? 25 : 80 }));
        worksheet['!rows'][0] = { hpt: 30 };


        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown");
        XLSX.writeFile(workbook, `${getCleanFileName()}.xlsx`, { cellStyles: true });
    };

    const exportToCSV = (delimiter: ',' | ';') => {
        const formattedData = formatDataForBreakdown(data);
        const headers = [
            "Серия", "Сцена", "Режим", "Инт / нат", "Объект", "Подобъект", "Синопсис",
            "Персонажи", "Массовка / Групповка", "Грим / Костюм",
            "Реквизит / Животное / Игровые фото", "Игровой транспорт", "Декорация",
            "Спец. оборудование / Администрация", "Трюк / Пиротехник"
        ];
        
        const escapeCsvField = (field: any): string => {
            const stringField = String(field ?? '').replace(/"/g, '""').replace(/\r\n|\n/g, ' | ');
            if (stringField.includes(delimiter) || stringField.includes('"') || stringField.includes(',')) {
                return `"${stringField}"`;
            }
            return stringField;
        };

        const csvRows: string[] = [];

        formattedData.forEach(group => {
            if (group.type === 'day') {
                const dayHeader = `"${group.date} ${group.dayOfWeek} СМЕНА №${group.shiftNumber} | ${group.shiftType} | СМЕНА ${group.shiftTime} | ${group.comments.join('; ')}"`;
                csvRows.push(dayHeader);
                csvRows.push(headers.join(delimiter)); // Add headers for each day group
                group.scenes.forEach(row => {
                     const sceneRow = [
                        row.series,
                        row.id,
                        row.mode,
                        row.int_nat,
                        row.object,
                        row.sub_object,
                        row.synopsis,
                        row.characters.join(' | '),
                        row.extras_grouping,
                        [row.makeup, row.costume].filter(Boolean).join(' | '),
                        [row.props, row.animals, row.photos].filter(Boolean).join(' | '),
                        row.transport,
                        row.set_decoration,
                        [row.special_equipment, row.administration].filter(Boolean).join(' | '),
                        [row.stunts, row.pyrotechnics].filter(Boolean).join(' | '),
                    ].map(escapeCsvField);
                    csvRows.push(sceneRow.join(delimiter));
                });
            } else { // off-day
                csvRows.push(`"${group.date} | ${group.dayOfWeek} | ${group.title}"`);
            }
             csvRows.push(''); // Add a blank line for separation
        });

        const csvContent = '\uFEFF' + csvRows.join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${getCleanFileName()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div className="space-y-6">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6">
                <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Экспорт данных</h2>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Сохраните результаты анализа в удобном для вас формате</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-6">
                    {/* XLSX Export */}
                    <button onClick={exportToXLSX} className="p-6 border-2 border-primary bg-primary-light dark:bg-dark-primary-light dark:border-dark-primary rounded-lg text-left hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-background">
                        <span className="text-lg font-bold text-primary dark:text-dark-primary">Экспорт в XLSX (формат КПП)</span>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Рекомендуемый формат. Сохраняет цвета, объединение ячеек и структуру.</p>
                    </button>
                    
                    {/* CSV Export */}
                    <div className="p-6 border-2 border-secondary dark:border-dark-secondary rounded-lg flex flex-col justify-between">
                        <div>
                            <span className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Экспорт в CSV (упрощенный)</span>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Базовый текстовый формат, совместимый со всеми редакторами.</p>
                             <div className="mt-4">
                                <label className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Разделитель:</label>
                                <div className="flex items-center gap-4 mt-1">
                                    <label className="flex items-center gap-2">
                                        <input type="radio" value=";" checked={csvDelimiter === ';'} onChange={() => setCsvDelimiter(';')} className="text-primary focus:ring-primary"/>
                                        Точка с запятой (;)
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" value="," checked={csvDelimiter === ','} onChange={() => setCsvDelimiter(',')} className="text-primary focus:ring-primary"/>
                                        Запятая (,)
                                    </label>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => exportToCSV(csvDelimiter)} className="mt-4 w-full px-4 py-2 bg-secondary text-text-primary dark:bg-dark-secondary dark:text-dark-text-primary rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-semibold">
                            Скачать CSV
                        </button>
                    </div>
                </div>
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
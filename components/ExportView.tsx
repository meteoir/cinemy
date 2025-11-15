import React from 'react';
import type { SceneData, FormattedData } from '../types';
import { formatDataForBreakdown } from '../types';

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

        const formattedData = formatDataForBreakdown(data);

        const headers = [
            "Серия", "Сцена", "Режим", "Инт / нат", "Объект", "Подобъект", "Синопсис",
            "Персонажи", "Массовка / Групповка", "Грим / Костюм",
            "Реквизит / Животное / Игровые фото", "Игровой транспорт", "Декорация",
            "Спец. оборудование / Администрация", "Трюк / Пиротехник"
        ];
        
        let sheetData: (string | null)[][] = [headers];
        const headerRowIndices: { index: number, type: 'day' | 'off-day' }[] = [];

        formattedData.forEach(group => {
            headerRowIndices.push({ index: sheetData.length, type: group.type });
            if (group.type === 'day') {
                const headerRow = [
                    `${group.date} ${group.dayOfWeek} СМЕНА №${group.shiftNumber}`, null, null,
                    group.shiftType, null, null,
                    `СМЕНА ${group.shiftTime}`, null, null, null,
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
                const offDayRow = [group.date, group.title, ...Array(headers.length - 2).fill(null)];
                sheetData.push(offDayRow);
            }
        });

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        
        // --- STYLING ---
        const styles = {
            header: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4A2E6F" } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } },
            dayHeader: { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: "C8BFE7" } }, alignment: { vertical: 'center' } },
            timeHeader: { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: "F9E79F" } }, alignment: { horizontal: 'center', vertical: 'center' } },
            offDayHeader: { font: { bold: true }, fill: { fgColor: { rgb: "E0E0E0" } }, alignment: { horizontal: 'center', vertical: 'center' } },
            cell: { alignment: { vertical: 'top', wrapText: true } },
        };
        
        worksheet['!merges'] = [];
        headerRowIndices.forEach(({ index: r, type }) => {
            if (type === 'day') {
                worksheet['!merges']?.push({ s: { r, c: 0 }, e: { r, c: 2 } });
                worksheet['!merges']?.push({ s: { r, c: 3 }, e: { r, c: 5 } });
                worksheet['!merges']?.push({ s: { r, c: 6 }, e: { r, c: 9 } });
                worksheet['!merges']?.push({ s: { r, c: 10 }, e: { r, c: 14 } });
            } else {
                worksheet['!merges']?.push({ s: { r, c: 1 }, e: { r, c: headers.length -1 } });
            }
        });
        
        const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1");
        for (let R = range.s.r; R <= range.e.r; ++R) {
             for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({r:R, c:C});
                let cell = worksheet[cellAddress];
                if (!cell) continue;

                const headerInfo = headerRowIndices.find(h => h.index === R);
                
                if (R === 0) cell.s = styles.header;
                else if (headerInfo) {
                    if (headerInfo.type === 'day') {
                        if (C >= 6 && C <= 9) cell.s = styles.timeHeader;
                        else cell.s = styles.dayHeader;
                    } else cell.s = styles.offDayHeader;
                }
                else cell.s = styles.cell;
            }
        }
        
        worksheet['!cols'] = headers.map(h => ({ wch: 30 }));
        worksheet['!rows'] = sheetData.map((_, i) => ({ hpt: headerRowIndices.find(h => h.index === i) ? 25 : 80 }));
        worksheet['!rows'][0] = { hpt: 30 };


        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown");
        XLSX.writeFile(workbook, `${getCleanFileName()}.xlsx`);
    };


    return (
        <div className="space-y-6">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6">
                <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Экспорт данных</h2>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Сохраните результаты анализа в формате профессионального КПП</p>
                <div className="grid grid-cols-1 mt-6">
                    <button onClick={exportToXLSX} className="p-6 border-2 border-primary bg-primary-light dark:bg-dark-primary-light dark:border-dark-primary rounded-lg text-left hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-background">
                        <span className="text-lg font-bold text-primary dark:text-dark-primary">Экспорт в XLSX (формат КПП)</span>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Рекомендуемый формат для производственных задач</p>
                    </button>
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
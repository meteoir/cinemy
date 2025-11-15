
import React, { useState, useMemo } from 'react';
import type { SceneData } from '../types';

interface ResultsViewProps {
  data: SceneData[];
  onReset: () => void;
  fileName: string;
}

const ALL_COLUMNS = [
  { key: 'id', name: 'Сцена №' },
  { key: 'location', name: 'Локация' },
  { key: 'timeOfDay', name: 'Время' },
  { key: 'characters', name: 'Персонажи' },
  { key: 'extras', name: 'Массовка' },
  { key: 'props', name: 'Реквизит' },
  { key: 'sfx', name: 'SFX' },
  { key: 'makeup', name: 'Грим' },
  { key: 'transport', name: 'Транспорт' },
];

const PRESETS = {
  basic: ['id', 'location', 'timeOfDay', 'characters'],
  advanced: ['id', 'location', 'timeOfDay', 'characters', 'props', 'extras'],
  full: ALL_COLUMNS.map(c => c.key),
};


const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset, fileName }) => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(PRESETS.full);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowercasedTerm = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(value => 
        Array.isArray(value) 
          ? value.join(', ').toLowerCase().includes(lowercasedTerm)
          : String(value).toLowerCase().includes(lowercasedTerm)
      )
    );
  }, [data, searchTerm]);
  
  const handlePresetChange = (preset: 'basic' | 'advanced' | 'full') => {
    setVisibleColumns(PRESETS[preset]);
  };

  const exportToCSV = () => {
    const headers = ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(c => c.name).join(',');
    const rows = filteredData.map(row => {
        return ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => {
            const value = row[col.key as keyof SceneData];
            if (Array.isArray(value)) {
                return `"${value.join(', ')}"`;
            }
            return `"${value}"`;
        }).join(',');
    }).join('\\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `breakdown_${fileName.split('.')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-brand-surface rounded-lg p-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-text-light">Результаты анализа</h2>
          <p className="text-sm text-brand-text-dark">{fileName}</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onReset} className="px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-gray-600 transition-colors">Новый сценарий</button>
            <button onClick={exportToCSV} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-600 transition-colors">Экспорт в CSV</button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4 p-4 bg-gray-900 rounded-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Пресеты:</span>
            <button onClick={() => handlePresetChange('basic')} className="px-3 py-1 text-sm bg-brand-secondary rounded-full hover:bg-gray-600">Базовый</button>
            <button onClick={() => handlePresetChange('advanced')} className="px-3 py-1 text-sm bg-brand-secondary rounded-full hover:bg-gray-600">Расширенный</button>
            <button onClick={() => handlePresetChange('full')} className="px-3 py-1 text-sm bg-brand-primary rounded-full hover:bg-blue-600">Полный</button>
          </div>
          <input 
            type="text" 
            placeholder="Поиск по таблице..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-brand-background border border-brand-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-brand-secondary">
          <thead className="bg-gray-800">
            <tr>
              {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-brand-surface divide-y divide-brand-secondary">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-800 transition-colors">
                {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm">
                    {Array.isArray(row[col.key as keyof SceneData]) 
                      ? (row[col.key as keyof SceneData] as string[]).join(', ') 
                      : String(row[col.key as keyof SceneData])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsView;

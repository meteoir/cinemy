import React, { useState, useMemo } from 'react';
import type { SceneData } from '../types';

interface ResultsViewProps {
  data: SceneData[];
}

const ALL_COLUMNS = [
  { key: 'id', name: '№' },
  { key: 'location', name: 'Локация' },
  { key: 'timeOfDay', name: 'Время' },
  { key: 'characters', name: 'Персонажи' },
  { key: 'props', name: 'Реквизит' },
  { key: 'sfx', name: 'Спецэффекты' },
  { key: 'makeup', name: 'Грим/Прически' },
  { key: 'stunts', name: 'Каскадеры' },
  { key: 'transport', name: 'Транспорт' },
  { key: 'extras', name: 'Массовка' },
];

const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 mr-1.5 text-text-secondary dark:text-dark-text-secondary flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>;
const TimeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 mr-1.5 text-text-secondary dark:text-dark-text-secondary flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;

const DataTag: React.FC<{ children: React.ReactNode, type?: 'default' | 'special' }> = ({ children, type = 'default' }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap";
    const typeClasses = type === 'special' 
        ? "bg-tag-bg text-tag-text dark:bg-dark-tag-bg dark:text-dark-tag-text" 
        : "bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-dark-text-secondary";
    return <span className={`${baseClasses} ${typeClasses}`}>{children}</span>;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data }) => {
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
  
  const renderCellContent = (row: SceneData, colKey: string) => {
    const value = row[colKey as keyof SceneData];
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-text-secondary dark:text-dark-text-secondary">—</span>;
        return <div className="flex flex-wrap gap-1.5">{value.map((item, index) => <DataTag key={`${item}-${index}`} type={colKey === 'sfx' || colKey === 'stunts' ? 'special' : 'default'}>{item}</DataTag>)}</div>;
    }
    if (colKey === 'location' || colKey === 'timeOfDay') {
        return <div className="flex items-center">{colKey === 'location' ? <LocationIcon/> : <TimeIcon/>}{String(value)}</div>
    }
    if (value === '' || value === null || value === undefined) return <span className="text-text-secondary dark:text-dark-text-secondary">—</span>;

    return String(value);
  }

  return (
    <div className="w-full bg-surface dark:bg-dark-surface rounded-lg shadow-card p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Таблица сцен</h2>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Результаты анализа сценария</p>
        </div>
        <input 
            type="text" 
            placeholder="Поиск по таблице..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-3 py-1.5 text-sm bg-transparent border border-secondary dark:border-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
          />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary dark:divide-dark-secondary">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              {ALL_COLUMNS.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary dark:divide-dark-secondary">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                 {ALL_COLUMNS.map(col => (
                  <td key={col.key} className="px-4 py-3 align-top text-sm text-text-primary dark:text-dark-text-primary" style={{ minWidth: ['props', 'characters', 'transport'].includes(col.key) ? '200px' : 'auto' }}>
                    {renderCellContent(row, col.key)}
                  </td>
                ))}
              </tr>
            ))}
             {filteredData.length === 0 && (
                <tr>
                    <td colSpan={ALL_COLUMNS.length} className="text-center py-10 text-text-secondary dark:text-dark-text-secondary">
                        Ничего не найдено по вашему запросу
                    </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsView;
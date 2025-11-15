import React, { useState, useMemo } from 'react';
import type { SceneData, FormattedData } from '../types';
import { formatDataForBreakdown } from '../types';

interface ResultsViewProps {
  data: SceneData[];
}

const TABLE_HEADERS = [
  "Серия", "Сцена", "Режим", "Инт/нат", "Объект", "Подобъект", "Синопсис",
  "Персонажи", "Массовка / Групповка", "Грим / Костюм",
  "Реквизит / Животное / Игровые фото", "Игровой транспорт", "Декорация",
  "Спец. оборудование / Администрация", "Трюк / Пиротехник"
];

const ResultsView: React.FC<ResultsViewProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formattedData = useMemo(() => formatDataForBreakdown(data), [data]);

  const filteredFormattedData = useMemo(() => {
    if (!searchTerm) return formattedData;
    const lowercasedTerm = searchTerm.toLowerCase();

    return formattedData.map(group => {
      if (group.type === 'off-day') {
        return group;
      }
      const filteredScenes = group.scenes.filter(scene =>
        Object.values(scene).some(value =>
          String(value).toLowerCase().includes(lowercasedTerm)
        )
      );
      return { ...group, scenes: filteredScenes };
    }).filter(group => group.type === 'off-day' || (group.type === 'day' && group.scenes.length > 0));

  }, [formattedData, searchTerm]);

  const renderSceneRow = (scene: SceneData) => (
    <tr key={scene.id} className="bg-surface dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <td className="px-2 py-3 align-top text-sm">{scene.series}</td>
      <td className="px-2 py-3 align-top text-sm font-bold">{scene.id}</td>
      <td className="px-2 py-3 align-top text-sm">{scene.mode}</td>
      <td className="px-2 py-3 align-top text-sm">{scene.int_nat}</td>
      <td className="px-2 py-3 align-top text-sm">{scene.object}</td>
      <td className="px-2 py-3 align-top text-sm">{scene.sub_object}</td>
      <td className="px-2 py-3 align-top text-sm" style={{minWidth: '250px'}}>{scene.synopsis}</td>
      <td className="px-2 py-3 align-top text-sm">{scene.characters?.join(', ')}</td>
      <td className="px-2 py-3 align-top text-sm">{scene.extras_grouping}</td>
      <td className="px-2 py-3 align-top text-sm">{[scene.makeup, scene.costume].filter(Boolean).join('\n')}</td>
      <td className="px-2 py-3 align-top text-sm">{[scene.props, scene.animals, scene.photos].filter(Boolean).join('\n')}</td>
      <td className="px-2 py-3 align-top text-sm">{scene.transport}</td>
      <td className="px-2 py-3 align-top text-sm">{scene.set_decoration}</td>
      <td className="px-2 py-3 align-top text-sm">{[scene.special_equipment, scene.administration].filter(Boolean).join('\n')}</td>
      <td className="px-2 py-3 align-top text-sm">{[scene.stunts, scene.pyrotechnics].filter(Boolean).join('\n')}</td>
    </tr>
  );

  return (
    <div className="w-full bg-surface dark:bg-dark-surface rounded-lg shadow-card p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Таблица сцен</h2>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Результаты анализа сценария в формате КПП</p>
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
        <table className="min-w-full border-collapse text-text-primary dark:text-dark-text-primary">
          <thead className="sticky top-12 bg-surface dark:bg-dark-surface">
            <tr>
              {TABLE_HEADERS.map(header => (
                <th key={header} className="px-2 py-3 text-left text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider border-b-2 border-secondary dark:border-dark-secondary">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          {filteredFormattedData.map((group, index) => (
            <tbody key={`${group.date}-${index}`}>
              {group.type === 'off-day' ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="p-2 bg-gray-200 dark:bg-gray-700 font-semibold text-center text-text-secondary dark:text-dark-text-secondary">
                    {group.date} | {group.title}
                  </td>
                </tr>
              ) : (
                <>
                  <tr className="bg-[#c8bfe7] dark:bg-[#4a4266]">
                      <td colSpan={3} className="px-2 py-1 font-bold">{group.date} {group.dayOfWeek} СМЕНА №{group.shiftNumber}</td>
                      <td colSpan={4} className="px-2 py-1 text-center font-bold">{group.shiftType}</td>
                      <td colSpan={4} className="px-2 py-1 text-center font-bold bg-yellow-300/80 text-black">СМЕНА {group.shiftTime}</td>
                      <td colSpan={4} className="px-2 py-1 text-xs">{group.comments.join('; ')}</td>
                  </tr>
                  {group.scenes.map(renderSceneRow)}
                </>
              )}
            </tbody>
          ))}
        </table>
        {filteredFormattedData.length === 0 && (
          <div className="text-center py-10 text-text-secondary dark:text-dark-text-secondary">
            Ничего не найдено по вашему запросу.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsView;

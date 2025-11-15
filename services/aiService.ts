
import type { SceneData } from '../types';

// This is a MOCK service. In a real application, this function would:
// 1. Send the file to a backend server.
// 2. The server would parse the PDF/DOCX to extract raw text.
// 3. The text would be segmented into scenes.
// 4. Each scene's text would be passed to a local LLM for analysis.
// 5. The structured JSON results from the LLM would be aggregated and returned.

const MOCK_DATA: SceneData[] = [
  {
    id: 1,
    location: 'ИНТ. КВАРТИРА ИВАНА',
    timeOfDay: 'Ночь',
    characters: ['Иван', 'Мария'],
    extras: [],
    props: ['Ноутбук', 'Стакан виски', 'Пистолет'],
    sfx: ['Звук сирен вдалеке'],
    makeup: [],
    transport: [],
  },
  {
    id: 2,
    location: 'ЭКСТ. УЛИЦА',
    timeOfDay: 'Ночь',
    characters: ['Иван'],
    extras: ['Прохожие'],
    props: ['Мобильный телефон'],
    sfx: ['Шум города', 'Дождь'],
    makeup: ['Мокрая одежда'],
    transport: ['Старый автомобиль'],
  },
  {
    id: 3,
    location: 'ИНТ. ПОЛИЦЕЙСКИЙ УЧАСТОК',
    timeOfDay: 'Ночь',
    characters: ['Иван', 'Детектив Петров'],
    extras: ['Полицейские'],
    props: ['Наручники', 'Папка с делом'],
    sfx: [],
    makeup: ['Синяк под глазом у Ивана'],
    transport: [],
  },
    {
    id: 4,
    location: 'ЭКСТ. ПРИСТАНЬ',
    timeOfDay: 'Утро',
    characters: ['Мария', 'Таинственный Незнакомец'],
    extras: ['Чайки'],
    props: ['Конверт', 'Бинокль'],
    sfx: ['Крики чаек', 'Шум волн'],
    makeup: [],
    transport: ['Катер'],
  },
];

export const processScript = (file: File): Promise<SceneData[]> => {
  console.log(`Simulating processing for file: ${file.name}`);
  
  // Simulate network delay and AI processing time (e.g., 3-5 seconds)
  const processingTime = 3000 + Math.random() * 2000;

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Processing complete. Returning mock data.');
      resolve(MOCK_DATA);
    }, processingTime);
  });
};

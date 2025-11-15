import type { SceneData } from '../types';

// This is a MOCK service that returns data consistent with the screenshots.
const MOCK_DATA: SceneData[] = [
  {
    id: 1,
    location: 'Офис редакции',
    timeOfDay: 'День',
    characters: ['Анна', 'Борис', 'Сергей'],
    props: ['Ноутбук', 'Кофе', 'Документы'],
    sfx: [],
    extras: '5-7 человек',
    makeup: [],
    transport: [],
  },
  {
    id: 2,
    location: 'Улица города',
    timeOfDay: 'Вечер',
    characters: ['Анна', 'Виктор'],
    props: ['Автомобиль', 'Телефон'],
    sfx: ['Дождь'],
    extras: '15-20 человек',
    makeup: [],
    transport: [],
  },
  {
    id: 3,
    location: 'Кафе',
    timeOfDay: 'День',
    characters: ['Анна', 'Марина'],
    props: ['Меню', 'Посуда'],
    sfx: [],
    extras: '3-5 человек',
    makeup: [],
    transport: [],
  },
  {
    id: 4,
    location: 'Парк',
    timeOfDay: 'День',
    characters: ['Виктор', 'Сергей'],
    props: ['Скамейка', 'Газета'],
    sfx: ['Птицы'],
    extras: '10-12 человек',
    makeup: [],
    transport: [],
  },
  {
    id: 5,
    location: 'Квартира Анны',
    timeOfDay: 'Ночь',
    characters: ['Анна'],
    props: ['Телефон', 'Ноутбук', 'Чашка чая'],
    sfx: [],
    extras: 'нет',
    makeup: [],
    transport: [],
  },
  {
    id: 6,
    location: 'Улица города',
    timeOfDay: 'День',
    characters: ['Борис', 'Марина'],
    props: ['Зонт', 'Сумка'],
    sfx: [],
    extras: '20-25 человек',
    makeup: [],
    transport: [],
  },
  {
    id: 7,
    location: 'Ресторан',
    timeOfDay: 'Вечер',
    characters: ['Анна', 'Борис', 'Виктор', 'Марина'],
    props: ['Меню', 'Бокалы', 'Посуда'],
    sfx: ['Фоновая музыка'],
    extras: '8-10 человек',
    makeup: [],
    transport: [],
  },
  {
    id: 8,
    location: 'Офис редакции',
    timeOfDay: 'Ночь',
    characters: ['Анна', 'Сергей'],
    props: ['Документы', 'Кофе', 'Принтер'],
    sfx: [],
    extras: '2-3 человека',
    makeup: [],
    transport: [],
  },
];


export const processScript = (file: File): Promise<SceneData[]> => {
  console.log(`Simulating processing for file: ${file.name}`);
  
  const processingTime = 2000 + Math.random() * 1500;

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Processing complete. Returning mock data.');
      resolve(MOCK_DATA);
    }, processingTime);
  });
};

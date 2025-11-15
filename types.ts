
export interface SceneData {
  id: number;
  location: string;
  timeOfDay: 'День' | 'Ночь' | 'Вечер' | 'Утро' | 'Не указано';
  characters: string[];
  extras: string[];
  props: string[];
  sfx: string[];
  makeup: string[];
  transport: string[];
}

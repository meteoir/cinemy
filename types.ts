export type AnalysisCategory = 'characters' | 'extras' | 'props' | 'sfx' | 'makeup' | 'stunts' | 'transport';

export interface AnalysisOptions {
  preset: 'basic' | 'advanced' | 'full' | 'custom';
  categories: AnalysisCategory[];
}

export interface SceneData {
  id: number;
  location: string;
  timeOfDay: string;
  characters: string[];
  extras: string;
  props: string[];
  sfx: string[];
  makeup: string[];
  stunts: string[];
  transport: string[];
}

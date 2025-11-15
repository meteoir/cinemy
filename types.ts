export type AnalysisCategory = 'characters' | 'extras' | 'props' | 'sfx' | 'makeup' | 'stunts' | 'transport';

export interface AnalysisOptions {
  preset: 'basic' | 'advanced' | 'full' | 'custom';
  categories: AnalysisCategory[];
}

export interface SceneData {
  id: string; // The scene number, can be complex like "4-2"
  series?: string;
  mode: string; // 'День', 'Ночь', etc.
  int_nat: string; // 'Инт', 'Нат', 'Нат/Инт'
  object: string; // The main location/object
  sub_object?: string; // The sub-location
  synopsis: string;
  characters: string[];
  extras_grouping: string;
  makeup: string;
  costume: string;
  props: string;
  animals?: string;
  photos?: string;
  transport: string;
  set_decoration: string;
  special_equipment: string;
  administration?: string;
  stunts: string;
  pyrotechnics?: string;
}

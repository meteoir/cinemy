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

export interface FormattedSceneDay {
  type: 'day';
  date: string;
  dayOfWeek: string;
  shiftNumber: number;
  shiftType: string;
  shiftTime: string;
  comments: string[];
  scenes: SceneData[];
}

export interface OffDay {
    type: 'off-day';
    date: string;
    dayOfWeek: string;
    title: string;
}

export type FormattedData = FormattedSceneDay | OffDay;

const isDay = (mode: string): boolean => {
    if (!mode) return true;
    const lowerMode = mode.toLowerCase();
    return lowerMode.includes('день') || lowerMode.includes('утро');
};

export const formatDataForBreakdown = (data: SceneData[]): FormattedData[] => {
    if (!data || data.length === 0) return [];

    // 1. Create shifts based on location and time of day
    const shifts: SceneData[][] = [];
    if (data.length > 0) {
        let currentShift: SceneData[] = [data[0]];
        for (let i = 1; i < data.length; i++) {
            const prevScene = data[i - 1];
            const currentScene = data[i];
            if (
                currentScene.object === prevScene.object &&
                isDay(currentScene.mode) === isDay(prevScene.mode)
            ) {
                currentShift.push(currentScene);
            } else {
                shifts.push(currentShift);
                currentShift = [currentScene];
            }
        }
        shifts.push(currentShift);
    }
    
    // 2. Format shifts into shooting days with dates
    const formattedData: FormattedData[] = [];
    let currentDate = new Date();
    let shiftNumber = 1;
    const weekdays = ['ВОСКРЕСЕНЬЕ', 'ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'];
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

    shifts.forEach((shiftScenes) => {
        const dayOfWeek = currentDate.getDay();

        if (dayOfWeek === 6 || dayOfWeek === 0) { // Saturday or Sunday
             formattedData.push({
                type: 'off-day',
                date: currentDate.toLocaleDateString('ru-RU', dateOptions),
                dayOfWeek: weekdays[dayOfWeek],
                title: 'ОТСЫПНО'
            });
            currentDate.setDate(currentDate.getDate() + 1);
            // If we just added a day off for Saturday, check if the next day is Sunday and add another
            if (currentDate.getDay() === 0) {
                 formattedData.push({
                    type: 'off-day',
                    date: currentDate.toLocaleDateString('ru-RU', dateOptions),
                    dayOfWeek: weekdays[0],
                    title: 'ОТСЫПНО'
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        const firstScene = shiftScenes[0];
        const isDayShift = isDay(firstScene.mode);
        const shiftType = isDayShift ? 'ДНЕВНАЯ СМЕНА' : 'НОЧНАЯ СМЕНА';
        const shiftTime = isDayShift ? '09:00-21:00' : '20:00-08:00';

        const comments = shiftScenes.map(s => s.administration || '').filter(Boolean);

        formattedData.push({
            type: 'day',
            date: currentDate.toLocaleDateString('ru-RU', dateOptions),
            dayOfWeek: weekdays[currentDate.getDay()],
            shiftNumber: shiftNumber,
            shiftType: shiftType,
            shiftTime: shiftTime,
            comments: [...new Set(comments)],
            scenes: shiftScenes,
        });
        
        shiftNumber++;
        currentDate.setDate(currentDate.getDate() + 1);
    });

    return formattedData;
}
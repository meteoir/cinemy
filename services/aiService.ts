import { GoogleGenAI } from "@google/genai";
import type { SceneData, AnalysisOptions, AnalysisCategory } from '../types';

// Let TypeScript know that mammoth.js is available globally from the script tag in index.html
declare var mammoth: any;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


const PROMPT_BASE = `You are a professional film production assistant. Your task is to analyze the provided film script and create a detailed breakdown sheet. Structure your output as a valid JSON array of objects, where each object represents a single scene. Each object must have the following mandatory properties:

- "id": Scene number, as a string (e.g., "1", "4-2", "6-A").
- "series": Series number, if applicable (string).
- "mode": Time of day ('День', 'Ночь', 'Утро', 'Вечер').
- "int_nat": Location type ('Инт' for Interior, 'Нат' for Exterior, or 'Нат/Инт').
- "object": The main location ('Объект').
- "sub_object": The sub-location or specific area within the main location ('Подобъект').
- "synopsis": A brief one-sentence summary of the scene's action.
- "set_decoration": Details about the set, furniture, and environment ('Декорация').
- "administration": Administrative notes, permissions, or special arrangements ('Администрация').`;

const PROMPT_CATEGORIES: Record<AnalysisCategory, string> = {
    characters: '- "characters": An array of all speaking characters.',
    extras: '- "extras_grouping": A description of any extras, background actors, or crowd scenes, including numbers if specified (e.g., "Массовка: Прохожие (10)").',
    makeup: '- "makeup": Description of any special makeup or hair requirements (\'Грим\').\n- "costume": Description of costumes (\'Костюм\').',
    props: '- "props": Description of all props, including items characters interact with (\'Реквизит\').\n- "animals": Any animals mentioned (\'Животное\').\n- "photos": Any on-screen graphics, photos, or digital screen content (\'Игровые фото\').',
    transport: '- "transport": All vehicles or modes of transport involved (\'Игровой транспорт\').',
    stunts: '- "stunts": Any physical stunts described (\'Трюк\').',
    sfx: '- "pyrotechnics": Any pyrotechnics, fire, or special effects like smoke (\'Пиротехник\').\n- "special_equipment": Any special camera, lighting, or other technical equipment needed (\'Спец. оборудование\').'
};

const PROMPT_FOOTER = `\n\nFor any optional properties that are not mentioned in a scene, use an empty string "" or an empty array [] for array properties. The entire response must consist ONLY of the JSON array, with no surrounding text, comments, or markdown formatting.`;


const generatePrompt = (options: AnalysisOptions): string => {
    let prompt = PROMPT_BASE;
    
    const includedCategories = new Set(options.categories);
    
    if (includedCategories.size > 0) {
        prompt += '\n\nAdditionally, include the following optional properties based on your analysis:';
        
        for (const category of Object.keys(PROMPT_CATEGORIES) as AnalysisCategory[]) {
            if (includedCategories.has(category)) {
                prompt += '\n' + PROMPT_CATEGORIES[category];
            }
        }
    }
    
    prompt += PROMPT_FOOTER;
    return prompt;
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: {
        mimeType: file.type,
        data: base64EncodedData,
      },
    };
  };

export const processScript = async (
  file: File,
  options: AnalysisOptions
): Promise<SceneData[]> => {
  console.log(`Starting script processing for ${file.name} with Gemini.`);

  const prompt = generatePrompt(options);

  try {
    let contents;

    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx')) {
        console.log("DOCX file detected. Extracting text content on the client-side.");
        if (typeof mammoth === 'undefined') {
            throw new Error("Mammoth.js library is not loaded. Cannot process DOCX files.");
        }
        const arrayBuffer = await file.arrayBuffer();
        const { value: scriptText } = await mammoth.extractRawText({ arrayBuffer });
        contents = `${prompt}\n\nHere is the script content:\n\n${scriptText}`;
    } else if (file.type === 'application/pdf') {
        console.log("PDF file detected. Sending file data to Gemini.");
        const filePart = await fileToGenerativePart(file);
        contents = { parts: [{ text: prompt }, filePart] };
    } else {
        throw new Error("Unsupported file format. Please use PDF or DOCX.");
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
    });

    const responseText = response.text;
    console.log("Received response from Gemini.");

    let jsonString = responseText.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7).trim();
    }
    if (jsonString.endsWith('```')) {
      jsonString = jsonString.substring(0, jsonString.length - 3).trim();
    }
    
    const parsedResult = JSON.parse(jsonString);

    if (!Array.isArray(parsedResult)) {
        throw new Error("The model returned data in an unexpected format. Expected a JSON array.");
    }

    const sanitizedResult = parsedResult.map((scene: any) => ({
        id: String(scene.id ?? ''),
        series: scene.series ?? "",
        mode: scene.mode ?? "",
        int_nat: scene.int_nat ?? "",
        object: scene.object ?? "",
        sub_object: scene.sub_object ?? "",
        synopsis: scene.synopsis ?? "",
        characters: Array.isArray(scene.characters) ? scene.characters : [],
        extras_grouping: scene.extras_grouping ?? "",
        makeup: scene.makeup ?? "",
        costume: scene.costume ?? "",
        props: scene.props ?? "",
        animals: scene.animals ?? "",
        photos: scene.photos ?? "",
        transport: scene.transport ?? "",
        set_decoration: scene.set_decoration ?? "",
        special_equipment: scene.special_equipment ?? "",
        administration: scene.administration ?? "",
        stunts: scene.stunts ?? "",
        pyrotechnics: scene.pyrotechnics ?? "",
    }));
    return sanitizedResult as SceneData[];

  } catch (e) {
    console.error("Failed to process script with Gemini:", e);
    if (e instanceof SyntaxError) {
        throw new Error("Could not parse the breakdown from the script. The model returned an invalid JSON format.");
    }
    // Re-throw other errors to be handled by the caller
    throw e;
  }
};

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { SceneData } from '../types';

// Let TypeScript know that mammoth.js is available globally from the script tag in index.html
declare var mammoth: any;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const FULL_ANALYSIS_PROMPT = `You are a professional film production assistant. Your task is to analyze the provided film script and create a detailed breakdown sheet. Structure your output as a valid JSON array of objects, where each object represents a single scene. Each object must have the following properties:

- "id": Scene number, as a string (e.g., "1", "4-2", "6-A").
- "series": Series number, if applicable (string).
- "mode": Time of day ('День', 'Ночь', 'Утро', 'Вечер').
- "int_nat": Location type ('Инт' for Interior, 'Нат' for Exterior, or 'Нат/Инт').
- "object": The main location ('Объект').
- "sub_object": The sub-location or specific area within the main location ('Подобъект').
- "synopsis": A brief one-sentence summary of the scene's action.
- "characters": An array of all speaking characters.
- "extras_grouping": A description of any extras, background actors, or crowd scenes, including numbers if specified (e.g., "Массовка: Прохожие (10)").
- "makeup": Description of any special makeup or hair requirements ('Грим').
- "costume": Description of costumes ('Костюм').
- "props": Description of all props, including items characters interact with ('Реквизит').
- "animals": Any animals mentioned ('Животное').
- "photos": Any on-screen graphics, photos, or digital screen content ('Игровые фото').
- "transport": All vehicles or modes of transport involved ('Игровой транспорт').
- "set_decoration": Details about the set, furniture, and environment ('Декорация').
- "special_equipment": Any special camera, lighting, or other technical equipment needed ('Спец. оборудование').
- "administration": Administrative notes, permissions, or special arrangements ('Администрация').
- "stunts": Any physical stunts described ('Трюк').
- "pyrotechnics": Any pyrotechnics, fire, or special effects like smoke ('Пиротехник').

If a property is not mentioned in a scene, use an empty string "" or an empty array [] for the 'characters' property. The entire response must consist ONLY of the JSON array, with no surrounding text, comments, or markdown formatting.`;


// Helper function to convert a File object to a base64-encoded generative part.
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const processScript = async (
  file: File
): Promise<SceneData[]> => {
  console.log(`Starting full script processing for ${file.name}`);

  try {
    const prompt = FULL_ANALYSIS_PROMPT;
    let response: GenerateContentResponse;

    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx')) {
      console.log("DOCX file detected. Extracting text content on the client-side.");
      if (typeof mammoth === 'undefined') {
          throw new Error("Mammoth.js library is not loaded. Cannot process DOCX files.");
      }
      const arrayBuffer = await file.arrayBuffer();
      const { value: scriptText } = await mammoth.extractRawText({ arrayBuffer });
      console.log("Text extracted. Sending as a text-only prompt.");
      
      const fullPrompt = `${prompt}\n\nHere is the script text to analyze:\n\n${scriptText}`;

      response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [{ text: fullPrompt }] }],
      });

    } else {
      console.log("PDF file detected. Using multimodal approach.");
      const filePart = await fileToGenerativePart(file);
      const textPart = { text: prompt };

      console.log("Sending file and prompt to Gemini...");
      response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [filePart, textPart] }], 
      });
    }
    
    console.log("Received response from Gemini.");

    let jsonString = response.text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3, -3).trim();
    }
    
    const result = JSON.parse(jsonString);

    const sanitizedResult = result.map((scene: any) => ({
        id: String(scene.id ?? ''),
        series: scene.series ?? "",
        mode: scene.mode ?? "",
        int_nat: scene.int_nat ?? "",
        object: scene.object ?? "",
        sub_object: scene.sub_object ?? "",
        synopsis: scene.synopsis ?? "",
        characters: scene.characters ?? [],
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
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Could not parse the breakdown from the script.");
  }
};

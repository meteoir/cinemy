import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { SceneData, AnalysisOptions } from '../types';

// Let TypeScript know that mammoth.js is available globally from the script tag in index.html
declare var mammoth: any;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generatePrompt = (options: AnalysisOptions): string => {
    const basePrompt = `Analyze the provided film script. Your task is to act as a pre-production assistant and break down the script into individual scenes. For each scene, extract the following information and structure it as a JSON array of objects. Each object must represent one scene.
    
The properties for each scene object are:
- id: The scene number (integer). Must be sequential.
- location: The primary location of the scene (string).
- timeOfDay: The time of day, e.g., "День", "Ночь", "Утро", "Вечер" (string).
`;
    
    let prompt = basePrompt;
    
    const categoryPrompts: Record<string, string> = {
        characters: '- characters: A list of all speaking characters in the scene (array of strings).\n',
        extras: '- extras: A description of any background actors or extras needed, including approximate numbers e.g., "10-15 человек" (string).\n',
        props: '- props: A list of all significant props mentioned or required for the scene (array of strings).\n',
        sfx: '- sfx: A list of any sound effects or special visual effects described (array of strings).\n',
        makeup: '- makeup: A list of special makeup or hair requirements (array of strings).\n',
        stunts: '- stunts: A list of any stunts or special actions required (array of strings).\n',
        transport: '- transport: A list of any vehicles or modes of transport involved (array of strings).\n',
    };

    options.categories.forEach(cat => {
        if (categoryPrompts[cat]) {
            prompt += categoryPrompts[cat];
        }
    });
    
    prompt += `
Ensure the output is a valid JSON array. If a category is not present in a scene, use an empty array [] for list types or an empty string "" for string types. For example: "props": []. Analyze the entire script from beginning to end. The response must only contain the JSON array, no other text or markdown formatting.
    `;
    
    return prompt;
};

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
  file: File,
  options: AnalysisOptions
): Promise<SceneData[]> => {
  console.log(`Starting script processing for ${file.name} with options:`, options);

  try {
    const prompt = generatePrompt(options);
    let response: GenerateContentResponse;

    // For DOCX files, extract text client-side to bypass potential MIME type issues.
    // For PDFs, use the standard multimodal upload which is generally supported.
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
      // Assume PDF, use multimodal approach
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
        id: scene.id ?? 0,
        location: scene.location ?? '',
        timeOfDay: scene.timeOfDay ?? '',
        characters: scene.characters ?? [],
        extras: scene.extras ?? '',
        props: scene.props ?? [],
        sfx: scene.sfx ?? [],
        makeup: scene.makeup ?? [],
        stunts: scene.stunts ?? [],
        transport: scene.transport ?? [],
    }));
    return sanitizedResult as SceneData[];

  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Could not parse the breakdown from the script.");
  }
};
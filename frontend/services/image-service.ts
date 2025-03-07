import api from './api';

export interface ImageAnalysisResponse {
  analysis: string;
}

/**
 * Sends an image to the backend for analysis using Gemini Flash
 * @param imageData Base64 encoded image data
 * @param prompt Optional custom prompt for the analysis
 * @returns Analysis text from the AI
 */
export const analyzeImage = async (imageData: string, prompt?: string): Promise<string> => {
  const response = await api.post<ImageAnalysisResponse>('/images/analyze', {
    image_data: imageData,
    user_id: 'anonymous', // This can be updated when authentication is implemented
    prompt: prompt || "Analyze this AWS architecture diagram. Identify the services shown, explain the architecture flow, and suggest improvements or potential issues."
  });
  return response;
};
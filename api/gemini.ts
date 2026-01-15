
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// This is a serverless function that will be deployed to Vercel.
// It acts as a secure proxy to the Google Gemini API.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This is a simplified handler. A production version would have more robust
// input validation and error handling.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Basic check for API key
  if (!process.env.API_KEY) {
    console.error('API_KEY is not set.');
    return res.status(500).json({ error: 'API key is missing on the server.' });
  }

  try {
    const { task, params } = req.body;

    if (task === 'generateContent') {
      const genAiResponse: GenerateContentResponse = await ai.models.generateContent(params);
      
      // Manually construct a plain, serializable object to return to the client.
      // This is safer than returning the complex SDK response object directly.
      const responsePayload = {
        text: genAiResponse.text,
        candidates: genAiResponse.candidates,
        // Add any other properties the frontend might need from the response
      };

      return res.status(200).json(responsePayload);
    }
    
    return res.status(400).json({ error: 'Invalid task specified' });

  } catch (error: any) {
    console.error('Error in Gemini API proxy:', error);
    // Be careful not to leak sensitive error details to the client
    const isQuotaError = error.message?.includes('quota');
    const clientErrorMessage = isQuotaError 
      ? 'API quota exceeded. Please check your usage limits.'
      : 'An error occurred while communicating with the AI service.';

    res.status(500).json({ error: clientErrorMessage });
  }
}

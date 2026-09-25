/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

export const gemini = new GoogleGenAI({
  apiKey,
});

export const GEMINI_MODEL = "gemini-3.6-flash";

export async function generateGeminiContent(
  prompt: string,
  maxRetries = 3,
) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[Gemini] Attempt ${attempt + 1}/${maxRetries + 1}`,
      );

      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });

      console.log("[Gemini] Success");

      return response;
    } catch (error: any) {
      lastError = error;

      const status = error?.status;

      console.error(
        `[Gemini] Error status=${status}, attempt=${attempt + 1}`,
      );

      if (
        status !== 503 &&
        status !== 429 &&
        status !== 500 &&
        status !== 408
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      const baseDelay = 2000 * 2 ** attempt;
      const jitter = Math.floor(Math.random() * 1000);
      const delay = baseDelay + jitter;

      console.log(
        `[Gemini] Retrying in ${delay}ms...`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay),
      );
    }
  }

  throw lastError;
}
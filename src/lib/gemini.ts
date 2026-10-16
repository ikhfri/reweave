/* eslint-disable @typescript-eslint/no-unused-vars */
export const GEMINI_MODEL = process.env.YUPIAI_MODEL || "cheap-qwen3.7-flash";

function cleanJsonString(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function generateGeminiContent(
  prompt: string,
  _retries = 3
): Promise<{ text: string }> {
  const apiKey = process.env.YUPIAI_API_KEY;
  const apiHost = process.env.YUPIAI_API_HOST || "https://gateway.euphy.cloud";
  const apiPath = process.env.YUPIAI_API_PATH || "/v1/chat/completions";
  const modelName = GEMINI_MODEL;

  if (!apiKey) {
    throw new Error("YUPIAI_API_KEY is not configured in environment variables.");
  }

  const endpoint = `${apiHost.replace(/\/$/, "")}${apiPath}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that always responds with valid JSON when requested.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`YupiAI API error (${response.status}): ${errorText}`);
    (error as unknown as { status: number }).status = response.status;
    throw error;
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content || "";

  return {
    text: cleanJsonString(rawContent),
  };
}
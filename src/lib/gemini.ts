const YUPIAI_API_KEY = process.env.YUPIAI_API_KEY;
const YUPIAI_API_HOST =
  process.env.YUPIAI_API_HOST ?? "https://gateway.euphy.cloud";
const YUPIAI_API_PATH = process.env.YUPIAI_API_PATH ?? "/v1/chat/completions";
export const AI_MODEL = process.env.YUPIAI_MODEL ?? "cheap-qwen3.7-flash";

export const GEMINI_MODEL = AI_MODEL;

export type AITextResponse = {
  text?: string;
  [key: string]: unknown;
};

function getEndpoint() {
  const host = YUPIAI_API_HOST.replace(/\/+$/, "");
  const path = `/${YUPIAI_API_PATH.replace(/^\/+/, "")}`;
  return `${host}${path}`;
}

function getStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    return Number.isFinite(status) ? status : undefined;
  }
  return undefined;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateAIContent(
  prompt: string,
  maxRetries = 3,
): Promise<AITextResponse> {
  if (!YUPIAI_API_KEY) {
    throw new Error("YupiAI is not ready yet");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.info(
        `[YupiAI] Attempt ${attempt + 1}/${maxRetries + 1}; model=${AI_MODEL}`,
      );

      const response = await fetch(getEndpoint(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${YUPIAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: "system",
              content:
                "Follow the user's instructions carefully. If JSON output is requested, return only valid JSON without markdown fences.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(45_000),
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(
          `YupiAI request failed (${response.status}): ${
            responseBody?.error?.message ??
            responseBody?.message ??
            response.statusText
          }`,
        ) as Error & { status?: number };
        error.status = response.status;
        throw error;
      }

      const text = responseBody?.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) {
        throw new Error("YupiAI returned an empty response");
      }

      console.info("[YupiAI] Success");
      return { text, raw: responseBody };
    } catch (error: unknown) {
      lastError = error;
      const status = getStatus(error);

      console.error(
        `[YupiAI] Error status=${status ?? "unknown"}, attempt=${attempt + 1}`,
      );

      const errorName = error instanceof Error ? error.name : undefined;

      const retryable =
        status === undefined ||
        status === 408 ||
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 || 
        errorName === "TimeoutError" ||
        errorName === "AbortError";

      if (!retryable || attempt === maxRetries) {
        throw error;
      }

      const delay =
        Math.min(1500 * 2 ** attempt, 10_000) + Math.floor(Math.random() * 500);

      console.warn(`[YupiAI] Retrying in ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Backwards-compatible alias so existing routes do not need to change now.
 */
export const generateGeminiContent = generateAIContent;

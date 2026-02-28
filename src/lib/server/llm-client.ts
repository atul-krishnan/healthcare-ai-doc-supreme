import OpenAI from "openai";
import { env } from "@/lib/env";

type Provider = "openai" | "huggingface";

type LlmConfig = {
  provider: Provider;
  model: string;
  client: OpenAI;
};

const OPENAI_DEFAULT_MODEL = "gpt-4.1-mini";
const HUGGINGFACE_DEFAULT_MODEL = "openai/gpt-oss-120b:cerebras";

export function getLlmConfig(): LlmConfig | null {
  if (env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      model: env.OPENAI_MODEL ?? OPENAI_DEFAULT_MODEL,
      client: new OpenAI({ apiKey: env.OPENAI_API_KEY }),
    };
  }

  if (env.HUGGINGFACE_API_KEY) {
    return {
      provider: "huggingface",
      model: env.HUGGINGFACE_MODEL ?? HUGGINGFACE_DEFAULT_MODEL,
      client: new OpenAI({
        apiKey: env.HUGGINGFACE_API_KEY,
        baseURL: "https://router.huggingface.co/v1",
      }),
    };
  }

  return null;
}

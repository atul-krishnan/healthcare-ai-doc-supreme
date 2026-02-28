import { retrieveClinicalEvidence, toPromptEvidenceBlock } from "@/lib/server/clinical-knowledge";
import { deidentifyClinicalText } from "@/lib/server/deidentify";
import { getLlmConfig } from "@/lib/server/llm-client";

function heuristicReply(content: string): string {
  const lower = content.toLowerCase();

  if (lower.includes("pain") || lower.includes("fever") || lower.includes("breath")) {
    return "I noted potentially important symptoms. A doctor visit is recommended soon, especially if symptoms worsen. I can summarize this for your clinician.";
  }

  if (lower.includes("report") || lower.includes("lab")) {
    return "You can use Health Records to scan your report text and save extracted findings before your doctor visit.";
  }

  return "Thanks, I captured that update. If symptoms persist or worsen, escalate to a doctor visit for clinical evaluation.";
}

export async function generateAssistantReply(content: string) {
  const retrieval = await retrieveClinicalEvidence(content, 2);
  const evidenceBlock = toPromptEvidenceBlock(retrieval.citations);

  const llm = getLlmConfig();
  if (!llm) {
    return {
      reply: heuristicReply(content),
      model: "heuristic-fallback",
      retriever: retrieval.retriever,
    };
  }

  try {
    const completion = await llm.client.chat.completions.create({
      model: llm.model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a conservative telemedicine assistant. Keep responses brief, avoid diagnosis certainty, and recommend doctor escalation when red flags are possible.",
        },
        {
          role: "user",
          content: JSON.stringify({
            message: deidentifyClinicalText(content),
            evidence: evidenceBlock,
            responseStyle: "2-4 sentences, practical next step, no fear-mongering.",
          }),
        },
      ],
    });

    const reply = completion.choices[0]?.message.content?.trim();

    if (!reply) {
      throw new Error("Missing reply");
    }

    return {
      reply,
      model: completion.model ?? `${llm.provider}:${llm.model}`,
      retriever: retrieval.retriever,
    };
  } catch {
    return {
      reply: heuristicReply(content),
      model: "heuristic-fallback",
      retriever: retrieval.retriever,
    };
  }
}

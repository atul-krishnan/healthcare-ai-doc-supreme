import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type KnowledgeChunk = {
  id: string;
  title: string;
  source: string;
  content: string;
  tags: string[];
};

const kbDir = path.join(process.cwd(), "knowledge-base", "clinical");

let cache: Promise<KnowledgeChunk[]> | null = null;

function toTags(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 18);
}

async function loadFromDisk(): Promise<KnowledgeChunk[]> {
  const entries = await readdir(kbDir, { withFileTypes: true }).catch(() => []);

  const chunks: KnowledgeChunk[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    const filePath = path.join(kbDir, entry.name);
    const text = await readFile(filePath, "utf8").catch(() => "");

    if (!text.trim()) {
      continue;
    }

    const [firstLine, ...rest] = text.split(/\r?\n/);
    const title = firstLine.replace(/^#\s*/, "").trim() || entry.name.replace(/\.md$/, "");
    const content = rest.join("\n").trim();

    chunks.push({
      id: entry.name.replace(/\.md$/, ""),
      title,
      source: `knowledge-base/clinical/${entry.name}`,
      content,
      tags: toTags(`${title} ${content}`),
    });
  }

  return chunks;
}

export async function getKnowledgeBaseChunks() {
  if (!cache) {
    cache = loadFromDisk();
  }

  return cache;
}

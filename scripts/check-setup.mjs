import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

function parseEnv(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const index = line.indexOf("=");
    if (index === -1) {
      continue;
    }

    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    values[key] = value;
  }

  return values;
}

const env = fs.existsSync(envPath) ? parseEnv(fs.readFileSync(envPath, "utf8")) : {};

const checks = [
  {
    name: "Supabase client",
    keys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    required: true,
  },
  {
    name: "Supabase admin",
    keys: ["SUPABASE_SERVICE_ROLE_KEY"],
    required: true,
  },
  {
    name: "Stripe billing",
    keys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_INR"],
    required: true,
  },
  {
    name: "OpenAI triage",
    keys: ["OPENAI_API_KEY"],
    required: false,
  },
  {
    name: "Python ML triage",
    keys: ["TRIAGE_ML_SERVICE_URL"],
    required: false,
  },
];

const missingRequired = [];

console.log("YourDoc setup report");
console.log("===================");

for (const check of checks) {
  const missing = check.keys.filter((key) => !env[key]);
  if (missing.length === 0) {
    console.log(`[OK] ${check.name}`);
  } else {
    const label = check.required ? "MISSING" : "OPTIONAL";
    console.log(`[${label}] ${check.name}: ${missing.join(", ")}`);
  }

  if (check.required && missing.length > 0) {
    missingRequired.push(...missing);
  }
}

const migrationDir = path.join(root, "supabase", "migrations");
if (fs.existsSync(migrationDir)) {
  const files = fs.readdirSync(migrationDir).filter((name) => name.endsWith(".sql"));
  console.log(`[OK] Supabase migrations present: ${files.length}`);
} else {
  console.log("[MISSING] Supabase migrations directory");
}

if (missingRequired.length > 0) {
  console.log("\nRequired setup still pending.");
  process.exitCode = 1;
} else {
  console.log("\nRequired setup is complete.");
}

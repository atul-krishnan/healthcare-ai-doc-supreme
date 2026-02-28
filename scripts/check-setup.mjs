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
    name: "Hugging Face triage",
    keys: ["HUGGINGFACE_API_KEY"],
    required: false,
  },
  {
    name: "Python ML triage",
    keys: ["TRIAGE_ML_SERVICE_URL"],
    required: false,
  },
  {
    name: "Wearables connector",
    keys: ["WEARABLE_PROVIDER", "WEARABLE_API_KEY", "WEARABLE_SYNC_URL"],
    required: false,
  },
  {
    name: "EHR connector",
    keys: ["EHR_PROVIDER", "EHR_API_KEY", "EHR_SYNC_URL"],
    required: false,
  },
  {
    name: "Vector retrieval",
    keys: ["VECTOR_DB_PROVIDER", "VECTOR_DB_URL", "VECTOR_DB_API_KEY"],
    required: false,
  },
  {
    name: "Sentry error tracking",
    keys: ["NEXT_PUBLIC_SENTRY_DSN"],
    required: false,
  },
  {
    name: "PostHog analytics",
    keys: ["NEXT_PUBLIC_POSTHOG_KEY"],
    required: false,
  },
];

const missingRequired = [];
const warnings = [];

console.log("");
console.log("╔════════════════════════════════════════════════════╗");
console.log("║        YourDoc Pre-Deployment Readiness Check     ║");
console.log("╚════════════════════════════════════════════════════╝");
console.log("");

// ─── Environment Variables ───────────────────────────────────
console.log("─── Environment Variables ───");
for (const check of checks) {
  const missing = check.keys.filter((key) => !env[key]);
  if (missing.length === 0) {
    console.log(`  ✅ ${check.name}`);
  } else {
    const label = check.required ? "❌ REQUIRED" : "⚪ OPTIONAL";
    console.log(`  ${label} ${check.name}: ${missing.join(", ")}`);
  }

  if (check.required && missing.length > 0) {
    missingRequired.push(...missing);
  }
}

// ─── Supabase Migrations ─────────────────────────────────────
console.log("");
console.log("─── Supabase Migrations ───");
const migrationDir = path.join(root, "supabase", "migrations");
if (fs.existsSync(migrationDir)) {
  const files = fs.readdirSync(migrationDir).filter((name) => name.endsWith(".sql"));
  console.log(`  ✅ ${files.length} migration(s) found`);
  for (const file of files) {
    console.log(`     └─ ${file}`);
  }
} else {
  console.log("  ❌ Supabase migrations directory not found");
  missingRequired.push("supabase/migrations");
}

// ─── Production Domain ───────────────────────────────────────
console.log("");
console.log("─── Production Config ───");
const appUrl = env.NEXT_PUBLIC_APP_URL || "";
if (appUrl && !appUrl.includes("localhost")) {
  console.log(`  ✅ Production URL: ${appUrl}`);
} else {
  warnings.push("NEXT_PUBLIC_APP_URL is still localhost or unset");
  console.log("  ⚠️  NEXT_PUBLIC_APP_URL is localhost or unset");
}

// ─── Vercel Config ───────────────────────────────────────────
const vercelPath = path.join(root, "vercel.json");
if (fs.existsSync(vercelPath)) {
  console.log("  ✅ vercel.json present");
} else {
  warnings.push("vercel.json not found");
  console.log("  ⚠️  vercel.json not found");
}

// ─── Security Headers ────────────────────────────────────────
const nextConfigPath = path.join(root, "next.config.ts");
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, "utf8");
  if (configContent.includes("Strict-Transport-Security")) {
    console.log("  ✅ Security headers configured");
  } else {
    warnings.push("Security headers not found in next.config.ts");
    console.log("  ⚠️  Security headers not found in next.config.ts");
  }
}

// ─── Required Documents ──────────────────────────────────────
console.log("");
console.log("─── Policy Documents ───");
const requiredDocs = [
  { name: "Doctor Consultation SOP", path: "docs/DOCTOR_CONSULTATION_SOP.md" },
  { name: "Incident Response Plan", path: "docs/INCIDENT_RESPONSE_PLAN.md" },
  { name: "Data Retention Policy", path: "docs/DATA_RETENTION_POLICY.md" },
  { name: "Deployment Checklist", path: "docs/DEPLOYMENT_CHECKLIST.md" },
];

for (const doc of requiredDocs) {
  const docPath = path.join(root, doc.path);
  if (fs.existsSync(docPath)) {
    console.log(`  ✅ ${doc.name}`);
  } else {
    warnings.push(`${doc.name} not found at ${doc.path}`);
    console.log(`  ⚠️  ${doc.name} missing (${doc.path})`);
  }
}

// ─── Legal Pages ─────────────────────────────────────────────
console.log("");
console.log("─── Legal Pages ───");
const legalPages = [
  { name: "Terms of Service", path: "src/app/terms/page.tsx" },
  { name: "Privacy Policy", path: "src/app/privacy/page.tsx" },
];

for (const page of legalPages) {
  const pagePath = path.join(root, page.path);
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, "utf8");
    const isPlaceholder = content.length < 500;
    if (isPlaceholder) {
      warnings.push(`${page.name} appears to be a placeholder`);
      console.log(`  ⚠️  ${page.name} exists but appears to be a placeholder`);
    } else {
      console.log(`  ✅ ${page.name}`);
    }
  } else {
    warnings.push(`${page.name} page not found`);
    console.log(`  ❌ ${page.name} not found`);
  }
}

// ─── AI Triage Safety ────────────────────────────────────────
console.log("");
console.log("─── AI Safety ───");
const hasMLService = !!env.TRIAGE_ML_SERVICE_URL;
const hasOpenAI = !!env.OPENAI_API_KEY;
const hasHuggingFace = !!env.HUGGINGFACE_API_KEY;
if (hasMLService) {
  console.log("  ✅ Python ML triage service configured");
} else if (hasOpenAI || hasHuggingFace) {
  console.log("  ✅ External LLM fallback configured");
} else {
  console.log("  ⚠️  No external AI configured — using conservative heuristic fallback");
  warnings.push("No AI triage backend configured (ML service, OpenAI, or Hugging Face)");
}

if (env.AI_ZERO_RETENTION_MODE === "true") {
  console.log("  ✅ Zero-retention mode enabled");
} else {
  warnings.push("AI_ZERO_RETENTION_MODE not set to true");
  console.log("  ⚠️  AI_ZERO_RETENTION_MODE not explicitly enabled");
}

// ─── Summary ─────────────────────────────────────────────────
console.log("");
console.log("═══════════════════════════════════════════════════");
if (missingRequired.length === 0 && warnings.length === 0) {
  console.log("🚀 All checks passed — ready for deployment!");
} else if (missingRequired.length === 0) {
  console.log(`⚡ Required checks passed. ${warnings.length} warning(s) to review.`);
} else {
  console.log(`🔴 ${missingRequired.length} required item(s) missing. Fix before deploying.`);
}
console.log("═══════════════════════════════════════════════════");
console.log("");

if (missingRequired.length > 0) {
  process.exitCode = 1;
}

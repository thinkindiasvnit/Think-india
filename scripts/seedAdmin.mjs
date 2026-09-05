/**
 * Seed script: creates the initial admin user in Firestore.
 * Run once with: node scripts/seedAdmin.mjs
 *
 * Requires: NEXT_PUBLIC_FIREBASE_* env vars set in .env
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env manually (no dotenv dependency needed) ──────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const envLines = readFileSync(envPath, "utf-8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const [key, ...rest] = trimmed.split("=");
  process.env[key.trim()] = rest.join("=").trim();
}

// ── Firebase setup ────────────────────────────────────────────────────────────
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Admin users to seed ───────────────────────────────────────────────────────
const ADMIN_USERS = [
  {
    name:     "Think India SVNIT",
    email:    "admin@svnit.ac.in",
    password: "admin123",
  },
  {
    name:     "Ayushman Singh",
    email:    "ayushman@svnit.ac.in",
    password: "Ayushman@123",
  },
];

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seedAdmin() {
  for (const user of ADMIN_USERS) {
    console.log(`🔍 Checking if admin user "${user.email}" already exists…`);

    const q = query(
      collection(db, "admin"),
      where("email", "==", user.email)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      console.log(`✅ Admin user "${user.email}" already exists — skipping.`);
      continue;
    }

    console.log(`➕ Creating admin user: ${user.name} <${user.email}>`);
    const ref = await addDoc(collection(db, "admin"), user);
    console.log(`✅ Admin user created! Document ID: ${ref.id}`);
  }

  console.log("");
  console.log("👉 Login at: http://localhost:3000/admin/login");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err.message || err);
  process.exit(1);
});

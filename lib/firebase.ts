// Firebase-ready adapter (optional backend).
// To use Firebase instead of the default JSON / PostgreSQL store:
//   1. `npm i firebase`
//   2. Set NEXT_PUBLIC_FIREBASE_* env vars (see .env.example)
//   3. Replace lib/db.ts internals with Firestore calls using the
//      collection names below. REST API + UI stay unchanged.
//
// Collections: customers, projects, tickets
// Project doc <-> SolarProject, Customer doc <-> Customer, Ticket doc <-> Ticket

export const FIREBASE_COLLECTIONS = {
  customers: "customers",
  projects: "projects",
  tickets: "tickets",
} as const;

export function firebaseConfigFromEnv() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

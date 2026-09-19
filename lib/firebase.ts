import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  type Firestore,
} from "firebase/firestore";

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

export function isFirebaseConfigured(): boolean {
  const config = firebaseConfigFromEnv();
  return Boolean(config.projectId && config.apiKey);
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (cachedApp) return cachedApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedApp = getApp();
  } else {
    cachedApp = initializeApp(firebaseConfigFromEnv());
  }
  return cachedApp;
}

export function getFirebaseFirestore(): Firestore | null {
  if (cachedDb) return cachedDb;
  const app = getFirebaseApp();
  if (!app) return null;
  cachedDb = getFirestore(app);
  return cachedDb;
}

export async function firestoreGetAll<T>(collectionName: string): Promise<T[]> {
  const db = getFirebaseFirestore();
  if (!db) throw new Error("Firebase Firestore is not configured");

  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as T[];
}

export async function firestoreSet<T extends Record<string, unknown>>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) throw new Error("Firebase Firestore is not configured");

  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, data, { merge: true });
}

export async function firestoreSaveAll<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) throw new Error("Firebase Firestore is not configured");

  for (const item of items) {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
  }
}

export async function firestoreDelete(
  collectionName: string,
  id: string
): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) throw new Error("Firebase Firestore is not configured");

  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

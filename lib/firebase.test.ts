import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  firebaseConfigFromEnv,
  isFirebaseConfigured,
  getFirebaseApp,
  FIREBASE_COLLECTIONS,
} from "./firebase";

describe("firebase helper module", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    delete process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("exports the required collection names", () => {
    expect(FIREBASE_COLLECTIONS.customers).toBe("customers");
    expect(FIREBASE_COLLECTIONS.projects).toBe("projects");
    expect(FIREBASE_COLLECTIONS.tickets).toBe("tickets");
  });

  it("isFirebaseConfigured returns false when env vars are missing", () => {
    expect(isFirebaseConfigured()).toBe(false);
  });

  it("isFirebaseConfigured returns true when apiKey and projectId are present", () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "mock-key";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "mock-project-id";
    expect(isFirebaseConfigured()).toBe(true);
  });

  it("getFirebaseApp returns null when not configured", () => {
    expect(getFirebaseApp()).toBeNull();
  });

  it("firebaseConfigFromEnv returns default empty strings", () => {
    const config = firebaseConfigFromEnv();
    expect(config.apiKey).toBe("");
    expect(config.projectId).toBe("");
    expect(config.authDomain).toBe("");
  });
});

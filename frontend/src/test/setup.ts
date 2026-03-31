import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

if (!globalThis.crypto) {
  // @ts-expect-error - add missing crypto for tests.
  globalThis.crypto = {};
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () =>
    "00000000-0000-4000-8000-000000000000";
}

if (!globalThis.matchMedia) {
  globalThis.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const ensureStorage = (key: "localStorage" | "sessionStorage") => {
  const existing = (globalThis as unknown as Record<string, any>)[key];
  if (
    existing &&
    typeof existing.getItem === "function" &&
    typeof existing.setItem === "function" &&
    typeof existing.removeItem === "function" &&
    typeof existing.clear === "function"
  ) {
    return;
  }

  let store: Record<string, string> = {};
  const storage: StorageLike = {
    getItem: (itemKey) =>
      Object.prototype.hasOwnProperty.call(store, itemKey)
        ? store[itemKey]
        : null,
    setItem: (itemKey, value) => {
      store[itemKey] = String(value);
    },
    removeItem: (itemKey) => {
      delete store[itemKey];
    },
    clear: () => {
      store = {};
    },
  };

  (globalThis as unknown as Record<string, StorageLike>)[key] = storage;
};

ensureStorage("localStorage");
ensureStorage("sessionStorage");

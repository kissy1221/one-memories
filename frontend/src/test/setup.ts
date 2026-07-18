import "@testing-library/jest-dom/vitest";

// Node.js 25 + jsdom 26 don't wire up Web Storage correctly.
// Provide a simple in-memory implementation so tests can use localStorage.
const makeStorage = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; },
  };
};

Object.defineProperty(globalThis, "localStorage", {
  value: makeStorage(),
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, "sessionStorage", {
  value: makeStorage(),
  writable: true,
  configurable: true,
});

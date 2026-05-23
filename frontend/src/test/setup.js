import "@testing-library/jest-dom";

// Node.js 25 + jsdom 26 don't wire up Web Storage correctly.
// Provide a simple in-memory implementation so tests can use localStorage.
const makeStorage = () => {
  let store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
    key: (i) => Object.keys(store)[i] ?? null,
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

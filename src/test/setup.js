import '@testing-library/jest-dom';

// Polyfill Blob.text() for jsdom, which does not implement it natively.
// We intercept the Blob constructor to capture the raw content, then expose
// it via a .text() method that returns a resolved Promise.
const OriginalBlob = globalThis.Blob;
globalThis.Blob = class PatchedBlob extends OriginalBlob {
  constructor(parts, options) {
    super(parts, options);
    // Concatenate all string parts so .text() can return them
    this._rawText = (parts || [])
      .map((p) => (typeof p === 'string' ? p : ''))
      .join('');
  }

  text() {
    return Promise.resolve(this._rawText);
  }
};

// Mock localStorage for tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage for tests
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Clear storage before each test
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

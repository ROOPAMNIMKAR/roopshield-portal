import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadCSV } from './csvExport.js';

// Helpers to capture what was "downloaded"
let createdBlobs = [];
let createdLinks = [];

beforeEach(() => {
  createdBlobs = [];
  createdLinks = [];

  // Mock URL.createObjectURL and revokeObjectURL
  vi.stubGlobal('URL', {
    createObjectURL: (blob) => {
      createdBlobs.push(blob);
      return 'blob:mock-url';
    },
    revokeObjectURL: vi.fn(),
  });

  // Mock document.createElement to capture anchor clicks
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    const el = originalCreateElement(tag);
    if (tag === 'a') {
      vi.spyOn(el, 'click').mockImplementation(() => {
        createdLinks.push({ href: el.getAttribute('href'), download: el.getAttribute('download') });
      });
    }
    return el;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('downloadCSV', () => {
  it('does nothing when data is an empty array', () => {
    downloadCSV([], 'test.csv');
    expect(createdBlobs).toHaveLength(0);
    expect(createdLinks).toHaveLength(0);
  });

  it('does nothing when data is not an array', () => {
    downloadCSV(null, 'test.csv');
    downloadCSV(undefined, 'test.csv');
    downloadCSV('string', 'test.csv');
    expect(createdBlobs).toHaveLength(0);
  });

  it('triggers a download with the correct filename', () => {
    const data = [{ name: 'Alice', score: 95 }];
    downloadCSV(data, 'results.csv');
    expect(createdLinks).toHaveLength(1);
    expect(createdLinks[0].download).toBe('results.csv');
  });

  it('generates a header row from object keys', () => {
    const data = [{ name: 'Alice', department: 'Engineering' }];
    downloadCSV(data, 'test.csv');
    const blobText = createdBlobs[0];
    // Read the blob content
    return blobText.text().then((text) => {
      const lines = text.split('\n');
      expect(lines[0]).toBe('name,department');
    });
  });

  it('generates correct data rows', () => {
    const data = [
      { name: 'Alice', score: 95 },
      { name: 'Bob', score: 80 },
    ];
    downloadCSV(data, 'test.csv');
    return createdBlobs[0].text().then((text) => {
      const lines = text.split('\n');
      expect(lines[0]).toBe('name,score');
      expect(lines[1]).toBe('Alice,95');
      expect(lines[2]).toBe('Bob,80');
    });
  });

  it('escapes values containing commas', () => {
    const data = [{ name: 'Smith, John', role: 'Admin' }];
    downloadCSV(data, 'test.csv');
    return createdBlobs[0].text().then((text) => {
      const lines = text.split('\n');
      expect(lines[1]).toBe('"Smith, John",Admin');
    });
  });

  it('escapes values containing double-quotes', () => {
    const data = [{ note: 'He said "hello"' }];
    downloadCSV(data, 'test.csv');
    return createdBlobs[0].text().then((text) => {
      const lines = text.split('\n');
      expect(lines[1]).toBe('"He said ""hello"""');
    });
  });

  it('handles null and undefined values as empty strings', () => {
    const data = [{ name: null, score: undefined }];
    downloadCSV(data, 'test.csv');
    return createdBlobs[0].text().then((text) => {
      const lines = text.split('\n');
      expect(lines[1]).toBe(',');
    });
  });

  it('creates a Blob with text/csv MIME type', () => {
    const data = [{ a: 1 }];
    downloadCSV(data, 'test.csv');
    expect(createdBlobs[0].type).toBe('text/csv;charset=utf-8;');
  });
});

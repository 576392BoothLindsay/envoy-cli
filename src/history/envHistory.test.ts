import * as fs from 'fs';
import * as path from 'path';
import {
  recordHistory,
  getHistoryEntry,
  listHistory,
  clearHistory,
  formatHistoryList,
  loadHistoryStore,
} from './envHistory';

const TEST_STORE = path.join(__dirname, '.test-history.json');

function cleanup() {
  if (fs.existsSync(TEST_STORE)) fs.unlinkSync(TEST_STORE);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('recordHistory', () => {
  it('should record an entry and persist it', () => {
    const env = { API_KEY: 'abc123', PORT: '3000' };
    const entry = recordHistory(env, '.env', 'initial', TEST_STORE);
    expect(entry.env).toEqual(env);
    expect(entry.filePath).toBe('.env');
    expect(entry.label).toBe('initial');
    expect(entry.id).toMatch(/^hist_/);
  });

  it('should accumulate multiple entries', () => {
    recordHistory({ A: '1' }, '.env', undefined, TEST_STORE);
    recordHistory({ B: '2' }, '.env.prod', undefined, TEST_STORE);
    const store = loadHistoryStore(TEST_STORE);
    expect(store.entries).toHaveLength(2);
  });
});

describe('getHistoryEntry', () => {
  it('should retrieve an entry by id', () => {
    const entry = recordHistory({ X: 'y' }, '.env', 'test', TEST_STORE);
    const found = getHistoryEntry(entry.id, TEST_STORE);
    expect(found).toBeDefined();
    expect(found?.id).toBe(entry.id);
  });

  it('should return undefined for unknown id', () => {
    const result = getHistoryEntry('nonexistent', TEST_STORE);
    expect(result).toBeUndefined();
  });
});

describe('listHistory', () => {
  it('should list all entries when no filePath provided', () => {
    recordHistory({ A: '1' }, '.env', undefined, TEST_STORE);
    recordHistory({ B: '2' }, '.env.prod', undefined, TEST_STORE);
    const all = listHistory(undefined, TEST_STORE);
    expect(all).toHaveLength(2);
  });

  it('should filter entries by filePath', () => {
    recordHistory({ A: '1' }, '.env', undefined, TEST_STORE);
    recordHistory({ B: '2' }, '.env.prod', undefined, TEST_STORE);
    const filtered = listHistory('.env', TEST_STORE);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].filePath).toBe('.env');
  });
});

describe('clearHistory', () => {
  it('should remove all entries', () => {
    recordHistory({ A: '1' }, '.env', undefined, TEST_STORE);
    clearHistory(TEST_STORE);
    const store = loadHistoryStore(TEST_STORE);
    expect(store.entries).toHaveLength(0);
  });
});

describe('formatHistoryList', () => {
  it('should return message when empty', () => {
    expect(formatHistoryList([])).toBe('No history entries found.');
  });

  it('should format entries with key count and label', () => {
    const entry = recordHistory({ A: '1', B: '2' }, '.env', 'v1', TEST_STORE);
    const entries = listHistory(undefined, TEST_STORE);
    const output = formatHistoryList(entries);
    expect(output).toContain(entry.id);
    expect(output).toContain('(v1)');
    expect(output).toContain('2 keys');
  });
});

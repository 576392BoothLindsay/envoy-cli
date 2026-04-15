import { pinKeys, applyPins, removePins, formatPinResult, PinStore } from './envPin';
import { EnvRecord } from '../parser/envParser';

const sampleEnv: EnvRecord = {
  API_KEY: 'abc123',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET: 'topsecret',
};

describe('pinKeys', () => {
  it('pins existing keys', () => {
    const { store, result } = pinKeys(sampleEnv, ['API_KEY', 'DB_HOST']);
    expect(result.pinned).toEqual(['API_KEY', 'DB_HOST']);
    expect(result.conflicts).toHaveLength(0);
    expect(store.pins).toHaveLength(2);
    expect(store.pins[0].key).toBe('API_KEY');
    expect(store.pins[0].value).toBe('abc123');
  });

  it('reports missing keys as conflicts', () => {
    const { result } = pinKeys(sampleEnv, ['MISSING_KEY']);
    expect(result.conflicts).toContain('MISSING_KEY');
    expect(result.pinned).toHaveLength(0);
  });

  it('attaches environment label when provided', () => {
    const { store } = pinKeys(sampleEnv, ['DB_PORT'], 'production');
    expect(store.pins[0].environment).toBe('production');
  });

  it('sets pinnedAt timestamp', () => {
    const { store } = pinKeys(sampleEnv, ['SECRET']);
    expect(store.pins[0].pinnedAt).toBeTruthy();
    expect(new Date(store.pins[0].pinnedAt).getTime()).not.toBeNaN();
  });
});

describe('applyPins', () => {
  it('overrides env values with pinned values', () => {
    const store: PinStore = {
      pins: [{ key: 'API_KEY', value: 'pinned-value', pinnedAt: new Date().toISOString() }],
    };
    const result = applyPins({ ...sampleEnv, API_KEY: 'changed' }, store);
    expect(result.API_KEY).toBe('pinned-value');
  });

  it('does not modify unrelated keys', () => {
    const store: PinStore = { pins: [] };
    const result = applyPins(sampleEnv, store);
    expect(result).toEqual(sampleEnv);
  });
});

describe('removePins', () => {
  it('removes specified pins', () => {
    const { store: pinStore } = pinKeys(sampleEnv, ['API_KEY', 'DB_HOST']);
    const { store, result } = removePins(pinStore, ['API_KEY']);
    expect(result.unpinned).toContain('API_KEY');
    expect(store.pins.map((p) => p.key)).not.toContain('API_KEY');
    expect(store.pins.map((p) => p.key)).toContain('DB_HOST');
  });

  it('reports non-existent pins as conflicts', () => {
    const { store: pinStore } = pinKeys(sampleEnv, ['DB_HOST']);
    const { result } = removePins(pinStore, ['NONEXISTENT']);
    expect(result.conflicts).toContain('NONEXISTENT');
  });
});

describe('formatPinResult', () => {
  it('formats all sections', () => {
    const output = formatPinResult({ pinned: ['A'], unpinned: ['B'], conflicts: ['C'] });
    expect(output).toContain('Pinned: A');
    expect(output).toContain('Unpinned: B');
    expect(output).toContain('Not found: C');
  });

  it('omits empty sections', () => {
    const output = formatPinResult({ pinned: ['A'], unpinned: [], conflicts: [] });
    expect(output).not.toContain('Unpinned');
    expect(output).not.toContain('Not found');
  });
});

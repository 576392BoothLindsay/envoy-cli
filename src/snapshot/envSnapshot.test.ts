import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  createSnapshot,
  saveSnapshot,
  loadSnapshotStore,
  getSnapshot,
  listSnapshots,
  deleteSnapshot,
  formatSnapshotList,
} from './envSnapshot';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envoy-snapshot-'));
const storePath = path.join(tmpDir, 'snapshots.json');

afterEach(() => {
  if (fs.existsSync(storePath)) fs.unlinkSync(storePath);
});

afterAll(() => {
  fs.rmdirSync(tmpDir, { recursive: true } as any);
});

const sampleEnv = { DB_HOST: 'localhost', SECRET_KEY: 'abc123' };

test('createSnapshot returns a snapshot with id and timestamp', () => {
  const snap = createSnapshot('.env', sampleEnv, 'baseline');
  expect(snap.id).toBeTruthy();
  expect(snap.label).toBe('baseline');
  expect(snap.file).toBe('.env');
  expect(snap.env).toEqual(sampleEnv);
  expect(snap.timestamp).toBeTruthy();
});

test('saveSnapshot persists to disk', () => {
  const snap = createSnapshot('.env', sampleEnv);
  saveSnapshot(snap, storePath);
  const store = loadSnapshotStore(storePath);
  expect(store.snapshots).toHaveLength(1);
  expect(store.snapshots[0].id).toBe(snap.id);
});

test('loadSnapshotStore returns empty store when file missing', () => {
  const store = loadSnapshotStore(path.join(tmpDir, 'nonexistent.json'));
  expect(store.snapshots).toHaveLength(0);
});

test('getSnapshot finds by id', () => {
  const snap = createSnapshot('.env', sampleEnv);
  saveSnapshot(snap, storePath);
  const found = getSnapshot(storePath, snap.id);
  expect(found).toBeDefined();
  expect(found?.id).toBe(snap.id);
});

test('getSnapshot finds by label', () => {
  const snap = createSnapshot('.env', sampleEnv, 'v1');
  saveSnapshot(snap, storePath);
  const found = getSnapshot(storePath, 'v1');
  expect(found?.label).toBe('v1');
});

test('listSnapshots returns all snapshots', () => {
  saveSnapshot(createSnapshot('.env', sampleEnv), storePath);
  saveSnapshot(createSnapshot('.env.prod', sampleEnv), storePath);
  expect(listSnapshots(storePath)).toHaveLength(2);
});

test('deleteSnapshot removes by id', () => {
  const snap = createSnapshot('.env', sampleEnv);
  saveSnapshot(snap, storePath);
  const result = deleteSnapshot(storePath, snap.id);
  expect(result).toBe(true);
  expect(listSnapshots(storePath)).toHaveLength(0);
});

test('deleteSnapshot returns false when not found', () => {
  const result = deleteSnapshot(storePath, 'nonexistent');
  expect(result).toBe(false);
});

test('formatSnapshotList returns message when empty', () => {
  expect(formatSnapshotList([])).toBe('No snapshots found.');
});

test('formatSnapshotList includes id and file', () => {
  const snap = createSnapshot('.env', sampleEnv, 'base');
  const output = formatSnapshotList([snap]);
  expect(output).toContain(snap.id);
  expect(output).toContain('.env');
  expect(output).toContain('base');
});

import {
  addAnnotation,
  addAnnotations,
  removeAnnotation,
  serializeWithAnnotations,
  formatAnnotateResult,
} from './envAnnotator';

const env = { API_KEY: 'abc', DB_URL: 'postgres://localhost', PORT: '3000' };

describe('addAnnotation', () => {
  it('adds a comment for a key', () => {
    const result = addAnnotation(env, 'API_KEY', 'Your API key');
    expect(result.comments['API_KEY']).toBe('Your API key');
    expect(result.count).toBe(1);
  });
});

describe('addAnnotations', () => {
  it('adds multiple annotations', () => {
    const result = addAnnotations(env, [
      { key: 'API_KEY', comment: 'Secret key' },
      { key: 'PORT', comment: 'App port' },
    ]);
    expect(result.count).toBe(2);
    expect(result.comments['PORT']).toBe('App port');
  });

  it('ignores keys not in env', () => {
    const result = addAnnotations(env, [{ key: 'MISSING', comment: 'nope' }]);
    expect(result.count).toBe(0);
  });
});

describe('removeAnnotation', () => {
  it('removes a comment', () => {
    const comments = { API_KEY: 'Secret', PORT: 'Port' };
    const result = removeAnnotation(comments, 'API_KEY');
    expect(result['API_KEY']).toBeUndefined();
    expect(result['PORT']).toBe('Port');
  });
});

describe('serializeWithAnnotations', () => {
  it('prepends comments before keys', () => {
    const comments = { API_KEY: 'Your API key' };
    const output = serializeWithAnnotations({ API_KEY: 'abc' }, comments);
    expect(output).toBe('# Your API key\nAPI_KEY=abc');
  });

  it('omits comment line when no annotation', () => {
    const output = serializeWithAnnotations({ PORT: '3000' }, {});
    expect(output).toBe('PORT=3000');
  });
});

describe('formatAnnotateResult', () => {
  it('returns message when no annotations', () => {
    const result = formatAnnotateResult({ annotated: {}, comments: {}, count: 0 });
    expect(result).toBe('No annotations added.');
  });

  it('formats annotation summary', () => {
    const result = formatAnnotateResult({
      annotated: env,
      comments: { API_KEY: 'Secret key' },
      count: 1,
    });
    expect(result).toContain('Annotated 1 key(s)');
    expect(result).toContain('API_KEY');
  });
});

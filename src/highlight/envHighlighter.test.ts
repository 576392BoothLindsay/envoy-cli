import { highlightEnv, highlightLine, formatHighlightResult } from './envHighlighter';

const sampleEnv = `# App config
APP_NAME=myapp
APP_PORT=3000
DB_PASSWORD=secret
`;

describe('highlightLine', () => {
  it('returns plain line unchanged for plain theme', () => {
    expect(highlightLine('KEY=value', 'plain', false, false, false, false)).toBe('KEY=value');
  });

  it('dims comment lines in ansi theme when dimComments is true', () => {
    const result = highlightLine('# comment', 'ansi', false, false, true, true);
    expect(result).toContain('# comment');
    expect(result).toContain('\x1b[2m');
  });

  it('does not dim comment lines when dimComments is false', () => {
    const result = highlightLine('# comment', 'ansi', false, false, true, false);
    expect(result).toBe('# comment');
  });

  it('applies bold yellow to matched key in ansi theme', () => {
    const result = highlightLine('KEY=value', 'ansi', true, false, false, false);
    expect(result).toContain('\x1b[1m');
    expect(result).toContain('\x1b[33m');
    expect(result).toContain('KEY');
  });

  it('applies bold magenta to matched value in ansi theme', () => {
    const result = highlightLine('KEY=value', 'ansi', false, true, false, false);
    expect(result).toContain('\x1b[35m');
    expect(result).toContain('value');
  });

  it('wraps key in html span for html theme', () => {
    const result = highlightLine('KEY=value', 'html', false, false, false, false);
    expect(result).toContain('<span class="env-key">KEY</span>');
    expect(result).toContain('<span class="env-value">value</span>');
  });

  it('adds highlight class for matched key in html theme', () => {
    const result = highlightLine('KEY=value', 'html', true, false, false, false);
    expect(result).toContain('env-key highlight');
  });

  it('escapes html entities in html theme', () => {
    const result = highlightLine('KEY=a&b', 'html', false, false, false, false);
    expect(result).toContain('a&amp;b');
  });
});

describe('highlightEnv', () => {
  it('returns output with all lines for plain theme', () => {
    const result = highlightEnv(sampleEnv, { theme: 'plain' });
    expect(result.output).toBe(sampleEnv);
    expect(result.matchedKeys).toEqual([]);
    expect(result.matchedValues).toEqual([]);
  });

  it('highlights specified keys', () => {
    const result = highlightEnv(sampleEnv, { theme: 'ansi', highlightKeys: ['APP_NAME'] });
    expect(result.matchedKeys).toContain('APP_NAME');
    expect(result.matchedKeys).not.toContain('APP_PORT');
  });

  it('highlights specified values', () => {
    const result = highlightEnv(sampleEnv, { theme: 'ansi', highlightValues: ['3000'] });
    expect(result.matchedValues).toContain('3000');
  });

  it('does not report unmatched keys', () => {
    const result = highlightEnv(sampleEnv, { theme: 'ansi', highlightKeys: ['MISSING_KEY'] });
    expect(result.matchedKeys).toEqual([]);
  });

  it('handles empty input', () => {
    const result = highlightEnv('', { theme: 'ansi' });
    expect(result.output).toBe('');
    expect(result.matchedKeys).toEqual([]);
  });

  it('defaults to ansi theme', () => {
    const result = highlightEnv('KEY=val');
    expect(result.output).toContain('\x1b[');
  });
});

describe('formatHighlightResult', () => {
  it('returns the output string', () => {
    const result = highlightEnv('KEY=val', { theme: 'plain' });
    expect(formatHighlightResult(result)).toBe('KEY=val');
  });
});

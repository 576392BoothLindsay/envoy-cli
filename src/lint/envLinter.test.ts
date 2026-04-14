import { lintEnv, formatLintResult, getAvailableRules, LintResult } from './envLinter';

describe('lintEnv', () => {
  it('returns no issues for a clean env', () => {
    const result = lintEnv({ DATABASE_URL: 'postgres://localhost', API_KEY: 'abc123' });
    expect(result.issues).toHaveLength(0);
    expect(result.passed).toBe(true);
    expect(result.errorCount).toBe(0);
  });

  it('flags lowercase keys as warnings', () => {
    const result = lintEnv({ database_url: 'value' });
    const rule = result.issues.find(i => i.rule === 'uppercase-keys');
    expect(rule).toBeDefined();
    expect(rule?.severity).toBe('warning');
  });

  it('flags empty values as warnings', () => {
    const result = lintEnv({ EMPTY_KEY: '' });
    const issue = result.issues.find(i => i.rule === 'no-empty-value');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
  });

  it('flags keys with spaces as errors', () => {
    const result = lintEnv({ 'BAD KEY': 'value' });
    const issue = result.issues.find(i => i.rule === 'no-spaces-in-keys');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
    expect(result.passed).toBe(false);
  });

  it('flags keys starting with a digit as errors', () => {
    const result = lintEnv({ '1BAD': 'value' });
    const issue = result.issues.find(i => i.rule === 'no-leading-digit');
    expect(issue).toBeDefined();
    expect(result.errorCount).toBeGreaterThan(0);
  });

  it('flags keys with special characters as errors', () => {
    const result = lintEnv({ 'BAD-KEY': 'value' });
    const issue = result.issues.find(i => i.rule === 'no-special-chars');
    expect(issue).toBeDefined();
    expect(result.passed).toBe(false);
  });

  it('counts errors, warnings, and infos correctly', () => {
    const result = lintEnv({ 'BAD KEY': '', lowercase: 'val' });
    expect(result.errorCount).toBeGreaterThan(0);
    expect(result.warningCount).toBeGreaterThan(0);
  });
});

describe('formatLintResult', () => {
  it('returns success message when no issues', () => {
    const result: LintResult = { issues: [], errorCount: 0, warningCount: 0, infoCount: 0, passed: true };
    expect(formatLintResult(result)).toContain('No lint issues');
  });

  it('includes issue details in output', () => {
    const result = lintEnv({ 'BAD KEY': '' });
    const output = formatLintResult(result);
    expect(output).toContain('no-spaces-in-keys');
    expect(output).toContain('Errors:');
  });

  it('includes key name in issue line', () => {
    const result = lintEnv({ lowercase: 'val' });
    const output = formatLintResult(result);
    expect(output).toContain('[lowercase]');
  });
});

describe('getAvailableRules', () => {
  it('returns a list of rules', () => {
    const rules = getAvailableRules();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0]).toHaveProperty('id');
    expect(rules[0]).toHaveProperty('severity');
  });
});

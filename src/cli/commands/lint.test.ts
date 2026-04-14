import * as fs from 'fs';
import * as path from 'path';
import { lintEnv, formatLintResult, getAvailableRules } from '../../lint/envLinter';

describe('lint command helpers', () => {
  describe('lintEnv integration', () => {
    it('passes a clean env file content', () => {
      const env = { API_URL: 'https://example.com', DB_HOST: 'localhost', PORT: '3000' };
      const result = lintEnv(env);
      expect(result.passed).toBe(true);
      expect(result.errorCount).toBe(0);
    });

    it('detects multiple issues in a single env', () => {
      const env = {
        'BAD KEY': 'value',
        lowercase_key: '',
        '1STARTS_DIGIT': 'val',
      };
      const result = lintEnv(env);
      expect(result.passed).toBe(false);
      expect(result.errorCount).toBeGreaterThanOrEqual(2);
      expect(result.warningCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('formatLintResult', () => {
    it('shows summary counts at the end', () => {
      const env = { bad_key: '', 'SPACE KEY': 'x' };
      const result = lintEnv(env);
      const output = formatLintResult(result);
      expect(output).toMatch(/Errors: \d+, Warnings: \d+, Info: \d+/);
    });

    it('shows checkmark when all pass', () => {
      const result = lintEnv({ CLEAN: 'value' });
      const output = formatLintResult(result);
      expect(output).toContain('✅');
    });
  });

  describe('getAvailableRules', () => {
    it('includes expected rule ids', () => {
      const rules = getAvailableRules();
      const ids = rules.map(r => r.id);
      expect(ids).toContain('no-empty-value');
      expect(ids).toContain('uppercase-keys');
      expect(ids).toContain('no-spaces-in-keys');
      expect(ids).toContain('no-special-chars');
      expect(ids).toContain('no-leading-digit');
    });

    it('each rule has severity', () => {
      const rules = getAvailableRules();
      for (const rule of rules) {
        expect(['error', 'warning', 'info']).toContain(rule.severity);
      }
    });
  });
});

export default class ESLintError extends Error {
  constructor(messages?: string) {
    super(`[eslint] ${messages}`);
    this.name = 'ESLintError';
    this.stack = '';
  }
}

export default class ESLintError extends Error {
  /**
   * @param {string=} messages
   */
  constructor(messages?: string | undefined);
  stack: string;
}

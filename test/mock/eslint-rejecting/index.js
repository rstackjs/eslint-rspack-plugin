class ESLintMock {
  async lintFiles() {
    throw new Error('Oh no!');
  }
}

export async function loadESLint() {
  return ESLintMock;
}

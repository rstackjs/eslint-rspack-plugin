const stateKey = Symbol.for('eslint-rspack-plugin.eslint-recording');
const state =
  global[stateKey] ||
  (global[stateKey] = {
    calls: [],
    outputFixesCalls: [],
    shouldReject: false,
  });

class ESLintMock {
  async lintFiles(files) {
    state.calls.push(files);

    if (state.shouldReject) {
      throw new Error('Oh no!');
    }

    return [];
  }
}

ESLintMock.outputFixes = async (results) => {
  state.outputFixesCalls.push(results);
};

function reset({ shouldReject = false } = {}) {
  state.calls = [];
  state.outputFixesCalls = [];
  state.shouldReject = shouldReject;
}

module.exports = {
  loadESLint: async () => ESLintMock,
  reset,
  state,
};

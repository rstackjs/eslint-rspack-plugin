const stateKey = Symbol.for('eslint-rspack-plugin.eslint-recording');
export const state =
  global[stateKey] ||
  (global[stateKey] = {
    calls: [],
    constructorOptions: [],
    loadOptions: [],
    outputFixesCalls: [],
    shouldReject: false,
  });

class ESLintMock {
  constructor(options) {
    state.constructorOptions.push(options);
  }

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

export function reset({ shouldReject = false } = {}) {
  state.calls = [];
  state.constructorOptions = [];
  state.loadOptions = [];
  state.outputFixesCalls = [];
  state.shouldReject = shouldReject;
}

export async function loadESLint(options) {
  state.loadOptions.push(options);
  return ESLintMock;
}

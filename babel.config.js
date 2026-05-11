const MIN_BABEL_VERSION = 7;

export default (api) => {
  api.assertVersion(MIN_BABEL_VERSION);
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: '20.19.0',
          },
          modules: false,
        },
      ],
    ],
  };
};

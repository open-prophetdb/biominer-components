export default {
  // more father 4 config: https://github.com/umijs/father-next/blob/master/docs/config.md
  esm: {},
  extraBabelPlugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]],
};

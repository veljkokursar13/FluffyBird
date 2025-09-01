// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',                           // keep existing plugins first
      ['module-resolver', {
        root: ['./'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
          '@core': './src/core',
          '@classic': './src/renderers/classic',
          '@hooks': './src/hooks',
          '@state': './src/state',
          '@utils': './src/utils',
          '@types': './src/types',
          '@ui': './src/ui',
          '@assets': './assets'
        }
      }],
    ],
  };
};

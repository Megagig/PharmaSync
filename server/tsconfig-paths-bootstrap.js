const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

// This is needed to make TypeScript's path mapping work with ts-node
tsConfigPaths.register({
  baseUrl: './src',
  paths: tsConfig.compilerOptions.paths || {}
});

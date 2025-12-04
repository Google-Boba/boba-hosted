export default {
  ignore: [
    'src/app/middleware.ts', // Explicitly ignore middleware file
    'knip.config.mjs', // Config file
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.data',
    '**/.next/**',
  ],
  moduleResolution: 'node',
  ignoreBinaries: ['autoprefixer', 'postcss-load-config'],
  ignoreDependencies: ['autoprefixer', 'postcss-load-config'],
};
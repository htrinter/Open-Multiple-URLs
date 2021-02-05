/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: [
    '.cache/**',
    'dev-out/**',
    'dist/**',
    'dist-chrome/**',
    'dist-firefox/**',
    'dist-zip/**',
    'dist-dev/**',
  ],
  rules: {
    quotes: ['error', 'single'],
  },
};

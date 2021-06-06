module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'max-len': ['warn', { code: 140 }]
  },
  globals: {
    $: true,
    darkmode: true,
    bootstrap: true
  }
}

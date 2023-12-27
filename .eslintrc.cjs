module.exports = {
  extends: ['plugin:node/recommended-module'],
  ignorePatterns: ['functions/lib', 'node_modules'],
  rules: {
    "node/no-missing-import": "off",
    "node/no-unpublished-import": "off",
    "camelcase": "off"
  }
}
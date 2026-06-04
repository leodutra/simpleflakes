const js = require("@eslint/js");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

const sharedGlobals = {
  ...globals.es2020,
  ...globals.node,
  Atomics: "readonly",
  BigInt: "readonly",
  globalThis: "readonly",
  SharedArrayBuffer: "readonly"
};

module.exports = [
  {
    ignores: ["coverage/**", "dist/**", "node_modules/**"]
  },
  {
    files: ["eslint.config.js", "benchmark/**/*.js", "scripts/**/*.js", "tests/**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 2020,
      sourceType: "commonjs",
      globals: sharedGlobals
    },
    rules: {
      ...js.configs.recommended.rules,
      "arrow-parens": "off",
      "comma-dangle": "off",
      "default-param-last": "off",
      "lines-between-class-members": "off",
      "no-bitwise": "off",
      "no-console": "off",
      "no-param-reassign": "off",
      "no-plusplus": "off",
      "object-curly-newline": "off",
      "operator-linebreak": "off",
      "prefer-destructuring": "off",
      "prefer-template": "off",
      quotes: "off",
      "space-infix-ops": "off"
    }
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      parser: tsParser,
      sourceType: "module",
      globals: sharedGlobals
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      "arrow-parens": "off",
      "comma-dangle": "off",
      "default-param-last": "off",
      "lines-between-class-members": "off",
      "no-bitwise": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "object-curly-newline": "off",
      "operator-linebreak": "off",
      "prefer-destructuring": "off",
      "prefer-template": "off",
      quotes: "off",
      "space-infix-ops": "off"
    }
  }
];

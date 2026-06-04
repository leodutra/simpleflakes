module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true
  },
  extends: [
    'airbnb-base'
  ],
  globals: {
    Atomics: 'readonly',
    BigInt: 'readonly',
    globalThis: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'script'
  },
  ignorePatterns: ['dist/', 'coverage/'],
  overrides: [
    {
      files: ['src/**/*.ts'],
      parser: '@babel/eslint-parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-typescript']
        }
      },
      rules: {
        'no-bitwise': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off'
      }
    },
    {
      files: ['benchmark/**/*.js', 'scripts/**/*.js'],
      rules: {
        'global-require': 'off',
        'import/no-dynamic-require': 'off',
        'no-console': 'off'
      }
    },
    {
      files: ['.eslintrc.js', 'benchmark/**/*.js', 'scripts/**/*.js', 'tests/**/*.js'],
      rules: {
        'global-require': 'off',
        'import/no-dynamic-require': 'off',
        'import/no-extraneous-dependencies': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off'
      }
    }
  ],
  rules: {
    'arrow-parens': 'off',
    'comma-dangle': 'off',
    'default-param-last': 'off',
    'import/newline-after-import': 'off',
    'lines-between-class-members': 'off',
    'no-bitwise': 'off',
    'object-curly-newline': 'off',
    'operator-linebreak': 'off',
    'prefer-destructuring': 'off',
    'prefer-template': 'off',
    quotes: 'off',
    'space-infix-ops': 'off'
  }
};

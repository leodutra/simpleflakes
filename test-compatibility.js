#!/usr/bin/env node

// Compatibility test runner for CI/CD
// Tests CommonJS, ES Modules, and TypeScript usage

const { spawn } = require('child_process');
const path = require('path');

async function runTest(command, args, description) {
  console.log(`\n🚀 Running ${description}...`);
  console.log(`Command: ${command} ${args.join(' ')}\n`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} PASSED\n`);
        resolve();
      } else {
        console.log(`❌ ${description} FAILED (exit code: ${code})\n`);
        reject(new Error(`${description} failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.log(`❌ ${description} ERROR: ${error.message}\n`);
      reject(error);
    });
  });
}

async function runCompatibilityTests() {
  console.log('🧪 Starting Module Compatibility Tests for simpleflakes\n');
  console.log('This verifies CommonJS, ES Modules, and TypeScript support.\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    {
      command: 'node',
      args: ['test-commonjs.js'],
      description: 'CommonJS (require) compatibility'
    },
    {
      command: 'node',
      args: ['test-esmodules.mjs'],
      description: 'ES Modules (import) compatibility'
    },
    {
      command: 'npx',
      args: ['tsx', 'test-typescript.ts'],
      description: 'TypeScript compatibility'
    }
  ];

  for (const test of tests) {
    try {
      await runTest(test.command, test.args, test.description);
      passed++;
    } catch (error) {
      failed++;
      console.error(`Failed: ${test.description}`);
    }
  }

  console.log('📊 COMPATIBILITY TEST RESULTS:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total:  ${tests.length}\n`);

  if (failed > 0) {
    console.log('❌ Some compatibility tests failed!');
    process.exit(1);
  } else {
    console.log('🎉 All compatibility tests passed!');
    console.log('✅ simpleflakes supports CommonJS, ES Modules, and TypeScript!');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  runCompatibilityTests().catch((error) => {
    console.error('Test runner error:', error.message);
    process.exit(1);
  });
}

#!/usr/bin/env node

// Script to extract benchmark results and create a shields.io badge
const fs = require('fs');
const path = require('path');

function extractOpsPerSec(benchmarkOutput) {
  // Parse the benchmark output to extract ops/sec for simpleflake()
  const lines = benchmarkOutput.split('\n');
  const simpleflakeLine = lines.find(line => line.includes('simpleflake()') && line.includes('ops/sec'));

  if (simpleflakeLine) {
    // Extract number like "8,791,527 ops/sec"
    const match = simpleflakeLine.match(/([\d,]+)\s+ops\/sec/);
    if (match) {
      const opsPerSec = match[1].replace(/,/g, '');
      const millions = (parseInt(opsPerSec) / 1000000).toFixed(1);
      return `${millions}M ops/sec`;
    }
  }
  return 'unknown';
}

function createBadgeUrl(performance) {
  const encoded = encodeURIComponent(performance);
  return `https://img.shields.io/badge/performance-${encoded}-brightgreen?style=flat&logo=javascript`;
}

// Read benchmark results if available
const resultsFile = 'benchmark-results.txt';
if (fs.existsSync(resultsFile)) {
  const benchmarkOutput = fs.readFileSync(resultsFile, 'utf8');
  const performance = extractOpsPerSec(benchmarkOutput);
  const badgeUrl = createBadgeUrl(performance);

  console.log('Performance:', performance);
  console.log('Badge URL:', badgeUrl);

  // Save for use in README or other places
  fs.writeFileSync('benchmark-badge.txt', badgeUrl);
} else {
  console.log('No benchmark results found');
}

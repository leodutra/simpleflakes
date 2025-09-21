#!/usr/bin/env node

// Generate release notes from git commits
const { execSync } = require('child_process');

function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0 HEAD^', { encoding: 'utf8' }).trim();
  } catch (error) {
    // If no previous tag, use first commit
    return execSync('git rev-list --max-parents=0 HEAD', { encoding: 'utf8' }).trim();
  }
}

function getCommitsSinceLastTag(lastTag) {
  const command = `git log ${lastTag}..HEAD --pretty=format:"%h %s" --no-merges`;
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return output.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    return [];
  }
}

function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    docs: [],
    perf: [],
    chore: [],
    other: []
  };

  commits.forEach(commit => {
    const [hash, ...messageParts] = commit.split(' ');
    const message = messageParts.join(' ');
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('feat') || lowerMessage.includes('add') || lowerMessage.includes('implement')) {
      categories.features.push(`- ${message} (${hash})`);
    } else if (lowerMessage.includes('fix') || lowerMessage.includes('bug') || lowerMessage.includes('resolve')) {
      categories.fixes.push(`- ${message} (${hash})`);
    } else if (lowerMessage.includes('doc') || lowerMessage.includes('readme')) {
      categories.docs.push(`- ${message} (${hash})`);
    } else if (lowerMessage.includes('perf') || lowerMessage.includes('optim') || lowerMessage.includes('speed')) {
      categories.perf.push(`- ${message} (${hash})`);
    } else if (lowerMessage.includes('chore') || lowerMessage.includes('update') || lowerMessage.includes('bump')) {
      categories.chore.push(`- ${message} (${hash})`);
    } else {
      categories.other.push(`- ${message} (${hash})`);
    }
  });

  return categories;
}

function generateReleaseNotes(version) {
  const lastTag = getLastTag();
  const commits = getCommitsSinceLastTag(lastTag);
  const categories = categorizeCommits(commits);

  let releaseNotes = `## 🚀 simpleflakes ${version}\n\n`;
  releaseNotes += `Fast, lightweight, and reliable distributed 64-bit ID generation with zero dependencies for Node.js.\n\n`;

  releaseNotes += `### Performance\n`;
  releaseNotes += `- ~8.8M ops/sec simpleflake() generation\n`;
  releaseNotes += `- Zero dependencies\n`;
  releaseNotes += `- TypeScript ready\n\n`;

  if (categories.features.length > 0) {
    releaseNotes += `### ✨ New Features\n${categories.features.join('\n')}\n\n`;
  }

  if (categories.fixes.length > 0) {
    releaseNotes += `### 🪲 Bug Fixes\n${categories.fixes.join('\n')}\n\n`;
  }

  if (categories.perf.length > 0) {
    releaseNotes += `### ⚡ Performance Improvements\n${categories.perf.join('\n')}\n\n`;
  }

  if (categories.docs.length > 0) {
    releaseNotes += `### 📚 Documentation\n${categories.docs.join('\n')}\n\n`;
  }

  if (categories.chore.length > 0) {
    releaseNotes += `### 🔧 Maintenance\n${categories.chore.join('\n')}\n\n`;
  }

  if (categories.other.length > 0) {
    releaseNotes += `### Other Changes\n${categories.other.join('\n')}\n\n`;
  }

  releaseNotes += `### Installation\n`;
  releaseNotes += `\`\`\`bash\n`;
  releaseNotes += `npm install simpleflakes@${version}\n`;
  releaseNotes += `\`\`\`\n\n`;

  releaseNotes += `**Full Changelog**: https://github.com/leodutra/simpleflakes/compare/${lastTag}...${version}`;

  return releaseNotes;
}

// Get version from command line or environment
const version = process.argv[2] || process.env.GITHUB_REF_NAME || 'v0.0.0';
const releaseNotes = generateReleaseNotes(version);

console.log(releaseNotes);

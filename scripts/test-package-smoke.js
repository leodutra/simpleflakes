const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const packageJson = require(path.join(repoRoot, "package.json"));
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "simpleflakes-pack-"));
const packDir = path.join(tempRoot, "pack");
const appDir = path.join(tempRoot, "app");

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function buildSnapshotScript(loader) {
  return `${loader}

const id = lib.simpleflake(1700000000000n, 0n, 946684800000n);
const snapshot = JSON.stringify({
  simpleflake: typeof lib.simpleflake,
  parseSimpleflake: typeof lib.parseSimpleflake,
  epoch: lib.SIMPLEFLAKE_EPOCH.toString(),
  sample: id.toString()
});

console.log(snapshot);
`;
}

try {
  fs.mkdirSync(packDir, { recursive: true });
  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(
    path.join(appDir, "package.json"),
    JSON.stringify({ name: "simpleflakes-smoke", private: true }, null, 2)
  );

  const packOutput = run("npm", ["pack", "--json", "--pack-destination", packDir], repoRoot);
  const [{ filename }] = JSON.parse(packOutput);
  const tarballPath = path.join(packDir, filename);

  run(
    "npm",
    ["install", "--no-package-lock", "--ignore-scripts", "--no-save", "--fund=false", "--audit=false", tarballPath],
    appDir
  );

  const installedRoot = path.join(appDir, "node_modules", packageJson.name);
  assert.ok(fs.existsSync(path.join(installedRoot, "dist", "simpleflakes.js")), "packed tarball includes the CJS build");
  assert.ok(fs.existsSync(path.join(installedRoot, "dist", "simpleflakes.mjs")), "packed tarball includes the ESM build");
  assert.ok(fs.existsSync(path.join(installedRoot, "dist", "simpleflakes.d.ts")), "packed tarball includes type declarations");

  const requireSnapshot = run(
    "node",
    ["-e", buildSnapshotScript(`const lib = require(${JSON.stringify(packageJson.name)});`)],
    appDir
  );

  const importSnapshot = run(
    "node",
    [
      "--input-type=module",
      "-e",
      buildSnapshotScript(`const lib = await import(${JSON.stringify(packageJson.name)});`)
    ],
    appDir
  );

  assert.equal(requireSnapshot, importSnapshot, "packed tarball resolves the same API for require() and import()");
  console.log("Packed tarball smoke test passed");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

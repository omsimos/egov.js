import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const directory = new URL("../src/generated/", import.meta.url);

async function readEntries(current = directory) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const url = new URL(entry.name, current);
      if (entry.isDirectory()) return readEntries(new URL(`${entry.name}/`, current));
      return [[path.relative(directory.pathname, url.pathname), await readFile(url, "utf8")]];
    }),
  );

  return files.flat();
}

async function snapshot() {
  return Object.fromEntries(
    (await readEntries()).sort(([left], [right]) => left.localeCompare(right)),
  );
}

const before = await snapshot();
const generation = spawnSync("pnpm", ["generate"], { stdio: "inherit" });

if (generation.status !== 0) process.exit(generation.status ?? 1);

const after = await snapshot();

if (JSON.stringify(before) !== JSON.stringify(after)) {
  console.error("Generated SDK was stale. Commit the updated src/generated files.");
  process.exit(1);
}

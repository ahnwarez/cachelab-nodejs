import { createReadStream } from "node:fs";
import readline from "readline";
import path from "node:path";
import url from "url";

import { initCache, access } from "./cache.js";

const argc = process.argv.length;

if (argc < 9) {
  console.log(`Usage:
-h help
-s <Set Index>
-E <Cache lines>
-b <Block offest>
<file name>`);
}

const s = Number(process.argv[3]);
const E = Number(process.argv[5]);
const b = Number(process.argv[7]);
const f = process.argv[8];

let cache = initCache({ s, E, b });
let hits = 0;
let misses = 0;
let evictions = 0;

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const fileStream = createReadStream(path.join(__dirname, f), "utf8");
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

for await (const line of rl) {
  // For each address in your trace file:
  const { cache: newCache, outcome } = access({
    cache,
    address: BigInt("0x1234"),
  });
  cache = newCache;
}

if (outcome.hit) hits++;
if (outcome.miss) misses++;
if (outcome.eviction) evictions++;

console.log(`hits: ${hits} misses: ${misses} evictions: ${evictions}`);

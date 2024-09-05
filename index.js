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
  if (line.startsWith(" M") || line.startsWith(" S") || line.startsWith(" L")) {
    const [_, addressAndByte] = line.trimStart().split(" ");
    const [address] = addressAndByte.split(",");
    const result = access({
      cache,
      address: BigInt(address),
    });
    cache = result.cache;

    const printMiss = result.outcome.miss ? "miss" : undefined;
    const printHit = result.outcome.hit ? "hit" : undefined;
    const printEviction = result.outcome.eviction ? "eviction" : undefined;
    const outcome = [printMiss, printHit, printEviction]
      .filter(Boolean)
      .join(" ");

    console.log(line.trimStart(), outcome);

    if (result.outcome.hit) hits++;
    if (result.outcome.miss) misses++;
    if (result.outcome.eviction) evictions++;
  }
}

console.log(`hits: ${hits} misses: ${misses} evictions: ${evictions}`);

import { createReadStream } from "node:fs";
import readline from "readline";
import path from "node:path";
import url from "url";

import { makeCache } from "./cache.js";

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

const cache = makeCache({ s, E, b });

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const fileStream = createReadStream(path.join(__dirname, f), "utf8");
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

for await (const line of rl) {
  if (line.startsWith("I")) continue;
  const [_, addressAndByte] = line.trimStart().split(" ");
  const [address] = addressAndByte.split(",");

  if (line.startsWith(" L")) {
    const outcome = cache.access(BigInt(`0x${address}`));
    console.log(`${line.trimStart()} ${getOutcome(outcome)}`);
  } else if (line.startsWith(" M")) {
    const outcome1 = cache.access(BigInt(`0x${address}`));
    getOutcome(outcome1);
    const outcome2 = cache.access(BigInt(`0x${address}`));
    getOutcome(outcome2);
    console.log(
      `${line.trimStart()} ${getOutcome(outcome1)} ${getOutcome(outcome2)}`,
    );
  } else if (line.startsWith(" S")) {
    const outcome = cache.access(BigInt(`0x${address}`));
    console.log(`${line.trimStart()} ${getOutcome(outcome)}`);
  }
}
const state = cache.getState();
console.log(
  `hits: ${state.hits} misses: ${state.misses} evictions: ${state.evictions}`,
);

function getOutcome(result) {
  const printMiss = result.miss ? "miss" : undefined;
  const printHit = result.hit ? "hit" : undefined;
  const printEviction = result.eviction ? "eviction" : undefined;
  const outcome = [printMiss, printEviction, printHit]
    .filter(Boolean)
    .join(" ");

  return outcome;
}

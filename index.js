const argc = process.argv.length;

if (argc < 6) {
  console.log(`Usage:
-s <Set Index>
-E <Cache lines>
-b <Block offest>
-f <file name>`);
}

let cache = initCache({ s: 4, E: 1, b: 4 });
let hits = 0;
let misses = 0;
let evictions = 0;

// For each address in your trace file:
const { cache: newCache, outcome } = access({
  cache,
  address: BigInt("0x1234"),
});
cache = newCache;
if (outcome.hit) hits++;
if (outcome.miss) misses++;
if (outcome.eviction) evictions++;

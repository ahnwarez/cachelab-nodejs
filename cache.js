export function makeCache({ s, E, b }) {
  let hits = 0;
  let misses = 0;
  let evictions = 0;

  const sets = Array(2 ** s)
    .fill()
    .map(() =>
      Array(E)
        .fill()
        .map(() => ({
          valid: false,
          tag: 0n,
        })),
    );

  return Object.freeze({
    getState,
    access,
  });

  function getState() {
    return { hits, misses, evictions };
  }

  function access(address) {
    const setIndex = (BigInt(address) >> BigInt(b)) & ((1n << BigInt(s)) - 1n);
    const tag = BigInt(address) >> BigInt(s + b);

    const setNumber = Number(setIndex);
    const set = sets[setNumber];

    // Check for hit
    for (let i = 0; i < set.length; i++) {
      if (set[i].valid && set[i].tag === tag) {
        hits++;
        return { hit: true, miss: false, eviction: false };
      }
    }

    // It's a miss, find an empty line or evict
    const emptyLineIndex = set.findIndex((line) => !line.valid);

    if (emptyLineIndex !== -1) {
      sets[setNumber][emptyLineIndex] = { valid: true, tag };
      misses++;
      return { hit: false, miss: true, eviction: false };
    } else {
      misses++;
      evictions++;
      // Eviction (assuming LRU policy, we evict the first line)
      sets[setNumber][0] = { valid: true, tag };
      return { hit: false, miss: true, eviction: true };
    }
  }
}

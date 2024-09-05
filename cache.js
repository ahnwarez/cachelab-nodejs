export function initCache({ s, E, b }) {
  return {
    sets: Array(2 ** s)
      .fill()
      .map(() =>
        Array(E)
          .fill()
          .map(() => ({
            valid: false,
            tag: 0n,
          }))
      ),
    s,
    E,
    b,
  }
}

export function access({ cache, address }) {
  const { sets, s, b } = cache
  const setIndex = (BigInt(address) >> BigInt(b)) & ((1n << BigInt(s)) - 1n)
  const tag = BigInt(address) >> BigInt(s + b)

  const setNumber = Number(setIndex)
  const set = sets[setNumber]

  // Check for hit
  for (let i = 0; i < set.length; i++) {
    if (set[i].valid && set[i].tag === tag) {
      return {
        cache: {
          s,
          b,
          sets,
        },
        outcome: { hit: true, miss: false, eviction: false },
      }
    }
  }

  // It's a miss, find an empty line or evict
  const emptyLineIndex = set.findIndex((line) => !line.valid)
  const newCache = {
    s,
    b,
    sets,
    sets: [...sets],
  }
  newCache.sets[setNumber] = [...set]

  if (emptyLineIndex !== -1) {
    newCache.sets[setNumber][emptyLineIndex] = { valid: true, tag }
    return {
      cache: newCache,
      outcome: { hit: false, miss: true, eviction: false },
    }
  } else {
    // Eviction (assuming LRU policy, we evict the first line)
    newCache.sets[setNumber][0] = { valid: true, tag }
    return {
      cache: newCache,
      outcome: { hit: false, miss: true, eviction: true },
    }
  }
}

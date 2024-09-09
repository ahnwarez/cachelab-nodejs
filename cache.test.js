import { describe, it, expect } from "vitest";

import { initCache, load, store, modify } from "./cache";

describe("cache", () => {
  it("M miss", () => {
    const s = 4;
    const b = 4;
    const E = 1;
    const address = 0xf;

    let cache = initCache({ s, b, E });

    cache = modify(cache, address);
    expect(cache).toStrictEqual(
      expect.objectContaining({
        cache: { s: s, b: b, sets: expect.anything() },
        outcome: { miss: false, hit: true, eviction: false },
      }),
    );
  });

  it("S miss", () => {
    const s = 2;
    const b = 1;
    const E = 1;
    const address = 0xf;

    let cache = initCache({ s, b, E });

    cache = store(cache, address);
    expect(cache).toStrictEqual(
      expect.objectContaining({
        cache: { s: s, b: b, sets: expect.anything() },
        outcome: { miss: true, hit: false, eviction: false },
      }),
    );
  });

  it("L miss", () => {
    const s = 2;

    const b = 1;
    const E = 1;
    const address = 0xf;

    let cache = initCache({ s, b, E });

    cache = load(cache, address);
    expect(cache).toStrictEqual(
      expect.objectContaining({
        cache: { s: s, b: b, sets: expect.anything() },
        outcome: { miss: true, hit: false, eviction: false },
      }),
    );
  });
});

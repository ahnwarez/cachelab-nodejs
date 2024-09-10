import { describe, it, expect } from "vitest";

import { makeCache } from "./cache";

describe("cache", () => {
  it("miss hit eviction", () => {
    const s = 1;
    const b = 2;
    const E = 1;

    const cache = makeCache({ s, b, E });

    cache.access(0x1); // 0x00001000
    cache.access(0x110); // 0x00001000
    cache.access(0x111); // 0x00001000
    expect(cache.getState()).toStrictEqual({
      misses: 2,
      hits: 1,
      evictions: 1,
    });
  });

  it("miss hit", () => {
    const s = 4;
    const b = 4;
    const E = 1;
    const address = 0xf;

    const cache = makeCache({ s, b, E });

    cache.access(address);
    cache.access(address);
    expect(cache.getState()).toStrictEqual({
      misses: 1,
      hits: 1,
      evictions: 0,
    });
  });

  it("miss", () => {
    const s = 4;
    const b = 4;
    const E = 1;
    const address = 0xf;
    const cache = makeCache({ s, b, E });

    cache.access(address);

    expect(cache.getState()).toStrictEqual({
      misses: 1,
      hits: 0,
      evictions: 0,
    });
  });
});

import { describe, it, expect } from "vitest";

import { initCache, access } from "./index";

describe("E = 1", () => {
  it("access", () => {
    const s = 2;
    const b = 1;
    const E = 1;
    const address = 0xf;

    let cache = initCache({ s, b, E });

    cache = access({ cache, address });
    expect(cache).toStrictEqual(
      expect.objectContaining({
        s: s,
        b: b,
        outcome: { miss: true, hit: false, eviction: false },
      }),
    );

    expect(access({ cache, address })).toStrictEqual(
      expect.objectContaining({
        outcome: { miss: false, hit: true, eviction: false },
      }),
    );
  });
});

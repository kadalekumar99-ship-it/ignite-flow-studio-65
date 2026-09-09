import { describe, expect, it } from "vitest";
import { recoverInterruptedShots } from "./run-recovery";

describe("recoverInterruptedShots", () => {
  it("requeues interrupted work while preserving completed and failed panels", () => {
    const shots = recoverInterruptedShots([
      { index: 0, status: "done" as const, url: "https://example.com/0.png" },
      { index: 1, status: "prompting" as const, error: "interrupted" },
      { index: 2, status: "drawing" as const, error: "interrupted" },
      { index: 3, status: "error" as const, error: "provider rejected" },
    ]);

    expect(shots.map((shot) => shot.status)).toEqual(["done", "waiting", "waiting", "error"]);
    expect(shots[0]?.url).toBe("https://example.com/0.png");
    expect(shots[1]?.error).toBeUndefined();
    expect(shots[2]?.error).toBeUndefined();
    expect(shots[3]?.error).toBe("provider rejected");
  });
});
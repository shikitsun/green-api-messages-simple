import { describe, expect, it } from "vitest";
import { UNEXPECTED_ERROR, toErrorMessage } from "./errorMessage";

describe("toErrorMessage", () => {
  it("keeps the message of a thrown error", () => {
    expect(toErrorMessage(new Error("instance is blocked"))).toBe(
      "instance is blocked",
    );
  });

  it("accepts a plain string rejection", () => {
    expect(toErrorMessage("network down")).toBe("network down");
  });

  it("falls back to a generic text", () => {
    expect(toErrorMessage(undefined)).toBe(UNEXPECTED_ERROR);
    expect(toErrorMessage({ status: 500 })).toBe(UNEXPECTED_ERROR);
    expect(toErrorMessage(new Error(""))).toBe(UNEXPECTED_ERROR);
    expect(toErrorMessage("   ")).toBe(UNEXPECTED_ERROR);
  });
});

import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "../src/token";

describe("tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await signToken("secret", "a@b.co", "confirm", 60);
    expect(await verifyToken("secret", token, "confirm")).toBe("a@b.co");
  });

  it("rejects the wrong action, secret, tampering and expiry", async () => {
    const token = await signToken("secret", "a@b.co", "confirm", 60);
    expect(await verifyToken("secret", token, "unsubscribe")).toBeNull();
    expect(await verifyToken("other", token, "confirm")).toBeNull();
    expect(await verifyToken("secret", `x${token}`, "confirm")).toBeNull();
    const expired = await signToken("secret", "a@b.co", "confirm", -10);
    expect(await verifyToken("secret", expired, "confirm")).toBeNull();
  });

  it("accepts non-expiring unsubscribe tokens", async () => {
    const token = await signToken("secret", "a@b.co", "unsubscribe");
    expect(await verifyToken("secret", token, "unsubscribe")).toBe("a@b.co");
  });
});

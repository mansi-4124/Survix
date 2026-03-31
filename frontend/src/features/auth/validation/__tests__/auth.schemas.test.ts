import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  loginSchema,
  passwordSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from "../auth.schemas";

describe("auth.schemas", () => {
  it("accepts a strong password", () => {
    const result = passwordSchema.safeParse("Strong#123");
    expect(result.success).toBe(true);
  });

  it("rejects weak passwords with missing requirements", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("nouppercase1!").success).toBe(false);
    expect(passwordSchema.safeParse("NOLOWERCASE1!").success).toBe(false);
    expect(passwordSchema.safeParse("NoNumber!").success).toBe(false);
    expect(passwordSchema.safeParse("NoSpecial123").success).toBe(false);
  });

  it("validates login payloads and trims email", () => {
    const parsed = loginSchema.parse({
      email: "  team@survix.io ",
      password: "secret",
    });

    expect(parsed.email).toBe("team@survix.io");
  });

  it("validates signup payloads", () => {
    const parsed = signupSchema.parse({
      username: "survix-user",
      email: "hello@survix.io",
      password: "Strong#123",
    });

    expect(parsed.username).toBe("survix-user");
  });

  it("requires a 6-digit numeric otp for email verification", () => {
    expect(
      verifyEmailSchema.safeParse({ otp: "123456" }).success,
    ).toBe(true);
    expect(
      verifyEmailSchema.safeParse({ otp: "12ab56" }).success,
    ).toBe(false);
  });

  it("validates forgot password emails", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "reset@survix.io" }).success,
    ).toBe(true);
  });

  it("requires matching passwords for reset flows", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "Strong#123",
      confirmPassword: "Strong#1234",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Passwords do not match.");
    }
  });
});

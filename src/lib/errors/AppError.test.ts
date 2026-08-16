import { describe, it, expect } from "vitest";
import { AppError, ValidationError, AuthError } from "./AppError";

describe("AppError Hierarchy", () => {
  it("should create AppError with status code and message", () => {
    const error = new AppError("Test error", 400, "TEST_CODE");
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("TEST_CODE");
  });

  it("should create ValidationError with 400 status", () => {
    const error = new ValidationError("Invalid field");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("should create AuthError with 401 status", () => {
    const error = new AuthError("Unauthorized access");
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
  });
});

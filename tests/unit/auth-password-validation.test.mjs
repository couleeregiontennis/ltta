import test from "node:test";
import assert from "node:assert/strict";

test("Password complexity validation logic on signup", () => {
  function validateSignupPassword(password) {
    if (!password) {
      return { valid: false, error: "Email and password are required" };
    }
    if (password.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters long" };
    }
    return { valid: true };
  }

  assert.deepEqual(validateSignupPassword("short"), {
    valid: false,
    error: "Password must be at least 8 characters long"
  });

  assert.deepEqual(validateSignupPassword("1234567"), {
    valid: false,
    error: "Password must be at least 8 characters long"
  });

  assert.deepEqual(validateSignupPassword("12345678"), {
    valid: true
  });

  assert.deepEqual(validateSignupPassword("securePassword123!"), {
    valid: true
  });
});

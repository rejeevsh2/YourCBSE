import assert from "node:assert/strict";
import test from "node:test";
import { statusToCode } from "../src/lib/auth/response-errors.ts";

test("pending and rejected registrations do not request an email OTP", () => {
  assert.equal(statusToCode(403, { code: "account-pending-approval" }), "account-pending-approval");
  assert.equal(statusToCode(403, { code: "account-rejected" }), "account-rejected");
  assert.equal(statusToCode(403, { code: "account-paused" }), "account-paused");
});

test("uncoded and unfamiliar forbidden responses do not imply an email was sent", () => {
  assert.equal(statusToCode(403, {}), "access-denied");
  assert.equal(statusToCode(403, { code: "class-access-required" }), "access-denied");
  assert.equal(statusToCode(403, { code: "toString" }), "access-denied");
});

test("email verification requires an explicit backend error code", () => {
  assert.equal(statusToCode(403, { code: "email-not-verified" }), "email-not-verified");
});

test("credential, validation and rate-limit failures keep their existing behavior", () => {
  assert.equal(statusToCode(401, {}), "invalid-credentials");
  assert.equal(statusToCode(422, {}), "validation-error");
  assert.equal(statusToCode(429, {}), "account-locked");
  assert.equal(statusToCode(500, {}), "server-error");
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAdminSession, parseCookies, verifyAdminSession } from "../../api/_utils/admin-session.js";

describe("admin session helpers", () => {
  const originalSecret = process.env.ADMIN_SESSION_SECRET;

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = "test-session-secret";
  });

  afterEach(() => {
    process.env.ADMIN_SESSION_SECRET = originalSecret;
  });

  it("creates and verifies a signed session", () => {
    const token = createAdminSession(100);
    expect(verifyAdminSession(token, 101)).toBe(true);
    expect(verifyAdminSession(`${token}tampered`, 101)).toBe(false);
  });

  it("rejects expired sessions", () => {
    const token = createAdminSession(100);
    expect(verifyAdminSession(token, 60 * 60 * 9)).toBe(false);
  });

  it("parses cookies by name", () => {
    expect(parseCookies("a=1; mh_admin_session=abc.def")).toEqual({
      a: "1",
      mh_admin_session: "abc.def",
    });
  });
});

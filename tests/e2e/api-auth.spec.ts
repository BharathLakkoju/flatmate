import { test, expect } from "@playwright/test";

/**
 * These tests cover the public API surface to confirm authorization is enforced.
 * They run against the live dev server without a valid session cookie.
 */
test.describe("API authorization — unauthenticated requests blocked", () => {
  const FLAT_ID = "00000000-0000-0000-0000-000000000001";

  for (const route of [
    `/api/expenses?flat_id=${FLAT_ID}`,
    `/api/meals?flat_id=${FLAT_ID}`,
    `/api/tasks?flat_id=${FLAT_ID}`,
  ]) {
    test(`GET ${route} returns 401`, async ({ request }) => {
      const resp = await request.get(route);
      expect(resp.status()).toBe(401);
    });

    test(`POST ${route} returns 401`, async ({ request }) => {
      const resp = await request.post(route.split("?")[0], {
        data: { flat_id: FLAT_ID },
      });
      expect(resp.status()).toBe(401);
    });
  }

  for (const route of [
    "/api/expenses/00000000-0000-0000-0000-000000000099",
    "/api/meals/00000000-0000-0000-0000-000000000099",
    "/api/tasks/00000000-0000-0000-0000-000000000099",
  ]) {
    test(`PATCH ${route} returns 401`, async ({ request }) => {
      const resp = await request.patch(route, {
        data: { note: "hacked" },
      });
      expect(resp.status()).toBe(401);
    });

    test(`DELETE ${route} returns 401`, async ({ request }) => {
      const resp = await request.delete(route);
      expect(resp.status()).toBe(401);
    });
  }
});

test.describe("API authorization — user_id cannot be injected via body", () => {
  test("POST /api/flats/join ignores body user_id", async ({ request }) => {
    const resp = await request.post("/api/flats/join", {
      data: {
        invite_code: "TST-AABBCC",
        display_name: "Hacker",
        user_id: "00000000-0000-0000-0000-000000000001", // should be ignored
      },
    });
    // Whether 404 (invalid code) or 201, the user_id from body must never be used.
    // Without a session cookie the route should treat session user_id as null.
    expect([201, 404]).toContain(resp.status());
    if (resp.status() === 201) {
      const body = await resp.json();
      expect(body.member?.user_id).not.toBe("00000000-0000-0000-0000-000000000001");
    }
  });
});

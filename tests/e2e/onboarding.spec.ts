import { test, expect } from "@playwright/test";

/**
 * Onboarding flow — unauthenticated visitor cannot skip to app pages.
 * Authenticated flow tests require a valid Supabase test user — see
 * `tests/e2e/README.md` for setup instructions.
 */
test.describe("Onboarding guard", () => {
  test("/onboarding is publicly accessible (redirects to login if unauthed)", async ({
    page,
  }) => {
    const resp = await page.goto("/onboarding");
    // Either rendered (200) or redirected to login — not a 5xx error
    expect([200, 302]).toContain(resp?.status() ?? 200);
  });

  test("/app/dashboard is protected", async ({ page }) => {
    await page.goto("/app/dashboard");
    await expect(page).not.toHaveURL(/\/app\/dashboard/);
  });

  test("/app/expenses is protected", async ({ page }) => {
    await page.goto("/app/expenses");
    await expect(page).not.toHaveURL(/\/app\/expenses/);
  });

  test("/app/tasks is protected", async ({ page }) => {
    await page.goto("/app/tasks");
    await expect(page).not.toHaveURL(/\/app\/tasks/);
  });

  test("/app/calendar is protected", async ({ page }) => {
    await page.goto("/app/calendar");
    await expect(page).not.toHaveURL(/\/app\/calendar/);
  });

  test("/app/settings is protected", async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page).not.toHaveURL(/\/app\/settings/);
  });
});

test.describe("Join flat page", () => {
  test("join page loads without errors", async ({ page }) => {
    const resp = await page.goto("/join");
    expect(resp?.status()).not.toBe(500);
  });
});

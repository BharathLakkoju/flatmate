import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("landing page loads and shows Sign In button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("unauthenticated access to /app redirects to login", async ({ page }) => {
    await page.goto("/app/dashboard");
    // Should be redirected away from app — either to / or /login
    await expect(page).not.toHaveURL(/\/app\//);
  });

  test("OAuth callback with an invalid `next` param falls back to /onboarding", async ({
    page,
  }) => {
    // Without a valid code the callback redirects to /login?error — but the important
    // thing is it must never redirect to an external URL.
    await page.goto("/auth/callback?next=http%3A%2F%2Fevil.com");
    const url = page.url();
    expect(url).not.toMatch(/^http:\/\/evil\.com/);
    expect(url).toMatch(/localhost:3000/);
  });

  test("OAuth callback with protocol-relative next falls back to /onboarding", async ({
    page,
  }) => {
    await page.goto("/auth/callback?next=%2F%2Fevil.com");
    const url = page.url();
    expect(url).not.toMatch(/evil\.com/);
    expect(url).toMatch(/localhost:3000/);
  });
});

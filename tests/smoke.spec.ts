import { test, expect } from "@playwright/test";

/**
 * Smoke tests covering the core storefront flows.
 * These verify the app boots and the critical user paths work end-to-end.
 *
 * GSAP/Framer Motion entrance animations make some elements transition in,
 * so we use `waitUntil: "networkidle"`, generous timeouts, and whole-element
 * text matching to keep assertions stable.
 */

test.describe("Homepage", () => {
  test("loads and shows the hero headline", async ({ page }) => {
    // Use domcontentloaded (not networkidle) — the hero preloads remote
    // Unsplash images, so the network never fully goes idle.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Headline text is split across spans for the GSAP reveal — match the h1
    // element as a whole rather than via role text.
    await expect(page.locator("h1")).toContainText("ENGINEERED", { timeout: 15_000 });
    await expect(page.getByRole("link", { name: "LUMEN home" })).toBeVisible();
  });

  test("document has correct title and meta description (SEO)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/LUMEN/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
  });

  test("renders featured products section", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByText("The Icons.").first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Navigation", () => {
  test("can navigate to the shop page via the navbar", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Shop", exact: true }).first().click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Add to cart", () => {
  test("quick-add opens the cart drawer with the item", async ({ page }) => {
    await page.goto("/shop", { waitUntil: "networkidle" });
    const quickAdd = page.getByRole("button", { name: /Quick Add/i }).first();
    await expect(quickAdd).toBeVisible({ timeout: 10_000 });
    await quickAdd.click();

    const drawer = page.getByRole("dialog", { name: /shopping cart/i });
    await expect(drawer).toBeVisible({ timeout: 10_000 });
    await expect(drawer.getByText(/Your Bag/i)).toBeVisible();
  });

  test("product page add-to-cart requires a size", async ({ page }) => {
    await page.goto("/product/aether-flight-1", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Add to Bag/i }).click();
    await expect(page.getByText(/Please select a size/i)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Search", () => {
  test("Cmd/Ctrl+K opens search and returns results", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: /search products/i });
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    await dialog.getByPlaceholder(/Search products/i).fill("aether");
    await expect(dialog.getByRole("link", { name: /Aether Flight/i }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Esc closes the search overlay", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog", { name: /search products/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /search products/i })).toBeHidden({
      timeout: 10_000,
    });
  });
});

test.describe("Accessibility basics", () => {
  test("homepage has a main landmark and a single h1", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("all icon-only nav buttons have accessible names", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: /search products/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /switch to/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /open cart/i })).toBeVisible();
  });
});

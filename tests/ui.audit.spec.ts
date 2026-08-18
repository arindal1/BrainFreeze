import { test, expect, Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function collect(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector("#protocol") as HTMLElement | null;
    const track = section?.querySelector<HTMLElement>(":scope > div:last-child");
    const pinSpacer = section?.parentElement;
    const canvas = document.querySelector("canvas");

    return {
      protocol: section
        ? {
            sectionWidth: section.getBoundingClientRect().width,
            trackScrollWidth: track?.scrollWidth ?? null,
            trackClientWidth: track?.clientWidth ?? null,
            trackDisplay: track ? getComputedStyle(track).flexDirection : null,
            trackTransform: track ? getComputedStyle(track).transform : null,
            parentClass: pinSpacer?.className ?? null,
            pinned: pinSpacer?.classList.contains("pin-spacer") ?? false,
          }
        : null,
      canvas: canvas
        ? {
            w: canvas.getBoundingClientRect().width,
            h: canvas.getBoundingClientRect().height,
          }
        : null,
      docHeight: document.documentElement.scrollHeight,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    };
  });
}

test("landing page audit", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  console.log("INITIAL", JSON.stringify(await collect(page), null, 2));
  await page.screenshot({ path: "tests/shots/01-hero.png" });

  // scroll into the protocol section and step through
  await page.evaluate(() => document.querySelector("#protocol")?.scrollIntoView());
  await page.waitForTimeout(800);
  console.log("AT PROTOCOL", JSON.stringify(await collect(page), null, 2));
  await page.screenshot({ path: "tests/shots/02-protocol-start.png" });

  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(500);
  }
  const mid = await collect(page);
  console.log("PROTOCOL SCROLLED", JSON.stringify(mid, null, 2));
  await page.screenshot({ path: "tests/shots/03-protocol-scrolled.png" });

  await page.evaluate(() => document.querySelector("#agents")?.scrollIntoView());
  await page.waitForTimeout(700);
  await page.screenshot({ path: "tests/shots/04-agents.png" });

  await page.evaluate(() => document.querySelector("#brief")?.scrollIntoView());
  await page.waitForTimeout(700);
  await page.screenshot({ path: "tests/shots/05-brief.png" });

  console.log("ERRORS", JSON.stringify(errors, null, 2));
  // React's dev-only eval() notice is emitted by the Next dev overlay and is
  // not present in a production build.
  const real = errors.filter((e) => !e.includes("favicon") && !e.includes("eval() is not supported"));
  expect(real).toEqual([]);
});

test("landing page audit @ 1024 and mobile", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 800 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  console.log("960px", JSON.stringify(await collect(page), null, 2));
  await page.evaluate(() => document.querySelector("#protocol")?.scrollIntoView());
  await page.waitForTimeout(600);
  await page.screenshot({ path: "tests/shots/06-protocol-960.png" });
  console.log("960px @protocol", JSON.stringify(await collect(page), null, 2));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "tests/shots/07-mobile-hero.png" });
});
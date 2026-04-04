import { chromium } from "@playwright/test";

const url = process.env.SMOKE_URL ?? "http://127.0.0.1:5173/";

const browser = await chromium.launch();
const page = await browser.newPage();

const consoleErrors = [];
const pageErrors = [];

page.on("console", (msg) => {
  if (msg.type() === "error") {
    consoleErrors.push(msg.text());
  }
});

page.on("pageerror", (err) => {
  pageErrors.push(String(err));
});

try {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1500);

  const rootInfo = await page.evaluate(() => {
    const root = document.getElementById("root");
    const text = root?.innerText ?? "";
    const html = root?.innerHTML ?? "";
    return {
      hasRoot: Boolean(root),
      textLen: text.trim().length,
      htmlLen: html.trim().length,
      title: document.title,
    };
  });

  const failed =
    pageErrors.length > 0 ||
    consoleErrors.length > 0 ||
    !rootInfo.hasRoot ||
    (rootInfo.textLen === 0 && rootInfo.htmlLen === 0);

  console.log(JSON.stringify({ url, rootInfo, consoleErrors, pageErrors }, null, 2));

  if (failed) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}

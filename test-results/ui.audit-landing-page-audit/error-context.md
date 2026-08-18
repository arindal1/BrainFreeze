# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.audit.spec.ts >> landing page audit
- Location: tests\ui.audit.spec.ts:36:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "eval() is not supported in this environment. If this page was served with a `Content-Security-Policy` header, make sure that `unsafe-eval` is included. React requires eval() in development mode for various debugging features like reconstructing callstacks from a different environment.
+ React will never use eval() in production mode",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Brain Freeze v0.4" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]: Brain Freeze
        - generic [ref=e6]: v0.4
      - navigation "Sections" [ref=e7]:
        - link "01Protocol" [ref=e8] [cursor=pointer]:
          - /url: "#protocol"
        - link "02Agents" [ref=e9] [cursor=pointer]:
          - /url: "#agents"
        - link "03Brief" [ref=e10] [cursor=pointer]:
          - /url: "#brief"
      - generic [ref=e11]:
        - link "Sign in" [ref=e12] [cursor=pointer]:
          - /url: /login
        - link "Open a node" [ref=e13] [cursor=pointer]:
          - /url: /register
  - main [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e19]:
        - paragraph [ref=e20]: Asynchronous multi-agent research
        - heading "Ask once. Walk away. Return to a document." [level=1] [ref=e21]:
          - generic [ref=e22]: Ask once.
          - generic [ref=e24]: Walk away.
          - generic [ref=e26]: Return to a document.
        - generic [ref=e28]:
          - paragraph [ref=e29]: Three models take your question at the same time - broad ground truth, technical depth, and what actually changed this week. Brain Freeze queues the run, works it in the background, and hands back a single structured markdown report. No spinner to sit and watch.
          - generic [ref=e30]:
            - link "Queue your first query" [ref=e31] [cursor=pointer]:
              - /url: /register
              - text: Queue your first query
              - generic [ref=e32]: →
            - link "Read the protocol" [ref=e33] [cursor=pointer]:
              - /url: "#protocol"
      - generic [ref=e35]:
        - generic [ref=e36]:
          - term [ref=e37]: Agents
          - definition [ref=e38]: 03 parallel
        - generic [ref=e39]:
          - term [ref=e40]: Dispatch
          - definition [ref=e41]: Queued, non-blocking
        - generic [ref=e42]:
          - term [ref=e43]: Output
          - definition [ref=e44]: One markdown report
        - generic [ref=e45]:
          - term [ref=e46]: Your wait
          - definition [ref=e47]: None
    - region "The protocol" [ref=e49]:
      - generic:
        - paragraph: The protocol
        - paragraph: Scroll →
      - generic [ref=e50]:
        - article [ref=e51]:
          - generic: "01"
          - paragraph [ref=e52]: Stage 01
          - heading "Submit" [level=3] [ref=e53]
          - paragraph [ref=e54]: One line. A topic, a company, a sector, a person, a shipping standard - whatever you'd otherwise spend an afternoon on. The query is normalised and checked against your in-flight work so the same question never runs twice.
          - list [ref=e55]:
            - listitem [ref=e56]:
              - text: Dedup on normalised text
              - generic [ref=e57]: ●
            - listitem [ref=e58]:
              - text: 500 char ceiling
              - generic [ref=e59]: ●
            - listitem [ref=e60]:
              - text: Rate limited per IP
              - generic [ref=e61]: ●
        - article [ref=e62]:
          - generic: "02"
          - paragraph [ref=e63]: Stage 02
          - heading "Dispatch" [level=3] [ref=e64]
          - paragraph [ref=e65]: The job enters an in-process queue with fixed concurrency and you are released immediately. Three agents are then fired in parallel - nothing is sequential, nothing waits on a previous answer.
          - list [ref=e66]:
            - listitem [ref=e67]:
              - text: FIFO queue
              - generic [ref=e68]: ●
            - listitem [ref=e69]:
              - text: Promise.allSettled fan-out
              - generic [ref=e70]: ●
            - listitem [ref=e71]:
              - text: Partial failure tolerated
              - generic [ref=e72]: ●
        - article [ref=e73]:
          - generic: "03"
          - paragraph [ref=e74]: Stage 03
          - heading "Synthesise" [level=3] [ref=e75]
          - paragraph [ref=e76]: Each agent returns its own section. The aggregator merges them into a single structured markdown document with a references footer - not three chat logs stapled together.
          - list [ref=e77]:
            - listitem [ref=e78]:
              - text: Sectioned markdown
              - generic [ref=e79]: ●
            - listitem [ref=e80]:
              - text: Reference footer
              - generic [ref=e81]: ●
            - listitem [ref=e82]:
              - text: Written to Postgres
              - generic [ref=e83]: ●
        - article [ref=e84]:
          - generic: "04"
          - paragraph [ref=e85]: Stage 04
          - heading "Return" [level=3] [ref=e86]
          - paragraph [ref=e87]: Every stage change is published to an event bus and streamed to your dashboard over server-sent events. Close the tab if you want. The document is waiting when you come back.
          - list [ref=e88]:
            - listitem [ref=e89]:
              - text: SSE, no polling
              - generic [ref=e90]: ●
            - listitem [ref=e91]:
              - text: Per-user fan-out
              - generic [ref=e92]: ●
            - listitem [ref=e93]:
              - text: Permanently archived
              - generic [ref=e94]: ●
          - paragraph [ref=e95]: End of protocol
    - generic [ref=e97]:
      - generic [ref=e98]:
        - generic [ref=e99]:
          - paragraph [ref=e100]: Three mandates
          - heading "Not one model asked three times." [level=2] [ref=e101]: Not one modelasked three times.
        - paragraph [ref=e103]: Each agent runs a different model against a different prompt with a different grounding strategy, and owns one section of the final document. If one fails, the other two still ship - the report notes the gap instead of pretending.
      - list [ref=e104]:
        - listitem [ref=e105]:
          - button "01 / A Ground Nemotron · OpenRouter" [ref=e106]:
            - generic [ref=e107]: 01 / A
            - generic [ref=e108]: Ground
            - generic [ref=e109]: Nemotron · OpenRouter
            - generic [ref=e110]: +
        - listitem [ref=e111]:
          - button "02 / B Depth Gemini · Google" [expanded] [ref=e112]:
            - generic [ref=e113]: 02 / B
            - generic [ref=e114]: Depth
            - generic [ref=e115]: Gemini · Google
            - generic [ref=e116]: +
          - generic [ref=e118]:
            - paragraph [ref=e120]: Goes technical. Mechanisms, architecture, trade-offs, comparisons and the failure modes - grounded against live web search rather than recalled from training.
            - generic [ref=e121]:
              - generic [ref=e122]:
                - term [ref=e123]: Model
                - definition [ref=e124]: Gemini (Google)
              - generic [ref=e125]:
                - term [ref=e126]: Grounding
                - definition [ref=e127]: Web search
              - generic [ref=e128]:
                - term [ref=e129]: Owns section
                - definition [ref=e130]: Technical analysis
        - listitem [ref=e131]:
          - button "03 / C Now Grok · xAI" [ref=e132]:
            - generic [ref=e133]: 03 / C
            - generic [ref=e134]: Now
            - generic [ref=e135]: Grok · xAI
            - generic [ref=e136]: +
    - generic [ref=e137]:
      - generic [ref=e139]:
        - generic [ref=e140]:
          - generic [ref=e141]:
            - text: Solid-state battery supply chain, 2026
            - generic [ref=e142]: ◆
          - generic [ref=e143]:
            - text: Rust vs Go for high-throughput services
            - generic [ref=e144]: ◆
          - generic [ref=e145]:
            - text: What ASML actually sells
            - generic [ref=e146]: ◆
          - generic [ref=e147]:
            - text: Post-quantum crypto migration status
            - generic [ref=e148]: ◆
          - generic [ref=e149]:
            - text: Who is Aravind Srinivas
            - generic [ref=e150]: ◆
        - generic [ref=e151]:
          - generic [ref=e152]:
            - text: Solid-state battery supply chain, 2026
            - generic [ref=e153]: ◆
          - generic [ref=e154]:
            - text: Rust vs Go for high-throughput services
            - generic [ref=e155]: ◆
          - generic [ref=e156]:
            - text: What ASML actually sells
            - generic [ref=e157]: ◆
          - generic [ref=e158]:
            - text: Post-quantum crypto migration status
            - generic [ref=e159]: ◆
          - generic [ref=e160]:
            - text: Who is Aravind Srinivas
            - generic [ref=e161]: ◆
      - generic [ref=e162]:
        - generic [ref=e163]:
          - paragraph [ref=e164]: Open a node
          - heading "Give it the question you keep postponing." [level=2] [ref=e165]: Give it thequestion youkeep postponing.
        - generic [ref=e166]:
          - paragraph [ref=e167]: Free to start. Documents are stored against your account permanently - every report you generate stays searchable in your history.
          - generic [ref=e168]:
            - link "Create an account" [ref=e169] [cursor=pointer]:
              - /url: /register
              - text: Create an account
              - generic [ref=e170]: →
            - link "I already have one" [ref=e171] [cursor=pointer]:
              - /url: /login
  - contentinfo [ref=e172]:
    - generic [ref=e173]:
      - generic [ref=e174]:
        - generic [ref=e175]:
          - paragraph [ref=e176]: Product
          - link "Sign in" [ref=e177] [cursor=pointer]:
            - /url: /login
          - link "Create account" [ref=e178] [cursor=pointer]:
            - /url: /register
          - link "Dashboard" [ref=e179] [cursor=pointer]:
            - /url: /dashboard
        - generic [ref=e180]:
          - paragraph [ref=e181]: Pipeline
          - generic [ref=e182]: Nemotron · Gemini · Grok
          - generic [ref=e183]: Postgres · Drizzle
          - generic [ref=e184]: Next.js · SSE
        - generic [ref=e185]:
          - paragraph [ref=e186]: Built by
          - link "Arindal Char" [ref=e187] [cursor=pointer]:
            - /url: https://github.com/arindal1
        - generic [ref=e188]:
          - paragraph [ref=e189]: Status
          - generic [ref=e190]: Pipeline nominal
      - paragraph [ref=e192]: BRAIN FREEZE
      - generic [ref=e193]:
        - paragraph [ref=e194]: © 2026 Brain Freeze
        - paragraph [ref=e195]: Ask once. Walk away.
  - generic [ref=e200] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e201]
    - generic [ref=e205]:
      - button "Open issues overlay" [ref=e206]:
        - generic [ref=e207]:
          - generic [ref=e208]: "0"
          - generic [ref=e209]: "1"
        - generic [ref=e210]: Issue
      - button "Collapse issues badge" [ref=e211]
  - alert [ref=e214]
```

# Test source

```ts
  1  | import { test, expect, Page } from "@playwright/test";
  2  | 
  3  | const BASE = process.env.BASE_URL ?? "http://localhost:3000";
  4  | 
  5  | async function collect(page: Page) {
  6  |   return page.evaluate(() => {
  7  |     const section = document.querySelector("#protocol") as HTMLElement | null;
  8  |     const track = section?.querySelector<HTMLElement>(":scope > div:last-child");
  9  |     const pinSpacer = section?.parentElement;
  10 |     const canvas = document.querySelector("canvas");
  11 | 
  12 |     return {
  13 |       protocol: section
  14 |         ? {
  15 |             sectionWidth: section.getBoundingClientRect().width,
  16 |             trackScrollWidth: track?.scrollWidth ?? null,
  17 |             trackClientWidth: track?.clientWidth ?? null,
  18 |             trackDisplay: track ? getComputedStyle(track).flexDirection : null,
  19 |             trackTransform: track ? getComputedStyle(track).transform : null,
  20 |             parentClass: pinSpacer?.className ?? null,
  21 |             pinned: pinSpacer?.classList.contains("pin-spacer") ?? false,
  22 |           }
  23 |         : null,
  24 |       canvas: canvas
  25 |         ? {
  26 |             w: canvas.getBoundingClientRect().width,
  27 |             h: canvas.getBoundingClientRect().height,
  28 |           }
  29 |         : null,
  30 |       docHeight: document.documentElement.scrollHeight,
  31 |       viewport: { w: window.innerWidth, h: window.innerHeight },
  32 |     };
  33 |   });
  34 | }
  35 | 
  36 | test("landing page audit", async ({ page }) => {
  37 |   const errors: string[] = [];
  38 |   page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  39 |   page.on("pageerror", (e) => errors.push(String(e)));
  40 | 
  41 |   await page.setViewportSize({ width: 1440, height: 900 });
  42 |   await page.goto(BASE, { waitUntil: "networkidle" });
  43 |   await page.waitForTimeout(2500);
  44 | 
  45 |   console.log("INITIAL", JSON.stringify(await collect(page), null, 2));
  46 |   await page.screenshot({ path: "tests/shots/01-hero.png" });
  47 | 
  48 |   // scroll into the protocol section and step through
  49 |   await page.evaluate(() => document.querySelector("#protocol")?.scrollIntoView());
  50 |   await page.waitForTimeout(800);
  51 |   console.log("AT PROTOCOL", JSON.stringify(await collect(page), null, 2));
  52 |   await page.screenshot({ path: "tests/shots/02-protocol-start.png" });
  53 | 
  54 |   for (let i = 0; i < 6; i++) {
  55 |     await page.mouse.wheel(0, 700);
  56 |     await page.waitForTimeout(500);
  57 |   }
  58 |   const mid = await collect(page);
  59 |   console.log("PROTOCOL SCROLLED", JSON.stringify(mid, null, 2));
  60 |   await page.screenshot({ path: "tests/shots/03-protocol-scrolled.png" });
  61 | 
  62 |   await page.evaluate(() => document.querySelector("#agents")?.scrollIntoView());
  63 |   await page.waitForTimeout(700);
  64 |   await page.screenshot({ path: "tests/shots/04-agents.png" });
  65 | 
  66 |   await page.evaluate(() => document.querySelector("#brief")?.scrollIntoView());
  67 |   await page.waitForTimeout(700);
  68 |   await page.screenshot({ path: "tests/shots/05-brief.png" });
  69 | 
  70 |   console.log("ERRORS", JSON.stringify(errors, null, 2));
> 71 |   expect(errors.filter((e) => !e.includes("favicon"))).toEqual([]);
     |                                                        ^ Error: expect(received).toEqual(expected) // deep equality
  72 | });
  73 | 
  74 | test("landing page audit @ 1024 and mobile", async ({ page }) => {
  75 |   await page.setViewportSize({ width: 960, height: 800 });
  76 |   await page.goto(BASE, { waitUntil: "networkidle" });
  77 |   await page.waitForTimeout(2000);
  78 |   console.log("960px", JSON.stringify(await collect(page), null, 2));
  79 |   await page.evaluate(() => document.querySelector("#protocol")?.scrollIntoView());
  80 |   await page.waitForTimeout(600);
  81 |   await page.screenshot({ path: "tests/shots/06-protocol-960.png" });
  82 |   console.log("960px @protocol", JSON.stringify(await collect(page), null, 2));
  83 | 
  84 |   await page.setViewportSize({ width: 390, height: 844 });
  85 |   await page.reload({ waitUntil: "networkidle" });
  86 |   await page.waitForTimeout(1500);
  87 |   await page.screenshot({ path: "tests/shots/07-mobile-hero.png" });
  88 | });
  89 | 
```
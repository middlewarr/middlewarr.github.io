import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const readOutput = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");

test("the built page exposes the complete public landing-page contract", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /<link rel="canonical" href="https:\/\/middlewarr\.github\.io\/?">/);
  assert.match(html, /<meta property="og:title" content="Middlewarr/);
  assert.match(html, /<meta property="og:image" content="https:\/\/middlewarr\.github\.io\/social-card\.svg">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
  assert.match(html, /<nav[ >]/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /<footer[ >]/);
  assert.match(html, /href="#main-content"[^>]*>Skip to content</);
  assert.match(html, /id="why-middlewarr"/);
  assert.match(html, /id="how-it-works"/);
  assert.match(html, /id="get-started"/);
  assert.match(html, /href="https:\/\/github\.com\/middlewarr\/middlewarr"/);
  assert.match(html, /href="https:\/\/docs\.middlewarr\.dev\/"/);
  assert.match(html, /aria-label="Requests travel from a client app through Middlewarr to an upstream service, and responses return through Middlewarr to the client app"/);
  assert.doesNotMatch(html, /Open source/);
  assert.doesNotMatch(html, /<script(?:\s|>)/);
  assert.match(html, /href="\/fonts\/space-grotesk-latin-wght-normal\.woff2"/);
});

test("the landing page has only the Why, How, and Get started sections", async () => {
  const html = await readOutput("index.html");

  assert.equal((html.match(/<main[^>]*>[\s\S]*?<\/main>/)?.[0].match(/<section(?: |\>)/g) ?? []).length, 3);
  assert.match(html, /id="why-middlewarr"/);
  assert.match(html, /id="how-it-works"/);
  assert.match(html, /id="get-started"/);
  assert.match(html, /<h2 id="how-heading">From app to service<\/h2>/);
  assert.match(html, />Get Started</);
  assert.doesNotMatch(html, /Operational overview|Example interface|Quick start/);
});

test("the header exposes an accessible GitHub repository link", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /class="github-icon-button"[^>]+href="https:\/\/github\.com\/middlewarr\/middlewarr"/);
  assert.match(html, /aria-label="View Middlewarr on GitHub"/);
  assert.match(html, /data-icon="github"/);
  assert.doesNotMatch(html, /ghbtns\.com|<iframe/);
});

test("the How diagram describes implemented proxy behavior", async () => {
  const html = await readOutput("index.html");

  assert.match(html, />Authenticate</);
  assert.match(html, />Match Endpoint</);
  assert.match(html, />Attach Service Key</);
  assert.match(html, />Forward &amp; Log</);
  assert.match(html, /GET \/api\/v3\/calendar/);
  assert.match(html, /Request allowed/);
  assert.match(html, /The response returns through Middlewarr to the app\./);
  assert.doesNotMatch(html, /cdn\.jsdelivr\.net/);
});

test("the request journey cycles seven example requests through a six-row log", async () => {
  const html = await readOutput("index.html");
  const css = await readOutput(html.match(/href="(\/_astro\/index\.[^"]+\.css)"/)?.[1].slice(1));

  assert.match(html, /data-request-feed/);
  for (const client of ["Homepage", "Seerr", "Bazarr", "Profilarr", "qui"]) {
    assert.match(html, new RegExp(`>${client}<`));
  }
  assert.equal((html.match(/<time/g) ?? []).length, 7);
  assert.match(html, /<figure[^>]*class="request-journey"/);
  assert.match(css, /\.request-feed\{[^}]*height:192px/);
  assert.match(css, /\.request-row\{[^}]*height:32px/);
  assert.match(css, /@keyframes request-feed/);
  assert.match(css, /animation:[^;}]*request-feed[^;}]*infinite/);
  assert.doesNotMatch(html, /X-Api-Key/);
});

test("the request journey routes into both destination services", async () => {
  const html = await readOutput("index.html");
  const css = await readOutput(html.match(/href="(\/_astro\/index\.[^"]+\.css)"/)?.[1].slice(1));

  assert.match(html, />Radarr</);
  assert.match(html, />Sonarr</);
  assert.match(html, /icons\/services\/radarr\.svg/);
  assert.match(html, /icons\/services\/sonarr\.svg/);
  assert.match(css, /\.upstream-service\{[^}]*padding:0/);
  assert.match(css, /\.upstream-service\{[^}]*overflow:hidden/);
  assert.match(css, /\.destination-service\{[^}]*height:100%/);
  assert.match(css, /\.destination-service\{[^}]*align-items:center/);
  // Preserve the current white service cards: the parent supplies their surface.
  assert.match(css, /\.upstream-service\{[^}]*background:var\(--surface\)/);
  assert.doesNotMatch(css, /\.destination-service\{[^}]*background:/);
  assert.doesNotMatch(css, /\.destination-service\{[^}]*linear-gradient/);
});

test("the destination stage explains implemented failure notifications", async () => {
  const html = await readOutput("index.html");
  const css = await readOutput(html.match(/href="(\/_astro\/index\.[^"]+\.css)"/)?.[1].slice(1));

  assert.equal((html.match(/data-upstream-service=/g) ?? []).length, 2);
  assert.match(html, /class="journey-target-stack"[\s\S]*data-upstream-service="Radarr"[\s\S]*data-upstream-service="Sonarr"[\s\S]*data-notification-panel/);
  assert.match(html, />Notification Providers</);
  assert.match(html, /Send alerts when access or upstream health needs attention/);
  for (const provider of ["Telegram", "Gotify", "Discord"]) {
    assert.match(html, new RegExp(`>${provider}<`));
  }
  for (const icon of ["telegram", "gotify", "discord"]) {
    assert.match(html, new RegExp(`icons/notifications/${icon}\\.svg`));
  }
  assert.doesNotMatch(html, /Request forwarded|lucide-bell-ring/);
  const notificationRoute = html.match(/data-notification-route[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";
  assert.match(notificationRoute, /data-lucide="arrow-right"/);
  assert.doesNotMatch(notificationRoute, /data-lucide="arrow-left"/);
  assert.doesNotMatch(notificationRoute, />Alert</);
  assert.match(css, /\.provider-list\{[^}]*flex-wrap:wrap/s);
  assert.doesNotMatch(css, /\.journey-target-stack:(?::)?before/);
});

test("the client and each upstream service have distinct request and response arrows", async () => {
  const html = await readOutput("index.html");

  const connectors = [
    html.match(/data-journey-connector="client"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "",
    ...(html.match(/data-service-route[^>]*>([\s\S]*?)<\/div>/g) ?? []),
  ];
  assert.equal(connectors.length, 3);
  for (const connector of connectors) {
    assert.match(connector, /class="journey-direction journey-direction-request"[\s\S]*data-lucide="arrow-right"/);
    assert.match(connector, /class="journey-direction journey-direction-response"[\s\S]*data-lucide="arrow-left"/);
    assert.doesNotMatch(connector, />Request<|>Response</);
    assert.doesNotMatch(connector, /data-lucide="arrow-left-right"/);
  }
  assert.match(html, /aria-label="Requests travel from a client app through Middlewarr to an upstream service, and responses return through Middlewarr to the client app"/);
});

test("the request journey loops with reduced-motion support and no playback controls", async () => {
  const html = await readOutput("index.html");
  const css = await readOutput(html.match(/href="(\/_astro\/index\.[^"]+\.css)"/)?.[1].slice(1));

  assert.match(html, /data-request-journey/);
  assert.doesNotMatch(html, /data-pause-journey|Pause animation|Example requests and routing/);
  assert.doesNotMatch(html, /<script(?:\s|>)|data-copy-command/);
  assert.equal((html.match(/class="flow-dot"/g) ?? []).length, 14);
  assert.match(css, /animation:[^;}]*infinite[^;}]*packet-flow/);
  assert.match(css, /@keyframes packet-flow/);
  assert.match(css, /animation:[^;}]*packet-flow/);
  assert.match(css, /animation:none!important/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test("the setup instructions match the documented Docker and administrator setup", async () => {
  const html = await readOutput("index.html");
  assert.match(html, /cp settings.sample.yml data\/settings.yml/);
  assert.match(html, /docker build -t middlewarr \./);
  assert.match(html, /127\.0\.0\.1:9292:80/);
  assert.match(html, /Create your administrator account on first run/);
  assert.doesNotMatch(html, /docker compose|does not authenticate/);
  assert.match(html, /<pre tabindex="0" aria-label="Docker installation commands">/);
});

test("the built site publishes crawler metadata", async () => {
  const robots = await readOutput("robots.txt");
  const sitemap = await readOutput("sitemap-index.xml");

  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Sitemap: https:\/\/middlewarr\.github\.io\/sitemap-index\.xml/);
  assert.match(sitemap, /https:\/\/middlewarr\.github\.io\/sitemap-0\.xml/);
});

test("the built site includes required public assets", async () => {
  for (const path of [
    "favicon.svg",
    "social-card.svg",
    "icons/notifications/telegram.svg",
    "icons/notifications/gotify.svg",
    "icons/notifications/discord.svg",
  ]) {
    await access(new URL(`../dist/${path}`, import.meta.url));
  }
});

test("request and response arrowheads are staggered along their lines", async () => {
  const css = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
  assert.match(css, /\.flow-track svg \{[^}]*left: calc\(75% - 7px\);[^}]*width: 14px;/);
  assert.match(css, /\.journey-direction-response \.flow-track svg \{ left: calc\(25% - 7px\); \}/);
});

test("policy simulation includes a rejected endpoint and synchronized resets", async () => {
  const html = await readOutput("index.html");
  const css = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
  assert.match(html, /result-rejected[^>]*>[\s\S]*Endpoint blocked[\s\S]*<code>403<\/code>/);
  assert.match(css, /--cycle: 19.2s/);
  assert.doesNotMatch(css, /animation-delay: calc\(var\(--step\)/);
  for (const name of ["check-first", "check-second", "check-third", "check-fourth", "result-allowed"]) {
    assert.match(css, new RegExp(`@keyframes ${name} \{[^\n]*48%`));
  }
  assert.match(css, /@keyframes result-rejected .*98%/);
});

test("connections remain visible while policy results reset with a shared fade", async () => {
  const css = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /upstream-window|upstream-packets|47\.99%|97\.99%/);
  assert.doesNotMatch(css, /\.upstream-route \.journey-connector \{[^}]*(?:animation|opacity|visibility)/);
  for (const name of ["check-first", "check-second", "check-third", "check-fourth", "result-allowed"]) {
    const keyframes = css.split(`@keyframes ${name} `)[1]?.split("\n")[0] ?? "";
    assert.match(keyframes, /46%/);
    assert.match(keyframes, /48%/);
  }
  for (const name of ["check-first", "check-rejected", "result-rejected"]) {
    const keyframes = css.split(`@keyframes ${name} `)[1]?.split("\n")[0] ?? "";
    assert.match(keyframes, /96%/);
    assert.match(keyframes, /98%/);
  }
});

test("policy steps immediately highlight a neutral background without sliding", async () => {
  const css = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
  assert.match(css, /--step-highlight: hsl\(0 0% 98\.5%\)/);
  assert.match(css, /@keyframes policy-third \{ 0%, 32%, 100% \{ opacity: 0;/);
  assert.match(css, /@keyframes policy-fourth \{ 0%, 40%, 100% \{ opacity: 0;/);
  assert.match(css, /\.journey-step::before \{[^}]*background: var\(--step-highlight\);[^}]*animation: policy-first/);
  for (const name of ["policy-first", "policy-second", "policy-third", "policy-fourth", "result-allowed", "result-rejected"]) {
    const keyframes = css.split(`@keyframes ${name} `)[1]?.split("\n")[0] ?? "";
    assert.match(keyframes, /opacity: 0/);
    assert.match(keyframes, /opacity: 1/);
    assert.doesNotMatch(keyframes, /transform:/);
  }
});

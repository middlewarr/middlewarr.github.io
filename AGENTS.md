# AGENTS.md — middlewarr.github.io

The Middlewarr landing page: a static Astro 7 site deployed to GitHub Pages. Product
documentation lives elsewhere (`docs.middlewarr.dev`); this repo is the marketing page only.

## Commands

```
pnpm install
pnpm dev      # astro dev
pnpm build    # astro build -> dist/
pnpm check    # astro check (types)
pnpm test     # node --test tests/site.test.mjs
```

`pnpm test` reads the built output in `dist/`, so **build before you test**. Skipping the build
gives a confusing ENOENT, and — worse — a stale `dist/` lets the tests pass against output that
no longer matches your edits.

## Non-obvious constraints

**`tests/site.test.mjs` is a contract, not a smoke test.** It asserts the built HTML precisely:
exactly one `<h1>`, the section ids `why-middlewarr` / `how-it-works` / `get-started`, the
canonical URL, the og and twitter meta tags, the preloaded Space Grotesk `woff2` path, the routing
diagram's full `aria-label` string, the skip-to-content link — and the *absence* of the phrase
"Open source" and of any `<script type="module">`. Editing copy or markup will break it by design.
Update the assertion deliberately and say why; never loosen a regex just to get green.

**The site ships no client-side JavaScript.** That is an asserted invariant, not an accident.
Adding an island or a framework integration breaks the test on purpose — raise it before doing it.

**pnpm is the package manager** (`packageManager: pnpm@11.25.0`). `pnpm-workspace.yaml`
allowlists esbuild under `allowBuilds`; pnpm blocks postinstall scripts by default, so any new
dependency that needs one must be added there or it silently under-installs.

**CI installs with npm and will not work as written.** `.github/workflows/deploy.yml` runs
`npm ci` with `cache: npm`, but this repo has only `pnpm-lock.yaml` — there is no
`package-lock.json`. Treat the deploy workflow as unverified: check the most recent run before
assuming CI gates anything. The fix is `pnpm/action-setup` plus
`pnpm install --frozen-lockfile`, not adding a second lockfile.

**`site:` in `astro.config.mjs` is `https://middlewarr.github.io`,** and the canonical-URL test
asserts it. Moving to a custom domain means changing the config, the test and the sitemap
together.

## Ask before

Pushing to `main` — that deploys to production Pages. Adding any client-side runtime. Changing the
canonical URL or the social-card asset.

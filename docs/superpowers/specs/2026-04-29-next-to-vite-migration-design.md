# Next.js → React + Vite Migration

**Date:** 2026-04-29
**Project:** Tail Admin Pro (TailAdmin Pro v2.2.0 template)
**Goal:** Convert this Next.js 15 (App Router) template into a React + Vite SPA, in place.

## Context

The project is a UI admin template with **73 pages**, **156 `"use client"` files**, and **no API routes / no server components doing real server work**. Every page is effectively client-rendered already, so a Vite SPA is a natural target.

There is no git repo here; the user has an external backup and explicitly opted out of an in-tree backup. The conversion overwrites the existing tree.

## Goals / Non-goals

**Goals**
- Replace Next.js with Vite + React 19 + React Router v7
- Preserve the URL structure produced by the current App Router (route groups don't change URLs)
- Preserve all visual output, components, layouts, and Tailwind v4 styling
- Keep TypeScript path alias `@/*` working
- Keep SVG-as-component imports working (currently via `@svgr/webpack`)

**Non-goals**
- SEO / metadata / SSR (template has no real SEO; metadata exports are dropped)
- Image optimization (drop `next/image` entirely in favor of `<img>`)
- Code-quality refactors beyond what the migration requires
- Test infrastructure (project has none today)

## Tooling

**Add**
- `vite`
- `@vitejs/plugin-react`
- `vite-tsconfig-paths` (preserves `@/*`)
- `vite-plugin-svgr` (replaces `@svgr/webpack`)
- `@tailwindcss/vite` (replaces `@tailwindcss/postcss`)
- `react-router` v7

**Remove**
- `next`
- `eslint-config-next`
- `@svgr/webpack`
- `@tailwindcss/postcss`
- `autoprefixer` and `postcss` (not needed with Tailwind v4 Vite plugin)
- `next.config.ts`
- `postcss.config.mjs`

**Scripts (`package.json`)**
- `dev` → `vite`
- `build` → `tsc -b && vite build`
- `preview` → `vite preview`
- `lint` → flat ESLint config without the `next` preset

## Entry point

- New `index.html` at repo root containing the head markup currently embedded in `src/app/layout.tsx` (lang, viewport, favicon link, Outfit Google Fonts `<link>` tags) and a `<div id="root">`.
- New `src/main.tsx` that:
  - Imports `./index.css`
  - Wraps `<RouterProvider />` in `<ThemeProvider>` and `<SidebarProvider>` (these are the providers currently mounted in `RootLayout`)
  - Mounts to `#root`
- Rename `src/app/globals.css` → `src/index.css`. Update `@import` paths if any.
- **Outfit font**: load via `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap">` in `index.html`. Apply the font-family in `index.css` (or via Tailwind config) since `next/font/google`'s automatic class injection is gone.

## Routing

Use **React Router v7** with `createBrowserRouter` and a route config in `src/routes.tsx`. Route groups in folder names (`(admin)`, `(home)`, `(auth)`, `(ui-elements)`, etc.) do not affect URLs — they only group layouts.

**Layout routes**
- `AdminLayout` (from `src/app/(admin)/layout.tsx`) — wraps the admin section with sidebar + header
- `FullWidthLayout` (from `src/app/(full-width-pages)/layout.tsx`) — wraps full-width pages
- `AuthLayout` (from `src/app/(full-width-pages)/(auth)/layout.tsx`) — nested under FullWidthLayout for auth pages

**URL mapping (representative)**

| Source file | URL |
|---|---|
| `(admin)/page.tsx` | `/` |
| `(admin)/(home)/crm/page.tsx` | `/crm` |
| `(admin)/(home)/stocks/page.tsx` | `/stocks` |
| `(admin)/(home)/marketing/page.tsx` | `/marketing` |
| `(admin)/(home)/saas/page.tsx` | `/saas` |
| `(admin)/(ui-elements)/buttons/page.tsx` | `/buttons` |
| `(admin)/(ui-elements)/<name>/page.tsx` | `/<name>` |
| `(admin)/(others-pages)/calendar/page.tsx` | `/calendar` |
| `(admin)/(others-pages)/<name>/page.tsx` | `/<name>` |
| `(full-width-pages)/(auth)/signin/page.tsx` | `/signin` |
| `(full-width-pages)/(auth)/signup/page.tsx` | `/signup` |
| `(full-width-pages)/(auth)/reset-password/page.tsx` | `/reset-password` |
| `(full-width-pages)/(auth)/two-step-verification/page.tsx` | `/two-step-verification` |
| `(full-width-pages)/coming-soon/page.tsx` | `/coming-soon` |
| `(full-width-pages)/success/page.tsx` | `/success` |
| `(full-width-pages)/(error-pages)/error-404/page.tsx` | `/error-404` |
| `(full-width-pages)/(error-pages)/error-500/page.tsx` | `/error-500` |
| `(full-width-pages)/(error-pages)/error-503/page.tsx` | `/error-503` |
| `(full-width-pages)/(error-pages)/maintenance/page.tsx` | `/maintenance` |
| `not-found.tsx` | `*` (catch-all, rendered through `FullWidthLayout`) |

The full route table is enumerated by walking `src/app/**/page.tsx` during implementation. The `src/app/` directory itself can stay (paths are still valid), or be flattened to `src/pages/` later — that decision is deferred and out of scope.

## Next API replacements

| Next API | Replacement | Notes |
|---|---|---|
| `import Link from "next/link"` | `import { Link } from "react-router"` | Drop `prefetch`, `scroll`, `replace` (RR has its own `replace`). Convert `<Link href="...">` → `<Link to="...">`. |
| `import Image from "next/image"` | Plain `<img>` | Drop the import. Keep existing `width`/`height`/`className`/`alt`. Drop `priority`, `placeholder`, `blurDataURL`, `fill`, `sizes`, `quality`. |
| `usePathname` | `useLocation().pathname` from `react-router` | |
| `useRouter` | `useNavigate` from `react-router` | `router.push(x)` → `navigate(x)`; `router.replace(x)` → `navigate(x, { replace: true })`. |
| `import dynamic from "next/dynamic"` | `React.lazy` + `<Suspense>` | Used for ApexCharts; with Vite there is no SSR, so a plain `import` would also work. Prefer plain import for simplicity unless code-splitting is desired. |
| `import { Metadata } from "next"` and `export const metadata` | **Delete** | No SEO requirement. |
| `import { Outfit } from "next/font/google"` | `<link>` in `index.html` + Tailwind `font-family` rule in CSS | |
| `"use client"` directive (top of file) | **Delete** | All components are client-rendered in Vite. |

## SVG handling

`vite-plugin-svgr` configured to mirror the existing default-export style. Today the project does:

```ts
import GridIcon from "@/icons/grid.svg"
```

…and uses it as a component. By default `vite-plugin-svgr` only converts SVGs imported with `?react`. We need plain `.svg` imports to keep working as components, so configure the plugin so the default export is the component. Exact config (`include`, `svgrOptions.exportType: "default"`, etc.) is finalized during implementation against the plugin's current API. The `src/svg.d.ts` shim stays.

## Vite config (sketch)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    svgr({ svgrOptions: { exportType: "default" } }),
    tsconfigPaths(),
    tailwindcss(),
  ],
});
```

## tsconfig

The current `tsconfig.json` includes Next-specific bits (`plugins: [{ name: "next" }]`, `next-env.d.ts`). Replace with a Vite-style split:
- `tsconfig.json` (root references)
- `tsconfig.app.json` (src code, DOM lib, `@/*` paths, JSX `react-jsx`)
- `tsconfig.node.json` (vite.config.ts)

Keep `src/svg.d.ts` (it declares the SVG default export — this remains useful).

## ESLint

Drop `eslint-config-next`. Switch to a flat config with `@eslint/js` + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`. This is best-effort and not gating; the goal is `npm run dev` and `npm run build` succeed cleanly.

## Static assets

`public/` continues to work in Vite (served from root). No changes needed.

## Implementation order

1. **Tooling pass**: install Vite stack, remove Next deps, write `vite.config.ts`, `index.html`, `src/main.tsx`, new tsconfig set, move `globals.css` → `index.css`, update `package.json` scripts. Delete `next.config.ts`, `postcss.config.mjs`.
2. **Router pass**: walk `src/app/**/page.tsx`, build `src/routes.tsx` with the layout-route hierarchy. Lift the providers from `src/app/layout.tsx` into `main.tsx`. Convert `(admin)/layout.tsx`, `(full-width-pages)/layout.tsx`, `(auth)/layout.tsx` into plain layout components that render `<Outlet />`.
3. **Codemod pass** (mechanical find-replace across `src/**/*.{ts,tsx}`):
   - Remove every `"use client";` directive
   - Replace `next/link` imports and `href` → `to`
   - Replace `next/navigation` hooks
   - Replace `next/image` usage with `<img>` (and drop now-unused props)
   - Replace `next/dynamic` (ApexCharts) with plain imports or `React.lazy`
   - Delete `Metadata` imports/exports and `next/font` imports
4. **Smoke verify**: `npm run dev` boots; visit `/`, several `(home)` dashboards, an auth page, an error page, a UI-element page, and one chart-heavy page (CRM/SaaS) to confirm ApexCharts mounts.
5. **Build verify**: `npm run build && npm run preview` succeeds; spot-check the same routes.
6. **Cleanup**: delete `eslint-config-next`, prune any leftover Next references, remove `src/app/layout.tsx` and `src/app/not-found.tsx` if their content has been moved (`not-found.tsx` becomes the catch-all route component, content preserved).

## Risks / open questions

- **Tailwind v4 Vite plugin vs PostCSS**: the v4 Vite plugin is the official path; should be a clean swap. If any directives behave differently, fall back to `@tailwindcss/postcss` (no functional difference).
- **`useRouter().refresh()`** has no direct equivalent. Audit grep for `refresh()`; replace with `navigate(0)` or remove if it was a leftover.
- **Hash/query handling** in any `Link` usages with object hrefs (`<Link href={{ pathname, query }}>`). React Router accepts `to` as a string; convert to a constructed string or pass a path + `search`/`hash` object.
- **SidebarContext currently uses `usePathname`** — works fine after swap, but verify the active-link logic still triggers on mount.

## Out of scope

- Migrating to a typed router (TanStack)
- Replacing component libraries
- Adding tests, CI, or observability
- File-tree restructuring (`src/app/` → `src/pages/`)
- Performance tuning beyond what Vite's defaults provide

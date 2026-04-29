# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TailAdmin Pro — admin dashboard template, recently migrated in place from **Next.js 15 (App Router)** to **React 19 + Vite 8 + React Router v7 + Tailwind v4**. The migration spec/plan live in `docs/superpowers/specs/` and `docs/superpowers/plans/`.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run preview  # serve dist/
npm run lint     # eslint .
```

There is **no test framework** and none is being added — verification is "boot the dev server and click through the affected routes." This directory is **not a git repo**, so there are no commits/PRs; checkpoints are dev-server boots.

## Architecture

### Routing (the big picture)

All 70+ routes are declared in a single `src/routes.tsx` `createBrowserRouter` config. The legacy Next App Router parenthesized folders (`(admin)`, `(home)`, `(others-pages)`, `(ui-elements)`, `(full-width-pages)`, `(auth)`, `(error-pages)`) **still exist on disk under `src/app/**/page.tsx`** but are *no longer route segments* — they are just folder organization. `routes.tsx` imports each `page.tsx` by path and assigns it a flat URL.

Three layout routes wrap children via `<Outlet />`:

- `src/layouts/AdminLayout.tsx` — sidebar + header chrome, wraps the admin section. Uses `SidebarProvider` (from `src/context/SidebarContext.tsx`) and applies route-specific padding (the AI generator pages opt out of the standard `p-4 max-w-...` content wrapper — see the `getRouteSpecificStyles` switch).
- `src/layouts/FullWidthLayout.tsx` — coming-soon, success, error pages.
- `src/layouts/AuthLayout.tsx` — nested *under* `FullWidthLayout` for signin/signup/reset-password.

`src/main.tsx` wraps `<RouterProvider>` in `<ThemeProvider>` (light/dark, `src/context/ThemeContext.tsx`). The sidebar context is scoped to `AdminLayout`, not global.

### Two "layout" directories — don't confuse them

- `src/layout/` (singular) — chrome **components**: `AppHeader.tsx`, `AppSidebar.tsx`, `Backdrop.tsx`, `SidebarWidget.tsx`.
- `src/layouts/` (plural) — React Router **layout routes** that compose the chrome with `<Outlet />`.

### Path alias

`@/*` → `./src/*` is configured in `tsconfig.app.json` and resolved at runtime by `vite-tsconfig-paths`. Use it for all cross-directory imports (the codebase does this consistently).

### SVGs

`vite-plugin-svgr` is configured with `exportType: "default"`, so `import Icon from "./foo.svg"` returns a React component. `src/svg.d.ts` declares the module type.

### Styling

Tailwind v4 via `@tailwindcss/vite`. The theme (custom breakpoints `2xsm`/`xsm`/`3xl`, `Outfit` font, `text-title-*` / `text-theme-*` scales, brand color ramps, etc.) is defined as `@theme { ... }` in `src/index.css` — **not** in a `tailwind.config.js`. Dark mode is a custom variant: `@custom-variant dark (&:is(.dark *))`, toggled by `ThemeContext` adding/removing `.dark` on `<html>`.

### When adding a new page

1. Create `src/app/(admin)/(some-group)/my-page/page.tsx` (or wherever it fits the existing grouping).
2. Add the import + `{ path: "my-page", element: <MyPage /> }` entry in `src/routes.tsx` under the appropriate layout's `children`.
3. Sidebar links live in `src/layout/AppSidebar.tsx`.

## Notable conventions

- React 19 + React Router 7 — use `react-router` (not `react-router-dom`); imports like `useNavigate`, `useLocation`, `Outlet`, `RouterProvider` all come from `"react-router"`.
- ESLint flat config (`eslint.config.mjs`) intentionally disables `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-unused-vars` — don't try to "fix" these.
- `@react-jvectormap/*` is pinned via `overrides` in `package.json` to accept React 19 as a peer; don't remove the override.
- If `npm install` fails on peer-deps, use `--legacy-peer-deps` (called out in README).

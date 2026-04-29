# Next.js → React + Vite Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert this Next.js 15 (App Router) admin template into a React + Vite SPA in place, preserving all 73 pages, layouts, styling, and component behavior.

**Architecture:** Vite + React 19 + React Router v7 + Tailwind v4 (Vite plugin) + vite-plugin-svgr + vite-tsconfig-paths. The current `src/app/**/page.tsx` files become plain page components wired into a single `src/routes.tsx` route config. Two layout routes — `AdminLayout` and `FullWidthLayout` (with `AuthLayout` nested under it) — replace Next's nested layouts.

**Tech Stack:** React 19, TypeScript, Vite 5, React Router 7, Tailwind v4, ApexCharts, FullCalendar, jVectormap, Swiper, react-dnd, react-dropzone, simplebar-react, prismjs.

**Spec:** `docs/superpowers/specs/2026-04-29-next-to-vite-migration-design.md`

**Important context for the implementer:**
- This directory is **not a git repo**. There is no `git commit` step. Instead, use natural checkpoints — pause and verify the dev server boots after each phase.
- The project has **no test infrastructure** and we are not adding any. Verification per phase is *boot the dev server and click through the relevant routes*.
- Path alias `@/*` → `./src/*` must keep working throughout.

---

## File Structure Overview

**New files**
- `index.html` — root HTML shell
- `vite.config.ts` — Vite config with React, SVGR, tsconfig-paths, Tailwind plugins
- `tsconfig.app.json` — TS config for `src/`
- `tsconfig.node.json` — TS config for Vite config file
- `src/main.tsx` — entry point, wraps providers + RouterProvider
- `src/index.css` — moved from `src/app/globals.css`
- `src/routes.tsx` — full React Router route config for all 73 pages
- `src/layouts/AdminLayout.tsx` — adapted from `src/app/(admin)/layout.tsx`
- `src/layouts/FullWidthLayout.tsx` — adapted from `src/app/(full-width-pages)/layout.tsx`
- `src/layouts/AuthLayout.tsx` — adapted from `src/app/(full-width-pages)/(auth)/layout.tsx`

**Deleted files**
- `next.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs` (replaced by a flat config without `next` preset, optional)
- `src/app/globals.css` (moved)
- `src/app/layout.tsx` (logic moved to `index.html` + `main.tsx`)
- `src/app/(admin)/layout.tsx` (moved to `src/layouts/AdminLayout.tsx`)
- `src/app/(full-width-pages)/layout.tsx` (moved to `src/layouts/FullWidthLayout.tsx`)
- `src/app/(full-width-pages)/(auth)/layout.tsx` (moved to `src/layouts/AuthLayout.tsx`)

**Modified (mechanical codemod)**
- All `src/**/*.{ts,tsx}` files containing Next imports — see Phase 4 for the exhaustive replacement table.

**Untouched**
- `src/components/**`, `src/hooks/**` (except `useGoBack.ts`), `src/icons/**`, `src/utils/**`, `public/**` — only the codemod touches files inside these directories.
- All `src/app/**/page.tsx` files stay where they are; the router imports them by path. Only their *contents* are codemodded.

---

## Phase 1 — Tooling Setup

Establish a working Vite + React shell that boots an empty page. After this phase the dev server runs but renders nothing meaningful.

### Task 1.1: Update `package.json` dependencies and scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Replace `package.json` with the new dependency set and scripts**

```json
{
  "name": "tailadmin-vite-typescript-pro",
  "version": "2.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "@fullcalendar/core": "^6.1.15",
    "@fullcalendar/daygrid": "^6.1.15",
    "@fullcalendar/interaction": "^6.1.15",
    "@fullcalendar/list": "^6.1.15",
    "@fullcalendar/react": "^6.1.15",
    "@fullcalendar/timegrid": "^6.1.15",
    "@popperjs/core": "^2.11.8",
    "@react-jvectormap/core": "^1.0.4",
    "@react-jvectormap/world": "^1.1.2",
    "@tailwindcss/forms": "^0.5.9",
    "apexcharts": "^4.3.0",
    "clsx": "^2.1.1",
    "flatpickr": "^4.6.13",
    "prismjs": "^1.30.0",
    "react": "^19.0.0",
    "react-apexcharts": "^1.7.0",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "react-dom": "^19.0.0",
    "react-dropzone": "^14.3.5",
    "react-router": "^7.1.0",
    "simplebar-react": "^3.3.0",
    "swiper": "^11.2.0",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@tailwindcss/vite": "^4.0.0",
    "@types/node": "^20",
    "@types/prismjs": "^1.26.5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "globals": "^15.14.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5",
    "typescript-eslint": "^8.18.0",
    "vite": "^5.4.11",
    "vite-plugin-svgr": "^4.3.0",
    "vite-tsconfig-paths": "^5.1.4"
  },
  "overrides": {
    "@react-jvectormap/core": {
      "react": "^16.8.0 || ^17 || ^18 || ^19",
      "react-dom": "^16.8.0 || ^17 || ^18 || ^19"
    },
    "@react-jvectormap/world": {
      "react": "^16.8.0 || ^17 || ^18 || ^19",
      "react-dom": "^16.8.0 || ^17 || ^18 || ^19"
    }
  }
}
```

- [ ] **Step 2: Reinstall**

Run: `rm -rf node_modules package-lock.json && npm install`
Expected: install completes without errors. (peer dep warnings about React 19 are acceptable due to the `overrides` block.)

### Task 1.2: Create `vite.config.ts`

**Files:**
- Create: `vite.config.ts`

- [ ] **Step 1: Write the Vite config**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: "**/*.svg",
      svgrOptions: {
        exportType: "default",
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
  ],
});
```

Note: `include: "**/*.svg"` plus `exportType: "default"` makes plain `import GridIcon from "@/icons/grid.svg"` return the React component, matching the current `@svgr/webpack` behavior.

### Task 1.3: Create `index.html`

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the HTML shell**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TailAdmin Pro</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="dark:bg-gray-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Move favicon to `public/`**

Run: `mv src/app/favicon.ico public/favicon.ico`
Expected: file moves; `ls public/favicon.ico` succeeds.

### Task 1.4: Replace `tsconfig.json` with Vite-style references

**Files:**
- Modify: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`

- [ ] **Step 1: Replace `tsconfig.json` with a references-only config**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 2: Create `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### Task 1.5: Move `globals.css` to `src/index.css`

**Files:**
- Move: `src/app/globals.css` → `src/index.css`

- [ ] **Step 1: Move the file**

Run: `mv src/app/globals.css src/index.css`

- [ ] **Step 2: Verify contents are intact**

Run: `head -5 src/index.css`
Expected: starts with `@import "tailwindcss";`

### Task 1.6: Update `src/svg.d.ts` so default export is a component

**Files:**
- Modify: `src/svg.d.ts`

The current file declares the default export as a `string`, which contradicts how the icons are actually used (`import X from "./x.svg"` then `<X />`). Replace it with the correct declaration matching `vite-plugin-svgr` with `exportType: "default"`.

- [ ] **Step 1: Replace contents**

```ts
declare module "*.svg" {
  import * as React from "react";
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default ReactComponent;
}

declare module "*.svg?url" {
  const src: string;
  export default src;
}
```

(`?url` query is the vite-plugin-svgr way to ask for the asset URL when needed; matches how `next/image src="...svg"` calls might be replaced if any survive.)

### Task 1.7: Create a placeholder `src/main.tsx` and verify boot

**Files:**
- Create: `src/main.tsx`

The full `main.tsx` is written in Phase 3 once the router exists. For now write a minimal version to confirm Vite boots.

- [ ] **Step 1: Write a temporary `src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="font-outfit p-8 text-gray-800 dark:text-white">
      Vite shell boots. Routing wired in Phase 3.
    </div>
  </StrictMode>
);
```

- [ ] **Step 2: Delete Next config and PostCSS config**

Run: `rm next.config.ts postcss.config.mjs`

- [ ] **Step 3: Boot the dev server**

Run: `npm run dev`
Expected: Vite prints `Local: http://localhost:5173/`. Open it. The page shows "Vite shell boots." in the Outfit font with the dark-mode background working when the OS is in dark mode (or never, since we haven't wired the toggle yet — that's fine).

If you see CSS errors about `@custom-variant` or `@theme`, the Tailwind v4 plugin isn't picking up `src/index.css`. Confirm the import path in `main.tsx` and that `@tailwindcss/vite` is in the `plugins` array.

- [ ] **Step 4: Stop the dev server**

`Ctrl+C`

**Phase 1 checkpoint:** Vite boots; Tailwind classes render; SVG type declarations updated; favicon in `public/`. Layouts and routes still untouched.

---

## Phase 2 — Convert Layouts to React Router Layout Components

Each Next layout becomes a plain React component that renders `<Outlet />` where children used to render. We move them to `src/layouts/` so they're separate from the page tree.

### Task 2.1: Create `src/layouts/AdminLayout.tsx`

**Files:**
- Create: `src/layouts/AdminLayout.tsx`

Adapted from `src/app/(admin)/layout.tsx`. Replaces `usePathname` with `useLocation`, replaces `{children}` with `<Outlet />`, drops `"use client"`.

- [ ] **Step 1: Write the file**

```tsx
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { Outlet, useLocation } from "react-router";

export default function AdminLayout() {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { pathname } = useLocation();

  const getRouteSpecificStyles = () => {
    switch (pathname) {
      case "/text-generator":
        return "";
      case "/code-generator":
        return "";
      case "/image-generator":
        return "";
      case "/video-generator":
        return "";
      default:
        return "p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6";
    }
  };

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "xl:ml-[290px]"
    : "xl:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className={getRouteSpecificStyles()}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
```

### Task 2.2: Create `src/layouts/FullWidthLayout.tsx`

**Files:**
- Create: `src/layouts/FullWidthLayout.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { Outlet } from "react-router";

export default function FullWidthLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
```

### Task 2.3: Create `src/layouts/AuthLayout.tsx`

**Files:**
- Create: `src/layouts/AuthLayout.tsx`

Adapted from `src/app/(full-width-pages)/(auth)/layout.tsx`. The original wraps children in its own `ThemeProvider` but the root already provides one — keep the inner one for now to preserve behavior verbatim. Replace `next/link`, `next/image`, and the children prop.

- [ ] **Step 1: Write the file**

```tsx
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import { Link, Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          <Outlet />
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link to="/" className="block mb-4">
                  <img
                    width={231}
                    height={48}
                    src="/images/logo/auth-logo.svg"
                    alt="Logo"
                  />
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Free and Open-Source Tailwind CSS Admin Dashboard Template
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
```

(Note: changed `src="./images/..."` → `src="/images/..."` — Vite serves `public/` from root, the leading dot was a Next quirk.)

### Task 2.4: Delete the old layout files

**Files:**
- Delete: `src/app/layout.tsx`
- Delete: `src/app/(admin)/layout.tsx`
- Delete: `src/app/(full-width-pages)/layout.tsx`
- Delete: `src/app/(full-width-pages)/(auth)/layout.tsx`

- [ ] **Step 1: Delete them**

```bash
rm src/app/layout.tsx
rm "src/app/(admin)/layout.tsx"
rm "src/app/(full-width-pages)/layout.tsx"
rm "src/app/(full-width-pages)/(auth)/layout.tsx"
```

**Phase 2 checkpoint:** Layouts live in `src/layouts/`. The dev server is now broken (no route config yet) — that's expected. We fix it in Phase 3.

---

## Phase 3 — Build Routes & Wire the Entry Point

Define every route, then plug it into `main.tsx`.

### Task 3.1: Create `src/routes.tsx` with the full route table

**Files:**
- Create: `src/routes.tsx`

This file imports every page component and declares the route hierarchy. Pages still live in `src/app/**/page.tsx` — we just import them from there. (We'll codemod their *contents* in Phase 4; for now, the imports work as-is even though the page files still contain `next/*` imports — Vite won't resolve those modules and will fail at compile time. **That's expected** — we don't run the dev server again until Phase 4 is done.)

- [ ] **Step 1: Write the file**

```tsx
import { createBrowserRouter } from "react-router";
import AdminLayout from "@/layouts/AdminLayout";
import FullWidthLayout from "@/layouts/FullWidthLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Admin pages
import Ecommerce from "@/app/(admin)/page";
import Analytics from "@/app/(admin)/(home)/analytics/page";
import Crm from "@/app/(admin)/(home)/crm/page";
import Logistics from "@/app/(admin)/(home)/logistics/page";
import Marketing from "@/app/(admin)/(home)/marketing/page";
import Saas from "@/app/(admin)/(home)/saas/page";
import Stocks from "@/app/(admin)/(home)/stocks/page";

// AI
import CodeGenerator from "@/app/(admin)/(others-pages)/(ai)/code-generator/page";
import ImageGenerator from "@/app/(admin)/(others-pages)/(ai)/image-generator/page";
import TextGenerator from "@/app/(admin)/(others-pages)/(ai)/text-generator/page";
import VideoGenerator from "@/app/(admin)/(others-pages)/(ai)/video-generator/page";

// Charts
import BarChart from "@/app/(admin)/(others-pages)/(chart)/bar-chart/page";
import LineChart from "@/app/(admin)/(others-pages)/(chart)/line-chart/page";
import PieChart from "@/app/(admin)/(others-pages)/(chart)/pie-chart/page";

// Ecommerce subpages
import AddProduct from "@/app/(admin)/(others-pages)/(ecommerce)/add-product/page";
import Billing from "@/app/(admin)/(others-pages)/(ecommerce)/billing/page";
import CreateInvoice from "@/app/(admin)/(others-pages)/(ecommerce)/create-invoice/page";
import Invoices from "@/app/(admin)/(others-pages)/(ecommerce)/invoices/page";
import ProductsList from "@/app/(admin)/(others-pages)/(ecommerce)/products-list/page";
import SingleInvoice from "@/app/(admin)/(others-pages)/(ecommerce)/single-invoice/page";
import SingleTransaction from "@/app/(admin)/(others-pages)/(ecommerce)/single-transaction/page";
import Transactions from "@/app/(admin)/(others-pages)/(ecommerce)/transactions/page";

// Email
import Inbox from "@/app/(admin)/(others-pages)/(email)/inbox/page";
import InboxDetails from "@/app/(admin)/(others-pages)/(email)/inbox-details/page";

// Forms
import FormElements from "@/app/(admin)/(others-pages)/(forms)/form-elements/page";
import FormLayout from "@/app/(admin)/(others-pages)/(forms)/form-layout/page";

// Support
import SupportTicketReply from "@/app/(admin)/(others-pages)/(support)/support-ticket-reply/page";
import SupportTickets from "@/app/(admin)/(others-pages)/(support)/support-tickets/page";

// Tables
import BasicTables from "@/app/(admin)/(others-pages)/(tables)/basic-tables/page";
import DataTables from "@/app/(admin)/(others-pages)/(tables)/data-tables/page";

// Task
import TaskKanban from "@/app/(admin)/(others-pages)/(task)/task-kanban/page";
import TaskList from "@/app/(admin)/(others-pages)/(task)/task-list/page";

// Other admin pages
import ApiKeys from "@/app/(admin)/(others-pages)/api-keys/page";
import Blank from "@/app/(admin)/(others-pages)/blank/page";
import Calendar from "@/app/(admin)/(others-pages)/calendar/page";
import Chat from "@/app/(admin)/(others-pages)/chat/page";
import Faq from "@/app/(admin)/(others-pages)/faq/page";
import FileManager from "@/app/(admin)/(others-pages)/file-manager/page";
import Integrations from "@/app/(admin)/(others-pages)/integrations/page";
import PricingTables from "@/app/(admin)/(others-pages)/pricing-tables/page";
import Profile from "@/app/(admin)/(others-pages)/profile/page";

// UI elements
import Alerts from "@/app/(admin)/(ui-elements)/alerts/page";
import Avatars from "@/app/(admin)/(ui-elements)/avatars/page";
import Badge from "@/app/(admin)/(ui-elements)/badge/page";
import Breadcrumb from "@/app/(admin)/(ui-elements)/breadcrumb/page";
import Buttons from "@/app/(admin)/(ui-elements)/buttons/page";
import ButtonsGroup from "@/app/(admin)/(ui-elements)/buttons-group/page";
import Cards from "@/app/(admin)/(ui-elements)/cards/page";
import Carousel from "@/app/(admin)/(ui-elements)/carousel/page";
import Dropdowns from "@/app/(admin)/(ui-elements)/dropdowns/page";
import Images from "@/app/(admin)/(ui-elements)/images/page";
import Links from "@/app/(admin)/(ui-elements)/links/page";
import List from "@/app/(admin)/(ui-elements)/list/page";
import Modals from "@/app/(admin)/(ui-elements)/modals/page";
import Notifications from "@/app/(admin)/(ui-elements)/notifications/page";
import Pagination from "@/app/(admin)/(ui-elements)/pagination/page";
import Popovers from "@/app/(admin)/(ui-elements)/popovers/page";
import ProgressBar from "@/app/(admin)/(ui-elements)/progress-bar/page";
import Ribbons from "@/app/(admin)/(ui-elements)/ribbons/page";
import Spinners from "@/app/(admin)/(ui-elements)/spinners/page";
import Tabs from "@/app/(admin)/(ui-elements)/tabs/page";
import Tooltips from "@/app/(admin)/(ui-elements)/tooltips/page";
import Videos from "@/app/(admin)/(ui-elements)/videos/page";

// Auth pages
import ResetPassword from "@/app/(full-width-pages)/(auth)/reset-password/page";
import Signin from "@/app/(full-width-pages)/(auth)/signin/page";
import Signup from "@/app/(full-width-pages)/(auth)/signup/page";
import TwoStepVerification from "@/app/(full-width-pages)/(auth)/two-step-verification/page";

// Error pages
import Error404 from "@/app/(full-width-pages)/(error-pages)/error-404/page";
import Error500 from "@/app/(full-width-pages)/(error-pages)/error-500/page";
import Error503 from "@/app/(full-width-pages)/(error-pages)/error-503/page";
import Maintenance from "@/app/(full-width-pages)/(error-pages)/maintenance/page";

// Misc full-width
import ComingSoon from "@/app/(full-width-pages)/coming-soon/page";
import Success from "@/app/(full-width-pages)/success/page";

// 404 catch-all
import NotFound from "@/app/not-found";

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Ecommerce /> },

      { path: "analytics", element: <Analytics /> },
      { path: "crm", element: <Crm /> },
      { path: "logistics", element: <Logistics /> },
      { path: "marketing", element: <Marketing /> },
      { path: "saas", element: <Saas /> },
      { path: "stocks", element: <Stocks /> },

      { path: "code-generator", element: <CodeGenerator /> },
      { path: "image-generator", element: <ImageGenerator /> },
      { path: "text-generator", element: <TextGenerator /> },
      { path: "video-generator", element: <VideoGenerator /> },

      { path: "bar-chart", element: <BarChart /> },
      { path: "line-chart", element: <LineChart /> },
      { path: "pie-chart", element: <PieChart /> },

      { path: "add-product", element: <AddProduct /> },
      { path: "billing", element: <Billing /> },
      { path: "create-invoice", element: <CreateInvoice /> },
      { path: "invoices", element: <Invoices /> },
      { path: "products-list", element: <ProductsList /> },
      { path: "single-invoice", element: <SingleInvoice /> },
      { path: "single-transaction", element: <SingleTransaction /> },
      { path: "transactions", element: <Transactions /> },

      { path: "inbox", element: <Inbox /> },
      { path: "inbox-details", element: <InboxDetails /> },

      { path: "form-elements", element: <FormElements /> },
      { path: "form-layout", element: <FormLayout /> },

      { path: "support-ticket-reply", element: <SupportTicketReply /> },
      { path: "support-tickets", element: <SupportTickets /> },

      { path: "basic-tables", element: <BasicTables /> },
      { path: "data-tables", element: <DataTables /> },

      { path: "task-kanban", element: <TaskKanban /> },
      { path: "task-list", element: <TaskList /> },

      { path: "api-keys", element: <ApiKeys /> },
      { path: "blank", element: <Blank /> },
      { path: "calendar", element: <Calendar /> },
      { path: "chat", element: <Chat /> },
      { path: "faq", element: <Faq /> },
      { path: "file-manager", element: <FileManager /> },
      { path: "integrations", element: <Integrations /> },
      { path: "pricing-tables", element: <PricingTables /> },
      { path: "profile", element: <Profile /> },

      { path: "alerts", element: <Alerts /> },
      { path: "avatars", element: <Avatars /> },
      { path: "badge", element: <Badge /> },
      { path: "breadcrumb", element: <Breadcrumb /> },
      { path: "buttons", element: <Buttons /> },
      { path: "buttons-group", element: <ButtonsGroup /> },
      { path: "cards", element: <Cards /> },
      { path: "carousel", element: <Carousel /> },
      { path: "dropdowns", element: <Dropdowns /> },
      { path: "images", element: <Images /> },
      { path: "links", element: <Links /> },
      { path: "list", element: <List /> },
      { path: "modals", element: <Modals /> },
      { path: "notifications", element: <Notifications /> },
      { path: "pagination", element: <Pagination /> },
      { path: "popovers", element: <Popovers /> },
      { path: "progress-bar", element: <ProgressBar /> },
      { path: "ribbons", element: <Ribbons /> },
      { path: "spinners", element: <Spinners /> },
      { path: "tabs", element: <Tabs /> },
      { path: "tooltips", element: <Tooltips /> },
      { path: "videos", element: <Videos /> },
    ],
  },
  {
    element: <FullWidthLayout />,
    children: [
      { path: "coming-soon", element: <ComingSoon /> },
      { path: "success", element: <Success /> },
      { path: "error-404", element: <Error404 /> },
      { path: "error-500", element: <Error500 /> },
      { path: "error-503", element: <Error503 /> },
      { path: "maintenance", element: <Maintenance /> },
      {
        element: <AuthLayout />,
        children: [
          { path: "signin", element: <Signin /> },
          { path: "signup", element: <Signup /> },
          { path: "reset-password", element: <ResetPassword /> },
          { path: "two-step-verification", element: <TwoStepVerification /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
```

### Task 3.2: Replace `src/main.tsx` with the real entry point

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Write the final entry**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { router } from "@/routes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  </StrictMode>
);
```

**Phase 3 checkpoint:** All files are in place but pages still contain `next/*` imports. The dev server will fail to compile until Phase 4 finishes the codemod. Do not boot it yet.

---

## Phase 4 — Codemod All Next Imports

This phase touches every `.ts`/`.tsx` under `src/` that imports from `next/*` or starts with `"use client"`. Do these in order. After all rules are applied, the `grep` checks at the end of the phase must come up empty.

### Task 4.1: Remove every `"use client"` directive

**Files:**
- Modify: 156 files in `src/**/*.tsx` and `src/**/*.ts` (per earlier grep)

- [ ] **Step 1: Run a sed pass**

```bash
# macOS sed: -i '' for in-place
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | \
  xargs -0 sed -i '' -E '/^"use client";?[[:space:]]*$/d'
```

- [ ] **Step 2: Verify**

Run: `grep -rn "use client" src --include="*.ts" --include="*.tsx" | wc -l`
Expected: `0`

If non-zero, the directive was on a line with other content (uncommon). Inspect manually with `grep -rn "use client" src` and remove by hand.

### Task 4.2: Replace `next/link` imports and `href`→`to`

**Files:**
- Modify: every file importing from `next/link`

- [ ] **Step 1: Replace the import line**

```bash
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | \
  xargs -0 sed -i '' \
    -e 's|^import Link from "next/link";|import { Link } from "react-router";|' \
    -e 's|^import NextLink from "next/link";|import { Link as NextLink } from "react-router";|'
```

- [ ] **Step 2: Verify no Next link imports remain**

Run: `grep -rn 'from "next/link"' src --include="*.ts" --include="*.tsx"`
Expected: no output.

- [ ] **Step 3: Convert `<Link href="..."` → `<Link to="..."`**

This is the tricky bit because both `Link` and `NextLink` are now React Router. Look for any `<Link ` or `<NextLink ` JSX with `href=`:

```bash
grep -rn '<Link ' src --include="*.tsx" | grep -c 'href='
grep -rn '<NextLink ' src --include="*.tsx" | grep -c 'href='
```

Note the counts. Then replace:

```bash
find src -type f -name "*.tsx" -print0 | \
  xargs -0 sed -i '' \
    -e 's/<Link href=/<Link to=/g' \
    -e 's/<NextLink href=/<NextLink to=/g'
```

- [ ] **Step 4: Audit for object-form `to`**

React Router doesn't accept `to={{ pathname, query }}` the same way Next does. Check:

```bash
grep -rn 'to={{' src --include="*.tsx"
```

If hits exist, convert each manually:
```tsx
// before (Next)
<Link to={{ pathname: "/foo", query: { a: "1" } }}>
// after (React Router) — pass a string
<Link to="/foo?a=1">
// or use the search/hash on a `Path` object
<Link to={{ pathname: "/foo", search: "?a=1" }}>
```

Expected after fix: `grep -rn 'to={{' src --include="*.tsx"` returns no `query:` matches.

- [ ] **Step 5: Strip Next-only Link props**

`prefetch`, `scroll`, `legacyBehavior`, `passHref` aren't accepted by React Router's `Link`. Audit:

```bash
grep -rnE '<Link\b[^>]*(prefetch|scroll|legacyBehavior|passHref)=' src --include="*.tsx"
grep -rnE '<NextLink\b[^>]*(prefetch|scroll|legacyBehavior|passHref)=' src --include="*.tsx"
```

For each hit, remove just that prop. (React Router does accept `replace` — leave that alone.)

### Task 4.3: Replace `next/navigation` imports and hooks

**Files:**
- Modify: every file importing from `next/navigation`

The Next hooks in use are `usePathname` and `useRouter`. React Router equivalents:

| Next | React Router |
|---|---|
| `usePathname()` returns string | `useLocation().pathname` |
| `useRouter()` returns `{ push, replace, back, forward, refresh }` | `useNavigate()` returns `(to, opts?) => void`, plus separate `useLocation` |

- [ ] **Step 1: Find every importer**

```bash
grep -rn 'from "next/navigation"' src --include="*.ts" --include="*.tsx"
```

There should be a small set: `SidebarContext.tsx`, `useGoBack.ts`, and a few page/layout files (the layouts are already replaced).

- [ ] **Step 2: Edit `src/context/SidebarContext.tsx`**

Replace the import and the call:

```tsx
// before
import { usePathname } from "next/navigation";
// ...
const pathname = usePathname();

// after
import { useLocation } from "react-router";
// ...
const { pathname } = useLocation();
```

- [ ] **Step 3: Edit `src/hooks/useGoBack.ts`**

Replace entirely:

```ts
import { useNavigate } from "react-router";

const useGoBack = () => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return goBack;
};

export default useGoBack;
```

- [ ] **Step 4: Edit any page files that still import `next/navigation`**

Re-run the grep. For each file:
- `usePathname()` → import `useLocation` from `react-router`, use `const { pathname } = useLocation()`
- `useRouter()` → import `useNavigate` from `react-router`. Call sites:
  - `router.push("/x")` → `navigate("/x")`
  - `router.replace("/x")` → `navigate("/x", { replace: true })`
  - `router.back()` → `navigate(-1)`
  - `router.forward()` → `navigate(1)`
  - `router.refresh()` — no exact equivalent; this codebase has zero `.refresh()` calls (verified during planning), so this case shouldn't appear.

- [ ] **Step 5: Verify**

```bash
grep -rn 'from "next/navigation"' src --include="*.ts" --include="*.tsx"
```
Expected: no output.

### Task 4.4: Replace `next/image` with `<img>`

**Files:**
- Modify: every file importing `Image` from `next/image`

The user explicitly opted to ditch `next/image` entirely. Replace `<Image ... />` with plain `<img ... />` and drop Next-only props.

Next-only props to drop: `priority`, `placeholder`, `blurDataURL`, `fill`, `sizes`, `quality`, `loader`, `unoptimized`. Keep: `src`, `alt`, `width`, `height`, `className`, `style`, `onLoad`, `onError`, `loading`.

- [ ] **Step 1: Remove the import line**

```bash
find src -type f -name "*.tsx" -print0 | \
  xargs -0 sed -i '' '/^import Image from "next\/image";$/d'
```

- [ ] **Step 2: Rename JSX usages**

```bash
find src -type f -name "*.tsx" -print0 | \
  xargs -0 sed -i '' -e 's/<Image /<img /g' -e 's/<\/Image>/<\/img>/g'
```

(`</Image>` is rare but possible.)

- [ ] **Step 3: Audit for dropped props**

```bash
grep -rnE '<img\b[^>]*\b(priority|placeholder|blurDataURL|fill|sizes|quality|loader|unoptimized)=' src --include="*.tsx"
```

For each hit, remove just that prop. The most common will be `priority` (a boolean flag). E.g.:

```tsx
// before
<img src="/x.png" alt="" width={48} height={48} priority />
// after
<img src="/x.png" alt="" width={48} height={48} />
```

- [ ] **Step 4: Verify no `next/image` remains**

```bash
grep -rn 'next/image' src --include="*.ts" --include="*.tsx"
```
Expected: no output.

### Task 4.5: Replace `next/dynamic` (used for ApexCharts)

**Files:**
- Modify: ~32 chart component files in `src/components/**` (per earlier grep)

The pattern in every chart file looks like this:

```tsx
import dynamic from "next/dynamic";
// ...
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
```

Vite has no SSR; replace with a plain import. The `ReactApexChart` const becomes the default import.

- [ ] **Step 1: For each file with `next/dynamic`, do this transformation**

Before:
```tsx
import dynamic from "next/dynamic";
// ...other imports
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
```

After:
```tsx
import ReactApexChart from "react-apexcharts";
// ...other imports
```

The list of files (verified):
- `src/components/ecommerce/MonthlyTarget.tsx`
- `src/components/ecommerce/StatisticsChart.tsx`
- `src/components/ecommerce/MonthlySalesChart.tsx`
- `src/components/ecommerce/CountryMap.tsx`
- `src/components/crm/EstimatedRevenue.tsx`
- `src/components/crm/SalePieChart.tsx`
- `src/components/crm/CrmStatisticsChart.tsx`
- `src/components/charts/line/LineChartOne.tsx`
- `src/components/charts/line/LineChartTwo.tsx`
- `src/components/charts/line/LineChartThree.tsx`
- `src/components/charts/pie/PieChartOne.tsx`
- `src/components/charts/pie/PieChartTwo.tsx`
- `src/components/charts/bar/BarChartOne.tsx`
- `src/components/charts/bar/BarChartTwo.tsx`
- `src/components/stocks/DividendChart.tsx`
- `src/components/stocks/PortfolioPerformance.tsx`
- `src/components/ai/CodeGeneratorContent.tsx`
- `src/components/marketing/ImpressionChart.tsx`
- `src/components/marketing/TrafficStats.tsx`
- `src/components/file-manager/StorageDetailsChart.tsx`
- `src/components/saas/FunnelChart.tsx`
- `src/components/saas/NewUserChart.tsx`
- `src/components/saas/ChurnRate.tsx`
- `src/components/saas/DailySaleChart.tsx`
- `src/components/saas/OnlineSaleChart.tsx`
- `src/components/saas/GrowthRate.tsx`
- `src/components/logistics/RevenueEarnedChart.tsx`
- `src/components/logistics/DeliveryStatisticsChart.tsx`
- `src/components/analytics/AcquisitionChannelChart.tsx`
- `src/components/analytics/SessionChart.tsx`
- `src/components/analytics/ActiveUsersChart.tsx`
- `src/components/analytics/AnalyticsBarChart.tsx`

Some files might import `react-apexcharts` differently. Inspect each before editing — the safest path is per-file Edit, not a global sed. But the pattern is uniform enough that this single-pass sed works for the import line and the constant declaration:

```bash
# Replace the import
find src/components -type f -name "*.tsx" -print0 | \
  xargs -0 sed -i '' 's|^import dynamic from "next/dynamic";$|import ReactApexChart from "react-apexcharts";|'
```

Then delete the dynamic-call lines manually per file (they span multiple lines, so a multi-line sed is fragile). For each file in the list:

```bash
# Open the file, find the block:
#   const ReactApexChart = dynamic(() => import("react-apexcharts"), {
#     ssr: false,
#   });
# and delete those lines (they may span 3 lines).
```

Easier: use a Node/Perl one-shot:

```bash
find src/components -type f -name "*.tsx" -print0 | \
  xargs -0 perl -i -0pe 's/\nconst ReactApexChart = dynamic\(\(\) => import\("react-apexcharts"\), \{\s*ssr: false,?\s*\}\);\n/\n/g'
```

- [ ] **Step 2: Verify**

```bash
grep -rn 'next/dynamic' src --include="*.tsx" --include="*.ts"
grep -rn 'dynamic(() => import' src --include="*.tsx" --include="*.ts"
```
Expected: no output for either.

### Task 4.6: Drop `Metadata` exports and `next/font`

**Files:**
- Modify: every `src/app/**/page.tsx` and any layout that exports metadata or imports a font

- [ ] **Step 1: Find them**

```bash
grep -rn '"next"' src --include="*.tsx" --include="*.ts"
grep -rn '"next/font' src --include="*.tsx" --include="*.ts"
```

- [ ] **Step 2: For each match, remove**

In every file with `import type { Metadata } from "next"` or `import { Metadata } from "next"`:
- Delete the import line
- Delete the `export const metadata: Metadata = { ... };` block

Example (apply per file):

```tsx
// before
import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// ...

export const metadata: Metadata = {
  title: "...",
  description: "...",
};

export default function Ecommerce() { ... }

// after
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// ...

export default function Ecommerce() { ... }
```

For `next/font/google` — it should only appear in the (already-deleted) `src/app/layout.tsx`. Verify nothing else uses it:
```bash
grep -rn 'next/font' src
```
Expected: no output.

- [ ] **Step 3: Final verify**

```bash
grep -rn 'from "next' src --include="*.ts" --include="*.tsx"
grep -rn 'from "next/' src --include="*.ts" --include="*.tsx"
```
Expected: no output.

### Task 4.7: Outfit font in CSS

`globals.css` (now `src/index.css`) already declares `--font-outfit: Outfit, sans-serif;` via Tailwind v4's `@theme` block. With the Google Fonts `<link>` in `index.html`, the font now loads. We need the body to actually use it (Next was injecting `outfit.className` on `<body>`).

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add a base rule**

Open `src/index.css`. Find the existing `@theme {` block. After the closing `}` of `@theme`, add:

```css
body {
  font-family: var(--font-outfit);
}
```

If a similar rule already exists, leave it. (Inspect the file first with `grep -n "body" src/index.css`.)

### Task 4.8: Sanity-check the codemod

- [ ] **Step 1: Final grep sweep**

```bash
echo "=== next imports ==="
grep -rn 'from "next' src --include="*.ts" --include="*.tsx" || echo "clean"
echo "=== use client ==="
grep -rn '"use client"' src --include="*.ts" --include="*.tsx" || echo "clean"
echo "=== <Image  ==="
grep -rn '<Image ' src --include="*.tsx" || echo "clean"
echo "=== href= on Link ==="
grep -rnE '<(Link|NextLink)\b[^>]*\shref=' src --include="*.tsx" || echo "clean"
```
Expected: every section reports `clean` (or no output before `clean`).

**Phase 4 checkpoint:** Codebase no longer references Next. Type-check next.

---

## Phase 5 — Type-Check & First Boot

### Task 5.1: Run TypeScript

- [ ] **Step 1: Type-check**

Run: `npx tsc -b`
Expected: zero errors.

Likely error categories and fixes:
- **`Cannot find module 'next/...'`** — a codemod miss. Find the file with `grep -rn 'next/'` and convert.
- **`Property 'href' does not exist on type ... Link`** — a `<Link href=...>` you missed. Convert to `to`.
- **`Type 'X' is missing the following properties...` on `<img>`** — usually fine; `<img>` accepts extra HTML attrs. If it complains about `priority` etc., remove that prop.
- **`React.lazy` / `Suspense` related** — ApexCharts replacement was only the `dynamic` swap; if you preserved a `Suspense` boundary and there's no longer a lazy component, drop the boundary too.

Iterate until clean.

### Task 5.2: Boot the dev server

- [ ] **Step 1: Run**

`npm run dev`
Expected: server starts; no compile errors in the terminal.

- [ ] **Step 2: Open the browser**

Visit `http://localhost:5173/`. Expected: the e-commerce dashboard renders with sidebar, header, and charts.

- [ ] **Step 3: Click through the major route categories**

Visit and visually confirm each loads without a console error or broken layout:
- `/` (e-commerce home)
- `/crm`, `/saas`, `/marketing`, `/stocks`, `/analytics`, `/logistics` — chart-heavy dashboards
- `/calendar` (FullCalendar)
- `/file-manager`, `/chat`
- `/buttons`, `/alerts`, `/tabs` — UI elements
- `/profile`
- `/signin`, `/signup`, `/reset-password` — auth (under `AuthLayout`)
- `/coming-soon`, `/error-404`, `/error-500`, `/maintenance`
- A bogus URL like `/xyz` — should hit the catch-all `NotFound` page

For each: open DevTools console, expect zero errors. Layout-shift or missing-image issues are fine to note and fix; runtime exceptions are not.

- [ ] **Step 4: Verify navigation works without page reload**

Click a few sidebar links and confirm the URL bar updates without a full reload (React Router behavior). Confirm the sidebar collapses when toggled and that the active-link highlight follows the URL.

**Phase 5 checkpoint:** The app runs in dev. Fix any runtime errors before moving on.

---

## Phase 6 — Production Build

### Task 6.1: Build and preview

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: `tsc -b` succeeds, then Vite emits a `dist/` folder. Note any warnings about chunk size — those are informational for this template, not errors.

- [ ] **Step 2: Preview**

Run: `npm run preview`
Expected: server at `http://localhost:4173/`. Open it and re-visit the same routes from Task 5.2 Step 3. Confirm the same routes work in the production bundle.

- [ ] **Step 3: Refresh test**

In the preview server, navigate to `/calendar`, then hit browser refresh. Expected: page reloads correctly (Vite preview handles SPA fallback by default; if it doesn't, that's a hosting concern, not a code one).

**Phase 6 checkpoint:** Production build works.

---

## Phase 7 — Cleanup

### Task 7.1: Delete leftover Next artifacts

- [ ] **Step 1: Remove Next/build leftovers**

```bash
rm -rf .next next-env.d.ts
```
(`.next` may not exist; `next-env.d.ts` may not exist — both are fine.)

- [ ] **Step 2: Check for `eslint.config.mjs`**

The current file extends `eslint-config-next`. Either:
- **Option A (recommended):** delete it for now. ESLint isn't gating anything in this template. `rm eslint.config.mjs`
- **Option B:** replace with a flat config that uses `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (all in `devDependencies`). Skip unless lint actually matters to the user.

- [ ] **Step 3: Check `README.md` for Next-specific instructions**

Run: `grep -n -i "next" README.md`
If hits exist, update the run instructions to mention `npm run dev` / `npm run build` (Vite). Don't rewrite the whole README — minimal touch.

- [ ] **Step 4: Re-boot dev one more time as a final smoke**

Run: `npm run dev`
Visit `/` and one chart page. Confirm clean.

- [ ] **Step 5: Final verification grep**

```bash
grep -rn '"next' src --include="*.ts" --include="*.tsx" || echo "no next imports"
grep -rn 'use client' src --include="*.ts" --include="*.tsx" || echo "no use client"
ls next.config.ts postcss.config.mjs 2>&1 | grep -v "No such file" || echo "configs gone"
```
Expected: each block reports the "clean" message.

**Phase 7 checkpoint:** Migration done.

---

## Risks & Rollback

There is no git here, so rollback means restoring from the user's external backup. The natural checkpoints to bail at are:

- **End of Phase 1**: trivial; just the new tooling files exist.
- **End of Phase 4**: codemod done but unverified. Most likely place to discover an unforeseen Next API.
- **Mid-Phase 5**: TypeScript errors are recoverable; runtime errors usually point at one missed file.

If a single page is the only one broken at the end, an acceptable shortcut is to delete that page from `src/routes.tsx` and circle back to it — but flag this to the user, don't silently drop routes.

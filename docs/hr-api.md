# HR API — Backend Handoff

This document specifies the HTTP contract the frontend `src/modules/hr` module
expects. The current frontend ships with a **mock implementation** at
`src/modules/hr/api/hrApi.mock.ts`. Replacing it with the real backend is a
drop-in swap — TypeScript wire types in `src/modules/hr/api/types.ts` are the
source of truth and must stay in lockstep with the responses below.

The HR API follows the same envelope and authentication conventions as the
auth API (`docs/auth-api.md`):
- Cookie-based session via `interval_session` (HttpOnly, Secure, SameSite=Lax).
- Every response is wrapped in `{ data, session: { status, expiresAt } }`.
- Errors use `{ code, message, fieldErrors? }`.

> Re-read `docs/auth-api.md § Conventions` if anything below feels ambiguous.

---

## Endpoint summary

| Method + Path                                    | Purpose                                                       |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `GET /hr/analytics/basic-counts/{date}`          | KPI counts, scoped to a calendar date                         |
| `GET /hr/analytics/dept-counts`                  | Departments + wings hierarchy                                 |
| `GET /hr/employees?...`                          | Paginated employees with filter combinations                  |
| `GET /hr/employees/under-head/{headId}`          | Non-paginated employees reporting to a specific head          |
| `GET /hr/post-working/{date}?page&limit&...`     | Paginated post-working-hours employees on a date (see § 5)    |

### Quick curl reference

```bash
# 1. KPI snapshot for today
curl -b cookies.txt $API/hr/analytics/basic-counts/2026-04-29

# 2. Full department hierarchy
curl -b cookies.txt $API/hr/analytics/dept-counts

# 3. Paginated drill-down (e.g. Female Employees, page 1)
curl -b cookies.txt "$API/hr/employees?page=1&limit=12&gender=Female"

# 4. Today's leave list (all leave types)
curl -b cookies.txt --get "$API/hr/employees" \
  --data-urlencode "page=1" --data-urlencode "limit=24" \
  --data-urlencode "leave=Compensatory Off,Leave-Casual Leave,Leave-Sick Leave,Leave-Paid Leave,Leave-Maternity Leave,Leave Without Pay,Leave-Dot Leave,Leave-Earned Leave" \
  --data-urlencode "gender=Male,Female"

# 5. OGD wing — non-paginated under-head lookup
curl -b cookies.txt $API/hr/employees/under-head/h_ogd_2
```

---

## 1. `GET /hr/analytics/basic-counts/{date}`

The `{date}` path parameter is `YYYY-MM-DD`. All time-of-day-sensitive counts
(attendance, leave, food) reflect that day. Lifetime counts (`total`,
`resigned`, etc.) ignore the date.

### Response — 200

```json
{
  "data": {
    "date": "2026-04-29",
    "stats": [
      { "key": "total",                "title": "Total Employees",            "count": 372 },
      { "key": "interval",             "title": "Interval Employees",         "count": 304 },
      { "key": "magic_lamp",           "title": "Magic Lamp Employees",       "count": 15 },
      { "key": "skillx",               "title": "SkillX Employees",           "count": 27 },

      { "key": "male",                 "title": "Male Employees",             "count": 81 },
      { "key": "female",               "title": "Female Employees",           "count": 267 },
      { "key": "permanent",            "title": "Permanent Employees",        "count": 249 },
      { "key": "post_working",         "title": "Post Working Employees",     "count": 0 },

      { "key": "notice_period",        "title": "Notice Period Employees",    "count": 9 },
      { "key": "probation",            "title": "Probation Employees",        "count": 82 },
      { "key": "long_leave",           "title": "Long Leave Employees",       "count": 2 },
      { "key": "resigned",             "title": "Resigned Employees",         "count": 1054 },

      { "key": "today_present",        "title": "Today Present",              "count": 259 },
      { "key": "today_leave",          "title": "Today Leave",                "count": 26 },
      { "key": "today_work_from_home", "title": "Today Work From Home",       "count": 0 },
      { "key": "lunch_count",          "title": "Lunch Count",                "count": 170 },

      { "key": "evening_food_count",   "title": "Evening Food Count",         "count": 0 }
    ],
    "generatedAt": "2026-04-29T12:34:56.000Z"
  },
  "session": { "status": "active", "expiresAt": "..." }
}
```

### Stat key semantics

Each entry is a single KPI tile. The frontend renders them in fixed groups,
keyed by the `key` field — **the order of the array does not matter**. Missing
keys are silently dropped, so the API can ship new metrics before the
frontend wires them up.

| `key`                  | Definition                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `total`                | All currently-employed people across all brands.                                        |
| `interval`             | Subset of `total` whose brand = "Interval" (i.e. excludes Magic Lamp + SkillX).         |
| `magic_lamp`           | Subset of `total` whose department display-name = `"MAGIC LAMP(D2C)"`.                  |
| `skillx`               | Subset of `total` whose department display-name = `"SkillX"`.                           |
| `male` / `female`      | Subset of `total` by recorded gender.                                                   |
| `permanent`            | Employment type = "Permanent".                                                          |
| `post_working`         | Employees serving notice but actively working (post-resignation, pre-exit).             |
| `notice_period`        | Employees on notice period (resignation accepted, last working day not yet reached).    |
| `probation`            | Employees still in probation period.                                                    |
| `long_leave`           | Employees on long leave (sabbatical, parental, etc.) — > 7 calendar days.               |
| `resigned`             | **Lifetime** count of resigned employees (historical).                                  |
| `today_present`        | Employees marked Present Marked (in-office; excludes WFH and leave).                    |
| `today_leave`          | Employees on any kind of leave today (any of the leave types listed below).             |
| `today_work_from_home` | Employees with today's leaveStatus = `"Work From Home (WFH)"`.                          |
| `lunch_count`          | Employees who have opted in / consumed lunch today (food category 1).                   |
| `evening_food_count`   | Employees who have opted in / consumed evening meal today (food category 2).            |

The frontend computes attendance %, attrition %, gender share, and other
ratios client-side from these raw counts.

### Consistency rule (read this — most common bug class)

The KPI count for `interval` MUST equal the count returned by
`GET /hr/employees?excludeDept=SkillX,MAGIC LAMP(D2C),Skillx&page=1&limit=1`'s
`meta.totalCount`. Same for `magic_lamp` (vs `?department=MAGIC LAMP(D2C)`)
and `skillx` (vs `?department=SkillX`). The dashboard tile shows N, the user
clicks through, and they expect to see N items in the resulting list. Mismatch
between the aggregated count and the filtered-list count breaks user trust
faster than any other bug.

The simplest implementation is to derive both endpoints from the same
underlying query so they cannot drift. If aggregations are precomputed
(materialised view, cache), invalidate the cache atomically with any change
that affects the filtered list.

### Errors
- `400 invalid_date` — date is malformed or outside an acceptable range.
- `403 forbidden_role` — caller lacks the `hr.viewer` role.

---

## 2. `GET /hr/analytics/dept-counts`

Returns the department + wings hierarchy. Not date-scoped; reflects current
employment relationships.

### Response — 200

```json
{
  "data": {
    "departments": [
      {
        "id": "ogd",
        "department": "Operations Growth Department (OGD)",
        "manager": "FAYIS K",
        "managerId": "u_mgr_ogd",
        "count": 79,
        "wings": [
          { "headId": "h_ogd_1", "wingName": "Ventas Squad", "wingHead": "VINEETH AP", "count": 14 },
          { "headId": "h_ogd_2", "wingName": "Deal Maestro", "wingHead": "ANJU R",     "count": 21 }
        ],
        "wingsUseHeadIdLookup": true
      },
      {
        "id": "technical",
        "department": "Technical Department",
        "manager": "SHAHIDA P A",
        "managerId": "u_mgr_tech",
        "count": 12,
        "wings": [
          { "headId": "h_tech_1", "wingName": "Frontend Wing", "wingHead": "AYESHA P", "count": 5 }
        ],
        "wingsUseHeadIdLookup": false
      }
    ],
    "generatedAt": "2026-04-29T12:34:56.000Z"
  },
  "session": { "status": "active", "expiresAt": "..." }
}
```

### Field semantics

| Field                                    | Type     | Notes                                                                |
| ---------------------------------------- | -------- | -------------------------------------------------------------------- |
| `id`                                     | string   | Stable, unique. Used as React key.                                   |
| `department`                             | string   | Display name. Frontend uses this verbatim and as a filter parameter. |
| `manager`                                | string   | Reporting head's display-case full name.                             |
| `managerId`                              | string   | Reporting head's user id (reserved; not yet consumed by UI).         |
| `count`                                  | integer  | Currently-employed people in this department.                        |
| `wings[]`                                | array    | May be empty.                                                        |
| `wings[].headId`                         | string   | Wing head's user id. Required.                                       |
| `wings[].wingName`                       | string   | Display name. Used as a filter for paginated employee lookup.        |
| `wings[].wingHead`                       | string   | Display-case full name.                                              |
| `wings[].count`                          | integer  | Currently-employed people in this wing.                              |
| `wingsUseHeadIdLookup`                   | boolean  | When `true`, the frontend queries this department's wings via        |
|                                          |          | `/hr/employees/under-head/{headId}` instead of                       |
|                                          |          | `/hr/employees?wing=...`. **Currently set for OGD only.**            |

The `wingsUseHeadIdLookup` flag preserves the old project's quirk where OGD
wings are tracked by head rather than by name. Default `false` for new
departments.

---

## 3. `GET /hr/employees`

Paginated list of employees, filterable by any combination of attributes.
Used for the KPI click-through page **and** the department/wing employees
modal.

### Query parameters

| Param            | Format                       | Notes                                                                                |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| `page`           | integer ≥ 1                  | Required. 1-based.                                                                   |
| `limit`          | integer ≥ 1                  | Required. Caps at backend's discretion (recommend 100).                              |
| `search`         | string                       | Match against name OR email (case-insensitive substring).                            |
| `department`     | comma-separated string list  | Match any.                                                                           |
| `excludeDept`    | comma-separated string list  | Exclude any. Used by the "Interval Employees" tile to exclude SkillX + Magic Lamp.   |
| `wing`           | comma-separated string list  | Match `wings.wingName`.                                                              |
| `reportingHead`  | comma-separated string list  | Match by reporting head display name.                                                |
| `gender`         | `Male` and/or `Female`       | Comma-separated.                                                                     |
| `employmentType` | comma-separated string list  | e.g. `Permanent`, `Probation`, `Notice Period`.                                      |
| `employeeStatus` | comma-separated string list  | e.g. `Resigned`, `Long Leave`, `Active`.                                             |
| `attendance`     | comma-separated string list  | e.g. `Present Marked`.                                                               |
| `leave`          | comma-separated string list  | One or more leave types — see "Leave types vocabulary" below.                        |
| `foodCategory`   | `1` or `2`                   | `1` = lunch, `2` = evening food. Surfaces the meal drill-down list.                  |
| `fromDate`       | `YYYY-MM-DD`                 | Optional date range start.                                                           |
| `toDate`         | `YYYY-MM-DD`                 | Optional date range end.                                                             |

#### Leave types vocabulary

Used by `leave=` and the "Today Leave" tile. The frontend ships the full set
when "Today Leave" is clicked:

```
Compensatory Off
Leave-Casual Leave
Leave-Sick Leave
Leave-Paid Leave
Leave-Maternity Leave
Leave Without Pay
Leave-Dot Leave
Leave-Earned Leave
Work From Home (WFH)
```

The "Today Work From Home" tile passes only `Work From Home (WFH)`.

#### KPI tile → query parameter mapping

This table is the contract that ties the analytics page's click-throughs to
this endpoint. The backend implementation must produce sensible results for
every combination listed.

| KPI tile (key)         | Query parameters added                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `total`                | (none)                                                                                                  |
| `interval`             | `excludeDept=SkillX,MAGIC LAMP(D2C),Skillx`                                                              |
| `magic_lamp`           | `department=MAGIC LAMP(D2C)`                                                                            |
| `skillx`               | `department=SkillX`                                                                                     |
| `male`                 | `gender=Male`                                                                                           |
| `female`               | `gender=Female`                                                                                         |
| `permanent`            | `employmentType=Permanent`                                                                              |
| `notice_period`        | `employmentType=Notice Period`                                                                          |
| `probation`            | `employmentType=Probation`                                                                              |
| `long_leave`           | `employeeStatus=Long Leave`                                                                             |
| `resigned`             | `employeeStatus=Resigned`                                                                               |
| `today_present`        | `attendance=Present Marked`                                                                             |
| `today_leave`          | `leave=<all 8 leave types above>&gender=Male,Female`                                                    |
| `today_work_from_home` | `leave=Work From Home (WFH)`                                                                            |
| `lunch_count`          | `foodCategory=1`                                                                                        |
| `evening_food_count`   | `foodCategory=2`                                                                                        |
| `post_working`         | navigates to `/hr/post-working` (separate page) — see § 5 below                                         |

### Response — 200

```json
{
  "data": {
    "employees": [
      {
        "id": "u_emp_42",
        "name": "AYESHA P",
        "photo": "ayesha-p-9381",
        "email": "ayesha.p@interval.com",
        "department": "Technical Department",
        "designation": "Frontend Wing",
        "employmentType": "Permanent",
        "status": "Active"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 12,
      "totalCount": 304,
      "totalPages": 26,
      "hasPrevPage": false,
      "hasNextPage": true
    }
  },
  "session": { "status": "active", "expiresAt": "..." }
}
```

#### Employee fields

| Field            | Type                  | Notes                                                            |
| ---------------- | --------------------- | ---------------------------------------------------------------- |
| `id`             | string                | Stable user id.                                                  |
| `name`           | string                | Display-case full name.                                          |
| `photo`          | string &#124; null    | Photo asset id. Frontend builds the URL:                         |
|                  |                       | `https://workspace.teaminterval.net/assets/employee/photo/passport_size/{photo}.jpg` |
| `email`          | string (optional)     |                                                                  |
| `department`     | string (optional)     | For chip rendering / future filters.                             |
| `designation`    | string (optional)     | Wing name or job title.                                          |
| `employmentType` | string (optional)     | "Permanent" / "Probation" / "Notice Period".                     |
| `status`         | string (optional)     | "Active" / "Resigned" / "Long Leave".                            |

The frontend does not require any optional field; gracefully degrades when
they are absent.

---

## 4. `GET /hr/employees/under-head/{headId}`

Non-paginated list of employees reporting (directly or transitively) to a
specific head. Used **only** for departments where
`wingsUseHeadIdLookup === true` (currently OGD).

### Response — 200

```json
{
  "data": { "employees": [ { ...Employee }, ... ] },
  "session": { "status": "active", "expiresAt": "..." }
}
```

No pagination — the frontend renders all employees in a single grid. If the
head has unusually many reports, prefer adding `wingsUseHeadIdLookup: false`
for that department in `dept-counts` and pointing the UI at the paginated
`GET /hr/employees?wing=...` instead.

### Errors
- `404 head_not_found` — no head with that id.

---

## 5. `GET /hr/post-working/{date}` *(planned — currently has UI placeholder)*

Post-working-hours employees: people working past office hours on a given
date. The old project served this from `general/help-support/{date}`; the
new contract proposed below mirrors `GET /hr/employees` so the same drill-
down UI can render the response without a special case.

### Query parameters

| Param          | Format         | Notes                                                |
| -------------- | -------------- | ---------------------------------------------------- |
| `page`         | integer ≥ 1    | Required.                                            |
| `limit`        | integer ≥ 1    | Required. Cap recommendation: 100.                   |
| `search`       | string         | Match against name OR email.                         |
| `department`   | string         | Filter by department display name.                   |

### Response — 200

Same shape as `GET /hr/employees` (employees + meta envelope). Add any
post-working-specific fields (e.g. `clockOutTime`, `extraHours`) as optional
keys on the `Employee` object — the frontend ignores unknown fields, so they
can ship without a frontend update.

### Status

The frontend's `post_working` KPI tile already navigates to
`/hr/post-working` with the empty filter state; the page itself is a thin
list view that will call this endpoint once it ships. Until then, the route
renders a "Coming soon" placeholder.

---

## Authorization

All four endpoints require:
- An active session (`session.status = "active"`).
- The `hr.viewer` role or higher. Return `403 forbidden_role` for callers
  without permission — the frontend displays the message verbatim.

## Caching

- `basic-counts/{date}` and `dept-counts` are cheap to read but expensive to
  compute. Recommended server-side cache: 30 seconds, keyed on `(date)` and
  `()` respectively. Bust on attendance / employment / department mutations.
- `Cache-Control: private, max-age=30` is fine; frontend's 60-second
  staleness window is independent.
- `GET /hr/employees` is uncacheable above the request scope.

## Pagination policy

- Default `limit` (when missing): 12.
- Hard cap on `limit`: 100 (return `400 limit_too_large` above this).
- `meta.totalCount` is mandatory. The Previous/Next buttons depend on it.

---

## Frontend integration reference

| Concern                             | Path                                                                  |
| ----------------------------------- | --------------------------------------------------------------------- |
| Wire types                          | `src/modules/hr/api/types.ts`                                         |
| Mock implementation                 | `src/modules/hr/api/hrApi.mock.ts`                                    |
| Real (axios) implementation         | `src/modules/hr/api/hrApi.real.ts`                                    |
| Mock/real toggle                    | `VITE_USE_MOCK_API=false` in `.env.local`                             |
| Store (zustand + immer + devtools)  | `src/stores/hrStore.ts`                                               |
| KPI navigation map                  | `src/modules/hr/lib/kpiNavigation.ts`                                 |
| Analytics page                      | `src/modules/hr/pages/EmployeeAnalyticsPage.tsx` → `/hr/employee-analytics` |
| Employees drill-down page           | `src/modules/hr/pages/EmployeesPage.tsx` → `/hr/employees`            |
| Department modals (wings/employees) | `src/modules/hr/components/{WingsModal,EmployeesModal}.tsx`           |

The frontend's 60-second client-side staleness window applies to KPI counts
and the department hierarchy (the "Refresh" button on the analytics page
forces a refetch).

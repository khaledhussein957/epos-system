# EPOS System

An Electronic Point-of-Sale platform with an Express/Bun backend and an Expo React Native mobile client. Cashiers ring up sales from the mobile app (with a live barcode scanner), customers browse and self-order, and admins manage products, categories, users, customers, inventory, and revenue reports.

**Developed by [Khalid Hussein](https://facebook.com/khaledhussein957).**

## Repository layout

```
EPOS System/
├── backend/   Bun + Express + Drizzle ORM + PostgreSQL
└── mobile/    Expo + React Native + NativeWind + Zustand
```

## Tech stack

| Layer         | Backend                                    | Mobile                                |
| ------------- | ------------------------------------------ | ------------------------------------- |
| Runtime       | Bun                                        | Expo SDK 55, React Native 0.83        |
| Language      | TypeScript (strict)                        | TypeScript (strict)                   |
| Framework     | Express 5                                  | expo-router (file-based)              |
| Database      | PostgreSQL via Drizzle ORM (+ migrations)  | —                                     |
| Auth          | JWT access (15m) + rotating refresh (30d)  | Zustand + `expo-secure-store`         |
| Validation    | Zod                                        | Zod + react-hook-form                 |
| State / data  | —                                          | Zustand + TanStack Query              |
| Styling       | —                                          | NativeWind (Tailwind for RN)          |
| Files         | Multer → Cloudinary                        | `expo-image-picker` → multipart       |
| Barcode       | —                                          | `expo-camera` scanner                 |
| Email         | Nodemailer (SMTP)                          | —                                     |
| Payments      | Stripe, WaafiPay                           | —                                     |
| Logging       | `pino` (+ `pino-http`, `pino-pretty` dev)  | `react-native-toast-message`          |
| Tests         | `bun test` (55 unit + validator tests)     | —                                     |

## Features

### Cashier POS

- Full point-of-sale screen (`mobile/src/app/(admin-tabs)/pos.tsx`) for cashiers and admins.
- Product search + 2-column grid with per-tile stock indicator.
- **Barcode scanner** button beside the search — opens `expo-camera` `CameraView` with EAN, UPC, code128/39/93, codabar, ITF-14, QR, and PDF417 support. Scans look up the product, add it to the cart, and pop the sheet.
- Persistent cart with `−` / `+` quantity steppers, live subtotal, item count, and a "Clear cart" action.
- Customer chip above the payment row — bottom-sheet picker to search existing customers **or** add a walk-in inline in one step.
- Payment method chips: **cash / card / mobile / bank**. `payment_account` field auto-appears and is required for mobile and bank.
- Order-level **discount and tax** inputs with live breakdown (Subtotal / Discount / Tax) and grand-total math.
- On checkout, receipt modal shows the order id + "View receipt" opens the backend-generated PDF; cart clears automatically.

### Admin panel

- Dashboard with headline stats (users, orders, products, categories, revenue).
- Products: full CRUD with image upload (Cloudinary), category assignment, active toggle, optional barcode, and per-row **stock adjustment** (Receive / Remove +/− delta with reason).
- Categories: full CRUD with optimistic UI and rollback.
- Customers: search, create, update, delete, and a detail sheet with **lifetime spend** + full order history.
- Users: list, block/unblock, edit profile, delete.
- Reports (see below).
- Role-aware routing: cashiers only see POS + Orders in the admin tab bar (other tabs hidden via `href: null`).

### Reports

Five aggregations at `/api/reports/*`, admin-only, all backed by grouped SQL and rendered as chip-picker tabs on mobile:

- **Daily sales** — orders grouped by day, revenue + count per row.
- **Top-selling products** — order_items joined on products, sorted by quantity sold.
- **Low-stock alerts** — active products at or below a threshold (default 5), red for `0`, amber otherwise.
- **Revenue by cashier** — orders joined on users, grouped by cashier.
- **Customer purchase history** — surfaced in the Customers tab detail sheet.

### Real-time transaction flow

Every sale is one Drizzle transaction:

1. Validate & create the customer (or reuse via email/phone match).
2. Read every requested product; reject if any is missing.
3. Validate stock; reject with 409 on insufficient stock.
4. Insert the order with `subtotal`, `discount`, `tax`, `total`, `payment_method`.
5. Insert one `order_items` row per line, snapshotting `price` at order time.
6. Deduct stock: `UPDATE products SET stock = stock - qty`.
7. Return the enriched order; controller generates the receipt PDF.

### Authentication & authorisation

- JWT-based register/login with **15-minute** access tokens.
- Refresh tokens (opaque, 32-byte base64url) stored SHA-256-hashed in `refresh_tokens`; rotated on every `/auth/refresh`, revocable via `/auth/logout`, cascade-deleted with the user.
- Password reset via cryptographically secure 6-digit codes (`crypto.randomInt`), emailed via SMTP, rate-limited per account.
- Role-based access: `admin`, `cashier`, `customer`. Enforced at the controller.
- Rate-limiting on all auth endpoints (`express-rate-limit`).
- `helmet()` security headers.

### Structured logging

- `pino` root logger with per-request child loggers (via `pino-http`).
- Every request has an `X-Request-Id` (echoed on the response); errors share the same id as their access-log line.
- Sensitive fields redacted: Authorization / cookie headers, `*.password`, `*.token`, `*.refreshToken`, `*.jwt`, `*.secret`, `*.apiKey`.
- Dev: colourised via `pino-pretty`. Prod: one JSON line per entry, pipe to any log drain.
- Log level from `ENV.LOG_LEVEL` (defaults `debug` dev / `info` prod).

### Mobile UX polish

- Auto silent refresh on 401 — single in-flight `/auth/refresh`, retries the original request, only bounces to `/(auth)` if refresh itself fails.
- Offline banner via `@react-native-community/netinfo`.
- Toast notifications (`react-native-toast-message`) instead of blocking `Alert.alert` for non-critical errors.
- Pull-to-refresh on every list screen.
- Optimistic category creation with automatic rollback on error.

### Security hardening

- Every service throws `AppError(message, status)` — controllers translate to the right HTTP code (400/401/403/404/409/410/429), not a blanket 500.
- Uploads unlinked in `try/finally` so failed Cloudinary uploads don't orphan local files.
- Duplicate barcode is a 409 with a clear message (not a Postgres unique-violation 500).
- ESLint flat config (`eslint-config-expo`) on mobile.

## Getting started

### Prerequisites
- [Bun](https://bun.com/) ≥ 1.3
- PostgreSQL 14+
- Cloudinary account (image hosting)
- SMTP credentials (e.g. Gmail app password) for password reset emails
- Optional: Stripe + WaafiPay accounts for live payments
- For mobile: iOS or Android simulator, or the Expo Go app on a device

### 1. Clone and install

```bash
git clone https://github.com/khaledhussein957/epos-system.git
cd epos-system

cd backend && bun install
cd ../mobile && bun install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Fill `.env`:

- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — long random string (e.g. `openssl rand -base64 48`)
- `LOG_LEVEL` — `debug` / `info` / `warn` (optional; sensible defaults)
- `CLOUDINARY_*` — from your Cloudinary dashboard
- `SMTP_EMAIL` / `SMTP_PASSWORD` — for password reset emails
- `STRIPE_SECRET_KEY`, `MERCHANT_UID`, `API_USER_ID`, `API_KEY`, `WAAFIPAY_URL` — only if enabling payments

### 3. Set up the database

Fresh DB:

```bash
bun run db:migrate     # applies backend/drizzle/*.sql in order
```

Migrations in `backend/drizzle/`:

- `0000_windy_wong.sql` — baseline schema
- `0001_add_order_discount_tax.sql` — subtotal / discount / tax on orders + refresh_tokens table
- `0002_add_product_barcode.sql` — nullable unique barcode column
- `0003_add_stock_adjustments.sql` — inventory audit trail table

For iterating on models during dev:

```bash
bun run db:generate    # emit a new migration from schema diff
bun run db:migrate     # apply pending migrations
```

`bun run db:push` is still available for quick prototyping (skips the migration file).

### 4. Run the backend

```bash
bun run dev            # bun --watch, colourised logs via pino-pretty
```

Listens on `PORT` (default `7711`). `GET /health` returns `{ status: "ok" }`. Every request gets an `X-Request-Id` on the response.

### 5. Configure the mobile app

```bash
cd ../mobile
```

Create `.env.local`:

```
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:7711/api
```

> Use your machine's LAN IP, not `localhost` — the device / simulator can't reach loopback on your dev machine. Production builds must use HTTPS.

### 6. Run the mobile app

```bash
bun run start          # opens the Expo dev menu
bun run android
bun run ios
```

## API surface

Everything lives under `/api`. All admin endpoints do the role check in the controller so removing a service guard can't accidentally expose them.

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/register` | public | Create account; returns access + refresh |
| POST | `/login` | public | Sign in; returns access + refresh |
| POST | `/refresh` | public | Rotate refresh; new pair |
| POST | `/logout` | public | Revoke a refresh token |
| POST | `/request-password-reset` | public | Email a 6-digit reset code |
| POST | `/reset-password` | public | Use code + email to set new password |

### Users (`/api/users`)
| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/` | admin | List users |
| PUT | `/update-profile` | user | Update own profile |
| PUT | `/profile-image` | user | Upload profile image |
| PUT | `/change-password` | user | Change password (needs old) |
| PUT | `/update-user-profile/:id` | admin | Admin edit any user |
| PUT | `/toggle-block-user/:id` | admin | Block / unblock |
| DELETE | `/delete-user/:id` | admin | Delete user |
| PUT | `/delete-account` | user | Delete own account |

### Categories (`/api/categories`)
| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/` | public | List categories |
| POST | `/` | admin | Create (multipart, `categoryImage`) |
| PUT | `/:id` | admin | Update (multipart, optional image) |
| DELETE | `/:id` | admin | Delete (password-confirmed) |

### Products (`/api/products`)
| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/` | public | List with category |
| GET | `/by-barcode/:code` | staff | Barcode lookup |
| GET | `/:id` | public | Single product |
| POST | `/` | admin | Create (multipart, `productImage`, optional `barcode`) |
| PUT | `/:id` | admin | Update (JSON body; null barcode clears it) |
| PUT | `/product-image/:id` | admin | Replace product image |
| POST | `/:id/adjust-stock` | admin | `{ delta, reason? }` — audited |
| GET | `/:id/stock-history` | admin | 50 most recent adjustments |
| DELETE | `/:id` | admin | Delete (password-confirmed) |

### Orders (`/api/orders`)
| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/` | admin | List all orders |
| GET | `/my-orders` | user | Caller's orders |
| POST | `/` | user | Create order + receipt PDF |

### Customers (`/api/customers`)
| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/` | staff | List with `?search=` (name / email / phone) |
| GET | `/:id` | staff | Single customer |
| POST | `/` | staff | Create (409 on dup email or phone) |
| PUT | `/:id` | staff | Update (uniqueness excludes self) |
| DELETE | `/:id` | admin | Delete |

### Reports (`/api/reports`)
| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/daily-sales?from&to` | admin | Per-day count + revenue |
| GET | `/top-products?limit&from&to` | admin | Best sellers by quantity |
| GET | `/low-stock?threshold` | admin | Products ≤ threshold |
| GET | `/revenue-by-cashier?from&to` | admin | Per-cashier totals |
| GET | `/customer-history/:id` | admin | Order list + lifetime spend |

### Dashboard (`/api/dashboard`)
| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/` | admin | Aggregate counts + revenue |

## Database schema

Key tables (all IDs are `uuid`):

- **users** — accounts, role, block flag, last login, password reset state.
- **refresh_tokens** — `token_hash` (sha256), `expires_at`, `revoked_at`; indexed on `user_id` and `token_hash`, cascade with user.
- **categories** — name, image, public id.
- **products** — name, description, FK `category_id`, `price numeric(12,2)`, `stock integer`, `is_active`, image url + public id, qr code, `barcode` (unique nullable).
- **stock_adjustments** — audit trail: `product_id` (cascade), `user_id`, `delta`, `reason`, `stock_after`, `created_at`.
- **orders** — FKs `user_id` and `customer_id`, `subtotal`, `discount`, `tax`, `total` (all `numeric(12,2)`), `payment_method` enum.
- **order_items** — FKs `order_id` and `product_id`, `quantity integer`, `price numeric(12,2)` (snapshot at order time).
- **customers** — name, phone (unique), email (unique).
- **payments** — FKs `user_id` and `order_id`, status enum, amount, phone, transaction id.

## Scripts

### Backend (`backend/package.json`)

| Script | Purpose |
| ------ | ------- |
| `bun run dev` | Watch mode with pretty pino logs |
| `bun run start` | Production start |
| `bun run test` | Run `bun test` suite |
| `bun run test:watch` | Test watch mode |
| `bun run db:push` | Push schema directly (dev only) |
| `bun run db:generate` | Emit a new migration from schema diff |
| `bun run db:migrate` | Apply pending migrations |

### Mobile (`mobile/package.json`)

| Script | Purpose |
| ------ | ------- |
| `bun run start` | Expo dev server |
| `bun run android` | Build & run on Android |
| `bun run ios` | Build & run on iOS |
| `bun run web` | Run as a web app |
| `bun run lint` | ESLint |
| `bun run lint:fix` | ESLint --fix |

## Testing

Backend runs 55 tests via bun's built-in runner in under a second, covering:

- `AppError` (status / message plumbing)
- `auth.util` — bcrypt round-trip, refresh token entropy, JWT round-trip, **regression test that reset codes are cryptographically distributed** (guards against the historical `Math.random()` bug)
- Zod schemas for order, customer, product — including that `discount` and `tax` reject negatives, mobile / bank require `payment_account`, empty carts are rejected, and barcode length limits are enforced

`src/testing/db.ts` provides a `withTx` helper for future service-layer integration tests — every block auto-rolls-back so no test leaks state. See `backend/TESTING.md` for the worked example and how to point at a dedicated `TEST_DATABASE_URL`.

```bash
cd backend
bun run test
```

## Auth flow walkthrough

1. `POST /api/auth/login` → response includes access token (15m) + refresh token (30d).
2. Mobile stores both in `expo-secure-store` via the Zustand `auth.store`.
3. Every request adds `Authorization: Bearer <access>` via an axios interceptor.
4. On 401, the response interceptor calls `/api/auth/refresh` once (single in-flight promise so concurrent calls share it), stores the new pair, and retries the original request transparently. Only if refresh itself fails does the app clear state and route to `/(auth)`.
5. `POST /api/auth/logout` with the current refresh token invalidates it server-side (marks `revoked_at`); the mobile store clears too.

## Project conventions

- Services throw `AppError(message, status)` from `src/utils/AppError.ts`. Controllers translate to JSON responses via a small `handleError` helper.
- Uploads use Multer → Cloudinary. Local temp files are deleted in `try/finally` even on upload failure.
- Money is `numeric(12, 2)` everywhere. Quantities and stock are `integer`. No `.toString()` dance.
- Mobile UX: **toasts for transient errors**, `Alert.alert` only for destructive confirmations.
- Admin-only routes do the role check in the **controller**, not the service — so removing a service guard can't silently expose them.
- Logging: **never `console.*`** — always `logger.*` or `req.log.*`. Errors use `{ err }, "message"` form so pino serialises stacks.

## Known limitations / not yet done

- No mobile tests yet (RN Testing Library / Detox).
- No crash reporting (Sentry) on either side.
- No `eas.json` build profiles — production mobile builds must set `EXPO_PUBLIC_API_URL` to an HTTPS host manually.
- No i18n; all UI copy is English.
- Backend integration tests are scaffolded (`withTx`) but not yet written for the order transaction or reports aggregations.

## Contributing

Branch off `main`, keep commits focused, run `bunx tsc --noEmit` in both `backend/` and `mobile/` before pushing. Backend PRs should keep `bun test` green. PRs land via squash-merge.

## License

Private. All rights reserved.

## Author

**Khalid Hussein**
GitHub: [@khaledhussein957](https://github.com/khaledhussein957)

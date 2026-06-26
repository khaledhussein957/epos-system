# EPOS System

An Electronic Point-of-Sale platform with an Express/Bun backend and an Expo React Native mobile client. Cashiers ring up orders, customers browse and order from their phone, and admins manage products, categories, users, and revenue.

**Developed by [Khalid Hussein](https://faceboom.com/khaledhussein957).**

## Repository layout

```
EPOS System/
├── backend/   Bun + Express + Drizzle ORM + PostgreSQL
└── mobile/    Expo + React Native + NativeWind + Zustand
```

## Tech stack

| Layer        | Backend                                  | Mobile                               |
| ------------ | ---------------------------------------- | ------------------------------------ |
| Runtime      | Bun                                      | Expo SDK 55, React Native 0.83       |
| Language     | TypeScript (strict)                      | TypeScript (strict)                  |
| Framework    | Express 5                                | expo-router (file-based)             |
| Database     | PostgreSQL via Drizzle ORM               | —                                    |
| Auth         | JWT access (15m) + rotating refresh (30d) | Zustand store + `expo-secure-store` |
| Validation   | Zod                                      | Zod + react-hook-form                |
| State / data | —                                        | Zustand + TanStack Query             |
| Styling      | —                                        | NativeWind (Tailwind for RN)         |
| Files        | Multer → Cloudinary                      | `expo-image-picker` → multipart      |
| Email        | Nodemailer (SMTP)                        | —                                    |
| Payments     | Stripe, WaafiPay                         | —                                    |

## Features

### Authentication
- JWT-based login/register with 15-minute access tokens.
- Refresh tokens (opaque, 32-byte) stored hashed (SHA-256) in `refresh_tokens` — rotated on each use, revocable, cascade-delete with the user.
- Password reset via cryptographically secure 6-digit codes (`crypto.randomInt`) emailed via SMTP, rate-limited per account.
- Role-based access: `admin`, `cashier`, `customer`. Admin-only routes enforced at the controller level.

### Catalogue
- Categories and products with Cloudinary-hosted images.
- Each product gets a generated QR code.
- Prices stored as `numeric(12, 2)`, stock as `integer` — no precision loss, no string-math.

### Orders
- Drizzle transactions guarantee stock validation and deduction happen atomically.
- Anonymous or registered customers; duplicate detection by email/phone.
- Receipts capture the price *at order time* — repricing a product doesn't change historical receipts.
- PDF receipt generation via `pdfkit`.

### Mobile UX
- Conditional layouts: `(auth)`, `(user-tabs)`, `(admin-tabs)`.
- Optimistic UI for category creation with automatic rollback on error.
- Pull-to-refresh on all list screens.
- Offline detection banner via `@react-native-community/netinfo`.
- Toast notifications instead of blocking `Alert.alert` for non-critical errors.
- Automatic silent refresh on 401 — single in-flight refresh, retries the original request, only bounces to login if refresh itself fails.

### Security hardening
- `helmet()` for security headers, `express-rate-limit` on auth routes.
- All errors flow through `AppError` with correct HTTP status codes (400/401/403/404/409/410/429).
- Local upload files cleaned up in `try/finally` so failed Cloudinary uploads don't orphan files.
- ESLint flat config (`eslint-config-expo`) on mobile.

## Getting started

### Prerequisites
- [Bun](https://bun.com/) ≥ 1.3
- PostgreSQL 14+
- Cloudinary account (image hosting)
- SMTP credentials (e.g. Gmail app password) for password reset emails
- Optional: Stripe + WaafiPay accounts for live payments
- For mobile: an iOS or Android simulator, or the Expo Go app on a physical device

### 1. Clone and install

```bash
git clone https://github.com/khaledhussein957/epos-system.git
cd "epos-system"

cd backend && bun install
cd ../mobile && bun install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Fill `.env` with your values. Required:

- `DATABASE_URL` — Postgres connection string.
- `JWT_SECRET` — long random string (e.g. `openssl rand -base64 48`).
- `CLOUDINARY_*` — from your Cloudinary dashboard.
- `SMTP_EMAIL` / `SMTP_PASSWORD` — for password reset emails.
- `STRIPE_SECRET_KEY`, `MERCHANT_UID`, `API_USER_ID`, `API_KEY`, `WAAFIPAY_URL` — only if you're enabling payments.

### 3. Set up the database

For a fresh database:

```bash
bun run db:migrate     # applies drizzle/0000_windy_wong.sql
```

For an existing dev database with `text`-typed prices, see `backend/drizzle/README.md` for the one-shot `ALTER … USING` SQL.

For day-to-day dev, after editing models in `src/models/`:

```bash
bun run db:generate    # emit a new migration file
bun run db:migrate     # apply it
```

`bun run db:push` is still available for quick prototyping (skips the migration file).

### 4. Run the backend

```bash
bun run dev            # auto-reload via bun --watch
```

The server listens on `PORT` (default `7711`). `GET /health` returns `{ status: "ok" }`.

### 5. Configure the mobile app

```bash
cd ../mobile
cp .env.local.example .env.local 2>/dev/null || true
```

`.env.local`:

```
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:7711/api
```

> Use your machine's LAN IP, not `localhost` — the device/simulator can't reach the loopback on your dev machine. In production, this must be HTTPS.

### 6. Run the mobile app

```bash
bun run start          # opens the Expo dev menu
bun run android        # build & run on Android
bun run ios            # build & run on iOS
```

Or scan the QR code with the Expo Go app.

## API surface

| Method | Path                              | Auth   | Description                              |
| ------ | --------------------------------- | ------ | ---------------------------------------- |
| POST   | `/api/auth/register`              | public | Create account, returns access + refresh |
| POST   | `/api/auth/login`                 | public | Sign in, returns access + refresh        |
| POST   | `/api/auth/refresh`               | public | Rotate refresh, returns new pair         |
| POST   | `/api/auth/logout`                | public | Revoke a refresh token                   |
| POST   | `/api/auth/request-password-reset`| public | Email a 6-digit reset code               |
| POST   | `/api/auth/reset-password`        | public | Use the code to set a new password       |
| GET    | `/api/users`                      | admin  | List users                               |
| PUT    | `/api/users/update-profile`       | user   | Update own profile                       |
| PUT    | `/api/users/profile-image`        | user   | Upload profile image                     |
| PUT    | `/api/users/change-password`      | user   | Change password (knows old one)          |
| PUT    | `/api/users/toggle-block-user/:id`| admin  | Block/unblock a user                     |
| DELETE | `/api/users/delete-user/:id`      | admin  | Delete a user                            |
| GET    | `/api/categories`                 | public | List categories                          |
| POST   | `/api/categories`                 | admin  | Create category (multipart, `categoryImage`) |
| PUT    | `/api/categories/:id`             | admin  | Update category                          |
| DELETE | `/api/categories/:id`             | admin  | Delete category (password-confirmed)     |
| GET    | `/api/products`                   | public | List products with category             |
| GET    | `/api/products/:id`               | public | Get one product                          |
| POST   | `/api/products`                   | admin  | Create product (multipart, `productImage`) |
| PUT    | `/api/products/:id`               | admin  | Update product                           |
| PUT    | `/api/products/product-image/:id` | admin  | Replace product image                    |
| DELETE | `/api/products/:id`               | admin  | Delete product (password-confirmed)      |
| GET    | `/api/orders/`                    | admin  | List all orders                          |
| GET    | `/api/orders/my-orders`           | user   | List the caller's orders                 |
| POST   | `/api/orders`                     | user   | Create an order + receipt                |
| GET    | `/api/dashboard`                  | admin  | Aggregate stats for admin home           |

## Database schema (key tables)

- **users** — accounts, role, block flag, last login, password reset state.
- **refresh_tokens** — `token_hash`, `expires_at`, `revoked_at`, indexed on `user_id` and `token_hash`.
- **categories** — name, image, public id.
- **products** — name, description, FK `category_id`, `price numeric(12,2)`, `stock integer`, `is_active`, image url + public id, qr code.
- **orders** — FKs `user_id` and `customer_id`, `total numeric(12,2)`, `payment_method` enum.
- **order_items** — FKs `order_id` and `product_id`, `quantity integer`, `price numeric(12,2)` (snapshot at order time).
- **customers** — name, phone (unique), email (unique).
- **payments** — FKs `user_id` and `order_id`, status enum, amount, phone, transaction id.

Migrations live in `backend/drizzle/`.

## Scripts

### Backend (`backend/package.json`)

| Script            | Purpose                                |
| ----------------- | -------------------------------------- |
| `bun run dev`     | Run with auto-reload                   |
| `bun run start`   | Run once (no watch)                    |
| `bun run db:push` | Push schema directly (dev only)        |
| `bun run db:generate` | Emit a new migration from schema diff |
| `bun run db:migrate`  | Apply pending migrations            |

### Mobile (`mobile/package.json`)

| Script               | Purpose                          |
| -------------------- | -------------------------------- |
| `bun run start`      | Expo dev server                  |
| `bun run android`    | Build & run on Android           |
| `bun run ios`        | Build & run on iOS               |
| `bun run web`        | Run as a web app                 |
| `bun run lint`       | ESLint                           |
| `bun run lint:fix`   | ESLint with `--fix`              |

## Testing the auth flow locally

1. `POST /api/auth/register` with name/email/phone/password → response includes `token` (access) + `refreshToken`.
2. Use the access token as `Authorization: Bearer <token>` on protected routes.
3. After 15 minutes, calls return 401. On mobile, the axios interceptor silently hits `/auth/refresh` with the stored refresh token, rotates it, and retries the original call.
4. `POST /api/auth/logout` with `{ refreshToken }` invalidates that token server-side.

## Project conventions

- Errors thrown from services use `AppError(message, status)` from `src/utils/AppError.ts`. Controllers translate them to JSON responses.
- File uploads use Multer + Cloudinary. Local temp files are deleted in `try/finally` even on upload failure.
- Money is `numeric(12, 2)` everywhere. Quantities and stock are `integer`. Avoid the old `.toString()` dance.
- Mobile error UX: toasts for transient errors, `Alert.alert` only for destructive confirmations.
- All admin-only routes do the role check in the controller, not just the service, so removing the service guard can't silently expose them.

## Known limitations / not yet done

- No automated tests (Jest / Detox).
- No structured logging (Winston / Pino) — `console.log` only.
- No crash reporting (Sentry).
- No `eas.json` for production builds — `EXPO_PUBLIC_API_URL` must be HTTPS in production but isn't enforced at build time.
- No i18n; UI copy is hardcoded English.

## Contributing

Open a branch off `main`, keep commits focused, run `bunx tsc --noEmit` in both `backend/` and `mobile/` before pushing. PRs land via squash-merge.

## Author

**Khalid Hussein**
GitHub: [@khaledhussein957](https://github.com/khaledhussein957)

## License

Private. All rights reserved.

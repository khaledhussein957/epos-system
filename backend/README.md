# EPOS System Backend

A robust and scalable backend for an Electronic Point of Sale (EPOS) system, built with Node.js, Express, TypeScript, and Bun.

## 🚀 Key Features

- **Authentication & Authorization**: Secure JWT-based authentication with password hashing using bcrypt.
- **User Management**: Comprehensive CRUD for users, including profile management and image uploads.
- **Product & Category Management**: Dynamic system for managing inventory with image uploads to Cloudinary.
- **Order & Transaction Processing**: Robust, atomic transaction flow with real-time stock validation and management.
- **Customer Management**: Automatic tracking and registration of customer records during checkout.
- **Database Architecture**: High-performance PostgreSQL database managed via Drizzle ORM.
- **Reliable Validation**: Request bodies and parameters validated using Zod.
- **Payment Processing**: Full integration with Stripe (card payments) and WaafiPay (mobile & bank payments).
- **File Storage**: Seamless integration with Cloudinary for product and profile images.
- **Email Service**: Automated email notifications using Nodemailer (SMTP).
- **PDF Receipts & QR Generation**: Built-in support for generating detailed transaction receipts (PDF) and QR codes.

## 🛠️ Technology Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Express.js](https://expressjs.com/) (v5.2.1)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on Neon)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Auth**: [JSON Web Tokens (JWT)](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Payments**: Stripe SDK & Axios (for WaafiPay integration)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Documentation**: README.md

## 📂 Project Structure

```text
backend/
├── src/
│   ├── config/         # Environment and Database configuration
│   ├── controllers/    # Request handlers (Business logic)
│   ├── emails/         # Email templates
│   ├── middlewares/    # Custom middlewares (Auth, Error handling)
│   ├── models/         # Drizzle schema and model definitions
│   ├── routes/         # API route definitions
│   ├── services/       # Modular business logic services
│   ├── uploads/        # Local temporary storage for uploads
│   ├── utils/          # Helper functions and utilities
│   ├── validations/    # Zod validation schemas
│   └── server.ts       # Express application setup
├── index.ts            # Entry point
├── drizzle.config.ts   # Drizzle ORM configuration
├── package.json        # Dependencies and scripts/
└── .env                # Environment variables (Internal only)
```

## ⚙️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/docs/installation) installed on your machine.
- A PostgreSQL database (e.g., [Neon.tech](https://neon.tech/)).
- A [Cloudinary](https://cloudinary.com/) account for image uploads.

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Fill in your credentials for Database, JWT, Cloudinary, and SMTP.

4. **Initialize Database**:
   Push the schema to your PostgreSQL instance:
   ```bash
   bun run db:push
   ```

### Running the Server

- **Development Mode** (with hot-reload):
  ```bash
  bun run dev
  ```
- **Production Mode**:
  ```bash
  bun run start
  ```

## 🛤️ API Reference

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint                  | Description                    |
| :----- | :------------------------ | :----------------------------- |
| POST   | `/register`               | Register a new account         |
| POST   | `/login`                  | Login and receive JWT          |
| POST   | `/request-password-reset` | Request a password reset email |
| POST   | `/reset-password`         | Reset password using a token   |

### 👤 User Management (`/api/users`)

| Method | Endpoint           | Description                       | Auth Required |
| :----- | :----------------- | :-------------------------------- | :------------ |
| GET    | `/`                | Get all users (Admin only)        | ✅            |
| PUT    | `/update-profile`  | Update current user profile       | ✅            |
| PUT    | `/profile-image`   | Upload profile image              | ✅            |
| PUT    | `/change-password` | Change current password           | ✅            |
| DELETE | `/delete-account`  | Deactivate/delete current account | ✅            |

### 📦 Product Management (`/api/products`)

| Method | Endpoint             | Description                 | Auth Required |
| :----- | :------------------- | :-------------------------- | :------------ |
| GET    | `/`                  | List all products           | ❌            |
| GET    | `/:id`               | Get product details by ID   | ❌            |
| POST   | `/`                  | Create a new product        | ✅            |
| PUT    | `/:id`               | Update product details      | ✅            |
| PUT    | `/product-image/:id` | Upload/update product image | ✅            |
| DELETE | `/:id`               | Delete a product            | ✅            |

### 📁 Category Management (`/api/categories`)

| Method | Endpoint | Description           | Auth Required |
| :----- | :------- | :-------------------- | :------------ |
| GET    | `/`      | List all categories   | ❌            |
| POST   | `/`      | Create a new category | ✅            |
| PUT    | `/:id`   | Update category       | ✅            |
| DELETE | `/:id`   | Delete category       | ✅            |

### 🛒 Order & Transaction Management (`/api/orders`)

| Method | Endpoint | Description                             | Auth Required |
| :----- | :------- | :-------------------------------------- | :------------ |
| POST   | `/`      | Create a new order and generate receipt | ✅            |

#### **Postman Testing Examples (POST `/api/orders/`)**

You can selectively provide `customer_id`, `customer_info`, or neither depending on if this is an anonymous walk-in, a returning customer, or a new customer.

**1. Using an Existing Customer ID (Card Payment)**

```json
{
  "customer_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_method": "card",
  "items": [
    {
      "product_id": "111e8400-e29b-41d4-a716-446655440000",
      "quantity": 2
    },
    {
      "product_id": "222e8400-e29b-41d4-a716-446655440000",
      "quantity": 1
    }
  ]
}
```

**2. Creating a New Customer or Linking by Phone/Email (Card Payment)**

```json
{
  "customer_info": {
    "name": "Khalid Hussein",
    "phone": "252616850294",
    "email": "khalidhusseinsayid@gamil.com"
  },
  "payment_method": "card",
  "items": [
    {
      "product_id": "111e8400-e29b-41d4-a716-446655440000",
      "quantity": 1
    }
  ]
}
```

**3. Mobile Payment (Requires `payment_account`)**

```json
{
  "customer_info": {
    "name": "Khalid Hussein",
    "phone": "252616850294",
    "email": "khalidhusseinsayid@gamil.com"
  },
  "payment_method": "mobile",
  "payment_account": "252612345678",
  "items": [
    {
      "product_id": "111e8400-e29b-41d4-a716-446655440000",
      "quantity": 3
    }
  ]
}
```

**4. Anonymous Walk-in Customer (Cash Payment)**

> _Note: Both `customer_id` and `customer_info` are completely optional. Leaving them empty works perfectly for quick walk-in cash payments where no customer data is collected._

```json
{
  "payment_method": "cash",
  "items": [
    {
      "product_id": "111e8400-e29b-41d4-a716-446655440000",
      "quantity": 1
    }
  ]
}
```

## 📜 Available Scripts

- `bun dev`: Runs the server with watch mode enabled.
- `bun start`: Starts the production server.
- `bun build`: Installs project dependencies.
- `bun db:push`: Synchronizes the Drizzle schema with the database.

## 🔒 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by Khalid Hussein

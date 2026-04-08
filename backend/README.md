# EPOS System Backend

A robust and scalable backend for an Electronic Point of Sale (EPOS) system, built with Node.js, Express, TypeScript, and Bun.

## 🚀 Key Features

- **Authentication & Authorization**: Secure JWT-based authentication with password hashing using bcrypt.
- **User Management**: Comprehensive CRUD for users, including profile management and image uploads.
- **Product & Category Management**: Dynamic system for managing inventory with image uploads to Cloudinary.
- **Database Architecture**: High-performance PostgreSQL database managed via Drizzle ORM.
- **Reliable Validation**: Request bodies and parameters validated using Zod.
- **File Storage**: Seamless integration with Cloudinary for product and profile images.
- **Email Service**: Automated email notifications using Nodemailer (SMTP).
- **PDF & QR Generation**: Built-in support for generating invoices (PDF) and QR codes.

## 🛠️ Technology Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Express.js](https://expressjs.com/) (v5.2.1)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on Neon)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Auth**: [JSON Web Tokens (JWT)](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
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

## 📜 Available Scripts

- `bun dev`: Runs the server with watch mode enabled.
- `bun start`: Starts the production server.
- `bun build`: Installs project dependencies.
- `bun db:push`: Synchronizes the Drizzle schema with the database.

## 🔒 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by Khalid Hussein

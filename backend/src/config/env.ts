import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const ENV = {
  PORT: process.env.PORT || "3000",
  DATABASE_URL: process.env.DATABASE_URL || "",

  NODE_ENV: process.env.NODE_ENV || "development",

  JWT_SECRET:
    process.env.JWT_SECRET ||
    (() => {
      if (process.env.NODE_ENV === "production") {
        throw new Error("JWT_SECRET must be set in production");
      }
      return "dev_jwt_secret_not_for_production";
    })(),

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  SMTP_EMAIL: process.env.SMTP_EMAIL || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",

  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    (() => {
      if (process.env.NODE_ENV === "production") {
        throw new Error("CORS_ORIGIN must be set in production");
      }
      return "http://localhost:3000";
    })(),

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",

  MERCHANT_UID: process.env.MERCHANT_UID || "",
  API_USER_ID: process.env.API_USER_ID || "",
  API_KEY: process.env.API_KEY || "",

  WAAFIPAY_URL: process.env.WAAFIPAY_URL || "",
};

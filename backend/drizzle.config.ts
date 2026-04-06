import { defineConfig } from "drizzle-kit";
import { ENV } from "./src/config/env";

if (!ENV.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  schema: "./src/models",
  dialect: "postgresql",
  dbCredentials: {
    url: ENV.DATABASE_URL,
  },
});

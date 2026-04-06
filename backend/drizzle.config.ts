import { defineConfig } from "drizzle-kit";
import { ENV } from "./src/config/env";

export default defineConfig({
  schema: "./src/models",
  dialect: "postgresql",
  dbCredentials: {
    url: ENV.DATABASE_URL!,
  },
});
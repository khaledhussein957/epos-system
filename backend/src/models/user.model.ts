import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const UserRole = pgEnum("user_role", ["admin", "cashier", "customer"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  role: UserRole("role").notNull(),

  profilePicture: text("profile_picture"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

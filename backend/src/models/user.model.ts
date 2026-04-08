import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const UserRole = pgEnum("user_role", ["admin", "cashier", "customer"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  role: UserRole("role").notNull(),

  profilePicture: text("profile_picture"),
  profilePublicId: text("profile_public_id"),

  isBlock: boolean("is_block").default(false).notNull(),
  lastLogin: timestamp("last_login"),

  resetPasswordCode: text("reset_password_code"),
  resetPasswordCodeExpiry: timestamp("reset_password_code_expiry"),

  resetPasswordEmailCount: integer("reset_password_email_count").default(0).notNull(),  resetPasswordLastSent: timestamp("reset_password_last_sent"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

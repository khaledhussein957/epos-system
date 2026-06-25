import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./user.model";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    token_hash: text("token_hash").notNull().unique(),

    expires_at: timestamp("expires_at").notNull(),
    revoked_at: timestamp("revoked_at"),

    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("refresh_tokens_user_id_idx").on(table.user_id),
    tokenHashIdx: index("refresh_tokens_token_hash_idx").on(table.token_hash),
  }),
);

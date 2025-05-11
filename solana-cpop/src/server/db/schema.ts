import { sql } from "drizzle-orm";
import {
  index,
  integer,
  json,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM.
 * Use the same database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `solana-cpop_${name}`);

export const users = createTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  walletAddress: varchar("wallet_address", { length: 44 }),
  role: text("role").default("user").notNull(),
});

export const accounts = createTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = createTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// CPOP specific tables

export const events = createTable("event", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creatorWallet: varchar("creator_wallet", { length: 44 }).notNull(),
  eventName: varchar("event_name", { length: 100 }).notNull(),
  tokenName: varchar("token_name", { length: 100 }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 10 }).notNull(),
  description: text("description"),
  maxSupply: integer("max_supply").notNull(),
  claimedCount: integer("claimed_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  eventUri: text("event_uri").notNull(),
  tokenUri: text("token_uri").notNull(),
  merkleRoot: text("merkle_root").default(""),
  merkleTreeAddress: varchar("merkle_tree_address", { length: 44 }),
  onChainInitialized: boolean("on_chain_initialized").default(false).notNull(),
  lastTransactionSignature: varchar("last_transaction_signature", { length: 88 }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const claimedTokens = createTable("claimed_token", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  claimerWallet: varchar("claimer_wallet", { length: 44 }).notNull(),
  tokenId: integer("token_id").notNull(),
  leafIndex: integer("leaf_index"),
  leafHash: text("leaf_hash").notNull(),
  claimTime: timestamp("claim_time").notNull(),
  transactionSignature: varchar("transaction_signature", { length: 88 }),
  verified: boolean("verified").default(false).notNull(),
  qrCodeId: uuid("qr_code_id")
    .references(() => qrCodes.id),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});



export const qrCodes = createTable("qr_code", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  qrCodeId: varchar("qr_code_id", { length: 100 }).notNull(),
  secretKey: text("secret_key").notNull(),
  expirationTime: integer("expiration_time").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  claimedBy: text("claimed_by")
    .references(() => users.id),
  claimedAt: timestamp("claimed_at", { mode: "date" }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

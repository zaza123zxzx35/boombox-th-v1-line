import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Metadata for files stored in Manus S3-compatible storage. The bytes stay in storage; the DB stores references only. */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  fileKey: varchar("fileKey", { length: 512 }).notNull().unique(),
  url: varchar("url", { length: 1024 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  contentType: varchar("contentType", { length: 128 }).notNull(),
  category: mysqlEnum("category", ["product", "banner", "flavor", "other"]).default("other").notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  altText: varchar("altText", { length: 255 }),
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  catalogId: varchar("catalogId", { length: 64 }).notNull().unique(),
  kind: mysqlEnum("kind", ["package", "refill"]).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(),
  compareAt: int("compareAt"),
  stock: int("stock").default(0).notNull(),
  imageAssetId: int("imageAssetId"),
  /** JSON object mapping color ids (e.g. black, white) to asset ids. */
  colorImages: text("colorImages"),
  active: int("active").default(1).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductRecord = typeof products.$inferSelect;
export type InsertProductRecord = typeof products.$inferInsert;

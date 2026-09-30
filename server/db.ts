import { desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { assets, InsertAsset, InsertProductRecord, InsertUser, products, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listAssets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assets).orderBy(desc(assets.createdAt));
}

export async function createAsset(asset: InsertAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(assets).values(asset);
  const created = await db.select().from(assets).where(eq(assets.id, result[0].insertId)).limit(1);
  return created[0];
}

export async function updateAsset(id: number, updates: Partial<Pick<InsertAsset, "fileKey" | "url" | "originalName" | "contentType" | "category" | "sizeBytes" | "altText">>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(assets).set(updates).where(eq(assets.id, id));
  const rows = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  return rows[0];
}

export async function listAssetsByCategory(category?: "product" | "banner" | "flavor" | "other") {
  const db = await getDb();
  if (!db) return [];
  const rows = category ? await db.select().from(assets).where(eq(assets.category, category)) : await db.select().from(assets);
  return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function listProducts(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ product: products, assetUrl: assets.url, assetAltText: assets.altText })
    .from(products)
    .leftJoin(assets, eq(products.imageAssetId, assets.id));
  const colorAssetIds = Array.from(new Set(rows.flatMap(({ product }) => {
    if (!product.colorImages) return [];
    try {
      return Object.values(JSON.parse(product.colorImages) as Record<string, number>).filter((id): id is number => Number.isInteger(id) && id > 0);
    } catch {
      return [];
    }
  })));
  const colorRows = colorAssetIds.length ? await db.select({ id: assets.id, url: assets.url, altText: assets.altText }).from(assets).where(inArray(assets.id, colorAssetIds)) : [];
  const colorAssets = new Map(colorRows.map((asset) => [asset.id, asset]));
  return (includeInactive ? rows : rows.filter(({ product }) => product.active === 1))
    .map((row) => {
      const colorImages: Record<string, { url: string; altText: string | null }> = {};
      if (row.product.colorImages) {
        try {
          for (const [colorId, assetId] of Object.entries(JSON.parse(row.product.colorImages) as Record<string, number>)) {
            const asset = colorAssets.get(assetId);
            if (asset) colorImages[colorId] = { url: asset.url, altText: asset.altText };
          }
        } catch { /* Keep malformed legacy mappings from breaking the catalog. */ }
      }
      return { ...row, colorImages };
    })
    .sort((a, b) => a.product.kind.localeCompare(b.product.kind) || a.product.id - b.product.id);
}

export async function updateProduct(catalogId: string, updates: Partial<Pick<InsertProductRecord, "name" | "description" | "price" | "compareAt" | "stock" | "imageAssetId" | "colorImages" | "active">>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(products).set(updates).where(eq(products.catalogId, catalogId));
  const rows = await listProducts(true);
  return rows.find(({ product }) => product.catalogId === catalogId);
}

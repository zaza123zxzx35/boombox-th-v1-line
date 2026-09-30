import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createAsset, listAssetsByCategory, listProducts, updateAsset, updateProduct } from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  assets: router({
    list: adminProcedure.input(z.object({ category: z.enum(["product", "banner", "flavor", "other"]).optional() }).optional()).query(({ input }) => listAssetsByCategory(input?.category)),
    upload: adminProcedure
      .input(z.object({
        fileName: z.string().trim().min(1).max(255),
        contentType: z.string().trim().min(1).max(128),
        dataBase64: z.string().min(1).max(12_000_000),
        altText: z.string().trim().max(255).optional(),
        category: z.enum(["product", "banner", "flavor", "other"]).default("other"),
      }))
      .mutation(async ({ input, ctx }) => {
        const [, encodedData = input.dataBase64] = input.dataBase64.split(",", 2);
        const data = Buffer.from(encodedData, "base64");
        if (data.length === 0 || data.length > 8 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "ไฟล์ต้องมีขนาดไม่เกิน 8 MB" });
        }
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "asset";
        const { key, url } = await storagePut(`boombox-assets/${Date.now()}-${safeName}`, data, input.contentType);
        return createAsset({
          fileKey: key,
          url,
          originalName: input.fileName,
          contentType: input.contentType,
          category: input.category,
          sizeBytes: data.length,
          altText: input.altText || null,
          uploadedBy: ctx.user.id,
        });
      }),
    update: adminProcedure.input(z.object({
      id: z.number().int().positive(),
      category: z.enum(["product", "banner", "flavor", "other"]).optional(),
      altText: z.string().trim().max(255).nullable().optional(),
      fileName: z.string().trim().min(1).max(255).optional(),
      contentType: z.string().trim().min(1).max(128).optional(),
      dataBase64: z.string().min(1).max(12_000_000).optional(),
    })).mutation(async ({ input }) => {
      const updates: Parameters<typeof updateAsset>[1] = {};
      if (input.category !== undefined) updates.category = input.category;
      if (input.altText !== undefined) updates.altText = input.altText || null;
      if (input.dataBase64) {
        if (!input.fileName || !input.contentType) throw new TRPCError({ code: "BAD_REQUEST", message: "กรุณาระบุชื่อไฟล์และชนิดไฟล์เมื่อเปลี่ยนรูป" });
        const [, encodedData = input.dataBase64] = input.dataBase64.split(",", 2);
        const data = Buffer.from(encodedData, "base64");
        if (data.length === 0 || data.length > 8 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "ไฟล์ต้องมีขนาดไม่เกิน 8 MB" });
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "asset";
        const { key, url } = await storagePut(`boombox-assets/${Date.now()}-${safeName}`, data, input.contentType);
        updates.fileKey = key;
        updates.url = url;
        updates.originalName = input.fileName;
        updates.contentType = input.contentType;
        updates.sizeBytes = data.length;
      }
      if (!Object.keys(updates).length) throw new TRPCError({ code: "BAD_REQUEST", message: "ไม่มีข้อมูลสำหรับแก้ไข" });
      return updateAsset(input.id, updates);
    }),
    setCategory: adminProcedure.input(z.object({ id: z.number().int().positive(), category: z.enum(["product", "banner", "flavor", "other"]) })).mutation(async ({ input }) => {
      const db = await import("./db").then((module) => module.getDb());
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      const { assets } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await db.update(assets).set({ category: input.category }).where(eq(assets.id, input.id));
      return { success: true } as const;
    }),
  }),

  catalog: router({
    list: publicProcedure.query(() => listProducts(false)),
  }),

  products: router({
    list: adminProcedure.query(() => listProducts(true)),
    update: adminProcedure.input(z.object({
      catalogId: z.string().min(1),
      name: z.string().trim().min(1).max(160).optional(),
      description: z.string().trim().min(1).max(1000).optional(),
      price: z.number().int().min(0).max(1_000_000).optional(),
      compareAt: z.number().int().min(0).max(1_000_000).nullable().optional(),
      stock: z.number().int().min(0).max(1_000_000).optional(),
      imageAssetId: z.number().int().positive().nullable().optional(),
      colorImages: z.string().max(2000).nullable().optional(),
      active: z.number().int().min(0).max(1).optional(),
    })).mutation(({ input }) => {
      const { catalogId, ...updates } = input;
      return updateProduct(catalogId, updates);
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;

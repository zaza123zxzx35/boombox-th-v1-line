import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("assets admin procedures", () => {
  it("rejects asset listing without an authenticated admin", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.assets.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects uploads without an authenticated admin", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.assets.upload({
      fileName: "test.png",
      contentType: "image/png",
      dataBase64: "data:image/png;base64,AA==",
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects asset edits without an authenticated admin", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.assets.update({ id: 1, altText: "new" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects product management without an authenticated admin", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.products.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

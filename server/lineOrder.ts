import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";

export type LineOrderInput = {
  items: Array<{
    name: string;
    count: number;
    price: number;
    color?: string;
    flavors?: string;
  }>;
  gifts: string[];
  subtotal: number;
  discount: number;
  total: number;
  note?: string;
  promotion?: string;
};

function formatBaht(value: number) {
  return `฿${value.toLocaleString("th-TH")}`;
}

export async function sendOrderToLine(input: LineOrderInput) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  const destination = process.env.LINE_DESTINATION_USER_ID?.trim();
  if (!token || !destination) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "ร้านยังไม่ได้ตั้งค่า LINE OA สำหรับรับออเดอร์อัตโนมัติ",
    });
  }

  const orderId = `BB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const lines = [
    `🛍️ ออเดอร์ใหม่ ${orderId}`,
    `เวลา: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`,
    "",
    "รายการสินค้า",
    ...input.items.flatMap((item) => [
      `• ${item.name} x${item.count} = ${formatBaht(item.price * item.count)}`,
      ...(item.color ? [`  🎨 สี: ${item.color}`] : []),
      ...(item.flavors ? [`  🌈 กลิ่น: ${item.flavors}`] : []),
    ]),
    ...(input.gifts.length ? ["", `🎁 ของแถม: ${input.gifts.join(", ")}`] : []),
    "",
    `ยอดสินค้า: ${formatBaht(input.subtotal)}`,
    ...(input.discount ? [`ส่วนลด: -${formatBaht(input.discount)}`] : []),
    `ยอดสุทธิ: ${formatBaht(input.total)}`,
    ...(input.promotion ? [`โปรโมชั่น: ${input.promotion}`] : []),
    ...(input.note ? [`📝 หมายเหตุ: ${input.note}`] : []),
    "",
    "สถานะ: รอติดต่อยืนยันออเดอร์กับลูกค้า",
  ];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ to: destination, messages: [{ type: "text", text: lines.join("\n") }] }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[LINE OA] push failed", response.status, detail);
      throw new TRPCError({ code: "BAD_GATEWAY", message: "ส่งออเดอร์เข้า LINE OA ไม่สำเร็จ กรุณาลองใหม่" });
    }
    return { orderId };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    console.error("[LINE OA] push error", error);
    throw new TRPCError({ code: "BAD_GATEWAY", message: "เชื่อมต่อ LINE OA ไม่สำเร็จ กรุณาลองใหม่" });
  } finally {
    clearTimeout(timeout);
  }
}

import { describe, expect, it } from "vitest";
import { formatFlavorSelections, packages, refills, CartItem } from "@/data/catalog";
import { calculatePromotion, getGiftItems, getRefillCount } from "@/lib/cart";

function item(product: typeof refills[number], count = 1): CartItem {
  return { ...product, count, cartKey: `${product.id}:test` };
}

describe("BoomBox promotion rules", () => {
  it("formats repeated flavor selections as grouped quantities", () => {
    expect(formatFlavorSelections(["มิ้นท์", "มิ้นท์", "สตรอว์เบอร์รี่", "สตรอว์เบอร์รี่", "สตรอว์เบอร์รี่"])).toBe("มิ้นท์ x2, สตรอว์เบอร์รี่ x3");
  });

  it("counts refill quantities and gives one 100-bead gift at three refills", () => {
    const cart = [item(refills[0], 3)];
    expect(getRefillCount(cart)).toBe(3);
    expect(getGiftItems(3)).toEqual([{ id: "gift-refill-100-1", name: "รีฟิล 100 เม็ด (ของแถม)", quantity: "1 ซอง · 100 เม็ด/ซอง", reason: "โปร 3 แถม 1" }]);
    expect(calculatePromotion(cart, false, 0).freeBeads).toBe(1);
  });

  it("gives two 100-bead gifts at five refills", () => {
    const result = calculatePromotion([item(refills[0], 5)], false, 0);
    expect(result.freeBeads).toBe(2);
    expect(result.giftItems[0].quantity).toContain("2 ซอง");
    expect(result.promoLabel).toContain("โปร 5 แถม 2");
  });

  it("does not combine COMEBACK with refill gifts", () => {
    const result = calculatePromotion([item(refills[0], 3)], true, 80);
    expect(result.comebackEligible).toBe(false);
    expect(result.effectiveDiscount).toBe(0);
    expect(result.cartTotal).toBe(207);
  });

  it("allows COMEBACK at subtotal 200 or above", () => {
    const result = calculatePromotion([item(refills[0], 3), item(refills[1], 1)], true, 80);
    expect(result.subtotal).toBe(326);
    expect(result.comebackEligible).toBe(false); // refill gift priority still wins
    const packageResult = calculatePromotion([{ ...packages[0], count: 1, cartKey: "starter:test" }], true, 80);
    expect(packageResult.subtotal).toBe(299);
    expect(packageResult.comebackEligible).toBe(true);
    expect(packageResult.cartTotal).toBe(219);
  });

  it("does not allow COMEBACK below the 200-baht threshold", () => {
    const result = calculatePromotion([item(refills[0], 1)], true, 80);
    expect(result.subtotal).toBe(69);
    expect(result.comebackEligible).toBe(false);
    expect(result.effectiveDiscount).toBe(0);
    expect(result.cartTotal).toBe(69);
  });

  it("keeps gift rows separate and free from the paid subtotal", () => {
    const result = calculatePromotion([item(refills[0], 5)], false, 0);
    expect(result.giftItems).toHaveLength(1);
    expect(result.giftItems[0].name).toContain("ของแถม");
    expect(result.cartTotal).toBe(345);
  });
});

import { CartItem } from "@/data/catalog";

export type GiftItem = {
  id: string;
  name: string;
  quantity: string;
  reason: string;
};

export function getRefillCount(cart: CartItem[]) {
  return cart.filter((item) => item.kind === "refill").reduce((total, item) => total + item.count, 0);
}

export function getGiftItems(refillCount: number): GiftItem[] {
  const giftCount = refillCount >= 5 ? 2 : refillCount >= 3 ? 1 : 0;
  return giftCount ? [{ id: `gift-refill-100-${giftCount}`, name: "รีฟิล 100 เม็ด (ของแถม)", quantity: `${giftCount} ซอง · 100 เม็ด/ซอง`, reason: refillCount >= 5 ? "โปร 5 แถม 2" : "โปร 3 แถม 1" }] : [];
}

export function calculatePromotion(cart: CartItem[], promoApplied: boolean, discount: number) {
  const subtotal = cart.reduce((total, item) => total + item.price * item.count, 0);
  const refillCount = getRefillCount(cart);
  const giftItems = getGiftItems(refillCount);
  const freeBeads = giftItems.length ? (refillCount >= 5 ? 2 : 1) : 0;
  const beadPromoLabel = freeBeads === 2 ? "🎁 โปร 5 แถม 2: แถม 100 เม็ด 2 ซอง ฟรี!" : freeBeads === 1 ? "🎁 โปร 3 แถม 1: แถม 100 เม็ด 1 ซอง ฟรี!" : "";
  const comebackEligible = promoApplied && subtotal >= 200 && freeBeads === 0;
  const promoLabel = beadPromoLabel || (comebackEligible ? "🎫 โค้ด COMEBACK: ลด 80 บาท!" : "");
  const effectiveDiscount = comebackEligible ? discount : 0;
  return { subtotal, refillCount, freeBeads, giftItems, beadPromoLabel, comebackEligible, promoLabel, effectiveDiscount, cartTotal: Math.max(0, subtotal - effectiveDiscount) };
}

import { Drawer } from "vaul";
import { ArrowUp, ArrowUpRight, Check, CircleHelp, Clipboard, Gift, Minus, Pencil, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice, groupFlavorSelections, CartItem, Product } from "@/data/catalog";
import { GiftItem } from "@/lib/cart";
import { ProductArt } from "@/components/ProductCard";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  giftItems: GiftItem[];
  cartCount: number;
  cartTotal: number;
  refillBeads: number;
  freeShippingThreshold: number;
  recommendedProducts: Product[];
  onRecommendedAdd: (product: Product) => void;
  discount: number;
  promoLabel: string;
  promoInput: string;
  onPromoInputChange: (value: string) => void;
  onApplyPromo: () => void;
  orderNote: string;
  onOrderNoteChange: (value: string) => void;
  copied: boolean;
  onCopyOrder: () => void;
  orderPreview: string;
  onLineOrder: () => void | Promise<void>;
  onUpdateCount: (id: string, delta: number) => void;
  onEdit: (item: CartItem) => void;
  onRemove: (id: string) => void;
  onBrowse: () => void;
};

export function CartDrawer({ open, onOpenChange, cart, giftItems, cartCount, cartTotal, refillBeads, freeShippingThreshold, recommendedProducts, onRecommendedAdd, discount, promoLabel, promoInput, onPromoInputChange, onApplyPromo, orderNote, onOrderNoteChange, copied, onCopyOrder, orderPreview, onLineOrder, onUpdateCount, onEdit, onRemove, onBrowse }: Props) {
  const [linePreviewOpen, setLinePreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideSeen, setGuideSeen] = useState(() => localStorage.getItem("boombox-order-guide-seen") === "1");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open && cart.length > 0 && !guideSeen) {
      setGuideOpen(true);
      setGuideSeen(true);
      localStorage.setItem("boombox-order-guide-seen", "1");
    }
  }, [open, cart.length, guideSeen]);
  function openGuide() { setGuideOpen(true); }
  return <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
    <Drawer.Portal>
      <Drawer.Overlay className="drawer-overlay" />
      <Drawer.Content className="cart-drawer">
        <div className="drawer-handle" />
        <div className="drawer-header">
          <div><Drawer.Title>รายการที่เลือก</Drawer.Title><Drawer.Description>{cartCount ? `${cartCount} ชิ้น · ตรวจสอบก่อนส่ง` : "ยังไม่มีสินค้า"}</Drawer.Description></div>
          <Drawer.Close asChild><button className="icon-button" type="button" aria-label="ปิดถุง"><X size={18} /></button></Drawer.Close>
        </div>
        {cart.length ? <>
          <div className="drawer-quick-actions">
            <div className="drawer-quick-total"><span>ยอดที่ต้องชำระ</span><strong>฿{formatPrice(cartTotal)}</strong></div>
            <div className={`free-shipping-meter${refillBeads >= freeShippingThreshold ? " is-complete" : ""}`}><div className="free-shipping-copy"><span>{refillBeads >= freeShippingThreshold ? "ส่งฟรีแล้ว · รีฟิลครบ 200 เม็ด" : `เพิ่มรีฟิลอีก ${freeShippingThreshold - refillBeads} เม็ด รับส่งฟรี`}</span><b>{refillBeads}/{freeShippingThreshold} เม็ด</b></div><div className="free-shipping-track"><span style={{ width: `${Math.min(100, Math.round((refillBeads / freeShippingThreshold) * 100))}%` }} /></div></div>
            <div className="drawer-quick-buttons"><button className={`copy-button${copied ? " is-copied" : ""}`} type="button" onClick={onCopyOrder}>{copied ? <Check size={15} /> : <Clipboard size={15} />} {copied ? "คัดลอกแล้ว ✓" : "คัดลอกสรุปยอด"}</button><button className="primary-button full" type="button" onClick={() => setLinePreviewOpen(true)}>ตรวจสอบและส่งเข้า LINE OA <ArrowUpRight size={16} /></button></div>
            <p className="drawer-quick-hint">ตรวจสอบรายการและยอดสุทธิ แล้วกดส่ง — ร้านจะได้รับออเดอร์ใน LINE OA อัตโนมัติ</p>
            {showScrollTop && <button className="drawer-scroll-top" type="button" onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp size={14} /> กลับไปดูยอดรวม</button>}
          </div>
          <button className="order-guide-trigger" type="button" onClick={openGuide}><CircleHelp size={16} /><span><strong>มือใหม่สั่งอย่างไร?</strong><small>เปิดคู่มือ 3 ขั้นตอน</small></span><ArrowUpRight size={14} /></button>
          <div className="drawer-scroll" ref={scrollRef} onScroll={(event) => setShowScrollTop(event.currentTarget.scrollTop > 180)}>
          <div className="drawer-items">
            {cart.map((item) => {
              const itemKey = item.cartKey ?? item.id;
              return <div className="drawer-item" key={itemKey}>
                <ProductArt accent={item.accent} image={item.image} compact />
                <div className="drawer-item-copy"><span>{item.eyebrow}</span><strong>{item.name}</strong><small>฿{formatPrice(item.price)} / ชิ้น</small>{item.selectedColor && <small>สีเครื่อง: {item.selectedColor.name}</small>}{item.selectedFlavors?.length ? <div className="drawer-flavors"><span className="drawer-flavors-label">กลิ่นที่เลือก <em>แตะชิปเพื่อแก้ไข</em></span><div className="drawer-flavor-chips">{groupFlavorSelections(item.selectedFlavors).map(({ name, count }) => <button className="drawer-flavor-chip" key={name} type="button" onClick={() => onEdit(item)} aria-label={`แก้ไขกลิ่น ${name} จำนวน ${count} หน่วย`}><i />{name} <b>×{count}</b><Pencil size={10} /></button>)}</div>{item.maxFlavors && <span className="drawer-flavor-quota">เลือกแล้ว {item.selectedFlavors.length}/{item.maxFlavors} หน่วย</span>}</div> : null}<div className="quantity-control" aria-label={`ปรับจำนวน ${item.name}`}><span className="quantity-label">จำนวน</span><button type="button" onClick={() => onUpdateCount(itemKey, -1)} aria-label={`ลดจำนวน ${item.name}`} title="ลดจำนวน"><Minus size={15} /></button><b aria-live="polite">{item.count}</b><button type="button" onClick={() => onUpdateCount(itemKey, 1)} aria-label={`เพิ่มจำนวน ${item.name}`} title="เพิ่มจำนวน"><Plus size={15} /></button></div>{(item.hasColorOption || item.canChooseFlavor) && <button className="edit-options-button" type="button" onClick={() => onEdit(item)}><Pencil size={12} /> แก้ไขตัวเลือก</button>}</div>
                <button className="remove-item" type="button" onClick={() => onRemove(itemKey)} aria-label={`ลบ ${item.name}`}><Trash2 size={15} /></button>
              </div>;
            })}
            {giftItems.map((gift) => <div className="drawer-item gift-item" key={gift.id}><div className="gift-icon"><Gift size={22} /></div><div className="drawer-item-copy"><span>🎁 ของแถมจากโปรโมชั่น</span><strong>{gift.name}</strong><small>{gift.quantity}</small><small>{gift.reason} · ราคา ฿0</small></div></div>)}
          </div>
          {recommendedProducts.length > 0 && <section className="cart-recommendations" aria-label="สินค้าแนะนำเพื่อเพิ่มในตะกร้า"><div className="cart-recommendations-heading"><strong>เพิ่มให้คุ้มขึ้น</strong><span>รีฟิลที่ลูกค้ามักเลือกเพิ่ม</span></div><div className="cart-recommendation-list">{recommendedProducts.map((product) => <div className="cart-recommendation" key={product.id}><ProductArt accent={product.accent} image={product.image} compact /><div><strong>{product.name}</strong><small>{product.quantity} · ฿{formatPrice(product.price)}</small></div><button type="button" onClick={() => onRecommendedAdd(product)}>เพิ่ม</button></div>)}</div></section>}
          <div className="drawer-summary">
            <div><span>{discount ? "ยอดสุทธิ" : "ยอดรวม"}</span><strong>฿{formatPrice(cartTotal)}</strong></div>
            {promoLabel && <p className="promo-success">{promoLabel}{giftItems.length > 0 && <><br /><small>รายการของแถมแสดงแยกด้านบนแล้ว</small></>}</p>}
            <div className="promo-box"><span>🎫 มีโค้ดส่วนลด?</span><div><input value={promoInput} onChange={(event) => onPromoInputChange(event.target.value)} placeholder="กรอกโค้ด..." aria-label="กรอกโค้ดส่วนลด" /><button type="button" onClick={onApplyPromo}>ใช้โค้ด</button></div></div>
            <label className="order-note-box"><span>📝 หมายเหตุสำหรับออเดอร์</span><textarea value={orderNote} onChange={(event) => onOrderNoteChange(event.target.value)} placeholder="เช่น ขอจัดส่งช่วงบ่าย หรือฝากแจ้งก่อนส่ง" maxLength={240} aria-label="หมายเหตุสำหรับออเดอร์" /><small>{orderNote.length}/240</small></label>
            <p>ส่งฟรีเมื่อมีรีฟิลรวมอย่างน้อย 200 เม็ด · ยืนยันที่อยู่กับร้านใน LINE</p>
          </div>
          </div>
        </> : <div className="drawer-empty"><div className="empty-bag"><ShoppingBag size={28} /></div><strong>เริ่มเลือก mood ของคุณ</strong><span>เพิ่มแพ็กเกจหรือรีฟิลที่อยากลอง แล้วกลับมาดูรายการที่นี่</span><Drawer.Close asChild><button className="primary-button" type="button" onClick={onBrowse}>ดูแพ็กเกจ</button></Drawer.Close></div>}
        {guideOpen && <div className="guide-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGuideOpen(false); }}><section className="guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title"><button className="icon-button guide-close" type="button" aria-label="ปิดคู่มือวิธีสั่งซื้อ" onClick={() => setGuideOpen(false)}><X size={18} /></button><span className="section-kicker">เริ่มต้นใช้งาน</span><h2 id="guide-title">สั่งง่ายใน 3 ขั้นตอน</h2><div className="guide-steps"><div><b>1</b><span><strong>เลือกสินค้า</strong><small>กดเพิ่มลงถุง แล้วเลือกสีหรือกลิ่นตามต้องการ</small></span></div><div><b>2</b><span><strong>ตรวจตะกร้า</strong><small>เปิดตะกร้า ตรวจรายการ จำนวน และยอดสุทธิ</small></span></div><div><b>3</b><span><strong>ส่งเข้า LINE OA</strong><small>ตรวจสอบสรุปยอด แล้วกดส่งให้ร้านอัตโนมัติ</small></span></div></div><button className="primary-button full" type="button" onClick={() => setGuideOpen(false)}>เข้าใจแล้ว เริ่มเลือกสินค้า</button></section></div>}
        {linePreviewOpen && <div className="line-preview-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !sending) setLinePreviewOpen(false); }}><section className="line-preview-modal" role="dialog" aria-modal="true" aria-labelledby="line-preview-title"><div className="line-preview-header"><div><span className="section-kicker">ขั้นสุดท้าย · ส่งออเดอร์</span><h2 id="line-preview-title">ตรวจสอบสรุปยอด</h2></div><button className="icon-button" type="button" aria-label="ปิดหน้าต่างตรวจสอบออเดอร์" onClick={() => setLinePreviewOpen(false)} disabled={sending}><X size={18} /></button></div><p className="line-preview-copy">เช็กสินค้า สี กลิ่น จำนวน และยอดสุทธิก่อนกดยืนยัน เมื่อกดส่ง ร้านจะได้รับข้อมูลนี้เข้า LINE OA อัตโนมัติ</p><pre className="line-preview-text">{orderPreview}</pre><div className="line-preview-actions"><button className="secondary-button" type="button" onClick={() => setLinePreviewOpen(false)} disabled={sending}>กลับไปแก้ไข</button><button className="primary-button" type="button" disabled={sending} onClick={async () => { setSending(true); await onLineOrder(); setSending(false); }}>{sending ? "กำลังส่งเข้า LINE OA…" : "ยืนยันและส่งเข้า LINE OA"} <ArrowUpRight size={15} /></button></div></section></div>}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>;
}

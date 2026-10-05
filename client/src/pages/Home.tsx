import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ChevronLeft,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  MessageCircle,
  Clipboard,
  Flame,
  Leaf,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { CartDrawer } from "@/components/CartDrawer";
import { FlavorBoard } from "@/components/FlavorBoard";
import { ProductCard } from "@/components/ProductCard";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { beadCountOf, CHAT_URL, formatFlavorSelections, formatPrice, LINE_URL, navItems, packages, refills, brandSlides, CartItem, ColorOption, Product } from "@/data/catalog";
import { calculatePromotion } from "@/lib/cart";
import { trpc } from "@/lib/trpc";

function scrollToId(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("boombox-cart") ?? "[]");
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(0);
  const [cartHintVisible, setCartHintVisible] = useState(false);
  const [cartHintShown, setCartHintShown] = useState(false);
  const [packPrice, setPackPrice] = useState(60);
  const [packsPerMonth, setPacksPerMonth] = useState(12);
  const [copied, setCopied] = useState(false);
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [editingCartKey, setEditingCartKey] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>();
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [lastColors, setLastColors] = useState<Record<string, string>>(() => JSON.parse(localStorage.getItem("boombox-last-colors") ?? "{}"));
  const [lastFlavors, setLastFlavors] = useState<Record<string, string[]>>(() => JSON.parse(localStorage.getItem("boombox-last-flavors") ?? "{}"));
  const [promoInput, setPromoInput] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [orderNote, setOrderNote] = useState(() => localStorage.getItem("boombox-order-note") ?? "");
  const [activeBrandSlide, setActiveBrandSlide] = useState(0);
  const [lightboxSlide, setLightboxSlide] = useState<number | null>(null);
  const [packQuizOpen, setPackQuizOpen] = useState(false);
  const catalogQuery = trpc.catalog.list.useQuery();
  const sendOrderMutation = trpc.orders.submit.useMutation();

  useEffect(() => {
    localStorage.setItem("boombox-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("boombox-order-note", orderNote);
  }, [orderNote]);
  useEffect(() => {
    localStorage.setItem("boombox-last-colors", JSON.stringify(lastColors));
    localStorage.setItem("boombox-last-flavors", JSON.stringify(lastFlavors));
  }, [lastColors, lastFlavors]);
  useEffect(() => {
    if (lightboxSlide === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxSlide(null);
      if (event.key === "ArrowRight") setLightboxSlide((current) => current === null ? null : (current + 1) % brandSlides.length);
      if (event.key === "ArrowLeft") setLightboxSlide((current) => current === null ? null : (current - 1 + brandSlides.length) % brandSlides.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxSlide]);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > window.innerHeight);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onQuickSelect = (event: Event) => setSelectedFlavors((event as CustomEvent<string[]>).detail);
    window.addEventListener("boombox:quick-select", onQuickSelect);
    return () => window.removeEventListener("boombox:quick-select", onQuickSelect);
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.count, 0);
  const { subtotal, refillCount, freeBeads, giftItems, beadPromoLabel, promoLabel, effectiveDiscount, cartTotal } = calculatePromotion(cart, promoApplied, discount);
  const freeShippingThreshold = 200;
  const refillBeads = cart.reduce((total, item) => total + (item.kind === "refill" ? beadCountOf(item) * item.count : 0), 0);
  const oldCost = packPrice * packsPerMonth;
  const newCost = packsPerMonth * 60 + 119;
  const monthlySave = Math.max(0, oldCost - newCost);
  const yearlySave = monthlySave * 12;

  const liveProductMap = useMemo(() => new Map((catalogQuery.data ?? []).map(({ product, assetUrl, colorImages }) => [product.catalogId, { product, assetUrl, colorImages }])), [catalogQuery.data]);
  const mergeLiveProduct = (product: Product): Product => {
    const record = liveProductMap.get(product.id);
    if (!record) return product;
    return { ...product, name: record.product.name, description: record.product.description, price: record.product.price, compareAt: record.product.compareAt ?? undefined, stock: record.product.stock, image: record.assetUrl || product.image, colors: product.colors?.map((color) => ({ ...color, image: record.colorImages?.[color.id]?.url || color.image })) };
  };
  const livePackages = useMemo(() => catalogQuery.isSuccess && catalogQuery.data?.length ? packages.filter((product) => liveProductMap.has(product.id)).map(mergeLiveProduct) : packages, [catalogQuery.data, catalogQuery.isSuccess, liveProductMap]);
  const liveRefills = useMemo(() => catalogQuery.isSuccess && catalogQuery.data?.length ? refills.filter((product) => liveProductMap.has(product.id)).map(mergeLiveProduct) : refills, [catalogQuery.data, catalogQuery.isSuccess, liveProductMap]);
  const quizOptions = [
    { id: "starter", title: "เพิ่งเริ่มลอง", description: "อยากลองแบบง่าย ๆ ราคาเข้าถึงง่าย", product: livePackages.find((item) => item.id === "starter") },
    { id: "daily", title: "อยากคุ้มและเลือกกลิ่นเอง", description: "เหมาะกับใช้ทุกวันและเลือกได้ 2 กลิ่น", product: livePackages.find((item) => item.id === "daily") },
    { id: "duo", title: "อยากจัดเต็ม", description: "เม็ดเยอะขึ้น เหมาะกับคนที่ใช้บ่อย", product: livePackages.find((item) => item.id === "duo") },
  ].filter((option): option is { id: string; title: string; description: string; product: Product } => Boolean(option.product));
  const recommendedProducts = useMemo(() => {
    const priority = ["refill-200", "refill-100", "refill-500"];
    return priority.map((id) => liveRefills.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)).filter((product) => !cart.some((item) => item.id === product.id)).slice(0, 2);
  }, [cart, liveRefills]);

  function addToCart(product: Product, options?: { color?: ColorOption; flavors?: string[] }) {
    const cartKey = `${product.id}:${options?.color?.id ?? "default"}:${(options?.flavors ?? []).join("|")}`;
    setCart((current) => {
      const existing = current.find((item) => (item.cartKey ?? item.id) === cartKey);
      if (existing) return current.map((item) => ((item.cartKey ?? item.id) === cartKey ? { ...item, count: item.count + 1 } : item));
      return [...current, { ...product, cartKey, count: 1, selectedColor: options?.color, selectedFlavors: options?.flavors }];
    });
    setCartPulse((current) => current + 1);
    if (!cartHintShown) {
      setCartHintShown(true);
      setCartHintVisible(true);
      window.setTimeout(() => setCartHintVisible(false), 5000);
    }
    toast.success(`${product.name} ถูกเพิ่มลงถุงแล้ว`, { description: options?.color || options?.flavors?.length ? "บันทึกสีและกลิ่นที่เลือกไว้ในถุงแล้ว" : "เลือกกลิ่นหรือปรับจำนวนได้ในถุงของคุณ", className: "cart-add-toast", action: { label: "ไปที่ตะกร้า", onClick: () => setCartOpen(true) } });
    const nextRefillCount = refillCount + (product.kind === "refill" ? 1 : 0);
    if (nextRefillCount === 3 || nextRefillCount === 5) toast.success(nextRefillCount === 5 ? "🎁 คุณได้รับโปร 5 แถม 2" : "🎁 คุณได้รับโปร 3 แถม 1", { description: nextRefillCount === 5 ? "แถมรีฟิล 100 เม็ดฟรี 2 ซอง" : "แถมรีฟิล 100 เม็ดฟรี 1 ซอง" });
  }
  function handleProductAdd(product: Product) {
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error("สินค้าหมดชั่วคราว", { description: "กรุณาเลือกสินค้าอื่น หรือติดต่อ BoomBox TH ทาง LINE" });
      return;
    }
    if (product.hasColorOption || product.canChooseFlavor) {
      setEditingCartKey(null);
      setConfigProduct(product);
      setSelectedColor(product.colors?.find((color) => color.id === lastColors[product.id]));
      setSelectedFlavors(lastFlavors[product.id] ?? []);
      return;
    }
    addToCart(product);
  }
  function handleRecommendedAdd(product: Product) {
    setCartOpen(false);
    handleProductAdd(product);
  }
  function editCartItem(item: CartItem) {
    setCartOpen(false);
    setEditingCartKey(item.cartKey ?? item.id);
    setConfigProduct(item);
    setSelectedColor(item.selectedColor);
    setSelectedFlavors(item.selectedFlavors ?? []);
  }
  function toggleFlavor(name: string) {
    setSelectedFlavors((current) => current.length < (configProduct?.maxFlavors ?? 1) ? [...current, name] : current);
  }
  function removeOneFlavor(name: string) {
    setSelectedFlavors((current) => {
      const index = current.lastIndexOf(name);
      return index < 0 ? current : [...current.slice(0, index), ...current.slice(index + 1)];
    });
  }
  function applyPromo() {
    if (promoInput.trim().toUpperCase() === "COMEBACK" && subtotal >= 200 && freeBeads === 0) {
      setDiscount(80);
      setPromoApplied(true);
      toast.success("🎫 ใช้โค้ด COMEBACK สำเร็จ! ลด 80 บาท");
    } else if (promoInput.trim().toUpperCase() === "COMEBACK" && freeBeads > 0) {
      setDiscount(0);
      setPromoApplied(false);
      toast.success(beadPromoLabel, { description: "โปรแถมเม็ดคุ้มกว่าส่วนลด COMEBACK ระบบเลือกให้โดยอัตโนมัติ" });
    } else if (promoInput.trim().toUpperCase() === "COMEBACK") {
      setDiscount(0);
      setPromoApplied(false);
      toast.error("ใช้โค้ดไม่ได้", { description: "COMEBACK ใช้ได้เมื่อยอดรวมตั้งแต่ ฿200 ขึ้นไป" });
    } else {
      setDiscount(0);
      setPromoApplied(false);
      toast.error("โค้ดไม่ถูกต้อง", { description: "ลองใหม่อีกครั้ง" });
    }
  }
  function confirmConfiguredProduct() {
    if (!configProduct) return;
    if (configProduct.hasColorOption && !selectedColor) { toast.error("กรุณาเลือกสีก่อน!", { description: "เลือกสีเครื่องที่ต้องการ แล้วกดเพิ่มลงถุงอีกครั้ง" }); document.querySelector(".color-options")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (configProduct.canChooseFlavor && selectedFlavors.length === 0) { toast.error("กรุณาเลือกกลิ่น!", { description: `เลือกได้สูงสุด ${configProduct.maxFlavors ?? 1} กลิ่น` }); document.querySelector(".config-flavors")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    const options = { color: selectedColor, flavors: selectedFlavors };
    if (editingCartKey) {
      const nextCartKey = `${configProduct.id}:${selectedColor?.id ?? "default"}:${selectedFlavors.join("|")}`;
      setCart((current) => {
        const editingItem = current.find((item) => (item.cartKey ?? item.id) === editingCartKey);
        const matchingItem = current.find((item) => (item.cartKey ?? item.id) === nextCartKey && (item.cartKey ?? item.id) !== editingCartKey);
        if (!editingItem) return current;
        if (matchingItem) return current.filter((item) => (item.cartKey ?? item.id) !== editingCartKey).map((item) => (item.cartKey ?? item.id) === nextCartKey ? { ...item, count: item.count + editingItem.count } : item);
        return current.map((item) => (item.cartKey ?? item.id) === editingCartKey ? { ...configProduct, cartKey: nextCartKey, count: item.count, selectedColor, selectedFlavors } : item);
      });
      if (selectedColor) setLastColors((current) => ({ ...current, [configProduct.id]: selectedColor.id }));
      if (selectedFlavors.length) setLastFlavors((current) => ({ ...current, [configProduct.id]: selectedFlavors }));
      toast.success(`${configProduct.name} อัปเดตตัวเลือกแล้ว`, { description: "กลิ่นและสีใหม่ถูกบันทึกไว้ในถุงแล้ว" });
      setEditingCartKey(null);
      setConfigProduct(null);
      return;
    }
    addToCart(configProduct, options);
    if (selectedColor) setLastColors((current) => ({ ...current, [configProduct.id]: selectedColor.id }));
    if (selectedFlavors.length) setLastFlavors((current) => ({ ...current, [configProduct.id]: selectedFlavors }));
    setConfigProduct(null);
  }

  function updateCount(id: string, delta: number) {
    setCart((current) => current.flatMap((item) => {
      if ((item.cartKey ?? item.id) !== id) return [item];
      const nextCount = item.count + delta;
      return nextCount > 0 ? [{ ...item, count: nextCount }] : [];
    }));
  }

  function changeBrandSlide(delta: number) {
    setActiveBrandSlide((current) => (current + delta + brandSlides.length) % brandSlides.length);
  }
  function removeFromCart(itemKey: string) {
    const removed = cart.find((item) => (item.cartKey ?? item.id) === itemKey);
    if (!removed) return;
    setCart((current) => current.filter((item) => (item.cartKey ?? item.id) !== itemKey));
    toast.success(`${removed.name} ถูกลบออกแล้ว`, { duration: 3200, action: { label: "Undo", onClick: () => setCart((current) => [...current, removed]) } });
  }
  async function handleLineOrder() {
    if (!cart.length || sendOrderMutation.isPending) return;
    try {
      const result = await sendOrderMutation.mutateAsync({
        items: cart.map((item) => ({
          name: item.name,
          count: item.count,
          price: item.price,
          color: item.selectedColor?.name,
          flavors: item.selectedFlavors?.length ? formatFlavorSelections(item.selectedFlavors) : undefined,
        })),
        gifts: giftItems.map((gift) => `${gift.name} (${gift.reason})`),
        subtotal,
        discount: effectiveDiscount,
        total: cartTotal,
        note: orderNote.trim() || undefined,
        promotion: promoLabel || undefined,
      });
      await copyOrder();
      toast.success(`ส่งออเดอร์เข้า LINE OA แล้ว · ${result.orderId}`, { description: "ร้านได้รับสรุปยอดและรายการสินค้าแล้ว", duration: 6000 });
    } catch (error) {
      toast.error("ส่งออเดอร์ไม่สำเร็จ", { description: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง" });
    }
  }
  function getOrderText() {
    return `สวัสดี BoomBox TH ขอสอบถามแพ็กเกจครับ\n${cart.length ? cart.map((item) => `- ${item.name} x${item.count}${item.selectedColor ? `\n  🎨 สีแพ็กเกจ: ${item.selectedColor.name}` : ""}${item.selectedFlavors?.length ? `\n  🌈 กลิ่น: ${formatFlavorSelections(item.selectedFlavors)}` : ""}`).join("\n") : "- ขอแนะนำแพ็กเกจเริ่มต้น"}${giftItems.length ? `\n🎁 ของแถม: ${giftItems.map((gift) => `${gift.quantity} (${gift.reason})`).join(", ")}` : ""}${promoLabel ? `\n${promoLabel}` : ""}${orderNote.trim() ? `\n📝 หมายเหตุ: ${orderNote.trim()}` : ""}\nยอดสินค้า: ฿${formatPrice(subtotal)}${effectiveDiscount ? `\nส่วนลด: -฿${formatPrice(effectiveDiscount)}` : ""}\nรวมสุทธิ: ฿${formatPrice(cartTotal)}`;
  }
  async function copyOrder(): Promise<boolean> {
    const orderText = getOrderText();
    try {
      await navigator.clipboard.writeText(orderText);
      setCopied(true);
      toast.success("📋 ก็อปปี้แล้ว!", { className: "copy-toast" });
      window.setTimeout(() => setCopied(false), 2200);
      return true;
    } catch {
      toast.error("คัดลอกสรุปยอดไม่สำเร็จ", { description: "กรุณาอนุญาตการเข้าถึงคลิปบอร์ด แล้วลองอีกครั้ง" });
      return false;
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <button className="brand-lockup" type="button" onClick={() => scrollToId("top")} aria-label="กลับด้านบน">
            <span className="brand-gem">✦</span>
            <span>
              <strong>BoomBox</strong>
              <small>TH / CATALOG 02</small>
            </span>
          </button>
          <nav className="desktop-nav" aria-label="เมนูหลัก">
            {navItems.map((item) => <button key={item.id} type="button" onClick={() => scrollToId(item.id)}>{item.label}</button>)}
          </nav>
          <div className="cart-trigger-wrap">
            {cartHintVisible && <button className="cart-first-hint" type="button" onClick={() => { setCartHintVisible(false); setCartOpen(true); }}>เพิ่มแล้ว — กดดูตะกร้าที่นี่ <ArrowUpRight size={13} /></button>}
            <button className={`cart-trigger ${cartPulse > 0 ? `cart-pulse-${cartPulse % 2}` : ""}`} type="button" onClick={() => setCartOpen(true)} aria-label={cartCount > 0 ? `เปิดตะกร้า มี ${cartCount} รายการ ยอดรวม ${cartTotal} บาท` : "เปิดตะกร้า"} title="เปิดตะกร้าเพื่อตรวจสอบและสั่งซื้อ">
              <ShoppingBag size={18} />
              <span>ตะกร้า</span>
              {cartCount > 0 && <span className="cart-summary"><b>{cartCount} ชิ้น</b><strong>฿{formatPrice(cartTotal)}</strong></span>}
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-catalog-status" aria-label="สถานะแคตตาล็อก">
        <span><i /> 1 เลือกสินค้า&nbsp; 2 เลือกกลิ่น/สี&nbsp; 3 เปิดถุง</span>
        <span>สั่งผ่าน LINE</span>
      </div>

      <main id="top">
        <section className="hero-section section-wrap">
          <div className="hero-copy">
            <div className="status-pill"><span className="pulse-dot" /> DROP 02 / SEPTEMBER 2026</div>
            <p className="hero-kicker">NICOTINE-FREE FLAVOR BEADS <span>•</span> MADE FOR YOUR ROUTINE</p>
            <h1>เปลี่ยน routine เดิม<br /><em>ให้สดกว่าเดิม</em></h1>
            <p className="hero-description">กลิ่นที่ชัด รสที่ clean และดีไซน์ที่พกไปได้ทุกที่ — ทางเลือกใหม่ของคนที่ไม่อยากให้วันธรรมดาจืดชืด</p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => scrollToId("packages")}>ดูแพ็กเกจเริ่มต้น <ArrowDown size={16} /></button>
              <button className="text-button" type="button" onClick={() => scrollToId("flavors")}>สำรวจ 18 กลิ่น <ArrowUpRight size={16} /></button>
            </div>
            <div className="hero-proof">
              <div><strong>18</strong><span>signature<br />flavors</span></div>
              <div><strong>0%</strong><span>nicotine<br />free</span></div>
              <div><strong>4.9</strong><span><Star size={12} fill="currentColor" /> rating</span></div>
            </div>
          </div>
          <div className="hero-visual" aria-label="ภาพกล่อง BoomBox TH พร้อมเม็ดบีดหลากสี">
            <img className="hero-generated-art" src="/manus-storage/hero-product-premium_63bee76e.jpg" alt="กล่อง BoomBox TH สีดำพร้อมเม็ดบีดหลากสี" />
            <div className="hero-float-card float-top"><span>NEW DROP</span><strong>Yuzu Fizz</strong><small>crisp / citrus / bright</small></div>
            <div className="hero-float-card float-bottom"><Zap size={14} /><span>clean energy<br /><b>every day.</b></span></div>
            <div className="hero-visual-note">NO NICOTINE<br /><span>JUST A BETTER SIGNAL</span></div>
          </div>
        </section>

        <section className="ticker-bar" aria-label="จุดเด่นของสินค้า">
          <div className="ticker-track"><span><Leaf size={15} /> NICOTINE-FREE</span><span><Sparkles size={15} /> 18 FLAVORS</span><span><Check size={15} /> MADE IN THAILAND</span><span><Flame size={15} /> FREE DELIVERY 999+</span><span><Leaf size={15} /> NICOTINE-FREE</span></div>
        </section>

        <section className="section-wrap brand-showcase" aria-label="ภาพลักษณ์ BoomBox TH carousel">
          <img className="brand-showcase-image" src={brandSlides[activeBrandSlide].src} alt={brandSlides[activeBrandSlide].alt} />
          <div className="brand-showcase-shade" />
          <button className="brand-showcase-hit-area" type="button" aria-label="ขยายภาพเต็มจอ" onClick={() => setLightboxSlide(activeBrandSlide)} />
          <div className="brand-showcase-caption"><span className="section-kicker">{brandSlides[activeBrandSlide].kicker}</span><strong>{brandSlides[activeBrandSlide].title}<br /><em>{brandSlides[activeBrandSlide].emphasis}</em></strong></div>
          <button className="carousel-arrow carousel-prev" type="button" aria-label="ภาพก่อนหน้า" onClick={() => changeBrandSlide(-1)}><ChevronLeft size={18} /></button>
          <button className="carousel-arrow carousel-next" type="button" aria-label="ภาพถัดไป" onClick={() => changeBrandSlide(1)}><ChevronRight size={18} /></button>
          <div className="carousel-controls" aria-label="เลือกภาพ carousel">{brandSlides.map((slide, index) => <button key={slide.src} className={`carousel-dot ${index === activeBrandSlide ? "active" : ""}`} type="button" aria-label={`ดูภาพที่ ${index + 1}`} aria-current={index === activeBrandSlide} onClick={() => setActiveBrandSlide(index)} />)}</div>
          <span className="carousel-hint">กดภาพเพื่อดูเต็มจอ · {activeBrandSlide + 1}/{brandSlides.length}</span>
        </section>
        {lightboxSlide !== null && <div className="lightbox-overlay" role="dialog" aria-modal="true" aria-label="ดูรายละเอียดสินค้า BoomBox TH เต็มจอ" onClick={() => setLightboxSlide(null)}><div className="lightbox-content offer-lightbox" onClick={(event) => event.stopPropagation()}><button className="lightbox-close" type="button" aria-label="ปิดรายละเอียดสินค้า" onClick={() => setLightboxSlide(null)}><X size={20} /></button><div className="lightbox-product-visual"><img src={brandSlides[lightboxSlide].src} alt={brandSlides[lightboxSlide].alt} /><button className="lightbox-arrow lightbox-prev" type="button" aria-label="โปรก่อนหน้า" onClick={() => setLightboxSlide((lightboxSlide - 1 + brandSlides.length) % brandSlides.length)}><ChevronLeft size={24} /></button><button className="lightbox-arrow lightbox-next" type="button" aria-label="โปรถัดไป" onClick={() => setLightboxSlide((lightboxSlide + 1) % brandSlides.length)}><ChevronRight size={24} /></button></div><div className="offer-detail-panel"><span className="section-kicker">{brandSlides[lightboxSlide].kicker}</span><h3>{brandSlides[lightboxSlide].offer}</h3><div className="offer-price"><strong>฿{formatPrice(brandSlides[lightboxSlide].price)}</strong>{brandSlides[lightboxSlide].compareAt && <del>฿{formatPrice(brandSlides[lightboxSlide].compareAt)}</del>}</div><p className="offer-detail-label">โปรนี้ได้อะไรบ้าง</p><ul>{brandSlides[lightboxSlide].included.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul><div className="offer-detail-actions"><button className="primary-button" type="button" onClick={() => { setLightboxSlide(null); scrollToId(brandSlides[lightboxSlide].section); }}>ดูสินค้าในแคตตาล็อก <ArrowUpRight size={15} /></button><button className="offer-slide-count" type="button" onClick={() => setLightboxSlide((lightboxSlide + 1) % brandSlides.length)}>โปรถัดไป {lightboxSlide + 1}/{brandSlides.length} <ChevronRight size={14} /></button></div></div></div></div>}

        <section className="section-wrap catalog-intro" id="catalog">
          <div>
            <p className="section-kicker">BOOMBOX TH</p>
            <h2>เลือกสินค้า<br /><em>ที่ต้องการ</em></h2>
          </div>
          <div className="catalog-intro-actions"><p className="section-intro-copy">กด “เพิ่มลงถุง” แล้วเลือกสีหรือกลิ่นได้ในขั้นตอนถัดไป</p><button className="quiz-trigger" type="button" onClick={() => setPackQuizOpen(true)}><CircleHelp size={15} /> ไม่รู้จะเริ่มแพ็กไหน?</button></div>
        </section>

        <section className="section-wrap discovery-tools">
          <div className="search-wrap"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหากลิ่น หรือแพ็กเกจ..." aria-label="ค้นหาสินค้า" />{query && <button type="button" onClick={() => setQuery("")} aria-label="ล้างการค้นหา"><X size={16} /></button>}</div>
          <div className="filter-row" role="tablist" aria-label="กรองสินค้า">
            {["ทั้งหมด", "แพ็กเกจ", "รีฟิล"].map((filter) => <button key={filter} className={activeFilter === filter ? "active" : ""} type="button" onClick={() => { setActiveFilter(filter); if (filter === "แพ็กเกจ") scrollToId("packages"); if (filter === "รีฟิล") scrollToId("refills"); }}>{filter}</button>)}
          </div>
        </section>

        <section className="section-wrap catalog-section" id="packages">
          <div className="section-heading"><div><p className="section-kicker">แพ็กเกจ</p><h2>แพ็กเกจ</h2></div><span className="heading-count">{livePackages.length} รายการ</span></div>
          <div className="product-grid">{livePackages.filter((product) => !query || `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase())).map((product) => <ProductCard key={product.id} product={product} onAdd={handleProductAdd} repeat={cart.some((item) => item.id === product.id)} />)}</div>
        </section>

        <section className="feature-banner section-wrap">
          <img className="feature-generated-art" src="/manus-storage/refill-editorial_7f810191.jpg" alt="ภาพเม็ดรีฟิลและกล่องกลิ่นหลากสีของ BoomBox" />
          <div className="feature-copy"><p className="section-kicker">WHY BOOMBOX</p><h2>ไม่ต้องฝืนตัวเอง<br /><em>แค่เปลี่ยน signal</em></h2><p>ออกแบบมาให้เป็น ritual ใหม่ที่สัมผัสได้จริง ตั้งแต่เสียงเปิดฝา กลิ่นแรก ไปจนถึงดีไซน์ที่อยากหยิบขึ้นมาใช้ซ้ำ</p><button className="text-button light" type="button" onClick={() => scrollToId("calculator")}>คำนวณเงินที่ประหยัดได้ <ArrowUpRight size={16} /></button></div>
          <div className="feature-stats"><div><strong>60<span>฿</span></strong><small>แทนค่าใช้จ่าย<br />ต่อซองเดิม</small></div><div><strong>119<span>฿</span></strong><small>ต่อ refill<br />100 beads</small></div><div><strong>18</strong><small>กลิ่นให้<br />ลองทุก mood</small></div></div>
        </section>

        <div id="flavors"><FlavorBoard /></div>

        <section className="section-wrap catalog-section" id="refills">
          <div className="section-heading"><div><p className="section-kicker">รีฟิล</p><h2>รีฟิล</h2></div><span className="heading-count">{liveRefills.length} รายการ</span></div>
          <div className="refill-grid">{liveRefills.filter((product) => !query || `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase())).map((product) => <ProductCard key={product.id} product={product} onAdd={handleProductAdd} repeat={cart.some((item) => item.id === product.id)} />)}</div>
        </section>

        <section className="calculator-section section-wrap" id="calculator">
          <div className="calculator-copy"><p className="section-kicker">THE SWITCH CALCULATOR</p><h2>ดูตัวเลขที่<br /><em>กลับมาเป็นของคุณ</em></h2><p>ลองปรับตาม routine ของคุณ แล้วดูว่าในหนึ่งปีคุณมีเงินเหลือไปทำสิ่งที่อยากทำได้อีกเท่าไหร่</p><div className="calculator-result"><span>คุณประหยัดได้ประมาณ</span><strong>฿{formatPrice(yearlySave)}<small> / ปี</small></strong><div className="result-bar"><span style={{ width: `${Math.min(100, Math.max(8, (yearlySave / 20000) * 100))}%` }} /></div></div></div>
          <div className="calculator-panel"><div className="slider-group"><div className="slider-label"><span>ราคาต่อซองเดิม</span><strong>฿{packPrice}</strong></div><input type="range" min="30" max="200" value={packPrice} onChange={(event) => setPackPrice(Number(event.target.value))} /></div><div className="slider-group"><div className="slider-label"><span>ใช้กี่ซองต่อเดือน</span><strong>{packsPerMonth} ซอง</strong></div><input type="range" min="1" max="30" value={packsPerMonth} onChange={(event) => setPacksPerMonth(Number(event.target.value))} /></div><div className="calc-breakdown"><div><span>เดิม / เดือน</span><strong>฿{formatPrice(oldCost)}</strong></div><div><span>BoomBox / เดือน</span><strong>฿{formatPrice(newCost)}</strong></div><div className="highlight"><span>เหลือกลับมา</span><strong>฿{formatPrice(monthlySave)}</strong></div></div><a className="primary-button full" href={LINE_URL} target="_blank" rel="noreferrer">สั่ง BoomBox เลย <ArrowUpRight size={16} /></a></div>
        </section>
      </main>

      {packQuizOpen && <div className="pack-quiz-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPackQuizOpen(false); }}><section className="pack-quiz-modal" role="dialog" aria-modal="true" aria-labelledby="pack-quiz-title"><button className="icon-button pack-quiz-close" type="button" aria-label="ปิดตัวช่วยเลือกแพ็ก" onClick={() => setPackQuizOpen(false)}><X size={18} /></button><span className="section-kicker">เริ่มต้นใน 10 วินาที</span><h2 id="pack-quiz-title">เลือกแพ็กที่เหมาะกับคุณ</h2><p>เลือกคำตอบที่ใกล้คุณที่สุด แล้วเราจะพาไปตั้งค่าสินค้าให้ต่อทันที</p><div className="pack-quiz-options">{quizOptions.map((option, index) => <button key={option.id} type="button" onClick={() => { setPackQuizOpen(false); handleProductAdd(option.product); }}><b>{index + 1}</b><span><strong>{option.title}</strong><small>{option.description}</small></span><ArrowUpRight size={16} /></button>)}</div></section></div>}

      <footer className="site-footer"><div className="footer-top"><div className="brand-lockup footer-brand"><span className="brand-gem">✦</span><span><strong>BoomBox</strong><small>TH / CATALOG 02</small></span></div><div className="footer-note">A better signal<br /><em>for every day.</em></div></div><div className="footer-bottom"><span>© 2026 BOOMBOX TH</span><span>NICOTINE-FREE FLAVOR BEADS / NOT A TOBACCO PRODUCT</span><button type="button" onClick={() => scrollToId("top")} aria-label="กลับขึ้นด้านบน"><ArrowUp size={14} /> TOP</button></div></footer>

      {cartCount > 0 && <button className="sticky-cart-bar" type="button" onClick={() => setCartOpen(true)}><span><ShoppingBag size={16} /> ตรวจสอบออเดอร์ <b>({cartCount})</b></span><strong className={cartPulse > 0 ? `sticky-cart-total cart-total-highlight-${cartPulse % 2}` : "sticky-cart-total"}>฿{formatPrice(cartTotal)} <ArrowUpRight size={15} /></strong></button>}
      {!cartOpen && <a className="floating-chat" href={CHAT_URL} target="_blank" rel="noreferrer" aria-label="คุยกับร้านทาง LINE"><MessageCircle size={17} /><span>คุยกับร้าน</span></a>}
      {showScrollTop && <button className="floating-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="กลับขึ้นด้านบน"><ArrowUp size={18} /></button>}

      {configProduct && <ProductConfigurator product={configProduct} open={Boolean(configProduct)} selectedColor={selectedColor} selectedFlavors={selectedFlavors} onColorChange={setSelectedColor} onFlavorToggle={toggleFlavor} onFlavorRemove={removeOneFlavor} onClose={() => { setEditingCartKey(null); setConfigProduct(null); }} onConfirm={confirmConfiguredProduct} />}

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} cart={cart} giftItems={giftItems} cartCount={cartCount} cartTotal={cartTotal} refillBeads={refillBeads} freeShippingThreshold={freeShippingThreshold} recommendedProducts={recommendedProducts} onRecommendedAdd={handleRecommendedAdd} discount={effectiveDiscount} promoLabel={promoLabel} promoInput={promoInput} onPromoInputChange={setPromoInput} onApplyPromo={applyPromo} orderNote={orderNote} onOrderNoteChange={setOrderNote} copied={copied} onCopyOrder={copyOrder} orderPreview={getOrderText()} onLineOrder={handleLineOrder} onUpdateCount={updateCount} onEdit={editCartItem} onRemove={removeFromCart} onBrowse={() => scrollToId("packages")} />
    </div>
  );
}

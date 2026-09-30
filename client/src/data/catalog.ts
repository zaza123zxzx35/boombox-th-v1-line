export type ColorOption = { id: string; name: string; hex: string; image?: string };
export type Product = {
  id: string;
  kind: "package" | "refill";
  name: string;
  eyebrow: string;
  description: string;
  price: number;
  stock?: number;
  compareAt?: number;
  quantity: string;
  badge?: string;
  accent: string;
  tag?: string;
  image: string;
  popular?: boolean;
  hasColorOption?: boolean;
  colors?: ColorOption[];
  canChooseFlavor?: boolean;
  maxFlavors?: number;
};
export type CartItem = Product & { count: number; cartKey?: string; selectedColor?: ColorOption; selectedFlavors?: string[]; note?: string };
export type FlavorCategory = "fruit" | "mint" | "sweets" | "floral";
export type Flavor = {
  name: string;
  note: string;
  detail: string;
  tagline: string;
  description: string;
  category: FlavorCategory;
  color: string;
  icon: string;
  badge?: "popular" | "recommended";
  popular?: boolean;
};

export const LINE_URL = "https://line.me/R/ti/p/@425syacj";
export const CHAT_URL = LINE_URL;

export const packages: Product[] = [
  { id: "starter", kind: "package", name: "แพ็ก A: ลองเล่น", eyebrow: "PACKAGE 01 · 100 BEADS", description: "เครื่อง BoomBox Regular + เม็ดบีด 100 เม็ด (สุ่มกลิ่น) + สติกเกอร์ + คู่มือ", price: 299, compareAt: 599, quantity: "1 device + 100 beads", badge: "มือใหม่เริ่มตรงนี้", accent: "ice", tag: "BEST ENTRY", image: "/images/set-a.jpg", popular: true, hasColorOption: true, colors: [{ id: "black", name: "ดำ", hex: "#1a1a1a", image: "/images/device-black.jpg" }, { id: "white", name: "ขาว", hex: "#f5f5f5", image: "/images/device-white.jpg" }] },
  { id: "daily", kind: "package", name: "แพ็ก B: คุ้มค่า", eyebrow: "PACKAGE 02 · 200 BEADS", description: "เครื่อง BoomBox Regular + เม็ดบีด 200 เม็ด (เลือกกลิ่นได้) + คู่มือ", price: 389, compareAt: 699, quantity: "1 device + 200 beads", badge: "คุ้มสุด", accent: "violet", tag: "POPULAR", image: "/images/set-b.jpg", popular: true, hasColorOption: true, colors: [{ id: "black", name: "ดำ", hex: "#1a1a1a", image: "/images/device-black.jpg" }, { id: "white", name: "ขาว", hex: "#f5f5f5", image: "/images/device-white.jpg" }], canChooseFlavor: true, maxFlavors: 2 },
  { id: "duo", kind: "package", name: "แพ็ก C: จัดเต็ม", eyebrow: "PACKAGE 03 · 350 BEADS", description: "เครื่อง BoomBox Regular + เม็ดบีด 350 เม็ด (เลือกกลิ่นได้) + คู่มือ", price: 499, compareAt: 899, quantity: "1 device + 350 beads", badge: "ขายดีที่สุด", accent: "amber", tag: "BEST SELLER", image: "/images/set-c.jpg", popular: true, hasColorOption: true, colors: [{ id: "black", name: "ดำ", hex: "#1a1a1a", image: "/images/device-black.jpg" }, { id: "white", name: "ขาว", hex: "#f5f5f5", image: "/images/device-white.jpg" }], canChooseFlavor: true, maxFlavors: 3 },
  { id: "archive", kind: "package", name: "แพ็ก D: VIP", eyebrow: "PACKAGE 04 · 500 BEADS", description: "เครื่อง BoomBox VIP (ไฟแช็กในตัว) + เม็ดบีด 500 เม็ด + ชุดทดลองครบ 19 กลิ่น + คู่มือ", price: 649, compareAt: 1099, quantity: "1 VIP device + 500 beads", badge: "👑 Premium", accent: "lime", tag: "VIP / FULL SET", image: "/images/set-d.jpg", hasColorOption: true, canChooseFlavor: true, maxFlavors: 5, colors: [{ id: "black", name: "ดำ", hex: "#1a1a1a" }, { id: "silver", name: "เงิน", hex: "#c0c0c0" }, { id: "blue", name: "ฟ้า", hex: "#3b82f6" }] },
];

export const refills: Product[] = [
  { id: "refill-100", kind: "refill", name: "REFILL 100", eyebrow: "SINGLE TUBE", description: "100 เม็ด เลือกกลิ่นได้ตามสไตล์คุณ", price: 69, quantity: "100 beads", badge: "ยอดฮิต", accent: "lime", image: "/images/refill-100.jpg", popular: true, canChooseFlavor: true, maxFlavors: 1 },
  { id: "refill-200", kind: "refill", name: "REFILL 200", eyebrow: "DUO FLAVOR", description: "2 กลิ่น × 100 เม็ด สลับ mood ได้ทั้งวัน", price: 119, quantity: "200 beads", badge: "แนะนำ", accent: "violet", image: "/images/set-b.jpg", popular: true, canChooseFlavor: true, maxFlavors: 2 },
  { id: "refill-500", kind: "refill", name: "REFILL 500", eyebrow: "THE STOCK", description: "5 กลิ่น × 100 เม็ด สำหรับสายสะสม", price: 249, quantity: "500 beads", badge: "คุ้มสุด", accent: "amber", image: "/images/set-d.jpg", canChooseFlavor: true, maxFlavors: 5 },
  { id: "refill-1000", kind: "refill", name: "FLAVOR ARCHIVE", eyebrow: "MIX & MATCH", description: "รวมรสที่ใช่ไว้ให้คุณเลือกได้ทุกช่วงเวลา", price: 399, quantity: "1,000 beads", badge: "เหมาแบบโปร", accent: "ice", image: "/images/refill-1000.jpg", canChooseFlavor: true, maxFlavors: 10 },
];

export const flavors: Flavor[] = [
  { name: "องุ่นหวาน", note: "หอมหวาน · เย็นสบาย", tagline: "หอมหวาน · เย็นสบาย", detail: "องุ่นม่วงหวานฉ่ำและเย็นละมุน ใช้ง่ายในทุกวัน", description: "องุ่นม่วงหวานฉ่ำและเย็นละมุน ใช้ง่ายในทุกวัน", category: "fruit", color: "#a876ec", icon: "🍇", badge: "popular", popular: true },
  { name: "สตรอเบอร์รี่เย็น", note: "หวานหอม · สดชื่น", tagline: "หวานหอม · สดชื่น", detail: "สตรอเบอร์รี่แดงหวานกำลังดี พร้อมความสดชื่นปลายลิ้น", description: "สตรอเบอร์รี่แดงหวานกำลังดี พร้อมความสดชื่นปลายลิ้น", category: "fruit", color: "#ff7199", icon: "🍓", badge: "popular", popular: true },
  { name: "บลูเบอร์รี่เย็น", note: "หอมหวาน · นุ่มลึก", tagline: "หอมหวาน · นุ่มลึก", detail: "เบอร์รี่สีเข้มหวานนุ่ม สำหรับสายหวานไม่เลี่ยน", description: "เบอร์รี่สีเข้มหวานนุ่ม สำหรับสายหวานไม่เลี่ยน", category: "fruit", color: "#6f72e8", icon: "🫐", badge: "popular", popular: true },
  { name: "แอปเปิ้ลเขียวเย็น", note: "กรอบสด · สะอาด", tagline: "กรอบสด · สะอาด", detail: "แอปเปิ้ลเขียวเปรี้ยวสด ให้ความรู้สึก clean สะอาด", description: "แอปเปิ้ลเขียวเปรี้ยวสด ให้ความรู้สึก clean สะอาด", category: "fruit", color: "#8bd46f", icon: "🍏" },
  { name: "เลมอนหอมเย็น", note: "เปรี้ยวใส · สดชื่น", tagline: "เปรี้ยวใส · สดชื่น", detail: "เลมอนซิตรัสหอมชัด ตัดความหวาน ปลุกความสด", description: "เลมอนซิตรัสหอมชัด ตัดความหวาน ปลุกความสด", category: "fruit", color: "#f5d54d", icon: "🍋" },
  { name: "แตงโมเย็น", note: "ฉ่ำหวาน · เย็นนุ่ม", tagline: "ฉ่ำหวาน · เย็นนุ่ม", detail: "แตงโมฉ่ำ ๆ ปิดท้ายด้วยความเย็นแบบโปร่งเบา", description: "แตงโมฉ่ำ ๆ ปิดท้ายด้วยความเย็นแบบโปร่งเบา", category: "fruit", color: "#ff6c84", icon: "🍉" },
  { name: "ส้มเย็น", note: "หอมส้ม · สดชื่นเต็มพลัง", tagline: "หอมส้ม · สดชื่นเต็มพลัง", detail: "ส้มหวานอมเปรี้ยว สว่างและใช้ได้ทุกวัน", description: "ส้มหวานอมเปรี้ยว สว่างและใช้ได้ทุกวัน", category: "fruit", color: "#ff9d36", icon: "🍊", badge: "popular", popular: true },
  { name: "ลิ้นจี่เย็น", note: "หอมหวาน · ละมุนลิ้น", tagline: "หอมหวาน · ละมุนลิ้น", detail: "ลิ้นจี่หวานหอมเย็น ให้ mood นุ่มและเข้าถึงง่าย", description: "ลิ้นจี่หวานหอมเย็น ให้ mood นุ่มและเข้าถึงง่าย", category: "fruit", color: "#f39aaf", icon: "🍒" },
  { name: "แบล็คเบอร์รี่", note: "เข้มข้น · เบอร์รี่แท้", tagline: "เข้มข้น · เบอร์รี่แท้", detail: "แบล็คเบอร์รี่เข้มหวานลึก มีมิติและความสดชื่น", description: "แบล็คเบอร์รี่เข้มหวานลึก มีมิติและความสดชื่น", category: "fruit", color: "#4e3c83", icon: "🫐" },
  { name: "องุ่นเย็น", note: "หอมองุ่น · เย็นสดชื่น", tagline: "หอมองุ่น · เย็นสดชื่น", detail: "องุ่นเขียวหวานซ่าเย็น สดชื่นทุกครั้งที่ใช้", description: "องุ่นเขียวหวานซ่าเย็น สดชื่นทุกครั้งที่ใช้", category: "fruit", color: "#95c76b", icon: "🍇" },
  { name: "แคนตาลูปเย็น", note: "หอมหวาน · เมลอนแท้", tagline: "หอมหวาน · เมลอนแท้", detail: "แคนตาลูปหอมหวานฉ่ำ เย็นละมุนแบบเมลอนญี่ปุ่น", description: "แคนตาลูปหอมหวานฉ่ำ เย็นละมุนแบบเมลอนญี่ปุ่น", category: "fruit", color: "#bde36a", icon: "🍈" },
  { name: "แบล็คไอซ์มิ้นท์", note: "เย็นสะอาด · cool สุด", tagline: "เย็นสะอาด · cool สุด", detail: "มิ้นท์ดำเย็นสะอาดระดับพรีเมียม ให้ความเย็นแบบนุ่มลึก", description: "มิ้นท์ดำเย็นสะอาดระดับพรีเมียม ให้ความเย็นแบบนุ่มลึก", category: "mint", color: "#6c7580", icon: "🖤", badge: "recommended" },
  { name: "ซีโร่ดีกรีมิ้นท์", note: "เย็นจัด +++ · สดชื่นสุดขั้ว", tagline: "เย็นจัด +++ · สดชื่นสุดขั้ว", detail: "มิ้นท์เย็นทะลุปรอท สำหรับสายเย็นตัวจริง", description: "มิ้นท์เย็นทะลุปรอท สำหรับสายเย็นตัวจริง", category: "mint", color: "#bdefff", icon: "❄️", badge: "popular", popular: true },
  { name: "มิกซ์ไร้น้ำแข็ง", note: "หอมสมุนไพร · ไม่เย็น", tagline: "หอมสมุนไพร · ไม่เย็น", detail: "มิกซ์กลิ่นสมุนไพรสดชื่น ไม่เน้นเย็น เหมาะกับคนที่ไม่ชอบความเย็นจัด", description: "มิกซ์กลิ่นสมุนไพรสดชื่น ไม่เน้นเย็น เหมาะกับคนที่ไม่ชอบความเย็นจัด", category: "mint", color: "#82c997", icon: "🌿", badge: "recommended" },
  { name: "นมกล้วย", note: "หอมนม · หวานละมุน", tagline: "หอมนม · หวานละมุน", detail: "นมกล้วยหอมหวานสไตล์ฮอกไกโด ให้ mood อบอุ่นและสบาย", description: "นมกล้วยหอมหวานสไตล์ฮอกไกโด ให้ mood อบอุ่นและสบาย", category: "sweets", color: "#f2d37e", icon: "🍌", badge: "recommended" },
  { name: "ไอศกรีม", note: "หวานครีมมี่ · dessert", tagline: "หวานครีมมี่ · dessert", detail: "ไอศกรีมวานิลลาหวานนุ่ม เติมความหวานแบบขนมหวาน", description: "ไอศกรีมวานิลลาหวานนุ่ม เติมความหวานแบบขนมหวาน", category: "sweets", color: "#f2e3b5", icon: "🍦", badge: "popular", popular: true },
  { name: "โคล่าเย็น", note: "ซ่าหอม · classic", tagline: "ซ่าหอม · classic", detail: "โคล่าคลาสสิกเย็น ๆ เหมือนเปิดกระป๋องใหม่ สดชื่นทุกวัน", description: "โคล่าคลาสสิกเย็น ๆ เหมือนเปิดกระป๋องใหม่ สดชื่นทุกวัน", category: "sweets", color: "#bd8457", icon: "🥤", badge: "popular", popular: true },
  { name: "เจียนลี่เป่าเย็น", note: "เปรี้ยวหวาน · ไม่เหมือนใคร", tagline: "เปรี้ยวหวาน · ไม่เหมือนใคร", detail: "รสน้ำอัดลมจีนในตำนาน เปรี้ยวหวานซ่าเย็น แตกต่างไม่ซ้ำใคร", description: "รสน้ำอัดลมจีนในตำนาน เปรี้ยวหวานซ่าเย็น แตกต่างไม่ซ้ำใคร", category: "sweets", color: "#ef7f50", icon: "🧃", badge: "recommended" },
  { name: "ออสแมนทัสเย็น", note: "หอมดอกไม้ · ชาพรีเมียม", tagline: "หอมดอกไม้ · ชาพรีเมียม", detail: "ออสแมนทัสหอมละมุนแบบดอกไม้จีนแท้ ให้ความรู้สึกหรูหราและผ่อนคลาย", description: "ออสแมนทัสหอมละมุนแบบดอกไม้จีนแท้ ให้ความรู้สึกหรูหราและผ่อนคลาย", category: "floral", color: "#f2a96b", icon: "🌸", badge: "recommended" },
]; 

export const flavorCategories = [
  { key: "fruit", label: "ผลไม้", icon: "🍓" },
  { key: "mint", label: "มิ้นท์ & เย็น", icon: "🧊" },
  { key: "sweets", label: "ขนม & เครื่องดื่ม", icon: "🍬" },
  { key: "floral", label: "ดอกไม้ & ชา", icon: "🌸" },
] as const;

export const navItems = [
  { label: "แพ็กเกจ", id: "packages" },
  { label: "รีฟิล", id: "refills" },
  { label: "19 กลิ่น", id: "flavors" },
];
export const brandSlides = [
  { src: "/images/device-black.jpg", alt: "BoomBox TH พร้อมกล่องเม็ดบีดสีดำและเม็ดบีดใส", kicker: "BOOMBOX / BRAND SIGNAL", title: "เล็กแต่ชัด", emphasis: "ในทุก mood", productId: "archive", productImage: "/images/set-d.jpg", offer: "แพ็ก D: VIP", price: 649, compareAt: 1099, included: ["เครื่องไฟแช็กในตัว 1 เครื่อง", "เม็ดบีด 500 เม็ด / 5 ตลับ", "เลือกกลิ่นได้สูงสุด 5 กลิ่น", "เลือกสีเครื่องได้: ดำ / เงิน / ฟ้า"], section: "packages" },
  { src: "/images/device-white.jpg", alt: "ภาพเม็ดรีฟิลและกล่องกลิ่นหลากสีของ BoomBox", kicker: "KEEP IT FRESH / REFILL", title: "เติม mood", emphasis: "ให้ต่อเนื่อง", productId: "refill-1000", productimage: "/images/refill-1000.jpg", offer: "FLAVOR ARCHIVE", price: 399, compareAt: undefined, included: ["เม็ดบีด 1,000 เม็ด", "เลือกกลิ่นได้สูงสุด 10 กลิ่น", "เหมาะสำหรับ mix & match หลาย mood"], section: "refills" },
  { src: "/images/set-d.jpg", alt: "ภาพรวมโทนสีของกลิ่น BoomBox ทั้ง 19 กลิ่น", kicker: "REAL FLAVOR BOARD", title: "ค้นพบกลิ่น", emphasis: "ที่เป็นคุณ", productId: "refill-500", productImage: "/images/set-d.jpg", offer: "REFILL 500", price: 249, compareAt: undefined, included: ["เม็ดบีด 500 เม็ด / 5 ตลับ", "เลือกกลิ่นได้สูงสุด 5 กลิ่น", "รวมโทนยอดนิยมสำหรับสายสะสม"], section: "refills" },
];


export function formatPrice(value: number) { return new Intl.NumberFormat("th-TH").format(value); }

export function formatFlavorSelections(selectedFlavors?: string[]) {
  if (!selectedFlavors?.length) return "";
  const counts = new Map<string, number>();
  selectedFlavors.forEach((flavor) => counts.set(flavor, (counts.get(flavor) ?? 0) + 1));
  return Array.from(counts.entries()).map(([flavor, count]) => `${flavor} x${count}`).join(", ");
}

export function groupFlavorSelections(selectedFlavors?: string[]) {
  if (!selectedFlavors?.length) return [];
  const counts = new Map<string, number>();
  selectedFlavors.forEach((flavor) => counts.set(flavor, (counts.get(flavor) ?? 0) + 1));
  return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
}

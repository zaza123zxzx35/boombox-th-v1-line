import { useMemo, useState } from "react";
import { ArrowUpRight, Check, ImagePlus, Loader2, Package, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

type AssetCategory = "product" | "banner" | "flavor" | "other";
type Draft = { name: string; description: string; price: string; compareAt: string; stock: string; active: boolean; imageAssetId: number | null };

const categoryLabels: Record<AssetCategory, string> = { product: "รูปสินค้า", banner: "แบนเนอร์", flavor: "รายละเอียดกลิ่น", other: "อื่น ๆ" };

function createDraft(record: { product: { name: string; description: string; price: number; compareAt: number | null; stock: number; active: number; imageAssetId: number | null } }): Draft {
  return { name: record.product.name, description: record.product.description, price: String(record.product.price), compareAt: record.product.compareAt == null ? "" : String(record.product.compareAt), stock: String(record.product.stock), active: record.product.active === 1, imageAssetId: record.product.imageAssetId };
}

export default function AdminProducts() {
  const { user, loading } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetCategory, setAssetCategory] = useState<AssetCategory | "all">("product");
  const productQuery = trpc.products.list.useQuery(undefined, { enabled: user?.role === "admin" });
  const assetQueryInput = useMemo(() => ({ category: assetCategory === "all" ? undefined : assetCategory }), [assetCategory]);
  const assetQuery = trpc.assets.list.useQuery(assetQueryInput, { enabled: user?.role === "admin" && assetPickerOpen });
  const utils = trpc.useUtils();
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.products.list.invalidate(), utils.catalog.list.invalidate()]);
      setEditingId(null);
      setDraft(null);
      toast.success("บันทึกข้อมูลสินค้าแล้ว", { description: "ราคา สต็อก และข้อมูลหน้าร้านอัปเดตเรียบร้อย" });
    },
    onError: (error) => toast.error("บันทึกไม่สำเร็จ", { description: error.message }),
  });

  if (loading) return <div className="asset-page-state"><Loader2 className="spin" size={24} /> กำลังตรวจสอบสิทธิ์...</div>;
  if (!user) return <div className="asset-page-state"><ShieldCheck size={28} /><h1>หลังบ้าน BoomBox TH</h1><p>กรุณาเข้าสู่ระบบเพื่อจัดการสินค้าและสต็อก</p><button className="asset-primary-button" type="button" onClick={() => startLogin()}>เข้าสู่ระบบ</button></div>;
  if (user.role !== "admin") return <div className="asset-page-state"><ShieldCheck size={28} /><h1>ไม่มีสิทธิ์เข้าถึง</h1><p>หน้านี้สงวนไว้สำหรับผู้ดูแลระบบเท่านั้น</p></div>;

  function beginEdit(record: NonNullable<typeof productQuery.data>[number]) {
    setEditingId(record.product.catalogId);
    setDraft(createDraft(record));
    setAssetPickerOpen(false);
  }

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  function saveProduct(catalogId: string) {
    if (!draft) return;
    if (!draft.name.trim() || !draft.description.trim()) {
      toast.error("กรุณากรอกข้อมูลสินค้าให้ครบ", { description: "ชื่อสินค้าและรายละเอียดต้องไม่เว้นว่าง" });
      return;
    }
    const price = Number(draft.price);
    const stock = Number(draft.stock);
    const compareAt = draft.compareAt.trim() ? Number(draft.compareAt) : null;
    if (!Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0 || (compareAt !== null && (!Number.isInteger(compareAt) || compareAt < 0))) {
      toast.error("กรุณาตรวจสอบตัวเลข", { description: "ราคา ราคาเดิม และสต็อกต้องเป็นจำนวนเต็มไม่ติดลบ" });
      return;
    }
    updateMutation.mutate({ catalogId, name: draft.name.trim(), description: draft.description.trim(), price, compareAt, stock, active: draft.active ? 1 : 0, imageAssetId: draft.imageAssetId });
  }

  const lowStockCount = productQuery.data?.filter(({ product }) => product.stock > 0 && product.stock <= 5).length ?? 0;
  const outOfStockCount = productQuery.data?.filter(({ product }) => product.stock === 0).length ?? 0;
  const selectedAsset = assetQuery.data?.find((asset) => asset.id === draft?.imageAssetId);
  return <main className="asset-page admin-products-page">
    <header className="asset-page-header"><div><span className="asset-kicker">BOOMBOX TH / ADMIN</span><h1>จัดการสินค้า</h1><p>แก้ไขข้อมูล ราคา สต็อก และเลือกรูปภาพจากคลังไฟล์ให้แต่ละรายการ</p></div><div className="admin-page-links"><a className="asset-store-link" href="/admin/assets">คลังไฟล์ <ArrowUpRight size={15} /></a><a className="asset-store-link" href="/">หน้าร้าน <ArrowUpRight size={15} /></a></div></header>
    <section className="admin-products-toolbar"><div><Package size={18} /><strong>{productQuery.data?.length ?? 0} รายการสินค้า</strong><span>ข้อมูลที่บันทึกจะสะท้อนในแคตตาล็อกหน้าร้าน</span></div><div className="admin-stock-summary"><span className="stock-summary-low">ใกล้หมด {lowStockCount}</span><span className="stock-summary-out">หมด {outOfStockCount}</span><button type="button" className="asset-store-link" onClick={() => void productQuery.refetch()}>รีเฟรชข้อมูล</button></div></section>
    {productQuery.isLoading ? <div className="asset-empty"><Loader2 className="spin" size={20} /> กำลังโหลดสินค้า...</div> : productQuery.error ? <div className="asset-empty">โหลดสินค้าไม่สำเร็จ: {productQuery.error.message}</div> : <div className="admin-products-list">{productQuery.data?.map((record) => { const product = record.product; const isEditing = editingId === product.catalogId && draft; return <article className={`admin-product-card ${isEditing ? "is-editing" : ""}`} key={product.catalogId}><div className="admin-product-top"><div className="admin-product-image">{(isEditing ? (selectedAsset?.url || record.assetUrl) : record.assetUrl) ? <img src={(isEditing ? (selectedAsset?.url || record.assetUrl) : record.assetUrl) ?? ""} alt={record.assetAltText || product.name} /> : <ImagePlus size={24} />}</div><div className="admin-product-identity"><span className="asset-kicker">{product.kind === "package" ? "PACKAGE" : "REFILL"} · {product.catalogId}</span><h2>{product.name}</h2><p className="admin-product-description">{product.description}</p><span className={`stock-pill ${product.stock > 0 ? "in-stock" : "not-set"}`}>{product.stock > 0 ? `มีสินค้า ${product.stock} ชิ้น` : "ยังไม่ตั้งสต็อก"}</span></div><button type="button" className="admin-edit-button" onClick={() => isEditing ? (setEditingId(null), setDraft(null)) : beginEdit(record)}>{isEditing ? "ยกเลิก" : "แก้ไขรายการ"}</button></div>{isEditing && <div className="admin-product-form"><label>ชื่อสินค้า<input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} /></label><label>รายละเอียด<textarea value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} rows={2} /></label><div className="admin-form-grid"><label>ราคาขาย (฿)<input type="number" min="0" step="1" value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} /></label><label>ราคาเดิม (฿)<input type="number" min="0" step="1" value={draft.compareAt} onChange={(event) => updateDraft("compareAt", event.target.value)} placeholder="ไม่ระบุ" /></label><label>สต็อก (ชิ้น)<input type="number" min="0" step="1" value={draft.stock} onChange={(event) => updateDraft("stock", event.target.value)} /></label></div><label className="admin-check-row"><input type="checkbox" checked={draft.active} onChange={(event) => updateDraft("active", event.target.checked)} /> แสดงสินค้านี้ในแคตตาล็อกหน้าร้าน</label><div className="admin-image-row"><div>{(selectedAsset?.url || record.assetUrl) ? <img src={(selectedAsset?.url || record.assetUrl) ?? ""} alt="รูปที่เลือก" /> : <ImagePlus size={18} />}<span>{selectedAsset?.originalName || (record.assetUrl ? "รูปที่เชื่อมอยู่" : "ยังไม่ได้เลือกรูป")}</span></div><button type="button" className="asset-store-link" onClick={() => setAssetPickerOpen(true)}><ImagePlus size={14} /> เลือกรูปจากคลังไฟล์</button></div><div className="admin-form-actions"><button type="button" className="asset-primary-button" disabled={updateMutation.isPending} onClick={() => saveProduct(product.catalogId)}>{updateMutation.isPending ? <Loader2 className="spin" size={16} /> : <Save size={16} />} บันทึกสินค้า</button></div></div>}</article>; })}</div>}
    {assetPickerOpen && <div className="asset-picker-overlay" role="dialog" aria-modal="true" aria-label="เลือกรูปภาพสินค้า"><div className="asset-picker"><div className="asset-picker-header"><div><span className="asset-kicker">MEDIA LIBRARY</span><h2>เลือกรูปภาพ</h2></div><button type="button" onClick={() => setAssetPickerOpen(false)} aria-label="ปิด">×</button></div><div className="asset-picker-filters"><button className={assetCategory === "all" ? "active" : ""} type="button" onClick={() => setAssetCategory("all")}>ทั้งหมด</button>{(Object.keys(categoryLabels) as AssetCategory[]).map((category) => <button className={assetCategory === category ? "active" : ""} type="button" key={category} onClick={() => setAssetCategory(category)}>{categoryLabels[category]}</button>)}</div>{assetQuery.isLoading ? <div className="asset-empty"><Loader2 className="spin" size={18} /> กำลังโหลดรูป...</div> : <div className="asset-picker-grid">{assetQuery.data?.map((asset) => <button type="button" className={`asset-picker-card ${draft?.imageAssetId === asset.id ? "selected" : ""}`} key={asset.id} onClick={() => { updateDraft("imageAssetId", asset.id); setAssetPickerOpen(false); }}><img src={asset.url} alt={asset.altText || asset.originalName} /><span>{draft?.imageAssetId === asset.id ? <Check size={13} /> : null}{asset.originalName}</span></button>)}</div>}</div></div>}
  </main>;
}

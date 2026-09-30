import { useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, Clipboard, FileImage, FileText, Film, Loader2, LogIn, Pencil, Save, ShieldCheck, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
type AssetCategory = "product" | "banner" | "flavor" | "other";
const categoryLabels: Record<AssetCategory, string> = { product: "รูปสินค้า", banner: "แบนเนอร์", flavor: "รายละเอียดกลิ่น", other: "อื่น ๆ" };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(contentType: string) {
  if (contentType.startsWith("image/")) return <FileImage size={20} />;
  if (contentType.startsWith("video/")) return <Film size={20} />;
  return <FileText size={20} />;
}

export default function AssetLibrary() {
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
  const [editingAltText, setEditingAltText] = useState("");
  const [editingCategory, setEditingCategory] = useState<AssetCategory>("product");
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const assetQueryInput = useMemo(() => ({ category: category === "all" ? undefined : category }), [category]);
  const assetsQuery = trpc.assets.list.useQuery(assetQueryInput, { enabled: user?.role === "admin" });
  const utils = trpc.useUtils();
  const uploadMutation = trpc.assets.upload.useMutation({
    onSuccess: async () => {
      await utils.assets.list.invalidate();
      setSelectedFile(null);
      setAltText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("อัปโหลดไฟล์สำเร็จ", { description: "ไฟล์ถูกเก็บใน storage และบันทึก metadata แล้ว" });
    },
    onError: (error) => toast.error("อัปโหลดไม่สำเร็จ", { description: error.message }),
  });
  const setCategoryMutation = trpc.assets.setCategory.useMutation({
    onSuccess: () => void utils.assets.list.invalidate(),
    onError: (error) => toast.error("เปลี่ยนหมวดหมู่ไม่สำเร็จ", { description: error.message }),
  });
  const updateAssetMutation = trpc.assets.update.useMutation({
    onSuccess: async () => { await utils.assets.list.invalidate(); setEditingAssetId(null); setReplacementFile(null); toast.success("อัปเดตไฟล์สำเร็จ"); },
    onError: (error) => toast.error("แก้ไขไฟล์ไม่สำเร็จ", { description: error.message }),
  });

  if (loading) return <div className="asset-page-state"><Loader2 className="spin" size={24} /> กำลังตรวจสอบสิทธิ์...</div>;
  if (!user) return <div className="asset-page-state"><ShieldCheck size={28} /><h1>คลังไฟล์สำหรับผู้ดูแล</h1><p>กรุณาเข้าสู่ระบบเพื่อจัดการไฟล์ของ BoomBox TH</p><button className="asset-primary-button" type="button" onClick={() => startLogin()}><LogIn size={16} /> เข้าสู่ระบบ</button></div>;
  if (user.role !== "admin") return <div className="asset-page-state"><ShieldCheck size={28} /><h1>ไม่มีสิทธิ์เข้าถึง</h1><p>หน้านี้สงวนไว้สำหรับผู้ดูแลระบบเท่านั้น</p></div>;

  async function uploadSelectedFile() {
    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("ไฟล์ใหญ่เกินไป", { description: "รองรับไฟล์ขนาดไม่เกิน 8 MB" });
      return;
    }
    const dataBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
      reader.readAsDataURL(selectedFile);
    });
    uploadMutation.mutate({
      fileName: selectedFile.name,
      contentType: selectedFile.type || "application/octet-stream",
      dataBase64,
      category: category === "all" ? "product" : category,
      altText: altText.trim() || undefined,
    });
  }

  async function copyUrl(id: number, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => current === id ? null : current), 1800);
      toast.success("คัดลอก URL แล้ว");
    } catch {
      toast.error("คัดลอกไม่สำเร็จ", { description: "ลองกดเปิดไฟล์แล้วคัดลอกจากแถบที่อยู่แทน" });
    }
  }

  function beginAssetEdit(asset: NonNullable<typeof assetsQuery.data>[number]) {
    setEditingAssetId(asset.id);
    setEditingAltText(asset.altText ?? "");
    setEditingCategory(asset.category);
    setReplacementFile(null);
  }

  async function saveAssetEdit() {
    if (editingAssetId === null) return;
    if (!replacementFile) {
      updateAssetMutation.mutate({ id: editingAssetId, category: editingCategory, altText: editingAltText.trim() || null });
      return;
    }
    const dataBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
      reader.readAsDataURL(replacementFile);
    });
    updateAssetMutation.mutate({ id: editingAssetId, category: editingCategory, altText: editingAltText.trim() || null, fileName: replacementFile.name, contentType: replacementFile.type || "application/octet-stream", dataBase64 });
  }

  return <main className="asset-page">
    <header className="asset-page-header">
      <div><span className="asset-kicker">BOOMBOX TH / ADMIN</span><h1>คลังไฟล์</h1><p>อัปโหลดและจัดการรูปสินค้า แบนเนอร์ และสื่อประกอบที่เก็บใน storage</p></div>
      <div className="admin-page-links"><a className="asset-store-link" href="/admin/products">จัดการสินค้า <ArrowUpRight size={15} /></a><a className="asset-store-link" href="/">กลับหน้าร้าน <ArrowUpRight size={15} /></a></div>
    </header>
    <section className="asset-upload-panel" aria-labelledby="asset-upload-title">
      <div className="asset-panel-heading"><div><span className="asset-kicker">STORAGE / S3</span><h2 id="asset-upload-title">เพิ่มไฟล์ใหม่</h2></div><span className="asset-limit">สูงสุด 8 MB</span></div>
      <div className="asset-upload-grid">
        <label className="asset-dropzone" htmlFor="asset-file-input"><Upload size={24} /><strong>{selectedFile ? selectedFile.name : "เลือกไฟล์เพื่ออัปโหลด"}</strong><small>รูปภาพ, วิดีโอ หรือ PDF · คลิกเพื่อเลือกไฟล์</small><input ref={fileInputRef} id="asset-file-input" type="file" accept="image/*,video/*,application/pdf" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} /></label>
        <div className="asset-upload-fields"><label>หมวดหมู่ไฟล์<select value={category === "all" ? "product" : category} onChange={(event) => setCategory(event.target.value as AssetCategory)}>{(Object.keys(categoryLabels) as AssetCategory[]).map((key) => <option key={key} value={key}>{categoryLabels[key]}</option>)}</select></label><label>คำอธิบายภาพ (alt text)<input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="เช่น ภาพสินค้า Refill 500" maxLength={255} /></label>{selectedFile && <div className="asset-selected-file">{fileIcon(selectedFile.type)}<span>{selectedFile.name}<small>{formatBytes(selectedFile.size)}</small></span><button type="button" aria-label="ยกเลิกไฟล์ที่เลือก" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}><X size={15} /></button></div>}<button className="asset-primary-button" type="button" disabled={!selectedFile || uploadMutation.isPending} onClick={() => void uploadSelectedFile()}>{uploadMutation.isPending ? <><Loader2 className="spin" size={16} /> กำลังอัปโหลด...</> : <><Upload size={16} /> อัปโหลดเข้า storage</>}</button></div>
      </div>
    </section>
    {editingAssetId !== null && <section className="asset-edit-panel" aria-label="แก้ไขไฟล์"><div className="asset-panel-heading"><div><span className="asset-kicker">EDIT MEDIA</span><h2>แก้ไขรูปภาพและข้อมูล</h2></div><button type="button" className="asset-icon-button" onClick={() => setEditingAssetId(null)} aria-label="ปิด">×</button></div><div className="asset-edit-grid"><label>หมวดหมู่<select value={editingCategory} onChange={(event) => setEditingCategory(event.target.value as AssetCategory)}>{(Object.keys(categoryLabels) as AssetCategory[]).map((key) => <option key={key} value={key}>{categoryLabels[key]}</option>)}</select></label><label>คำอธิบายภาพ (alt text)<input value={editingAltText} onChange={(event) => setEditingAltText(event.target.value)} maxLength={255} /></label><label>แทนที่ไฟล์ภาพ<input type="file" accept="image/*,video/*,application/pdf" onChange={(event) => setReplacementFile(event.target.files?.[0] ?? null)} /><small>{replacementFile ? `${replacementFile.name} · ${formatBytes(replacementFile.size)}` : "ไม่เลือกไฟล์ = แก้เฉพาะข้อมูล"}</small></label></div><div className="asset-form-actions"><button className="asset-primary-button" type="button" disabled={updateAssetMutation.isPending} onClick={() => void saveAssetEdit()}>{updateAssetMutation.isPending ? <Loader2 className="spin" size={16} /> : <Save size={16} />} บันทึกการแก้ไข</button></div></section>}
    <section className="asset-list-section" aria-labelledby="asset-list-title"><div className="asset-panel-heading"><div><span className="asset-kicker">MEDIA LIBRARY</span><h2 id="asset-list-title">ไฟล์ที่จัดเก็บแล้ว</h2></div><span className="asset-limit">{assetsQuery.data?.length ?? 0} ไฟล์</span></div><div className="asset-category-filters"><button type="button" className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>ทั้งหมด</button>{(Object.keys(categoryLabels) as AssetCategory[]).map((key) => <button type="button" className={category === key ? "active" : ""} key={key} onClick={() => setCategory(key)}>{categoryLabels[key]}</button>)}</div>{assetsQuery.isLoading ? <div className="asset-empty"><Loader2 className="spin" size={20} /> กำลังโหลดรายการไฟล์...</div> : assetsQuery.error ? <div className="asset-empty">โหลดรายการไฟล์ไม่สำเร็จ: {assetsQuery.error.message}</div> : assetsQuery.data?.length ? <div className="asset-grid">{assetsQuery.data.map((asset) => <article className="asset-card" key={asset.id}>{asset.contentType.startsWith("image/") ? <img src={asset.url} alt={asset.altText || asset.originalName} /> : <div className="asset-file-preview">{fileIcon(asset.contentType)}<span>{asset.contentType.split("/")[1]?.toUpperCase() || "FILE"}</span></div>}<div className="asset-card-copy"><strong title={asset.originalName}>{asset.originalName}</strong><small>{formatBytes(asset.sizeBytes)} · {asset.contentType}</small><label className="asset-category-select"><span>หมวด</span><select value={asset.category} disabled={setCategoryMutation.isPending} onChange={(event) => setCategoryMutation.mutate({ id: asset.id, category: event.target.value as AssetCategory })}>{(Object.keys(categoryLabels) as AssetCategory[]).map((key) => <option key={key} value={key}>{categoryLabels[key]}</option>)}</select></label><div className="asset-card-actions"><button type="button" onClick={() => beginAssetEdit(asset)}><Pencil size={13} /> แก้ไขรูป/ข้อมูล</button><button type="button" onClick={() => void copyUrl(asset.id, asset.url)}>{copiedId === asset.id ? <><Check size={13} /> คัดลอกแล้ว</> : <><Clipboard size={13} /> คัดลอก URL</>}</button><a href={asset.url} target="_blank" rel="noreferrer">เปิดไฟล์ <ArrowUpRight size={13} /></a></div></div></article>)}</div> : <div className="asset-empty"><FileImage size={22} /><strong>ยังไม่มีไฟล์ในหมวดนี้</strong><span>อัปโหลดภาพแรกเพื่อใช้กับสินค้าและแคมเปญ</span></div>}</section>
  </main>;
}

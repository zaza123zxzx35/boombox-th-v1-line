import { Drawer } from "vaul";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { FlavorPicker } from "@/components/FlavorPicker";
import { formatPrice, ColorOption, Product } from "@/data/catalog";

type ProductConfiguratorProps = {
  product: Product;
  open: boolean;
  selectedColor?: ColorOption;
  selectedFlavors: string[];
  onColorChange: (color: ColorOption) => void;
  onFlavorToggle: (name: string) => void;
  onFlavorRemove: (name: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function ProductConfigurator({ product, open, selectedColor, selectedFlavors, onColorChange, onFlavorToggle, onFlavorRemove, onClose, onConfirm }: ProductConfiguratorProps) {
  const maxFlavors = product.maxFlavors ?? 1;
  const colorMissing = Boolean(product.hasColorOption && !selectedColor);
  const flavorMissing = Boolean(product.canChooseFlavor && selectedFlavors.length === 0);

  return <Drawer.Root open={open} onOpenChange={(next) => !next && onClose()} direction="bottom">
    <Drawer.Portal><Drawer.Overlay className="drawer-overlay" /><Drawer.Content className="config-drawer">
      <div className="drawer-handle" /><div className="config-head"><div><Drawer.Title>{product.name}</Drawer.Title><Drawer.Description>เลือกตัวเลือกให้ตรงกับสไตล์ของคุณก่อนเพิ่มลงถุง</Drawer.Description></div><Drawer.Close asChild><button className="icon-button" type="button" aria-label="ปิดตัวเลือก"><X size={18} /></button></Drawer.Close></div>
      <div className="config-body">
        <div className="config-product-preview"><div className="config-product-image">{product.image ? <img key={selectedColor?.id ?? "default"} className="color-fade-image" src={selectedColor?.image || product.image} alt={`ภาพสินค้า ${product.name}${selectedColor ? ` สี${selectedColor.name}` : ""}`} /> : <span>ภาพสินค้าจะแสดงที่นี่</span>}</div><div><span className="section-kicker">สินค้าที่กำลังเลือก</span><strong>{product.name}{selectedColor ? ` · สี${selectedColor.name}` : ""}</strong><small>{product.quantity} · ฿{formatPrice(product.price)}</small></div></div>
        {product.hasColorOption && <section className="config-section"><div className="config-label"><strong>🎨 เลือกสีเครื่อง</strong><span>{selectedColor ? `เลือกแล้ว: ${selectedColor.name}` : "แตะรูปเพื่อดูสี"}</span></div><div className="color-options">{product.colors?.map((color) => <button key={color.id} type="button" aria-pressed={selectedColor?.id === color.id} className={`color-option ${selectedColor?.id === color.id ? "selected" : ""}`} onClick={() => onColorChange(color)}><span className="color-option-image"><img key={color.id} className="color-fade-image" src={color.image || product.image} alt={`${product.name} สี${color.name}`} /></span><span className="color-option-meta"><span className="color-swatch" style={{ backgroundColor: color.hex }} /><strong>{color.name}</strong></span>{selectedColor?.id === color.id && <span className="color-option-check"><Check size={14} /> เลือกแล้ว</span>}</button>)}</div>{colorMissing && <p className="config-error">⚠️ กรุณาเลือกสีเครื่องก่อนเพิ่มลงถุง</p>}</section>}
        {product.canChooseFlavor && <section className="config-section"><FlavorPicker selected={selectedFlavors} maxFlavors={maxFlavors} onToggle={onFlavorToggle} onRemove={onFlavorRemove} />{flavorMissing && <p className="config-error">⚠️ กรุณาเลือกอย่างน้อย 1 กลิ่นก่อนเพิ่มลงถุง</p>}</section>}
        <div className="config-confirm-wrap"><button className="primary-button full config-confirm" type="button" aria-disabled={colorMissing || flavorMissing} onClick={onConfirm}>{colorMissing || flavorMissing ? "เลือกตัวเลือกให้ครบก่อนเพิ่มลงถุง" : `เพิ่ม ${product.name} ลงถุง · ฿${formatPrice(product.price)}`} <Plus size={16} /></button><span className="config-confirm-hint">{colorMissing ? "เลือกสีเครื่องก่อน แล้วกดปุ่มนี้" : flavorMissing ? "เลือกกลิ่นอย่างน้อย 1 กลิ่น แล้วกดปุ่มนี้" : "เลือกครบแล้ว? กดปุ่มนี้เพื่อเพิ่มสินค้าเข้าถุง"}</span></div>
      </div>
    </Drawer.Content></Drawer.Portal>
  </Drawer.Root>;
}

import { useState } from "react";
import { Flame, Plus } from "lucide-react";
import { formatPrice, Product } from "@/data/catalog";

export function ProductArt({ accent, image, compact = false }: { accent: string; image?: string; compact?: boolean }) {
  return (
    <div className={`product-art art-${accent} ${compact ? "product-art-compact" : ""}`} aria-hidden="true">
      {image ? <img className="product-photo" src={image} alt="" /> : <>
        <div className="art-halo" />
        <div className="art-ring ring-one" />
        <div className="art-ring ring-two" />
        <div className="art-pod"><span className="art-mark">B</span><span className="art-line" /></div>
        <div className="art-beads beads-one" /><div className="art-beads beads-two" />
      </>}
    </div>
  );
}

function AddButton({ onClick, label = "เพิ่มลงถุง", disabled = false }: { onClick: () => void; label?: string; disabled?: boolean }) {
  const [pressed, setPressed] = useState(false);
  function handleClick() {
    setPressed(true);
    if (disabled) return;
    onClick();
    window.setTimeout(() => setPressed(false), 520);
  }
  return (
    <button className={`add-button ${pressed ? "is-added" : ""} ${disabled ? "is-disabled" : ""}`} disabled={disabled} type="button" title={disabled ? "สินค้าหมด" : "เพิ่มด่วน"} aria-label={disabled ? "สินค้าหมด" : "เพิ่มด่วนลงถุง"} onClick={(event) => { event.stopPropagation(); handleClick(); }}>
      <span>{disabled ? "หมดสินค้า" : pressed ? "เพิ่มแล้ว ✓" : label}</span>
      <Plus className={pressed ? "add-icon-pop" : ""} size={16} strokeWidth={2.5} />
    </button>
  );
}

export function ProductCard({ product, onAdd, repeat }: { product: Product; onAdd: (product: Product) => void; repeat?: boolean }) {
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  const lowStock = !outOfStock && product.stock !== undefined && product.stock <= 5;
  return (
    <article className={`product-card accent-${product.accent} ${outOfStock ? "is-out-of-stock" : ""}`} role="button" tabIndex={outOfStock ? -1 : 0} aria-disabled={outOfStock} onClick={() => !outOfStock && onAdd(product)} onKeyDown={(event) => { if (!outOfStock && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onAdd(product); } }}>
      <div className="product-card-topline">
        <span className="eyebrow">{product.eyebrow}</span>
        <span className="product-tag">{product.tag ?? product.badge}</span>{repeat && <span className="repeat-badge">ซื้ออีกครั้ง</span>}{product.popular && <span className="popular-badge"><Flame size={11} /> กลิ่นยอดนิยม</span>}{outOfStock ? <span className="stock-badge out">หมด</span> : lowStock ? <span className="stock-badge low">เหลือ {product.stock}</span> : product.stock !== undefined ? <span className="stock-badge in">มีสินค้า</span> : null}
      </div>
      <ProductArt accent={product.accent} image={product.image} />
      <div className="product-copy">
        <div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        <div className="product-meta">
          <div>
            <span className="meta-label">{product.quantity}</span>
            <div className="price-line">
              <strong>฿{formatPrice(product.price)}</strong>
              {product.compareAt && <del>฿{formatPrice(product.compareAt)}</del>}
            </div>
          </div>
          <AddButton onClick={() => onAdd(product)} disabled={outOfStock} />
        </div>
      </div>
    </article>
  );
}

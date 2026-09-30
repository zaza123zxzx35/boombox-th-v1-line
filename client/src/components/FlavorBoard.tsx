import { useMemo, useState } from "react";
import { flavors, flavorCategories, FlavorCategory } from "@/data/catalog";

/** Read-only flavor archive. Selection remains in ProductConfigurator. */
export function FlavorBoard() {
  const [activeCategory, setActiveCategory] = useState<FlavorCategory | "all">("all");
  const filteredFlavors = useMemo(
    () => activeCategory === "all" ? flavors : flavors.filter((flavor) => flavor.category === activeCategory),
    [activeCategory],
  );

  return (
    <section className="flavor-board" aria-labelledby="flavor-board-title">
      <div className="flavor-board-header">
        <h2 id="flavor-board-title">🌈 REAL FLAVOR BOARD</h2>
        <p>ดูโทนกลิ่นจริงก่อนเลือก</p>
        <span>อ่าน profile และดูโทนกลิ่น — การเลือกกลิ่นจะทำในหน้าตัวเลือกของสินค้ารีฟิล</span>
      </div>

      <div className="flavor-board-tabs" role="tablist" aria-label="หมวดหมู่กลิ่น">
        <button type="button" role="tab" aria-selected={activeCategory === "all"} onClick={() => setActiveCategory("all")} className={activeCategory === "all" ? "active" : ""}>
          🌟 ทั้งหมด ({flavors.length})
        </button>
        {flavorCategories.map((category) => {
          const count = flavors.filter((flavor) => flavor.category === category.key).length;
          const active = activeCategory === category.key;
          return (
            <button key={category.key} type="button" role="tab" aria-selected={active} onClick={() => setActiveCategory(category.key)} className={active ? "active" : ""}>
              {category.icon} {category.label} ({count})
            </button>
          );
        })}
      </div>

      {filteredFlavors.length ? (
        <div className="flavor-board-grid">
          {filteredFlavors.map((flavor) => (
            <article key={flavor.name} className="flavor-board-card">
              {flavor.badge && <span className={`flavor-board-badge ${flavor.badge}`}>
                {flavor.badge === "popular" ? "⭐ ยอดนิยม" : "💡 แนะนำ"}
              </span>}
              <span className="flavor-board-icon" aria-hidden="true">{flavor.icon}</span>
              <h3>{flavor.name}</h3>
              <p className="flavor-board-tagline">{flavor.tagline}</p>
              <p className="flavor-board-description">{flavor.description}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="flavor-board-empty" role="status">🔍 ไม่พบกลิ่นในหมวดนี้</div>
      )}
    </section>
  );
}

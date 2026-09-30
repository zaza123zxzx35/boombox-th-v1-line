import { Check, Minus } from "lucide-react";
import { toast } from "sonner";
import { flavors } from "@/data/catalog";

type FlavorPickerProps = {
  selected: string[];
  onToggle: (name: string) => void;
  onRemove?: (name: string) => void;
  maxFlavors: number;
};

export function FlavorPicker({ selected, onToggle, onRemove, maxFlavors }: FlavorPickerProps) {
  const isComplete = selected.length === maxFlavors;

  return (
    <div className="flavor-picker">
      <div className="config-label">
        <strong>🌈 เลือกกลิ่น <span className={`selection-badge ${isComplete ? "complete" : ""}`}>
          {isComplete ? `✅ ครบ ${maxFlavors} หน่วยแล้ว` : selected.length ? `เลือกแล้ว ${selected.length}/${maxFlavors}` : `เลือกได้ ${maxFlavors} หน่วย`}
        </span></strong>
        <span>💡 100 เม็ดต่อ 1 กลิ่น · เลือกซ้ำได้</span>
      </div>
      <div className="flavor-progress" role="progressbar" aria-label="โควตากลิ่นที่เลือก" aria-valuemin={0} aria-valuemax={maxFlavors} aria-valuenow={selected.length}>
        <div className={`flavor-progress-fill ${isComplete ? "complete" : ""}`} style={{ width: `${Math.min(100, (selected.length / maxFlavors) * 100)}%` }} />
      </div>
      <div className="flavor-progress-meta"><span>{selected.length ? `เลือกแล้ว ${selected.length} หน่วย` : "ยังไม่ได้เลือกกลิ่น"}</span><strong>{selected.length}/{maxFlavors}</strong></div>
      {maxFlavors >= 2 && <button type="button" className="quick-select" onClick={() => {
        const popular = flavors.filter((flavor) => flavor.popular).slice(0, maxFlavors).map((flavor) => flavor.name);
        window.dispatchEvent(new CustomEvent("boombox:quick-select", { detail: popular }));
      }}>⚡ เลือก {maxFlavors} กลิ่นยอดฮิต</button>}
      <div className="config-flavors">
        {flavors.map((flavor) => {
          const count = selected.filter((name) => name === flavor.name).length;
          const disabled = selected.length >= maxFlavors && count === 0;
          return <div className="flavor-choice" key={flavor.name}>
            <button type="button" aria-disabled={disabled} className={`config-flavor ${count ? "selected" : ""} ${disabled ? "disabled" : ""}`} onClick={() => {
              if (disabled) {
                toast("เลือกครบแล้ว!", { description: `เลือกได้ทั้งหมด ${maxFlavors} หน่วย และเลือกกลิ่นซ้ำได้`, duration: 2000 });
                return;
              }
              onToggle(flavor.name);
            }}>
              <span className="flavor-dot" style={{ backgroundColor: flavor.color }} />{flavor.name}
              {count > 0 && <span className="flavor-count">x{count}</span>}
              {count > 0 && <Check size={13} />}
              {disabled && <span className="chip-disabled">—</span>}
            </button>
            {count > 0 && onRemove && <button className="flavor-minus" type="button" onClick={() => onRemove(flavor.name)} aria-label={`ลด ${flavor.name} หนึ่งหน่วย`} title={`ลด ${flavor.name}`}><Minus size={13} /></button>}
          </div>;
        })}
      </div>
      <div className="flavor-summary"><strong>{selected.length ? "กลิ่นที่เลือก" : "ยังไม่ได้เลือกกลิ่น"}</strong><span>{selected.length ? `${formatSelections(selected)} · รวม ${selected.length}/${maxFlavors} หน่วย` : `เลือกได้สูงสุด ${maxFlavors} หน่วย · กลิ่นซ้ำได้`}</span></div>
    </div>
  );
}

function formatSelections(selected: string[]) {
  const counts = new Map<string, number>();
  selected.forEach((name) => counts.set(name, (counts.get(name) ?? 0) + 1));
  return Array.from(counts.entries()).map(([name, count]) => `${name} x${count}`).join(", ");
}

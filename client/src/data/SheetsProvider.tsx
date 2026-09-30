import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getPackages, getRefills, getFlavors } from "@/data/sheets";
import type { Product, Flavor } from "@/data/catalog";

type SheetsData = {
  packages: Product[];
  refills: Product[];
  flavors: Flavor[];
  loading: boolean;
  lastUpdate: number | null;
};

const SheetsContext = createContext<SheetsData>({ packages: [], refills: [], flavors: [], loading: true, lastUpdate: null });

export function SheetsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SheetsData>({ packages: [], refills: [], flavors: [], loading: true, lastUpdate: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const cached = localStorage.getItem("sheets_data");
      const cacheTime = localStorage.getItem("sheets_data_time");
      if (cached && cacheTime && Date.now() - Number(cacheTime) < 300000) {
        setData({ ...JSON.parse(cached), loading: false, lastUpdate: Number(cacheTime) });
      }
      try {
        const [packages, refills, flavors] = await Promise.all([getPackages(), getRefills(), getFlavors()]);
        if (cancelled) return;
        const newData = { packages, refills, flavors, loading: false, lastUpdate: Date.now() };
        localStorage.setItem("sheets_data", JSON.stringify(newData));
        localStorage.setItem("sheets_data_time", String(Date.now()));
        setData(newData);
      } catch {
        if (cancelled) return;
        setData((prev) => ({ ...prev, loading: false }));
      }
    }
    load();
    const interval = setInterval(load, 300000); // refresh every 5 min
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return <SheetsContext.Provider value={data}>{children}</SheetsContext.Provider>;
}

export function useSheets() {
  return useContext(SheetsContext);
}

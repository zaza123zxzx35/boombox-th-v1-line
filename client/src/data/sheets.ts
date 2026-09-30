const SHEETS = {
  packages: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKAZzKaZHMKUZOzkZnY3HxY8QItMJd1Zemx0XukVZbHiczlG7rG6KODH04FAa8yHhU--hwp2D75JD3/pub?gid=0&single=true&output=csv",
  refills: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKAZzKaZHMKUZOzkZnY3HxY8QItMJd1Zemx0XukVZbHiczlG7rG6KODH04FAa8yHhU--hwp2D75JD3/pub?gid=1812976450&single=true&output=csv",
  flavors: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKAZzKaZHMKUZOzkZnY3HxY8QItMJd1Zemx0XukVZbHiczlG7rG6KODH04FAa8yHhU--hwp2D75JD3/pub?gid=1018488955&single=true&output=csv",
};

function parseCSV(csv: string) {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const values = line.split("\t");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h.trim()] = (values[i] || "").trim(); });
    return row;
  });
}

async function fetchSheet(key: keyof typeof SHEETS) {
  const cached = localStorage.getItem("sheets_" + key);
  const cacheTime = localStorage.getItem("sheets_" + key + "_time");
  if (cached && cacheTime && Date.now() - Number(cacheTime) < 300000) {
    return JSON.parse(cached);
  }
  try {
    const res = await fetch(SHEETS[key]);
    const csv = await res.text();
    const data = parseCSV(csv);
    localStorage.setItem("sheets_" + key, JSON.stringify(data));
    localStorage.setItem("sheets_" + key + "_time", String(Date.now()));
    return data;
  } catch {
    const fallback = localStorage.getItem("sheets_" + key);
    return fallback ? JSON.parse(fallback) : [];
  }
}

export async function getPackages() {
  const rows = await fetchSheet("packages");
  return rows.map((r: any) => ({
    id: r.id,
    kind: "package" as const,
    name: r.name,
    eyebrow: "",
    description: "",
    price: Number(r.price) || 0,
    compareAt: Number(r.compareAt) || undefined,
    quantity: "",
    badge: r.badge || "",
    accent: "ice",
    tag: "",
    image: "/images/" + (r.image || "set-b.jpg"),
    popular: r.id === "daily",
    hasColorOption: r.colors?.includes(","),
    colors: (r.colors || "").split(",").filter(Boolean).map((c: string, i: number) => ({
      id: c.trim(), name: c.trim(), hex: c.includes("??") ? "#1a1a1a" : c.includes("???") ? "#f5f5f5" : c.includes("???") ? "#c0c0c0" : "#3b82f6",
      image: "/images/device-" + (c.includes("??") ? "black" : c.includes("???") ? "white" : c.includes("???") ? "vip-silver" : "vip-blue") + ".jpg"
    })),
    canChooseFlavor: Number(r.maxFlavors) > 0,
    maxFlavors: Number(r.maxFlavors) || 0,
    stock: Number(r.stock) || 0,
  }));
}

export async function getRefills() {
  const rows = await fetchSheet("refills");
  return rows.map((r: any) => ({
    id: r.id,
    kind: "refill" as const,
    name: r.name,
    eyebrow: "",
    description: "",
    price: Number(r.price) || 0,
    quantity: "",
    badge: r.badge || "",
    accent: "violet",
    image: "/images/" + (r.image || "refill-100.jpg"),
    popular: r.id === "refill-100",
    canChooseFlavor: Number(r.maxFlavors) > 0,
    maxFlavors: Number(r.maxFlavors) || 1,
    stock: Number(r.stock) || 0,
  }));
}

export async function getFlavors() {
  const rows = await fetchSheet("flavors");
  return rows.map((r: any) => ({
    name: r.name,
    note: r.note || "",
    detail: r.note || "",
    tagline: r.note || "",
    description: r.note || "",
    category: r.category || "fruit",
    color: r.color || "#ff7199",
    icon: "",
    badge: r.badge || undefined,
    popular: r.badge === "popular",
    inStock: r.inStock === "TRUE",
  }));
}

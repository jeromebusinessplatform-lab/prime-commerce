import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useCart } from "@/context/CartContext.tsx";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { ShoppingCart, Minus, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce.ts";

function BadgePill({ badge }: { badge: "NEW" | "SALE" | "LOW_STOCK" }) {
  const config = {
    NEW: { label: "NEW", bg: "#3b82f6" },
    SALE: { label: "SALE", bg: "#ef4444" },
    LOW_STOCK: { label: "LOW STOCK", bg: "#f97316" },
  }[badge];
  return (
    <span className="text-white font-black px-2 py-0.5 rounded-full text-[9px] leading-none" style={{ backgroundColor: config.bg, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.5px" }}>
      {config.label}
    </span>
  );
}

function ProductCard({ product }: { product: Doc<"products"> }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.productId === product._id);
  const qty = cartItem?.quantity ?? 0;
  const unitPrice = product.salePrice ?? product.price;
  const isOutOfStock = product.stock <= 0;
  const stockColor = product.stock <= 0 ? "#9ca3af" : product.stock <= 5 ? "#ef4444" : product.stock <= 10 ? "#f97316" : "#22c55e";

  const handleAdd = () => {
    if (isOutOfStock) return;
    if (qty === 0) {
      addItem({ productId: product._id, productName: product.name, unitPrice, image: product.image, quantity: 1 });
    } else {
      updateQuantity(product._id, qty + 1);
    }
  };

  return (
    <div className={`bg-white rounded-xl border overflow-hidden shadow-sm flex flex-col transition-opacity ${isOutOfStock ? "opacity-50 border-gray-200" : "border-gray-200"}`}>
      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingCart size={32} /></div>
        )}
        {product.badge && !isOutOfStock && <div className="absolute top-1.5 left-1.5"><BadgePill badge={product.badge} /></div>}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="bg-gray-900/80 text-white text-[9px] font-black px-2 py-0.5 rounded-full" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "1px" }}>OUT OF STOCK</span>
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col flex-1">
        <div className="text-black font-bold leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px" }}>{product.name}</div>
        {product.subname && <div className="text-gray-500 leading-tight mt-0.5" style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px" }}>{product.subname}</div>}
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px" }}>₱{unitPrice.toFixed(2)}</span>
          {product.salePrice && <span className="text-gray-400 line-through" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px" }}>₱{product.price.toFixed(2)}</span>}
        </div>
        <div className="font-semibold mt-0.5" style={{ fontFamily: "'Barlow', sans-serif", fontSize: "10px", color: stockColor }}>
          {isOutOfStock ? "Out of stock" : `Stock: ${product.stock}`}
        </div>
        <div className="mt-2 flex items-center gap-1">
          <button onClick={() => !isOutOfStock && addItem({ productId: product._id, productName: product.name, unitPrice, image: product.image, quantity: 1 })} disabled={isOutOfStock} className="border border-gray-300 rounded p-1 cursor-pointer hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
            <ShoppingCart size={14} />
          </button>
          <button onClick={() => qty > 0 && updateQuantity(product._id, qty - 1)} disabled={qty === 0} className="border border-gray-300 rounded p-1 cursor-pointer hover:bg-gray-50 disabled:opacity-30">
            <Minus size={14} />
          </button>
          <span className="w-6 text-center font-bold text-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px" }}>{qty}</span>
          <button onClick={handleAdd} disabled={isOutOfStock || product.stock <= qty} className="border border-gray-300 rounded p-1 cursor-pointer hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

type SortOption = "default" | "price_asc" | "price_desc" | "name_asc";
const SORT_LABELS: Record<SortOption, string> = {
  default: "Default",
  price_asc: "Price: Low \u2192 High",
  price_desc: "Price: High \u2192 Low",
  name_asc: "Name A\u2013Z",
};

export default function ShopCatalog() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const products = useQuery(api.products.list, { includeUnavailable: false });

  const categories = useMemo(() => {
    if (!products) return ["All"];
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
    return ["All", ...cats.sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (activeCategory !== "All") list = list.filter((p) => p.category === activeCategory);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.subname ?? "").toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q));
    }
    const inStock = list.filter((p) => p.stock > 0);
    const outOfStock = list.filter((p) => p.stock <= 0);
    const sortFn = (a: Doc<"products">, b: Doc<"products">) => {
      if (sort === "price_asc") return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      if (sort === "price_desc") return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
    };
    return [...inStock.sort(sortFn), ...outOfStock.sort(sortFn)];
  }, [products, activeCategory, debouncedSearch, sort]);

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-3 pt-2 pb-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" />
          </div>
          <div className="relative">
            <button onClick={() => setShowSortMenu((v) => !v)} className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 cursor-pointer whitespace-nowrap">
              <SlidersHorizontal size={13} />
              {sort === "default" ? "Sort" : SORT_LABELS[sort].split(":")[0].trim()}
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <button key={key} onClick={() => { setSort(key); setShowSortMenu(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 ${sort === key ? "text-black font-bold" : "text-gray-600"}`}>
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {categories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${activeCategory === cat ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.3px" }}>
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
      {showSortMenu && <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />}
      <div className="p-2">
        {!products ? (
          <div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 aspect-[3/5] animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShoppingCart size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No products found</p>
            {(search || activeCategory !== "All") && <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="mt-2 text-xs text-black underline cursor-pointer">Clear filters</button>}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">{filtered.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </div>
      <div className="text-center py-3 text-gray-400" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", letterSpacing: "0.5px" }}>USAGE OF THIS SYSTEM IS PROPRIETARY. DO NOT DISTRIBUTE OR COPY.</div>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, ChevronDown, Grid, List as ListIcon, X } from "lucide-react";
import { Product } from "../types";
import { ProductCard, Button } from "../components/Common";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { getProducts } from "../services/productService";

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [maxPrice, setMaxPrice] = useState(500);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryFilter = searchParams.get("category");
  const specialFilter = searchParams.get("filter");

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      // Fetch all products to have the full category list available
      const data = await getProducts();
      setAllProducts(data);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category Filter
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Special Filter (New/Sale)
    if (specialFilter === "new") {
      result = result.filter(p => p.isNew);
    } else if (specialFilter === "sale") {
      result = result.filter(p => p.isSale);
    }

    // Price Filter
    result = result.filter(p => (p.salePrice || p.price) <= maxPrice);

    // Sorting
    result.sort((a, b) => {
      const priceA = a.salePrice || a.price;
      const priceB = b.salePrice || b.price;

      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      // Default to "newest"
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [allProducts, categoryFilter, specialFilter, sortBy, maxPrice]);

  const categories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category));
    return Array.from(cats).sort();
  }, [allProducts]);

  return (
    <div className="pt-24 lg:pt-32 pb-24 min-h-screen bg-brand-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gray-400 mb-4 block">
              The Archive
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none">
              {categoryFilter || (specialFilter === "new" ? "New Arrivals" : specialFilter === "sale" ? "Sale Items" : "All Products")}
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand-gray-400">
            Showing {filteredProducts.length} Results
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between py-6 border-y border-brand-gray-100 mb-12 gap-6">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 font-display font-bold uppercase tracking-widest text-xs hover:text-brand-gray-500 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-display font-bold uppercase tracking-widest text-xs outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2 transition-colors", viewMode === "grid" ? "text-brand-black" : "text-brand-gray-300")}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2 transition-colors", viewMode === "list" ? "text-brand-black" : "text-brand-gray-300")}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-12">
            <div>
              <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Categories</h4>
              <div className="flex flex-col gap-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (categoryFilter === cat) {
                        searchParams.delete("category");
                      } else {
                        searchParams.set("category", cat);
                      }
                      setSearchParams(searchParams);
                    }}
                    className={cn(
                      "text-left text-sm font-medium transition-colors hover:text-brand-black",
                      categoryFilter === cat ? "text-brand-black font-bold" : "text-brand-gray-400"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Size</h4>
              <div className="grid grid-cols-4 gap-2">
                {["7", "8", "9", "10", "11", "12"].map(size => (
                  <button
                    key={size}
                    className="aspect-square border border-brand-gray-200 flex items-center justify-center text-xs font-bold hover:bg-brand-black hover:text-brand-white transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Price Range</h4>
              <div className="space-y-4">
                <input 
                  type="range" 
                  className="w-full accent-brand-black cursor-pointer" 
                  min="0" 
                  max="500" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                />
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Rs. 0</span>
                  <span>Up to Rs. {maxPrice}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[4/5] bg-brand-gray-100" />
                    <div className="h-4 bg-brand-gray-100 w-1/2" />
                    <div className="h-6 bg-brand-gray-100 w-3/4" />
                    <div className="h-4 bg-brand-gray-100 w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                "grid gap-x-8 gap-y-16",
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
              )}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className={viewMode === "list" ? "flex-row gap-8 items-center" : ""}
                  />
                ))}
              </div>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <div className="py-20 text-center">
                <h3 className="text-2xl font-display font-bold mb-4">No products found</h3>
                <p className="text-brand-gray-500 mb-8">Try adjusting your filters or search criteria.</p>
                <Button variant="outline" onClick={() => setSearchParams({})}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-white z-[70] p-8 rounded-t-3xl shadow-heavy max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display font-bold text-xl uppercase tracking-tight">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-10 pb-10">
                <div>
                  <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Categories</h4>
                  <div className="flex flex-wrap gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          if (categoryFilter === cat) {
                            searchParams.delete("category");
                          } else {
                            searchParams.set("category", cat);
                          }
                          setSearchParams(searchParams);
                        }}
                        className={cn(
                          "px-6 py-2 text-xs font-bold uppercase tracking-widest border transition-all",
                          categoryFilter === cat ? "bg-brand-black border-brand-black text-brand-white" : "border-brand-gray-200 text-brand-gray-400"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Size</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {["7", "8", "9", "10", "11", "12"].map(size => (
                      <button
                        key={size}
                        className="aspect-square border border-brand-gray-200 flex items-center justify-center text-xs font-bold hover:bg-brand-black hover:text-brand-white transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

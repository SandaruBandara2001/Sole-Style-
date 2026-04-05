import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save, Upload, Search } from "lucide-react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../types";
import { Button } from "../components/Common";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category: "Lifestyle",
    price: 0,
    image: "",
    images: [],
    description: "",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: [{ name: "Default", hex: "#000000" }],
    isNew: false,
    isSale: false,
    salePrice: 0
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      setProducts(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "Lifestyle",
        price: 0,
        image: "",
        images: [],
        description: "",
        sizes: ["7", "8", "9", "10", "11", "12"],
        colors: [{ name: "Default", hex: "#000000" }],
        isNew: false,
        isSale: false,
        salePrice: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        const newId = Date.now().toString();
        await addDoc(collection(db, "products"), {
          ...formData,
          id: newId,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gray-400 mb-4 block">
              Admin Portal
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none">
              Inventory Control
            </h1>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Silhouette
          </Button>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-wrap items-center justify-between py-6 border-y border-brand-gray-100 mb-12 gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
            <input 
              type="text"
              placeholder="Search Inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-gray-50 border-none px-12 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-brand-black transition-all"
            />
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-1">Total Items</p>
              <p className="text-2xl font-display font-black">{products.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-1">New Arrivals</p>
              <p className="text-2xl font-display font-black">{products.filter(p => p.isNew).length}</p>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-gray-100">
                <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Product</th>
                <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Category</th>
                <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Price</th>
                <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Status</th>
                <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-brand-gray-50 group hover:bg-brand-gray-50 transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-brand-gray-100 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-display font-bold uppercase text-sm">{product.name}</p>
                        <p className="text-[10px] text-brand-gray-400 uppercase tracking-widest">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="text-xs font-bold uppercase tracking-widest">{product.category}</span>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-col">
                      <span className={cn("text-xs font-bold", product.isSale && "text-red-600")}>
                        ${product.isSale ? product.salePrice : product.price}
                      </span>
                      {product.isSale && (
                        <span className="text-[10px] text-brand-gray-400 line-through">${product.price}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex gap-2">
                      {product.isNew && <span className="text-[8px] font-bold uppercase tracking-widest bg-brand-black text-brand-white px-2 py-1">New</span>}
                      {product.isSale && <span className="text-[8px] font-bold uppercase tracking-widest bg-red-600 text-brand-white px-2 py-1">Sale</span>}
                    </div>
                  </td>
                  <td className="py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 hover:bg-brand-white rounded-full transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-brand-white text-red-600 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="py-20 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-brand-black border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-[110] shadow-heavy overflow-y-auto"
            >
              <div className="p-12">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-display font-black uppercase tracking-tighter">
                    {editingProduct ? "Edit Silhouette" : "Add New Silhouette"}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)}>
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Product Name</label>
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                      >
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Performance">Performance</option>
                        <option value="Outdoor">Outdoor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Base Price ($)</label>
                      <input 
                        required
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Sale Price ($)</label>
                      <input 
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Main Image URL</label>
                    <input 
                      required
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Description</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.isNew}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        className="w-5 h-5 accent-brand-black"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest">New Arrival</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.isSale}
                        onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                        className="w-5 h-5 accent-brand-black"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest">On Sale</span>
                    </label>
                  </div>

                  <div className="pt-12 border-t border-brand-gray-100 flex gap-4">
                    <Button type="submit" className="flex-1 flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      {editingProduct ? "Update Silhouette" : "Save Silhouette"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

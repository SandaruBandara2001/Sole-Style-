import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save, Upload, Search, BarChart3, Package, DollarSign, ShoppingCart, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { collection, onSnapshot, setDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Product } from "../types";
import { Button } from "../components/Common";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"products" | "sales">("products");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'product' | 'order' } | null>(null);
  const [deleteVerification, setDeleteVerification] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
  }

  interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
      userId: string | undefined;
      email: string | null | undefined;
      emailVerified: boolean | undefined;
      isAnonymous: boolean | undefined;
      tenantId: string | null | undefined;
      providerInfo: {
        providerId: string;
        displayName: string | null;
        email: string | null;
        photoUrl: string | null;
      }[];
    }
  }

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("insufficient permissions")) {
      setError("Missing or insufficient permissions. Please ensure you are logged in as an administrator.");
    } else {
      setError(errorMessage);
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  };

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
    salePrice: 0,
    variants: []
  });

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      setProducts(data);
      setIsLoading(false);
    });

    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setOrders(data);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "variant" | "additional", variantIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (field === "image") {
        setFormData({ ...formData, image: base64String });
      } else if (field === "variant" && variantIndex !== undefined) {
        const newVariants = [...(formData.variants || [])];
        newVariants[variantIndex].images = [base64String, ...(newVariants[variantIndex].images || []).slice(1)];
        setFormData({ ...formData, variants: newVariants });
      } else if (field === "additional") {
        setFormData({ ...formData, images: [...(formData.images || []), base64String] });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenModal = (product?: Product) => {
      if (product) {
        setEditingProduct(product);
        setFormData({
          ...product,
          variants: product.variants || []
        });
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
          salePrice: 0,
          variants: []
        });
      }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        const newId = Date.now().toString();
        await setDoc(doc(db, "products", newId), {
          ...formData,
          id: newId,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, "products");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget({ id, type: 'product' });
    setDeleteVerification("");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOrder = async (id: string) => {
    setDeleteTarget({ id, type: 'order' });
    setDeleteVerification("");
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteVerification !== "DELETE") return;
    
    setError(null);
    try {
      const collectionName = deleteTarget.type === 'product' ? 'products' : 'orders';
      await deleteDoc(doc(db, collectionName, deleteTarget.id));
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteVerification("");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${deleteTarget.type}s/${deleteTarget.id}`);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    setError(null);
    try {
      await updateDoc(doc(db, "orders", id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setIsOrderModalOpen(false);
      setEditingOrder(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSales = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "processing": return <AlertCircle className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-amber-600 bg-amber-50";
      case "processing": return "text-blue-600 bg-blue-50";
      case "shipped": return "text-indigo-600 bg-indigo-50";
      case "delivered": return "text-emerald-600 bg-emerald-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="pt-24 lg:pt-32 pb-24 min-h-screen bg-brand-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-display font-black uppercase tracking-tighter leading-none">Admin Control</h1>
            <p className="text-brand-gray-500">Manage your kinetic archive and track performance.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-brand-gray-50 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab("products")}
                className={cn(
                  "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === "products" ? "bg-brand-black text-brand-white shadow-soft" : "text-brand-gray-400 hover:text-brand-black"
                )}
              >
                Products
              </button>
              <button 
                onClick={() => setActiveTab("sales")}
                className={cn(
                  "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === "sales" ? "bg-brand-black text-brand-white shadow-soft" : "text-brand-gray-400 hover:text-brand-black"
                )}
              >
                Sales
              </button>
            </div>
            {activeTab === "products" && (
              <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {activeTab === "sales" && (
          <div className="space-y-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-brand-gray-50 p-8 border border-brand-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Total Revenue</span>
                </div>
                <p className="text-3xl font-display font-black">Rs. {totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-brand-gray-50 p-8 border border-brand-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Total Orders</span>
                </div>
                <p className="text-3xl font-display font-black">{totalOrders}</p>
              </div>
              <div className="bg-brand-gray-50 p-8 border border-brand-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                    <Package className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Pending Orders</span>
                </div>
                <p className="text-3xl font-display font-black">{pendingOrders}</p>
              </div>
            </div>

            <div className="bg-brand-gray-50 border border-brand-gray-100 overflow-hidden">
              <div className="p-8 border-b border-brand-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-display font-black uppercase tracking-tighter">Sales History</h3>
                <BarChart3 className="w-5 h-5 text-brand-gray-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-brand-gray-200">
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Order ID</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Customer</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Date</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Total</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="group hover:bg-white transition-colors">
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold uppercase tracking-widest">#{order.id.slice(-8)}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{order.shippingAddress?.name || "Guest"}</span>
                            <span className="text-[10px] text-brand-gray-400 uppercase tracking-widest">{order.email || "No Email"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-medium">
                            {order.createdAt?.toDate().toLocaleDateString() || "Recently"}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold">Rs. {order.total.toFixed(2)}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            getStatusColor(order.status)
                          )}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingOrder(order);
                                setIsOrderModalOpen(true);
                              }}
                              className="p-2 hover:bg-brand-gray-50 rounded-full transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 hover:bg-brand-gray-50 text-red-600 rounded-full transition-colors"
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
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-8">
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

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-gray-100">
                    <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Product</th>
                    <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Category</th>
                    <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Price</th>
                    <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Status</th>
                    <th className="py-6 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 text-right px-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-200">
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
                            Rs. {product.isSale ? product.salePrice : product.price}
                          </span>
                          {product.isSale && (
                            <span className="text-[10px] text-brand-gray-400 line-through">Rs. {product.price}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex gap-2">
                          {product.isNew && <span className="text-[8px] font-bold uppercase tracking-widest bg-brand-black text-brand-white px-2 py-1">New</span>}
                          {product.isSale && <span className="text-[8px] font-bold uppercase tracking-widest bg-red-600 text-brand-white px-2 py-1">Sale</span>}
                        </div>
                      </td>
                      <td className="py-6 text-right px-8">
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
          </div>
        )}

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
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest">
                      {error}
                    </div>
                  )}
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
                      <input 
                        required
                        type="text"
                        list="categories"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                        placeholder="Select or type category"
                      />
                      <datalist id="categories">
                        {Array.from(new Set(products.map(p => p.category))).map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                        <option value="Lifestyle" />
                        <option value="Performance" />
                        <option value="Outdoor" />
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Base Price (Rs.)</label>
                      <input 
                        required
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Sale Price (Rs.)</label>
                      <input 
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
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
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Or Upload Main Image</label>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "image")}
                        className="w-full text-xs text-brand-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-brand-black file:text-brand-white hover:file:bg-brand-gray-800 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Additional Image URLs (One per line)</label>
                      <textarea 
                        rows={3}
                        value={formData.images?.join("\n")}
                        onChange={(e) => setFormData({ ...formData, images: e.target.value.split("\n").filter(url => url.trim() !== "") })}
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Or Upload Additional Image</label>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "additional")}
                        className="w-full text-xs text-brand-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-brand-black file:text-brand-white hover:file:bg-brand-gray-800 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Available Sizes (Comma separated)</label>
                      <input 
                        type="text"
                        value={formData.sizes?.join(", ")}
                        onChange={(e) => setFormData({ ...formData, sizes: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "") })}
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Colors (Format: Name:Hex, Name:Hex)</label>
                      <input 
                        type="text"
                        value={formData.colors?.map(c => `${c.name}:${c.hex}`).join(", ")}
                        onChange={(e) => {
                          const colorPairs = e.target.value.split(",").map(p => p.trim()).filter(p => p !== "");
                          const colors = colorPairs.map((p, idx) => {
                            const [name, hex] = p.split(":").map(s => s.trim());
                            return { name: name || `Color ${idx + 1}`, hex: hex || "#000000" };
                          });
                          setFormData({ ...formData, colors });
                        }}
                        className="w-full bg-brand-gray-50 border-none px-6 py-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                      />
                    </div>
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

                  {/* Variants Section */}
                  <div className="pt-12 border-t border-brand-gray-100">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-display font-black uppercase tracking-tighter">Color Variants</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const variantCount = (formData.variants || []).length + 1;
                          const newVariant = { name: `Color ${variantCount}`, hex: "#000000", images: [], sizes: formData.sizes || [] };
                          setFormData({ ...formData, variants: [...(formData.variants || []), newVariant] });
                        }}
                      >
                        Add Variant
                      </Button>
                    </div>

                    <div className="space-y-12">
                      {formData.variants?.map((variant, index) => (
                        <div key={index} className="p-6 bg-brand-gray-50 space-y-6 relative">
                          <button 
                            type="button"
                            onClick={() => {
                              const newVariants = [...(formData.variants || [])];
                              newVariants.splice(index, 1);
                              setFormData({ ...formData, variants: newVariants });
                            }}
                            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Color Name</label>
                              <input 
                                type="text"
                                value={variant.name}
                                onChange={(e) => {
                                  const newVariants = [...(formData.variants || [])];
                                  newVariants[index].name = e.target.value;
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="w-full bg-white border-none px-4 py-3 text-xs font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Hex Code</label>
                              <div className="flex gap-2">
                                <input 
                                  type="color"
                                  value={variant.hex}
                                  onChange={(e) => {
                                    const newVariants = [...(formData.variants || [])];
                                    newVariants[index].hex = e.target.value;
                                    setFormData({ ...formData, variants: newVariants });
                                  }}
                                  className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
                                />
                                <input 
                                  type="text"
                                  value={variant.hex}
                                  onChange={(e) => {
                                    const newVariants = [...(formData.variants || [])];
                                    newVariants[index].hex = e.target.value;
                                    setFormData({ ...formData, variants: newVariants });
                                  }}
                                  className="flex-1 bg-white border-none px-4 py-3 text-xs font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Variant Images (One per line)</label>
                              <textarea 
                                rows={2}
                                value={variant.images.join("\n")}
                                onChange={(e) => {
                                  const newVariants = [...(formData.variants || [])];
                                  newVariants[index].images = e.target.value.split("\n").filter(url => url.trim() !== "");
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="w-full bg-white border-none px-4 py-3 text-xs font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Or Upload Variant Image</label>
                              <input 
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "variant", index)}
                                className="w-full text-[10px] text-brand-gray-400 file:mr-4 file:py-1 file:px-2 file:border-0 file:text-[8px] file:font-bold file:uppercase file:bg-brand-black file:text-brand-white hover:file:bg-brand-gray-800 transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Variant Sizes (Comma separated)</label>
                            <input 
                              type="text"
                              value={variant.sizes.join(", ")}
                              onChange={(e) => {
                                const newVariants = [...(formData.variants || [])];
                                newVariants[index].sizes = e.target.value.split(",").map(s => s.trim()).filter(s => s !== "");
                                setFormData({ ...formData, variants: newVariants });
                              }}
                              className="w-full bg-white border-none px-4 py-3 text-xs font-medium outline-none focus:ring-1 focus:ring-brand-black transition-all"
                            />
                          </div>
                        </div>
                      ))}
                      {(!formData.variants || formData.variants.length === 0) && (
                        <p className="text-center py-8 text-brand-gray-400 text-xs font-medium uppercase tracking-widest border-2 border-dashed border-brand-gray-100">
                          No detailed variants added. Using default colors/sizes.
                        </p>
                      )}
                    </div>
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

      {/* Order Modal */}
      <AnimatePresence>
        {isOrderModalOpen && editingOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[110] shadow-heavy overflow-y-auto"
            >
              <div className="p-12">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-display font-black uppercase tracking-tighter">
                    Update Order
                  </h2>
                  <button onClick={() => setIsOrderModalOpen(false)}>
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-brand-gray-50 border border-brand-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-2">Order ID</p>
                    <p className="text-sm font-bold">#{editingOrder.id}</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Order Status</label>
                    <div className="grid grid-cols-1 gap-2">
                      {["pending", "processing", "shipped", "delivered"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateOrderStatus(editingOrder.id, status)}
                          className={cn(
                            "w-full px-6 py-4 text-xs font-bold uppercase tracking-widest border transition-all flex items-center justify-between",
                            editingOrder.status === status 
                              ? "bg-brand-black text-brand-white border-brand-black" 
                              : "bg-white text-brand-gray-600 border-brand-gray-200 hover:border-brand-black"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(status)}
                            {status}
                          </div>
                          {editingOrder.status === status && <CheckCircle className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-brand-gray-100">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {editingOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-gray-100">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase">{item.name}</p>
                            <p className="text-[10px] text-brand-gray-400 uppercase tracking-widest">Size: {item.size} | Qty: {item.quantity}</p>
                          </div>
                          <p className="text-xs font-bold">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-brand-gray-100">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-4">Shipping Address</h3>
                    <div className="text-xs space-y-1">
                      <p className="font-bold">{editingOrder.shippingAddress?.name}</p>
                      <p>{editingOrder.shippingAddress?.address}</p>
                      <p>{editingOrder.shippingAddress?.city}, {editingOrder.shippingAddress?.postalCode}</p>
                      <p>{editingOrder.shippingAddress?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[210] shadow-heavy p-12 border border-brand-gray-100"
            >
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center rounded-full mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Confirm Deletion</h3>
                  <p className="text-sm text-brand-gray-500">
                    This action is permanent and cannot be undone. All associated data will be lost.
                  </p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                    Type <span className="text-red-600">DELETE</span> to confirm
                  </p>
                  <input 
                    type="text"
                    value={deleteVerification}
                    onChange={(e) => setDeleteVerification(e.target.value)}
                    placeholder="Type DELETE here..."
                    className="w-full bg-brand-gray-50 border-none px-6 py-4 text-center text-sm font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    onClick={confirmDelete}
                    disabled={deleteVerification !== "DELETE"}
                    className={cn(
                      "w-full py-4 bg-red-600 hover:bg-red-700 text-white",
                      deleteVerification !== "DELETE" && "opacity-50 cursor-not-allowed grayscale"
                    )}
                  >
                    Permanently Delete
                  </Button>
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 hover:text-brand-black transition-colors"
                  >
                    Cancel Action
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { Button } from "../components/Common";
import { useUser } from "../UserContext";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { cn } from "../lib/utils";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  image: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  createdAt: any;
}

export const Orders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "processing": return <AlertCircle className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "text-amber-600 bg-amber-50";
      case "processing": return "text-blue-600 bg-blue-50";
      case "shipped": return "text-indigo-600 bg-indigo-50";
      case "delivered": return "text-emerald-600 bg-emerald-50";
    }
  };

  if (loading) {
    return (
      <div className="pt-24 lg:pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-black"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-32 pb-24 min-h-screen bg-brand-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter">Order History</h1>
            <p className="text-brand-gray-500">Track and manage your kinetic archive acquisitions.</p>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-8">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-gray-50 border border-brand-gray-100 overflow-hidden"
                >
                  <div className="p-6 sm:p-8 border-b border-brand-gray-200 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Order Placed</p>
                        <p className="text-sm font-bold">
                          {order.createdAt?.toDate().toLocaleDateString() || "Recently"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Total</p>
                        <p className="text-sm font-bold">Rs. {order.total.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Order ID</p>
                        <p className="text-sm font-bold uppercase">#{order.id.slice(-8)}</p>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      getStatusColor(order.status)
                    )}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-6 items-center">
                        <div className="w-20 h-20 bg-brand-gray-100 overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.productId}`} className="font-display font-bold uppercase tracking-tight hover:text-brand-gray-600 transition-colors truncate block">
                            {item.name}
                          </Link>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mt-1">
                            Size: {item.selectedSize} / Color: {item.selectedColor} / Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-4 bg-brand-gray-100/50 flex justify-end">
                    <Link to={`/orders/${order.id}`}>
                      <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-gray-600 hover:text-brand-black transition-colors">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-8 bg-brand-gray-50 border border-brand-gray-100">
              <Package className="w-16 h-16 mx-auto text-brand-gray-200" />
              <div className="space-y-2">
                <p className="text-brand-gray-500">You haven't placed any orders yet.</p>
                <p className="text-sm text-brand-gray-400">Your kinetic journey begins with your first acquisition.</p>
              </div>
              <Link to="/shop">
                <Button variant="outline">Explore Archive</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

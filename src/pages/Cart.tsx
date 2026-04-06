import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, RefreshCw, CreditCard, ShoppingBag } from "lucide-react";
import { Button } from "../components/Common";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../CartContext";
import { useUser } from "../UserContext";
import { db } from "../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export const Cart = () => {
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const subtotal = cartTotal;
  const shipping = subtotal > 150 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const orderRef = doc(collection(db, "orders"));
      const orderData = {
        id: orderRef.id,
        userId: user.uid,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          image: item.image
        })),
        total: total,
        status: "pending",
        shippingAddress: shippingInfo,
        email: user.email,
        createdAt: serverTimestamp()
      };

      await setDoc(orderRef, orderData);
      setOrderId(orderRef.id);
      setStep("success");
      clearCart();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === "success") {
    return (
      <div className="pt-40 pb-24 min-h-screen flex items-center justify-center bg-brand-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center space-y-8 p-12 bg-brand-gray-50 border border-brand-gray-100"
        >
          <div className="w-20 h-20 bg-brand-black text-brand-white flex items-center justify-center rounded-full mx-auto">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter">Order Confirmed</h1>
            <p className="text-brand-gray-500 leading-relaxed">
              Your kinetic archive is being prepared. We've sent a confirmation email to your inbox.
            </p>
          </div>
          <div className="pt-8 border-t border-brand-gray-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-4">Order Number: #{orderId || "SS-92841"}</p>
            <div className="flex flex-col gap-4">
              <Link to="/orders">
                <Button variant="outline" className="w-full">View My Orders</Button>
              </Link>
              <Link to="/shop">
                <Button className="w-full">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-32 pb-24 min-h-screen bg-brand-white">
      <div className="container mx-auto px-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-20">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
              step === "cart" ? "text-brand-black" : "text-brand-gray-400"
            )}>
              <span className={cn(
                "w-6 h-6 flex items-center justify-center border-2 rounded-full",
                step === "cart" ? "border-brand-black bg-brand-black text-brand-white" : "border-brand-gray-200"
              )}>1</span>
              Shopping Bag
            </div>
            <div className="w-12 h-px bg-brand-gray-200" />
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
              step === "checkout" ? "text-brand-black" : "text-brand-gray-400"
            )}>
              <span className={cn(
                "w-6 h-6 flex items-center justify-center border-2 rounded-full",
                step === "checkout" ? "border-brand-black bg-brand-black text-brand-white" : "border-brand-gray-200"
              )}>2</span>
              Checkout
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {step === "cart" ? (
              <>
                <h1 className="text-4xl font-display font-black uppercase tracking-tighter">Your Bag ({cart.length})</h1>

                {cart.length > 0 ? (
                  <div className="space-y-8">
                    {cart.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col sm:flex-row gap-8 py-8 border-b border-brand-gray-100 group"
                      >
                        <div className="w-full sm:w-40 aspect-square bg-brand-gray-50 overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-2">
                          <div className="flex justify-between gap-4">
                            <div>
                              <h3 className="font-display font-bold text-xl uppercase tracking-tight mb-2">{item.name}</h3>
                              <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-4">
                                Size: {item.selectedSize} / Color: {item.selectedColor}
                              </p>
                            </div>
                            <p className="font-display font-bold text-xl">Rs. {(item.salePrice || item.price) * item.quantity}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-brand-gray-200">
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)}
                                className="p-2 hover:bg-brand-gray-50 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)}
                                className="p-2 hover:bg-brand-gray-50 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-8">
                    <ShoppingBag className="w-16 h-16 mx-auto text-brand-gray-200" />
                    <p className="text-brand-gray-500">Your bag is currently empty.</p>
                    <Link to="/shop">
                      <Button variant="outline">Start Shopping</Button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-12">
                <h1 className="text-4xl font-display font-black uppercase tracking-tighter">Shipping Info</h1>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-brand-gray-50 border-none px-4 py-4 text-sm focus:ring-1 focus:ring-brand-black outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-brand-gray-50 border-none px-4 py-4 text-sm focus:ring-1 focus:ring-brand-black outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-brand-gray-50 border-none px-4 py-4 text-sm focus:ring-1 focus:ring-brand-black outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">City</label>
                    <input 
                      type="text" 
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-brand-gray-50 border-none px-4 py-4 text-sm focus:ring-1 focus:ring-brand-black outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Postal Code</label>
                    <input 
                      type="text" 
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-brand-gray-50 border-none px-4 py-4 text-sm focus:ring-1 focus:ring-brand-black outline-none" 
                    />
                  </div>
                </form>

                <h1 className="text-4xl font-display font-black uppercase tracking-tighter pt-12">Payment Method</h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="flex flex-col items-center gap-4 p-8 border-2 border-brand-black bg-brand-gray-50">
                    <CreditCard className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Credit Card</span>
                  </button>
                  <button className="flex flex-col items-center gap-4 p-8 border-2 border-transparent bg-brand-gray-50 hover:border-brand-gray-200 transition-all">
                    <div className="font-display font-black italic text-xl">PayPal</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">PayPal</span>
                  </button>
                  <button className="flex flex-col items-center gap-4 p-8 border-2 border-transparent bg-brand-gray-50 hover:border-brand-gray-200 transition-all">
                    <div className="font-display font-black text-xl">Pay</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Apple Pay</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-brand-gray-50 p-8 sm:p-10 sticky top-32 space-y-8">
              <h2 className="text-2xl font-display font-black uppercase tracking-tighter">Order Summary</h2>

              <div className="space-y-4 pt-4 border-t border-brand-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-500">Subtotal</span>
                  <span className="font-bold">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-500">Shipping</span>
                  <span className="font-bold">Rs. {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-500">Estimated Tax</span>
                  <span className="font-bold">Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl pt-4 border-t border-brand-gray-200">
                  <span className="font-display font-black uppercase tracking-tighter">Total</span>
                  <span className="font-display font-black">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              {step === "cart" ? (
                <Button
                  className="w-full group"
                  size="lg"
                  disabled={cart.length === 0}
                  onClick={() => setStep("checkout")}
                >
                  Checkout
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <div className="space-y-4">
                  <Button
                    className="w-full group"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Complete Purchase"}
                    {!isProcessing && <ShieldCheck className="w-4 h-4 ml-2" />}
                  </Button>
                  <button
                    onClick={() => setStep("cart")}
                    className="w-full text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 hover:text-brand-black transition-colors"
                  >
                    Back to Bag
                  </button>
                </div>
              )}

              <div className="space-y-6 pt-8 border-t border-brand-gray-200">
                <div className="flex items-center gap-4">
                  <Truck className="w-5 h-5 text-brand-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Free Shipping</span>
                    <span className="text-[10px] text-brand-gray-400">On all orders over Rs. 150</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <RefreshCw className="w-5 h-5 text-brand-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Easy Returns</span>
                    <span className="text-[10px] text-brand-gray-400">30-day extended window</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

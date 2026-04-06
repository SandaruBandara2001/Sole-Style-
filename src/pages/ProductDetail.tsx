import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, Heart, Share2, Plus, Minus, ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { Product } from "../types";
import { ProductCard, Button } from "../components/Common";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../CartContext";
import { useUser } from "../UserContext";
import { getProductById, getProducts } from "../services/productService";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, user } = useUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const currentVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return product.variants.find(v => v.name === selectedColor) || null;
  }, [product, selectedColor]);

  const displayImages = useMemo(() => {
    if (currentVariant && currentVariant.images.length > 0) {
      return currentVariant.images;
    }
    return product?.images || [];
  }, [product, currentVariant]);

  const displaySizes = useMemo(() => {
    if (currentVariant && currentVariant.sizes.length > 0) {
      return currentVariant.sizes;
    }
    return product?.sizes || [];
  }, [product, currentVariant]);

  useEffect(() => {
    setActiveImage(0);
    if (currentVariant && currentVariant.sizes.length > 0) {
      if (!currentVariant.sizes.includes(selectedSize || "")) {
        setSelectedSize(currentVariant.sizes[0]);
      }
    }
  }, [selectedColor, currentVariant]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      const found = await getProductById(id);
      if (found) {
        setProduct(found);
        
        // Initialize selection from variants if available, otherwise from colors
        if (found.variants && found.variants.length > 0) {
          setSelectedColor(found.variants[0].name || "");
          if (found.variants[0].sizes && found.variants[0].sizes.length > 0) {
            setSelectedSize(found.variants[0].sizes[0] || "");
          } else {
            setSelectedSize(found.sizes[0] || "");
          }
        } else {
          setSelectedColor(found.colors[0]?.name || "");
          setSelectedSize(found.sizes[0] || "");
        }
        
        // Fetch related products
        const related = await getProducts(found.category);
        setRelatedProducts(related.filter(p => p.id !== found.id).slice(0, 4));
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (isLoading) return (
    <div className="pt-40 flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-brand-black border-t-transparent rounded-full"
      />
      <p className="font-display font-bold uppercase tracking-widest text-xs">Loading Archive...</p>
    </div>
  );

  if (!product) return (
    <div className="pt-40 text-center">
      <h2 className="text-2xl font-display font-bold mb-4">Product Not Found</h2>
      <Link to="/shop">
        <Button variant="outline">Back To Shop</Button>
      </Link>
    </div>
  );

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    
    setIsAdding(true);
    addToCart(product, quantity, selectedSize, selectedColor);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <div className="pt-24 lg:pt-32 pb-24 bg-brand-white">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-12">
          <Link to="/" className="hover:text-brand-black">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-brand-black">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-brand-black">{product.category}</Link>
          <span>/</span>
          <span className="text-brand-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">
          {/* Image Gallery (Asymmetric) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 aspect-square bg-brand-gray-50 overflow-hidden">
              <motion.img
                key={`${selectedColor}-${activeImage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={displayImages[activeImage] || product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {displayImages.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "aspect-square bg-brand-gray-50 overflow-hidden cursor-pointer border-2 transition-all",
                  activeImage === i ? "border-brand-black" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt={`${product.name} ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gray-400">
                  {product.category}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={cn("w-3 h-3", i <= 4 ? "fill-brand-black" : "text-brand-gray-300")} />
                  ))}
                  <span className="text-[10px] font-bold ml-2">(48 Reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                {product.isSale ? (
                  <>
                    <span className="text-3xl font-display font-black">Rs. {product.salePrice}</span>
                    <span className="text-xl text-brand-gray-400 line-through font-display font-bold">Rs. {product.price}</span>
                    <span className="bg-red-600 text-brand-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                      Save {Math.round((1 - (product.salePrice || 0) / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-display font-black">Rs. {product.price}</span>
                )}
              </div>
              <p className="text-brand-gray-600 leading-relaxed max-w-md">
                {product.description}
              </p>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Color: {selectedColor}</h4>
              <div className="flex items-center gap-3">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map(variant => (
                    <button
                      key={variant.name}
                      onClick={() => setSelectedColor(variant.name)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all p-0.5",
                        selectedColor === variant.name ? "border-brand-black scale-110" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: variant.hex }} />
                    </button>
                  ))
                ) : (
                  product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all p-0.5",
                        selectedColor === color.name ? "border-brand-black scale-110" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Select Size</h4>
                <button 
                  onClick={() => setIsSizeChartOpen(true)}
                  className="text-[10px] font-bold uppercase tracking-widest underline hover:text-brand-gray-500 transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {displaySizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "aspect-square border flex items-center justify-center text-xs font-bold transition-all",
                      selectedSize === size ? "bg-brand-black border-brand-black text-brand-white" : "border-brand-gray-200 hover:border-brand-black"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-brand-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-4 hover:bg-brand-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-4 hover:bg-brand-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* Desktop Add to Bag */}
                <Button 
                  className="hidden lg:block lg:w-[279px]" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  {isAdding ? "Added!" : "Add to Bag"}
                </Button>
                {user && (
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="p-4 border border-brand-gray-200 hover:bg-brand-gray-50 transition-colors"
                  >
                    <Heart className={cn("w-5 h-5", isInWishlist(product.id) && "fill-red-600 text-red-600")} />
                  </button>
                )}
              </div>
              {/* Mobile Add to Bag */}
              <Button 
                className="lg:hidden w-full" 
                size="lg"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? "Added!" : "Add to Bag"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => {
                  handleAddToCart();
                  navigate("/cart");
                }}
              >
                Buy It Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-brand-gray-100">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-5 h-5 text-brand-gray-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RefreshCw className="w-5 h-5 text-brand-gray-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">30-Day Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-gray-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <section className="py-32 border-t border-brand-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gray-400 mb-6 block">
                The Narrative
              </span>
              <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none mb-10">
                Designed For <br /> The Kinetic Athlete
              </h2>
              <div className="space-y-6 text-lg text-brand-gray-600 leading-relaxed">
                <p>
                  The {product.name} isn't just a shoe; it's a statement of intent. Every stitch, every layer of foam, and every curve of the outsole has been engineered to optimize your movement.
                </p>
                <p>
                  Our design philosophy centers on the "Kinetic Advantage" — the moment where human potential meets technical precision. Whether you're navigating the urban sprawl or conquering the trail, this silhouette adapts to your rhythm.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2 aspect-[4/3] bg-brand-gray-50 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop"
                alt="Narrative"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Related Products */}
        <section className="py-32 border-t border-brand-gray-100">
          <div className="flex items-end justify-between mb-16">
            <h2 className="text-4xl font-display font-black uppercase tracking-tighter">Complete The Look</h2>
            <Link to="/shop" className="group flex items-center gap-2 font-display font-bold uppercase tracking-widest text-xs">
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeChartOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white p-8 md:p-12 shadow-heavy overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsSizeChartOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-brand-gray-100 rounded-full transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>

              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-24 border-x-2 border-brand-gray-100 relative">
                    <div className="absolute inset-x-0 top-0 h-px bg-brand-gray-100" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-brand-gray-100" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 150" className="w-12 h-20 fill-brand-black">
                        <path d="M50,140 C30,140 15,120 15,90 C15,60 30,40 50,40 C70,40 85,60 85,90 C85,120 70,140 50,140 Z M50,35 C55,35 60,30 60,25 C60,20 55,15 50,15 C45,15 40,20 40,25 C40,30 45,35 50,35 Z M30,30 C35,30 38,26 38,22 C38,18 35,14 30,14 C25,14 22,18 22,22 C22,26 25,30 30,30 Z M70,30 C75,30 78,26 78,22 C78,18 75,14 70,14 C65,14 62,18 62,22 C62,26 65,30 70,30 Z" />
                      </svg>
                    </div>
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                      (X cm / inch)
                    </div>
                  </div>
                </div>
                <h3 className="text-3xl font-display font-black uppercase tracking-tighter">Size Guide</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-brand-black text-brand-white">
                      <th className="py-4 px-2 text-[10px] font-bold uppercase tracking-widest">EU/ASIA</th>
                      <th className="py-4 px-2 text-[10px] font-bold uppercase tracking-widest">US</th>
                      <th className="py-4 px-2 text-[10px] font-bold uppercase tracking-widest">UK</th>
                      <th className="py-4 px-2 text-[10px] font-bold uppercase tracking-widest">JAPAN</th>
                      <th className="py-4 px-2 text-[10px] font-bold uppercase tracking-widest">KOREA</th>
                      <th className="py-4 px-2 text-[10px] font-bold uppercase tracking-widest">Length (CM)</th>
                      <th className="py-4 px-2 text-[10px] font-bold uppercase tracking-widest">Length (IN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gray-100">
                    {[
                      { eu: "35", us: "4", uk: "2", jp: "22.0", kr: "220", cm: "22.3", in: "8.78\"" },
                      { eu: "36", us: "5", uk: "3", jp: "22.5", kr: "225", cm: "23.0", in: "9.05\"" },
                      { eu: "37", us: "6", uk: "4", jp: "23.0", kr: "230", cm: "23.7", in: "9.33\"" },
                      { eu: "38", us: "7", uk: "5", jp: "23.5", kr: "235", cm: "24.3", in: "9.57\"" },
                      { eu: "39", us: "8", uk: "6", jp: "24.0", kr: "240", cm: "25.0", in: "9.84\"" },
                      { eu: "40", us: "9", uk: "7", jp: "24.5", kr: "245", cm: "25.7", in: "10.12\"" },
                      { eu: "41", us: "10", uk: "8", jp: "25.0", kr: "250", cm: "26.3", in: "10.35\"" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-brand-gray-50 transition-colors">
                        <td className="py-4 px-2 text-xs font-bold">{row.eu}</td>
                        <td className="py-4 px-2 text-xs font-bold">{row.us}</td>
                        <td className="py-4 px-2 text-xs font-bold">{row.uk}</td>
                        <td className="py-4 px-2 text-xs font-bold">{row.jp}</td>
                        <td className="py-4 px-2 text-xs font-bold">{row.kr}</td>
                        <td className="py-4 px-2 text-xs font-bold">{row.cm}</td>
                        <td className="py-4 px-2 text-xs font-bold">{row.in}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                  If you are between sizes, we recommend sizing up.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

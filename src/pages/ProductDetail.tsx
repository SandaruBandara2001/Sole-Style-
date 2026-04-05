import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Heart, Share2, Plus, Minus, ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { Product } from "../types";
import { ProductCard, Button } from "../components/Common";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { useCart } from "../CartContext";
import { useUser } from "../UserContext";
import { getProductById, getProducts } from "../services/productService";

export const ProductDetail = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      const found = await getProductById(id);
      if (found) {
        setProduct(found);
        setSelectedColor(found.colors[0].name);
        setSelectedSize(found.sizes[0]);
        
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
    <div className="pt-32 pb-24 bg-brand-white">
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
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[activeImage] || product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.map((img, i) => (
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
                    <span className="text-3xl font-display font-black">${product.salePrice}</span>
                    <span className="text-xl text-brand-gray-400 line-through font-display font-bold">${product.price}</span>
                    <span className="bg-red-600 text-brand-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                      Save {Math.round((1 - (product.salePrice || 0) / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-display font-black">${product.price}</span>
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
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all p-0.5",
                      selectedColor === color.name ? "border-brand-black" : "border-transparent"
                    )}
                  >
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Select Size</h4>
                <button className="text-[10px] font-bold uppercase tracking-widest underline">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map(size => (
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
                <Button 
                  className="flex-1" 
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
              <Button variant="outline" className="w-full" size="lg">Buy It Now</Button>
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
    </div>
  );
};

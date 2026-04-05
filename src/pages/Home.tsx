import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Play, Star, Quote } from "lucide-react";
import { Product } from "../types";
import { ProductCard, Button } from "../components/Common";
import { getProducts } from "../services/productService";

export const Home = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const data = await getProducts(null, 'new');
      setNewArrivals(data.slice(0, 4));
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-brand-gray-50">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1974&auto=format&fit=crop"
            alt="Hero"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="inline-block bg-brand-black text-brand-white text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 mb-8">
              The New Air-Lite
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.9] mb-8 drop-shadow-sm">
              Engineered <br />
              <span className="text-brand-black/80 stroke-brand-black stroke-1" style={{ WebkitTextStroke: "1px black" }}>For The</span> <br />
              Kinetic Athlete
            </h1>
            <p className="text-lg text-brand-gray-900 font-sans max-w-md mb-10 leading-relaxed font-medium">
              Experience the archive of performance-driven design. Curated for those who move with intention.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="group">
                  Shop The Archive
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Watch Film
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 rotate-90 origin-left translate-x-2">Scroll</span>
          <div className="w-px h-16 bg-brand-gray-200 relative overflow-hidden">
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-brand-black"
            />
          </div>
        </div>
      </section>

      {/* Categories / Curated Archive */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gray-400 mb-4 block">
                The Curated Archive
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none">
                Explore By <br /> Movement
              </h2>
            </div>
            <Link to="/shop" className="group flex items-center gap-2 font-display font-bold uppercase tracking-widest text-xs">
              View All Categories
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Performance", img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop", count: "12 Items" },
              { name: "Lifestyle", img: "https://images.unsplash.com/photo-1512374382149-4332c6c021f1?q=80&w=1966&auto=format&fit=crop", count: "24 Items" },
              { name: "Outdoor", img: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop", count: "08 Items" },
            ].map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative aspect-[3/4] overflow-hidden bg-brand-gray-100"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-brand-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest mb-2 block opacity-80">{cat.count}</span>
                  <h3 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">{cat.name}</h3>
                  <Link to={`/shop?category=${cat.name}`}>
                    <Button variant="outline" size="sm" className="border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black">
                      Explore
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="py-24 bg-brand-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gray-400 mb-4 block">
                Fresh Drops
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none">
                New Arrivals
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[4/5] bg-brand-gray-200" />
                  <div className="h-4 bg-brand-gray-200 w-1/2" />
                  <div className="h-6 bg-brand-gray-200 w-3/4" />
                </div>
              ))
            ) : (
              newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Mid-Season Sale Banner */}
      <section className="py-24 bg-brand-black text-brand-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop"
            alt="Sale"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block border border-brand-white text-brand-white text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 mb-8">
              Limited Time Offer
            </span>
            <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.9] mb-8">
              Mid-Season <br /> Sale
            </h2>
            <p className="text-xl text-brand-gray-400 font-sans mb-10 leading-relaxed">
              Up to <span className="text-brand-white font-bold">40% OFF</span> on selected performance and lifestyle silhouettes.
            </p>
            <Link to="/shop?filter=sale">
              <Button variant="outline" size="lg" className="border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black">
                Shop The Sale
              </Button>
            </Link>
          </div>
        </div>

        {/* Marquee */}
        <div className="mt-20 flex whitespace-nowrap overflow-hidden border-y border-brand-gray-800 py-6">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-20 items-center"
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-20 items-center">
                <span className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter opacity-20">Sole & Style</span>
                <span className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter opacity-20">Sole & Style</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand Showcase / Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] bg-brand-gray-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1974&auto=format&fit=crop"
                  alt="Showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-black p-8 text-brand-white hidden md:flex flex-col justify-between">
                <Quote className="w-10 h-10 opacity-20" />
                <p className="font-sans text-sm italic leading-relaxed">
                  "The most responsive shoe I've ever worn. It feels like an extension of my own body."
                </p>
                <div>
                  <p className="font-display font-bold uppercase tracking-widest text-xs">Marcus Thorne</p>
                  <p className="text-[10px] text-brand-gray-500 uppercase tracking-widest">Olympic Marathoner</p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gray-400 mb-4 block">
                  Voice of the Runner
                </span>
                <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none mb-8">
                  Designed For <br /> The Kinetic Athlete
                </h2>
                <p className="text-lg text-brand-gray-600 leading-relaxed">
                  Every silhouette in our archive is tested by elite athletes across diverse terrains. We don't just build shoes; we engineer kinetic advantages.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-4xl font-display font-black mb-2">98%</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">Energy Return</p>
                </div>
                <div>
                  <h4 className="text-4xl font-display font-black mb-2">120g</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">Average Weight</p>
                </div>
                <div>
                  <h4 className="text-4xl font-display font-black mb-2">500+</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">Pro Athletes</p>
                </div>
                <div>
                  <h4 className="text-4xl font-display font-black mb-2">15</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">Design Awards</p>
                </div>
              </div>

              <Button variant="outline" size="lg">Read Our Story</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

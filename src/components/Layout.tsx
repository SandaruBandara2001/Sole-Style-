import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, LogOut, Settings, Heart } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../CartContext";
import { useUser } from "../UserContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const { user, profile, isAdmin } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const navLinks = [
    { name: "New Arrivals", path: "/shop?filter=new" },
    { name: "Performance", path: "/shop?category=Performance" },
    { name: "Lifestyle", path: "/shop?category=Lifestyle" },
    { name: "Sale", path: "/shop?filter=sale" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500",
        isScrolled ? "bg-white/80 backdrop-blur-md py-4 shadow-soft" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 -ml-2"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-black flex items-center justify-center overflow-hidden">
            <span className="text-brand-white font-display font-bold text-xl leading-none group-hover:scale-110 transition-transform">S</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tighter uppercase hidden sm:block">Sole & Style</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="font-sans text-sm font-medium uppercase tracking-widest hover:text-brand-gray-500 transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-black transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors hidden sm:block"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-4 relative group/user">
                {isAdmin && (
                  <Link to="/admin" className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors text-brand-black" title="Admin Portal">
                    <Settings className="w-5 h-5" />
                  </Link>
                )}
                <button className="flex items-center gap-2 p-1 hover:bg-brand-gray-100 rounded-full transition-colors">
                  <div className="w-8 h-8 bg-brand-black text-brand-white flex items-center justify-center rounded-full text-[10px] font-bold uppercase">
                    {profile?.displayName?.charAt(0) || user.email?.charAt(0)}
                  </div>
                </button>
                
                {/* User Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-brand-gray-100 shadow-heavy opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 z-[60]">
                  <div className="p-4 border-b border-brand-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-1">Account</p>
                    <p className="text-xs font-bold truncate">{profile?.displayName || user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-gray-600 hover:bg-brand-gray-50 transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                      My Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-gray-600 hover:bg-brand-gray-50 transition-colors">
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-brand-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          <Link to="/cart" className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-black text-brand-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-[100] p-6 flex flex-col"
          >
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-12">
                <span className="font-display font-bold text-xl tracking-tighter uppercase">Sole & Style</span>
                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="max-w-4xl mx-auto w-full pt-20">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gray-400 mb-6 block">
                  What are you looking for?
                </span>
                <div className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-brand-gray-300" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the archive..."
                    className="w-full bg-transparent border-b-2 border-brand-gray-100 py-6 pl-12 text-4xl md:text-6xl font-display font-black uppercase tracking-tighter outline-none focus:border-brand-black transition-colors"
                  />
                </div>
                
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-6">Trending Searches</h4>
                    <div className="flex flex-wrap gap-3">
                      {["Air-Lite", "Performance", "Sale", "Lifestyle", "Outdoor"].map(tag => (
                        <button 
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-4 py-2 bg-brand-gray-50 text-xs font-bold uppercase tracking-widest hover:bg-brand-black hover:text-brand-white transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400 mb-6">Quick Links</h4>
                    <div className="flex flex-col gap-4">
                      <Link to="/shop?filter=new" onClick={() => setIsSearchOpen(false)} className="text-xl font-display font-bold uppercase tracking-tight hover:pl-2 transition-all">New Arrivals</Link>
                      <Link to="/shop?filter=sale" onClick={() => setIsSearchOpen(false)} className="text-xl font-display font-bold uppercase tracking-tight hover:pl-2 transition-all">Mid-Season Sale</Link>
                      <Link to="/shop" onClick={() => setIsSearchOpen(false)} className="text-xl font-display font-bold uppercase tracking-tight hover:pl-2 transition-all">All Products</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-[70] p-8 shadow-heavy"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="font-display font-bold text-xl tracking-tighter uppercase">Sole & Style</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-display text-2xl font-bold uppercase tracking-tight hover:pl-2 transition-all"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-px bg-brand-gray-100 my-4" />
                {user ? (
                  <>
                    <div className="flex flex-col gap-1 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Logged in as</span>
                      <span className="font-display font-bold text-xl uppercase tracking-tight">{profile?.displayName || user.email?.split('@')[0]}</span>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-brand-black">
                        <Settings className="w-5 h-5" /> Admin Portal
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 text-lg font-medium text-red-600">
                      <LogOut className="w-5 h-5" /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium">
                    <User className="w-5 h-5" /> Account
                  </Link>
                )}
                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium">
                  <ShoppingBag className="w-5 h-5" /> Shopping Bag
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1000);
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={status === "success" ? "Subscribed!" : "Email address"}
        disabled={status === "loading" || status === "success"}
        className={cn(
          "bg-brand-gray-900 border-none px-4 py-2 text-sm w-full focus:ring-1 focus:ring-brand-white transition-all outline-none",
          status === "success" && "text-brand-green-500 placeholder:text-brand-green-500"
        )}
      />
      <button 
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="bg-brand-white text-brand-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-gray-200 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "..." : status === "success" ? "✓" : "Join"}
      </button>
    </form>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-brand-black text-brand-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-white flex items-center justify-center">
                <span className="text-brand-black font-display font-bold text-xl leading-none">S</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tighter uppercase">Sole & Style</span>
            </Link>
            <p className="text-brand-gray-400 font-sans text-sm leading-relaxed max-w-xs">
              Redefining the kinetic experience through curated archives and performance-driven design.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-brand-gray-400">
              <li><Link to="/shop" className="hover:text-brand-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?category=Performance" className="hover:text-brand-white transition-colors">Performance</Link></li>
              <li><Link to="/shop?category=Lifestyle" className="hover:text-brand-white transition-colors">Lifestyle</Link></li>
              <li><Link to="/shop?filter=sale" className="hover:text-brand-white transition-colors">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-brand-gray-400">
              <li><Link to="/" className="hover:text-brand-white transition-colors">Our Story</Link></li>
              <li><Link to="/" className="hover:text-brand-white transition-colors">Sustainability</Link></li>
              <li><Link to="/" className="hover:text-brand-white transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-brand-white transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Newsletter</h4>
            <p className="text-sm text-brand-gray-400 mb-4">Join the archive for early access and exclusive drops.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-brand-gray-800 gap-6">
          <p className="text-xs text-brand-gray-500">© 2026 Sole & Style. All rights reserved.</p>
          <div className="flex items-center gap-8 text-xs text-brand-gray-500">
            <Link to="/" className="hover:text-brand-white transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-brand-white transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-brand-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye, Heart } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { Product } from "../types";
import { useUser } from "../UserContext";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { toggleWishlist, isInWishlist, user } = useUser();
  const isWishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("group relative flex flex-col gap-4", className)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-gray-50">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-brand-black text-brand-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              New
            </span>
          )}
          {product.isSale && (
            <span className="bg-red-600 text-brand-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {user && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-soft hover:bg-white transition-colors z-10"
          >
            <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-red-600 text-red-600" : "text-brand-black")} />
          </button>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <Link
            to={`/product/${product.id}`}
            className="w-12 h-12 bg-brand-white flex items-center justify-center rounded-full hover:bg-brand-black hover:text-brand-white transition-colors shadow-medium"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <button className="w-12 h-12 bg-brand-white flex items-center justify-center rounded-full hover:bg-brand-black hover:text-brand-white transition-colors shadow-medium">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
            {product.category}
          </span>
          <div className="flex items-center gap-2">
            {product.isSale ? (
              <>
                <span className="text-sm font-bold">Rs. {product.salePrice}</span>
                <span className="text-xs text-brand-gray-400 line-through">Rs. {product.price}</span>
              </>
            ) : (
              <span className="text-sm font-bold">Rs. {product.price}</span>
            )}
          </div>
        </div>
        <Link to={`/product/${product.id}`} className="font-display font-bold text-lg tracking-tight hover:text-brand-gray-600 transition-colors">
          {product.name}
        </Link>
      </div>
    </motion.div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => {
  const variants = {
    primary: "bg-brand-black text-brand-white hover:bg-brand-gray-800",
    secondary: "bg-brand-gray-100 text-brand-black hover:bg-brand-gray-200",
    outline: "bg-transparent border border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-white",
    ghost: "bg-transparent text-brand-black hover:bg-brand-gray-100",
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-10 py-4 text-sm",
    xl: "px-14 py-5 text-base",
  };

  return (
    <button
      className={cn(
        "font-display font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

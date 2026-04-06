import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { ProductCard, Button } from "../components/Common";
import { useUser } from "../UserContext";
import { getProductById } from "../services/productService";
import { Product } from "../types";

export const Wishlist = () => {
  const { profile, loading: userLoading } = useUser();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!profile?.wishlist || profile.wishlist.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const products = await Promise.all(
          profile.wishlist.map(id => getProductById(id))
        );
        setWishlistProducts(products.filter((p): p is Product => p !== null));
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchWishlistProducts();
    }
  }, [profile?.wishlist, userLoading]);

  if (loading || userLoading) {
    return (
      <div className="pt-24 lg:pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-black"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-32 pb-24 min-h-screen bg-brand-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter">My Wishlist</h1>
            <p className="text-brand-gray-500">Your curated selection of kinetic archive pieces.</p>
          </div>

          {wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-8 bg-brand-gray-50 border border-brand-gray-100">
              <Heart className="w-16 h-16 mx-auto text-brand-gray-200" />
              <div className="space-y-2">
                <p className="text-brand-gray-500">Your wishlist is empty.</p>
                <p className="text-sm text-brand-gray-400">Save items you love to keep track of them.</p>
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

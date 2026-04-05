import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Header, Footer } from "./components/Layout";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Auth } from "./pages/Auth";
import { Cart } from "./pages/Cart";
import { Admin } from "./pages/Admin";
import { Orders } from "./pages/Orders";
import { Wishlist } from "./pages/Wishlist";
import { CartProvider } from "./CartContext";
import { UserProvider, useUser } from "./UserContext";
import { seedProducts, testConnection } from "./services/productService";

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading, isAdmin } = useUser();
  const location = useLocation();

  if (loading) return <div className="pt-40 text-center">Verifying Credentials...</div>;

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const { isAdmin, loading } = useUser();

  useEffect(() => {
    testConnection();
    if (!loading && isAdmin) {
      console.log("Admin detected, attempting to seed products...");
      seedProducts();
    }
  }, [isAdmin, loading]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <UserProvider>
        <CartProvider>
          <ScrollToTop />
          <AppContent />
        </CartProvider>
      </UserProvider>
    </Router>
  );
}

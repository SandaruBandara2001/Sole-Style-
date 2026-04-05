import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Github, Chrome } from "lucide-react";
import { Button } from "../components/Common";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  updateProfile
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleAuthError = (err: any) => {
    console.error("Auth Error:", err);
    let message = "An error occurred during authentication.";
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      message = "Invalid email or password.";
    } else if (err.code === "auth/email-already-in-use") {
      message = "This email is already in use.";
    } else if (err.code === "auth/weak-password") {
      message = "Password should be at least 6 characters.";
    } else if (err.code === "auth/operation-not-allowed") {
      message = "This login method is currently disabled. Please contact the administrator or enable it in the Firebase Console.";
    } else if (err.message) {
      message = err.message;
    }
    setError(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile
        await updateProfile(user, { displayName: fullName });
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: fullName,
          role: user.email === "sandarujbandara@gmail.com" ? "admin" : "user",
          createdAt: serverTimestamp()
        });
      }
      setIsSuccess(true);
      setTimeout(() => navigate("/shop"), 2000);
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create/Update user document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.email === "sandarujbandara@gmail.com" ? "admin" : "user",
        createdAt: serverTimestamp()
      }, { merge: true });
      
      setIsSuccess(true);
      setTimeout(() => navigate("/shop"), 2000);
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-white p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="w-20 h-20 bg-brand-black text-brand-white flex items-center justify-center mx-auto rounded-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <ArrowRight className="w-10 h-10" />
            </motion.div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-black uppercase tracking-tighter leading-none">
              {isLogin ? "Welcome Back" : "Account Created"}
            </h2>
            <p className="text-brand-gray-500 font-medium">
              Redirecting you to the kinetic archive...
            </p>
          </div>
          <Link to="/shop">
            <Button className="w-full mt-8">Go To Shop</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch bg-brand-white">
      {/* Left Side: Immersive Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1974&auto=format&fit=crop"
          alt="Auth"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-brand-black/40 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-end p-20 text-brand-white">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-brand-white flex items-center justify-center">
              <span className="text-brand-black font-display font-bold text-2xl leading-none">S</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter uppercase">Sole & Style</span>
          </Link>
          <h2 className="text-6xl font-display font-black uppercase tracking-tighter leading-none mb-8">
            Join The <br /> Curated Archive
          </h2>
          <p className="text-xl text-brand-gray-300 font-sans max-w-md leading-relaxed">
            Unlock early access to drops, exclusive performance insights, and a personalized kinetic experience.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-20">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 lg:hidden mb-8">
              <div className="w-8 h-8 bg-brand-black flex items-center justify-center">
                <span className="text-brand-white font-display font-bold text-xl leading-none">S</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tighter uppercase">Sole & Style</span>
            </div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter leading-none">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-brand-gray-500 font-medium">
              {isLogin ? "Enter your credentials to access your archive." : "Join the kinetic movement today."}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest border border-red-100"
            >
              {error}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-brand-gray-100">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              disabled={isLoading}
              className={cn(
                "flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                isLogin ? "text-brand-black" : "text-brand-gray-400 hover:text-brand-black",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              Sign In
              {isLogin && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-black" />}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              disabled={isLoading}
              className={cn(
                "flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                !isLogin ? "text-brand-black" : "text-brand-gray-400 hover:text-brand-black",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              Sign Up
              {!isLogin && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-black" />}
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-brand-gray-50 border-none px-12 py-4 text-sm focus:ring-1 focus:ring-brand-black transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-brand-gray-50 border-none px-12 py-4 text-sm focus:ring-1 focus:ring-brand-black transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-bold uppercase tracking-widest underline">Forgot Password?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-brand-gray-50 border-none px-12 py-4 text-sm focus:ring-1 focus:ring-brand-black transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full group" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-brand-white border-t-transparent rounded-full"
                  />
                  Processing...
                </span>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-brand-white px-4 text-brand-gray-400">Or Continue With</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 border border-brand-gray-200 py-4 hover:bg-brand-gray-50 transition-colors disabled:opacity-50"
            >
              <Chrome className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Google</span>
            </button>
            <button 
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 border border-brand-gray-200 py-4 hover:bg-brand-gray-50 transition-colors disabled:opacity-50"
            >
              <Github className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
            </button>
          </div>

          <p className="text-center text-xs text-brand-gray-400">
            By continuing, you agree to our <Link to="/" className="text-brand-black underline">Terms of Service</Link> and <Link to="/" className="text-brand-black underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Menu, Search, Heart, ShoppingCart, LogIn, Package, MapPin, LayoutDashboard, LogOut,
  Settings, Shield, ChevronDown, X, Tag, Grid3X3, Home, ShoppingBag, Zap,
  User, Phone, Info, Lock, FileText, ChevronRight, Star, Gift
} from 'lucide-react';


import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useStoreData } from '../store/useStoreData';
import logo from '../assets/logo.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

function AvatarDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const items = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'My Orders', path: '/my-orders' },
    { icon: MapPin, label: 'My Addresses', path: '/my-addresses' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: Settings, label: 'Account Settings', path: '/account-settings' },
    ...(user?.role === 'admin' ? [{ icon: Shield, label: 'Admin Panel', path: '/admin' }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 group">
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-sm ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all">
          {initials}
        </div>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform hidden md:block ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100]">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>
          {items.map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => { navigate(path); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-indigo-600 transition-colors text-left">
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-1">
            <button onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const categories = useStoreData(s => s.categories);

  return (
    <div ref={ref} className="relative py-4 -my-4"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-[14px] lg:text-[15px] font-bold text-gray-800 hover:text-indigo-600 transition-colors">
        Categories <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100]">
          <button onClick={() => { navigate('/category/all'); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Grid3X3 className="w-4 h-4" /> All Categories
          </button>
          <div className="border-t border-gray-100 my-1" />
          {categories.map(cat => (
            <button key={cat.id} onClick={() => { navigate(`/category/${cat.id}`); setOpen(false); }}
              className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OffersDropdown() {
  const [open, setOpen] = useState(false);
  const [offers, setOffers] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_URL}/offers/active`)
      .then(r => r.json())
      .then(d => setOffers(d.offers || []))
      .catch(() => { });
  }, []);

  return (
    <div ref={ref} className="relative py-4 -my-4"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-[14px] lg:text-[15px] font-bold text-gray-800 hover:text-indigo-600 transition-colors">
        Offers <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100]">
          <button onClick={() => { navigate('/offers'); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Tag className="w-4 h-4" /> View All Offers
          </button>
          {offers.length > 0 && <div className="border-t border-gray-100 my-1" />}
          {offers.slice(0, 6).map(offer => (
            <button key={offer.id} onClick={() => { navigate(`/offers?id=${offer.id}`); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50 transition-colors">
              <span className="text-sm font-semibold text-gray-700 truncate">{offer.name || offer.code}</span>
              <span className="text-xs font-bold text-indigo-600 ml-2 shrink-0">
                {offer.discount_type === 'flat' ? `₹${offer.discount_percent}` : `${offer.discount_percent}%`} OFF
              </span>
            </button>
          ))}
          {offers.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-500">No active offers right now</p>
          )}
        </div>
      )}
    </div>
  );
}

function DesktopFullHeader({ cartCount, wishlistCount, token, user, handleLogout }) {
  return (
    <>
      <div className="h-[90px] lg:h-[110px] hidden md:block" />
      <header className="fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm px-6 md:px-10 lg:px-12 py-2 hidden md:block transition-all duration-300">
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4">

          {/* Navigation Links */}
          <nav className="flex-1 hidden lg:flex items-center justify-start gap-8">
            <Link to="/" className="text-[14px] lg:text-[15px] font-bold text-gray-800 hover:text-indigo-600 transition-all relative group">
              Home
              <span className="absolute -bottom-1.5 left-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out"></span>
            </Link>
            <CategoriesDropdown />
            <OffersDropdown />
            <Link to="/about" className="text-[14px] lg:text-[15px] font-bold text-gray-800 hover:text-indigo-600 transition-all relative group">
              About
              <span className="absolute -bottom-1.5 left-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out"></span>
            </Link>
            <Link to="/contact" className="text-[14px] lg:text-[15px] font-bold text-gray-800 hover:text-indigo-600 transition-all relative group">
              Contact
              <span className="absolute -bottom-1.5 left-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out"></span>
            </Link>
            <Link to="/my-orders" className="text-[14px] lg:text-[15px] font-bold text-gray-800 hover:text-indigo-600 transition-all relative group">
              Orders
              <span className="absolute -bottom-1.5 left-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out"></span>
            </Link>
          </nav>

          {/* Centered Logo */}
          <Link to="/" className="shrink-0 flex items-center justify-center mx-4 group lg:mx-0 relative -ml-2 md:-ml-8 lg:-ml-16">
            <img src={logo} alt="Logo" className="relative z-10 h-20 md:h-24 lg:h-28 w-auto max-w-[320px] lg:max-w-[400px] object-contain transition-all duration-500 group-hover:scale-105 filter drop-shadow-sm brightness-0" />
          </Link>

          {/* Right Action Icons & Search */}
          <div className="flex-1 flex items-center justify-end gap-5 lg:gap-8">
            <div className="relative hidden xl:block w-[260px] group">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-600 transition-colors z-10" />
              <input type="text" placeholder="Search products..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim())
                    window.location.href = `/category/all?search=${encodeURIComponent(e.target.value.trim())}`;
                }}
                className="w-full bg-[#f8f9fa] hover:bg-gray-100 border border-gray-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-4 lg:gap-5">
              <Link to="/wishlist" className="relative p-2.5 cursor-pointer bg-[#f8f9fa] hover:bg-gray-100 rounded-full border border-gray-200 hover:border-indigo-600/40 hover:-translate-y-1 transition-all group">
                <Heart className="w-5 h-5 text-gray-700 group-hover:text-indigo-600 transition-colors" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative p-2.5 cursor-pointer bg-[#f8f9fa] hover:bg-gray-100 rounded-full border border-gray-200 hover:border-indigo-600/40 hover:-translate-y-1 transition-all group">
                <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-indigo-600 transition-colors" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {token ? (
                <div className="ml-2">
                  <AvatarDropdown user={user} onLogout={handleLogout} />
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 lg:px-6 py-2.5 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ml-2 group">
                  <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wide">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export function Header({ variant = 'default', title, showShare = false }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // slide-out drawer for home header
  const categories = useStoreData(s => s.categories);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems ? wishlistItems.length : 0;
  const { token, user, logout } = useAuthStore();
  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Offers', path: '/offers' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'My Orders', path: '/my-orders' },
    { name: 'My Profile', path: '/profile' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <DesktopFullHeader cartCount={cartCount} wishlistCount={wishlistCount} token={token} user={user} handleLogout={handleLogout} />

      {/* Mobile */}
      <div className="md:hidden">
        {/* Sidebar overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          {mobileMenuOpen && (
            <motion.div key="sidebar"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 w-[280px] h-full bg-white border-r border-gray-100 z-[101] shadow-xl flex flex-col">

              <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-orange-50/50">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="Logo" className="h-28 w-auto max-w-[240px] object-contain" />
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-full border border-gray-200 transition-colors shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <motion.nav variants={containerVariants} initial="hidden" animate="visible"
                className="flex flex-col p-4 gap-1 flex-grow overflow-y-auto">

                {/* Categories accordion */}
                <motion.div variants={itemVariants}>
                  <button onClick={() => setMobileCatsOpen(o => !o)}
                    className="w-full flex items-center justify-between text-gray-900 font-bold text-base py-3 px-4 rounded-xl hover:bg-gray-50 hover:text-indigo-600 transition-all">
                    Categories
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCatsOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileCatsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="ml-5 border-l-2 border-gray-100 pl-4 py-2 space-y-1 mt-1 mb-2">
                          <Link to="/category/all" onClick={() => setMobileMenuOpen(false)}
                            className="block text-sm font-extrabold text-indigo-600 py-2.5 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                            All Categories
                          </Link>
                          {categories.map(cat => (
                            <Link key={cat.id} to={`/category/${cat.id}`} onClick={() => setMobileMenuOpen(false)}
                              className="block text-sm font-medium text-gray-600 py-2.5 px-3 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {navLinks.map(link => (
                  <motion.div key={link.name} variants={itemVariants}>
                    <Link to={link.path} onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-900 font-bold text-base py-3 px-4 rounded-xl hover:bg-gray-50 hover:text-indigo-600 transition-all">
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              {!token && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="p-5 border-t border-gray-100 bg-gray-50">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-brand-blue text-white font-extrabold py-3.5 rounded-xl shadow-md hover:bg-blue-700 transition-all">
                    <LogIn className="w-5 h-5" /> Login to Account
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-[110px]" />
        <header className="fixed top-0 left-0 z-50 w-full bg-indigo-600 px-4 py-4 shadow-sm border-b-0">
          <div className="w-full max-w-lg mx-auto">
            {/* Title and Actions row */}
            <div className="flex items-center justify-between">

              {/* Left Side: Logo */}
              <div className="flex items-center flex-1">
                <Link to="/" className="flex items-center justify-center relative group gap-2">
                  <img src={logo} alt="Logo" className="h-16 md:h-20 w-auto object-contain invert brightness-0 scale-[1.3] origin-left" />
                </Link>
              </div>

              {/* Right Side: Search, Cart, Notification */}
              <div className="flex items-center justify-end gap-3 md:gap-4 shrink-0">
                {/* Search Icon */}
                <button
                  onClick={() => navigate('/search')}
                  className="relative p-1.5 transition-colors"
                >
                  <Search className="w-6 h-6 text-white" strokeWidth={1.5} />
                </button>

                {/* Cart icon */}
                <button
                  onClick={() => navigate('/cart')}
                  className="relative p-1.5 transition-colors"
                >
                  <ShoppingCart className="w-6 h-6 text-white" strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full text-indigo-600 text-[10px] font-black flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>

                {/* Menu icon */}
                <button
                  onClick={() => setMenuOpen(true)}
                  className="relative p-1.5 transition-colors"
                >
                  <Menu className="w-6 h-6 text-white" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ── SLIDE-OUT MENU DRAWER ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[82vw] max-w-[320px] bg-white z-[201] flex flex-col overflow-hidden"
              style={{ boxShadow: '-8px 0 40px rgba(0,0,0,0.15)' }}
            >
              {/* Top blue accent bar */}
              <div className="h-1.5 w-full bg-indigo-600" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-8 pb-5 border-b border-gray-100">
                <div>
                  <p className="text-gray-900 font-extrabold text-xl tracking-widest" style={{ fontFamily: 'inherit' }}>
                    Aradhana Apparels
                  </p>
                  <p className="text-indigo-600 text-[9px] font-bold tracking-[0.22em] uppercase mt-0.5">
                    Your Choice, From Anywhere.
                  </p>
                </div>
                <button onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X className="w-4.5 h-4.5 text-gray-500" />
                </button>
              </div>

              {/* User section */}
              <div className="px-5 py-4 border-b border-gray-100">
                {token && user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                      <span className="text-white font-black text-lg">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-bold text-[15px] truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <button onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                      className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { navigate('/login'); setMenuOpen(false); }}
                      className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:shadow-indigo-600/40 hover:bg-indigo-700 transition-all">
                      Login
                    </button>
                    <button onClick={() => { navigate('/signup'); setMenuOpen(false); }}
                      className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* Scrollable nav */}
              <div className="flex-1 overflow-y-auto px-3 py-3">

                {/* Main nav */}
                <p className="text-gray-400 text-[9px] font-black tracking-[0.2em] uppercase mb-2 px-3">Menu</p>
                {[
                  { icon: <Home className="w-4.5 h-4.5" />, label: 'Home', path: '/', color: 'text-gray-700' },
                  { icon: <ShoppingBag className="w-4.5 h-4.5" />, label: 'Shop All', path: '/category/all', color: 'text-gray-700' },
                  { icon: <Zap className="w-4.5 h-4.5 fill-current text-yellow-500" />, label: 'Offers & Deals', path: '/offers', color: 'text-gray-700' },
                  { icon: <Package className="w-4.5 h-4.5 text-blue-500" />, label: 'My Orders', path: '/my-orders', color: 'text-gray-700', badge: null },
                  { icon: <Heart className="w-4.5 h-4.5 text-red-500" />, label: 'Wishlist', path: '/wishlist', color: 'text-gray-700', badge: wishlistCount > 0 ? wishlistCount : null },
                  { icon: <ShoppingCart className="w-4.5 h-4.5 text-green-500" />, label: 'Cart', path: '/cart', color: 'text-gray-700', badge: cartCount > 0 ? cartCount : null },
                  { icon: <User className="w-4.5 h-4.5 text-indigo-500" />, label: 'My Profile', path: token ? '/profile' : '/login', color: 'text-gray-700' },
                  { icon: <Gift className="w-4.5 h-4.5 text-pink-500" />, label: 'Refer & Earn', path: '/refer', color: 'text-gray-700' },
                ].map(item => (
                  <button key={item.path}
                    onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group mb-0.5">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
                      {item.icon}
                    </div>
                    <span className={`font-semibold text-[14px] group-hover:text-indigo-600 transition-colors flex-1 ${item.color}`}>{item.label}</span>
                    {item.badge && (
                      <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{item.badge}</span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))}

                {/* Categories */}
                {categories.length > 0 && (
                  <>
                    <p className="text-gray-400 text-[9px] font-black tracking-[0.2em] uppercase mt-4 mb-2 px-3">Categories</p>
                    {categories.slice(0, 6).map(cat => (
                      <button key={cat.id}
                        onClick={() => { navigate(`/category/${cat.slug || cat.id}`); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group mb-0.5">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
                          <Tag className="w-4 h-4 text-indigo-600/70" />
                        </div>
                        <span className="text-gray-600 font-medium text-[14px] group-hover:text-indigo-600 transition-colors flex-1">{cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                      </button>
                    ))}
                  </>
                )}

                {/* Info links */}
                <p className="text-gray-400 text-[9px] font-black tracking-[0.2em] uppercase mt-4 mb-2 px-3">Info</p>
                {[
                  { icon: <Info className="w-4 h-4" />, label: 'About Us', path: '/about' },
                  { icon: <Phone className="w-4 h-4" />, label: 'Contact Us', path: '/contact' },
                  { icon: <Lock className="w-4 h-4" />, label: 'Privacy Policy', path: '/privacy-policy' },
                  { icon: <FileText className="w-4 h-4" />, label: 'Terms & Conditions', path: '/terms' },
                ].map(item => (
                  <button key={item.path}
                    onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group mb-0.5">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-gray-100 group-hover:text-indigo-600 transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-gray-500 font-medium text-[13px] group-hover:text-indigo-600 transition-colors">{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))}

                <div className="h-4" />
              </div>

              {/* Footer: logout + tagline */}
              <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/50">
                {token ? (
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-500 font-semibold text-[14px] hover:bg-red-100 transition-colors mb-3">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                ) : null}
                <p className="text-gray-400 text-[10px] text-center font-medium">
                  © 2025 Aradhana Apparels · Crafted with ♥
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Heart, ShoppingCart, Star, MapPin, Zap, X, ChevronLeft, Truck, RefreshCcw, ShieldCheck, Package } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useStoreData } from '../store/useStoreData';
import { motion, AnimatePresence } from 'framer-motion';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useStoreData();
  const product = products.find(p => p.id.toString() === id);
  const { addToCart } = useCartStore();
  const { toggleWishlist, items: wishlistItems } = useWishlistStore();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isWishlisted = product ? wishlistItems.includes(product.id) : false;
  const relatedProducts = product ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 10) : [];

  let parsedSizes = [];
  try {
    if (product?.variants && (typeof product.variants === 'string' || product.variants.length > 0)) {
      parsedSizes = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
    } else if (product?.sizes && (typeof product.sizes === 'string' || product.sizes.length > 0)) {
      parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
    }
  } catch(e) {}

  const isHierarchical = parsedSizes.length > 0 && Array.isArray(parsedSizes[0].sizes);
  const currentVariant = isHierarchical ? parsedSizes[selectedVariantIdx] : null;
  const currentSizesArray = isHierarchical ? currentVariant.sizes : parsedSizes;
  const selectedSizeObj = currentSizesArray && currentSizesArray.length > 0
    ? currentSizesArray[selectedSizeIdx]
    : { size: 'Standard', price: product?.price || 0 };

  let parsedImages = [];
  try {
    if (currentVariant?.images) {
      parsedImages = typeof currentVariant.images === 'string' ? JSON.parse(currentVariant.images) : currentVariant.images;
    } else if (product?.images) {
      parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    } else if (product?.image_url) {
      let url = product.image_url;
      if (typeof url === 'string' && url.trim().startsWith('[')) {
        parsedImages = JSON.parse(url);
      } else {
        parsedImages = [url];
      }
    }
  } catch(e) {}

  const productImages = Array.isArray(parsedImages) && parsedImages.length > 0 
    ? parsedImages 
    : [];

  const [mainImg, setMainImg] = useState(null);

  useEffect(() => {
    if (productImages.length > 0 && !productImages.includes(mainImg)) {
      setMainImg(productImages[0]);
      setImgError(false);
    }
  }, [productImages, selectedVariantIdx]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-lg font-bold text-gray-700">Product not found</p>
        <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-md">
          Go Home
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    const variantWithColor = { ...selectedSizeObj, color: parsedSizes[selectedVariantIdx]?.color || '' };
    addToCart(product, variantWithColor, quantity);
  };

  const handleBuyNow = () => {
    const variantWithColor = { ...selectedSizeObj, color: parsedSizes[selectedVariantIdx]?.color || '' };
    addToCart(product, variantWithColor, quantity);
    navigate('/cart');
  };

  const handleShare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, text: `Check out ${product.name} on Aradhana Apparels!`, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const displayPrice = selectedSizeObj ? (selectedSizeObj.our_price || selectedSizeObj.price || product?.price || 0) : 0;
  const originalPrice = selectedSizeObj ? (selectedSizeObj.mrp || product?.mrp || (displayPrice > 0 ? Math.round(displayPrice * 1.4) : 0)) : 0;
  const discountPercent = originalPrice > displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  let customAttrs = {};
  try {
    customAttrs = typeof product.custom_attributes === 'string' ? JSON.parse(product.custom_attributes) : product.custom_attributes || {};
  } catch(e) {}

  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  const CATEGORY_FALLBACKS = {
    tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
    shirt: 'https://images.unsplash.com/photo-1602810316693-3667c854239a?w=500&q=80',
    jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80',
    pant: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80',
    kurta: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80',
    saree: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
    default: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80'
  };

  const text = `${product.name || ''} ${product.category || ''}`.toLowerCase();
  let fallbackMatch = CATEGORY_FALLBACKS.default;
  for (const [key, url] of Object.entries(CATEGORY_FALLBACKS)) {
    if (key !== 'default' && text.includes(key)) {
      fallbackMatch = url;
      break;
    }
  }

  const PLACEHOLDER = fallbackMatch;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-40 md:pb-12">
      <div className="hidden md:block">
        <Header />
      </div>

      {/* ── MOBILE: Full-width image section ── */}
      <div className="md:hidden">
        {/* Image container */}
        <div className="relative w-full h-[60vh] bg-gray-50 overflow-hidden">
          {/* Back + actions */}
          <div className="absolute top-safe pt-5 left-0 right-0 z-20 flex items-center justify-between px-5">
            <button onClick={() => navigate(-1)}
              className="w-11 h-11 bg-white/70 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] active:scale-95 transition-transform">
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <div className="flex gap-3">
              <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                className="w-11 h-11 bg-white/70 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] active:scale-95 transition-transform">
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-indigo-600 text-indigo-600' : 'text-gray-900'}`} strokeWidth={isWishlisted ? 0 : 1.5} />
              </button>
              <button onClick={handleShare}
                className="w-11 h-11 bg-white/70 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] active:scale-95 transition-transform">
                <Share2 className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Bottom Gradient overlay for readability */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>

          {/* Main image */}
          <div className="w-full h-full" onClick={() => setIsImageModalOpen(true)}>
            <img
              src={imgError ? PLACEHOLDER : (mainImg || productImages[0] || PLACEHOLDER)}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Mobile thumbnail row */}
        {productImages.length > 1 && (
          <div className="flex gap-2 px-4 py-3 bg-white border-b border-gray-100 overflow-x-auto hide-scrollbar">
            {productImages.map((img, i) => (
              <button key={i} onClick={() => { setMainImg(img); setImgError(false); }}
                className={`w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden border-2 transition-all ${mainImg === img ? 'border-indigo-600' : 'border-transparent'}`}>
                <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-[1400px] mx-auto md:px-8 lg:px-12 md:pt-10 lg:pt-12 md:pb-8 md:grid md:grid-cols-[45%_55%] md:gap-8 lg:gap-12">

        {/* ── DESKTOP LEFT: Images ── */}
        <div className="hidden md:block">
          <div className="sticky top-[100px] flex gap-3">
            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex flex-col gap-2 w-[72px]">
                {productImages.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(img)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 flex-shrink-0 transition-all overflow-hidden ${mainImg === img ? 'border-indigo-600 shadow-sm bg-orange-50' : 'border-gray-200 bg-white hover:border-indigo-600'}`}>
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover rounded-lg"
                      onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}
            {/* Main */}
            <div className="flex-1 relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md aspect-square flex items-center justify-center cursor-zoom-in group"
              onClick={() => setIsImageModalOpen(true)}>
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:scale-110 hover:border-red-400 transition-all shadow-sm">
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} strokeWidth={isWishlisted ? 0 : 1.5} />
                </button>
                <button onClick={handleShare}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:scale-110 hover:border-indigo-600 transition-all shadow-sm">
                  <Share2 className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                </button>
              </div>
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow z-10">
                  {discountPercent}% OFF
                </div>
              )}
              <img src={mainImg || productImages[0] || PLACEHOLDER} alt={product.name}
                className="w-5/6 h-5/6 object-contain group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = PLACEHOLDER; }} />
            </div>
          </div>

          {/* Desktop action buttons */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4 mt-6">
            <button onClick={handleAddToCart}
              className="group flex-1 bg-[#f8f9fa] border border-gray-200 text-gray-900 font-bold py-4 rounded-[1.25rem] text-[16px] flex items-center justify-center gap-2 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 shadow-sm active:scale-95">
              <ShoppingCart className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" /> Add to Cart
            </button>
            <button onClick={handleBuyNow}
              className="group flex-[1.4] relative overflow-hidden bg-indigo-600 text-white font-extrabold py-4 rounded-[1.25rem] text-[16px] flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-500 active:scale-95">
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none rounded-[1.25rem]"></div>
              <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform duration-300 relative z-10" /> 
              <span className="relative z-10 tracking-wide">Buy Now</span>
            </button>
          </motion.div>
        </div>

        {/* ── RIGHT / MOBILE BOTTOM: Product Info ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-t-3xl md:rounded-2xl md:shadow-2xl md:border md:border-gray-100 px-5 py-8 md:p-10 relative -mt-6 z-20 md:mt-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] pb-32 md:pb-10"
        >
          {/* Mobile Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

          {/* Category tag */}
          {product.category && (
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-extrabold mb-3 uppercase tracking-widest shadow-[0_2px_10px_rgba(79,70,229,0.05)] w-fit border border-indigo-100">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              {product.category}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-[2.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-4" style={{ fontFamily: 'inherit' }}>
            {product.name}
          </h1>

          {/* Ratings */}
          <div className="flex items-center gap-2 mb-6 bg-gray-50/50 w-fit px-3 py-1.5 rounded-full border border-gray-100">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-900 font-bold text-sm">4.7</span>
            <span className="text-gray-400 text-sm font-medium">| &nbsp;214 reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">₹{displayPrice.toLocaleString()}</span>
            {originalPrice > displayPrice && (
              <div className="flex items-center gap-3 pb-1">
                <span className="text-lg text-gray-400 line-through font-medium">₹{originalPrice.toLocaleString()}</span>
                <span className="text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-yellow-500 px-3 py-1 rounded-full shadow-md shadow-indigo-600/20 tracking-wider">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Colors */}
          {isHierarchical && parsedSizes.length > 0 && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Color</span>
                {currentVariant?.color && <span className="text-sm text-gray-500">{currentVariant.color}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedSizes.map((variant, idx) => (
                  <button key={idx}
                    onClick={() => { setSelectedVariantIdx(idx); setSelectedSizeIdx(0); }}
                    className={`px-4 py-2 rounded-xl border-2 transition-all text-sm font-semibold ${selectedVariantIdx === idx
                      ? 'border-indigo-600 text-indigo-600 bg-orange-50'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-600/50'}`}>
                    {variant.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {currentSizesArray && currentSizesArray.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Size</span>
                {selectedSizeObj?.size && <span className="text-sm font-semibold text-gray-900">{selectedSizeObj.size}</span>}
              </div>
              <div className="flex flex-wrap gap-3">
                {currentSizesArray.map((sizeObj, idx) => (
                  <button key={idx}
                    onClick={() => setSelectedSizeIdx(idx)}
                    className={`px-5 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold shadow-sm ${selectedSizeIdx === idx
                      ? 'bg-indigo-600 text-white shadow-indigo-600/30 translate-y-[1px]'
                      : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-indigo-600/50 hover:text-indigo-600'}`}>
                    {sizeObj.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Quantity</span>
            <div className="inline-flex items-center bg-gray-50/80 rounded-2xl p-1 border border-gray-100/80 shadow-inner">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900 font-bold text-xl transition-all">−</button>
              <span className="text-lg font-bold text-gray-900 w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900 font-bold text-xl transition-all">+</button>
            </div>
          </div>

          {/* Delivery */}
          <div className="mb-8 bg-[#FFFBF4] rounded-[1.5rem] p-5 shadow-sm border border-[#F4E6D4]/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Delivery Options</span>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
              <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
              <input type="text" placeholder="Enter pincode"
                value={pincode} onChange={(e) => setPincode(e.target.value)}
                className="flex-1 outline-none text-[15px] placeholder-gray-400 font-medium bg-transparent text-gray-900" maxLength={6} />
              <button className="text-indigo-600 font-bold text-sm hover:opacity-80 transition-opacity bg-indigo-600/10 px-4 py-1.5 rounded-lg">Check</button>
            </div>
            <div className="space-y-1">
              <p className="text-[15px] text-gray-700 font-medium flex items-center gap-2">
                Delivery by <span className="font-bold text-gray-900">{deliveryDate}</span> 
                <span className="text-gray-300">|</span>
                <span className="text-[#3EA361] font-bold">Free</span>
                <span className="text-gray-400 line-through text-xs">₹40</span>
              </p>
              <p className="text-xs text-gray-500">If ordered before 4:00 PM</p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mb-8 pb-8 border-b border-gray-100">
            {[
              { icon: <Truck className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />, label: 'Free Delivery', bg: 'bg-indigo-600/10' },
              { icon: <ShieldCheck className="w-6 h-6 text-[#3EA361]" strokeWidth={1.5} />, label: '100% Genuine', bg: 'bg-[#3EA361]/10' },
              { icon: <RefreshCcw className="w-6 h-6 text-gray-900" strokeWidth={1.5} />, label: 'Easy Returns', bg: 'bg-gray-900/10' },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-3 p-4 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className={`${b.bg} p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {b.icon}
                </div>
                <span className="text-[11px] font-extrabold text-gray-800 tracking-wide uppercase text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3" style={{ fontFamily: 'inherit' }}>
              <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-600 to-yellow-500 rounded-full" />
              Product Description
            </h2>
            <div className="bg-gray-50/80 p-5 rounded-[1.5rem] border border-gray-100">
              <p className="text-[14.5px] text-gray-700 leading-relaxed font-medium">
                {product.description || 'Experience the perfect blend of tradition and quality. This product is carefully crafted to meet your daily needs while maintaining an authentic feel. Suitable for all occasions and built to last.'}
              </p>
            </div>
          </div>

          {/* Specs */}
          {(product.category || currentVariant?.color || Object.keys(customAttrs).length > 0) && (
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3" style={{ fontFamily: 'inherit' }}>
                <span className="w-1.5 h-6 bg-gradient-to-b from-[#022A21] to-[#054335] rounded-full" />
                Specifications
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  product.category && { k: 'Category', v: product.category },
                  currentVariant?.color && { k: 'Color', v: currentVariant.color },
                  ...Object.entries(customAttrs).map(([k, v]) => ({ k: k.replace(/_/g, ' '), v })),
                ].filter(Boolean).map((row) => (
                  <div key={row.k} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1 hover:border-gray-200 transition-colors">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{row.k}</span>
                    <span className="text-[14px] text-gray-900 font-extrabold truncate">
                      {String(row.v).startsWith('http')
                        ? <a href={row.v} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View Link</a>
                        : row.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'inherit' }}>You may also like</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-4 snap-x">
            {relatedProducts.map(rp => (
              <div key={rp.id} className="w-[160px] md:w-[200px] flex-shrink-0 snap-start">
                <ProductCard product={rp} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MOBILE sticky action bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60]">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/0 pointer-events-none -top-8"></div>
        <div className="relative bg-white/80 backdrop-blur-xl border-t border-gray-100/50 flex gap-3 px-5 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe-4">
          <button onClick={handleAddToCart}
            className="group flex-[1] bg-gray-900/5 text-gray-900 border border-[#022A21]/20 font-bold py-4 rounded-[1.25rem] text-[15px] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 hover:text-white">
            <ShoppingCart className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" /> Cart
          </button>
          <button onClick={handleBuyNow}
            className="group flex-[1.5] relative overflow-hidden bg-indigo-600 text-white font-extrabold py-4 rounded-[1.25rem] text-[15px] active:scale-95 transition-all duration-500 shadow-[0_8px_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none rounded-[1.25rem]"></div>
            <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform relative z-10" /> 
            <span className="relative z-10 tracking-wide">Buy Now</span>
          </button>
        </div>
      </div>

      {/* ── Image Zoom Modal ── */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setIsImageModalOpen(false)}>
            <button onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-[101]">
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl px-4 flex flex-col items-center gap-4"
              onClick={e => e.stopPropagation()}>
              <img src={mainImg || productImages[0] || PLACEHOLDER} alt={product.name}
                className="w-full max-h-[70vh] object-contain rounded-2xl"
                onError={(e) => { e.target.src = PLACEHOLDER; }} />
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar max-w-full pb-2">
                  {productImages.map((img, i) => (
                    <button key={i} onClick={() => setMainImg(img)}
                      className={`w-14 h-14 rounded-xl border-2 p-0.5 flex-shrink-0 overflow-hidden transition-all ${mainImg === img ? 'border-indigo-600' : 'border-white/20'}`}>
                      <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover rounded-lg"
                        onError={(e) => { e.target.src = PLACEHOLDER; }} />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

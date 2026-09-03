import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Share2 } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';

// Category-based image fallback — high quality Unsplash images per category keyword
const CATEGORY_IMAGES = {
  saree:       'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
  silk:        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
  kurta:       'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80',
  kurti:       'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80',
  lehenga:     'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
  dupatta:     'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
  dress:       'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&q=80',
  shirt:       'https://images.unsplash.com/photo-1602810316693-3667c854239a?w=500&q=80',
  tshirt:      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
  pant:        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80',
  jeans:       'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80',
  footwear:    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
  shoes:       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
  sandal:      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
  jewelry:     'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80',
  jewellery:   'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80',
  necklace:    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80',
  ring:        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
  bag:         'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
  handbag:     'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
  mobile:      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
  phone:       'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
  laptop:      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80',
  headphone:   'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80',
  watch:       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
  furniture:   'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
  sofa:        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80',
  appliance:   'https://images.unsplash.com/photo-1584269600519-112d00e42a1f?w=500&q=80',
  grocery:     'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
  beauty:      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80',
  cosmetic:    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80',
  fashion:     'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80',
  clothing:    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80',
  default:     'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80',
};

function getCategoryFallback(product) {
  const text = `${product.name || ''} ${product.category || ''}`.toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (key !== 'default' && text.includes(key)) return url;
  }
  return CATEGORY_IMAGES.default;
}

// Safely extract first valid image URL from any field format
function getFirstImage(product, parsedSizes) {
  // 1. Try hierarchical variant images
  if (parsedSizes?.length > 0 && parsedSizes[0].images?.length > 0) {
    const img = parsedSizes[0].images[0];
    if (img && typeof img === 'string' && img.startsWith('http')) return img;
  }

  // 2. Try product.images (array or JSON string)
  if (product.images) {
    let imgs = product.images;
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch (e) {}
    }
    if (Array.isArray(imgs) && imgs.length > 0) {
      const img = imgs[0];
      if (img && typeof img === 'string' && img.startsWith('http')) return img;
    }
  }

  // 3. Try product.image_url (may be JSON string)
  if (product.image_url) {
    let url = product.image_url;
    if (typeof url === 'string' && url.trim().startsWith('[')) {
      try {
        const arr = JSON.parse(url);
        if (Array.isArray(arr) && arr[0] && arr[0].startsWith('http')) return arr[0];
      } catch (e) {}
    }
    if (typeof url === 'string' && url.startsWith('http')) return url;
  }

  // 4. Smart category/name fallback
  return getCategoryFallback(product);
}


export function ProductCard({ product, layout = 'grid' }) {
  const navigate = useNavigate();
  const { toggleWishlist, items: wishlistItems } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [imgErr, setImgErr] = useState(false);

  const isWishlisted = wishlistItems.includes(product.id);

  let parsedSizes = [];
  try {
    if (product.variants && (typeof product.variants === 'string' || product.variants.length > 0)) {
      parsedSizes = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
    } else if (product.sizes && (typeof product.sizes === 'string' || product.sizes.length > 0)) {
      parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
    }
  } catch (e) {}

  let defaultSize = { size: 'Standard', price: product.price || 0 };

  if (parsedSizes?.length > 0) {
    if (Array.isArray(parsedSizes[0].sizes) && parsedSizes[0].sizes.length > 0) {
      defaultSize = parsedSizes[0].sizes[0];
    } else if (parsedSizes[0].size) {
      defaultSize = parsedSizes[0];
    }
  }

  const firstImg = getFirstImage(product, parsedSizes);
  const displayPrice = defaultSize.our_price || defaultSize.price || product.price || 0;
  const originalPrice = defaultSize.mrp || product.mrp || (displayPrice > 0 ? Math.round(displayPrice * 1.4) : 0);
  const discountPercent = originalPrice > displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  // firstImg always returns a valid URL (category fallback if needed)
  // onError swaps to category fallback in case of network issues
  const fallbackImg = getCategoryFallback(product);

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleShare = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = window.location.origin + `/product/${product.id}`;
    if (navigator.share) {
      navigator.share({ title: product.name, text: `Check out ${product.name} on Aradhana Apparels!`, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(product, defaultSize);
  };

  const handleCardClick = () => navigate(`/product/${product.id}`);

  /* ── LIST LAYOUT ── */
  if (layout === 'list') {
    return (
      <div onClick={handleCardClick}
        className="flex gap-4 p-4 rounded-3xl mb-3 relative hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-500 border border-gray-100/50 group bg-white cursor-pointer">
        <div className="w-28 h-28 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden relative">
          <img src={imgErr ? fallbackImg : firstImg} alt={product.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10 uppercase tracking-tight">
              {discountPercent}% OFF
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center flex-grow pr-2">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[15px] font-extrabold text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors pr-8" style={{ fontFamily: 'inherit' }}>{product.name}</h3>
            <button onClick={handleWishlist}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:scale-110 hover:bg-gray-100 transition-all duration-300">
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'}`} strokeWidth={isWishlisted ? 0 : 2} />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-gray-900 tracking-tight">₹{displayPrice?.toLocaleString('en-IN')}</span>
              {originalPrice > displayPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">₹{originalPrice?.toLocaleString('en-IN')}</span>
              )}
            </div>
            <button onClick={handleAddToCart}
              className="bg-gray-900 hover:bg-indigo-600 transition-colors p-2.5 rounded-xl relative z-20 active:scale-95 shadow-sm hover:shadow-md hover:shadow-indigo-600/20">
              <ShoppingCart className="w-4 h-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID LAYOUT ── */
  return (
    <div onClick={handleCardClick}
      className="group flex flex-col rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:-translate-y-1 h-full relative bg-white border border-gray-100">

      {/* Image */}
      <div className="relative bg-white w-full aspect-square overflow-hidden flex items-center justify-center p-0 md:p-0">
        <img
          src={imgErr ? fallbackImg : firstImg}
          alt={product.name}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow z-20 tracking-wide uppercase">
            {discountPercent}% OFF
          </div>
        )}
        
        {/* Wishlist Button Overlay */}
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all duration-200">
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-gray-400 text-gray-400' : 'text-gray-400'}`} strokeWidth={isWishlisted ? 0 : 1.5} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-grow px-3 pt-2 pb-3">
        <h3 className="text-[13px] md:text-[14px] font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">
          {product.name}
        </h3>

        <div className="text-[15px] md:text-[16px] font-bold text-indigo-600 tracking-tight mb-3 flex items-center gap-2">
          <span>₹{displayPrice?.toLocaleString('en-IN')}</span>
          {originalPrice > displayPrice && (
            <span className="text-xs text-gray-400 line-through font-medium">₹{originalPrice?.toLocaleString('en-IN')}</span>
          )}
        </div>
        
        <div className="mt-auto pt-1">
          <button onClick={handleAddToCart}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-md transition-colors active:scale-95 flex items-center justify-center uppercase tracking-wider">
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}

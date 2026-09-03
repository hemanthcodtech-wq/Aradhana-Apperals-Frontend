import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, Tag, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { useCartStore } from '../store/useCartStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

function getCartImage(product) {
  if (!product) return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80';
  
  const extractFromVariants = (variants) => {
    let parsed = variants;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch(e){}
    }
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].images && Array.isArray(parsed[0].images) && parsed[0].images.length > 0) {
      const img = parsed[0].images[0];
      if (typeof img === 'string' && img.startsWith('http')) return img;
    }
    return null;
  };

  if (product.variants) {
    const img = extractFromVariants(product.variants);
    if (img) return img;
  }
  
  if (product.sizes) {
    const img = extractFromVariants(product.sizes);
    if (img) return img;
  }

  if (product.images) {
    let imgs = product.images;
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch(e){}
    }
    if (Array.isArray(imgs) && imgs.length > 0) {
      if (typeof imgs[0] === 'string' && imgs[0].startsWith('http')) return imgs[0];
    }
  }

  if (product.image_url) {
    let url = product.image_url;
    if (typeof url === 'string' && url.trim().startsWith('[')) {
      try {
        const arr = JSON.parse(url);
        if (Array.isArray(arr) && arr[0] && arr[0].startsWith('http')) return arr[0];
      } catch(e){}
    }
    if (typeof url === 'string' && url.startsWith('http')) return url;
  }
  
  return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80';
}

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getSubtotal, getTotal, deliveryCharge } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);   // applied coupon object
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  
  const container = React.useRef(null);
  
  useGSAP(() => {
    if (items.length > 0) {
      gsap.from('.animate-cart-item', {
        x: -30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
      gsap.from('.animate-cart-summary', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }
  }, { scope: container });

  const handleCheckout = () => {
    navigate('/checkout', { state: { couponCode: coupon?.code || couponCode, discount } });
  };

  const subtotal = getSubtotal();
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const discount = (() => {
    if (!coupon) return 0;
    const type = coupon.type || coupon.discount_type;
    const val = Number(coupon.value || coupon.discount_value || coupon.discount_percent || 0);
    if (type === 'percentage' || type === 'percent') {
      return Math.round((subtotal * val) / 100);
    }
    return val;
  })();

  const grandTotal = Math.max(0, subtotal - discount) + (subtotal > 0 ? deliveryCharge : 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCoupon(null);
    try {
      const res = await fetch(`${BACKEND_URL}/general/coupon/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), subtotal, qty: totalQty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon');
      setCoupon(data.coupon);
    } catch (e) {
      setCouponError(e.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => { setCoupon(null); setCouponCode(''); setCouponError(''); };

  return (
    <div ref={container} className="min-h-screen bg-transparent pb-36">
      <Header title={`My Cart (${items.length})`} />
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 mt-20 max-w-md mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl">
          <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6 border border-indigo-600/20">
            <ShoppingCart className="w-12 h-12 text-indigo-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight font-sans">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-center text-sm">Looks like you haven't added anything to your cart yet. Discover our latest premium collections.</p>
          <button 
            onClick={() => navigate('/')} 
            className="w-full bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 md:max-w-7xl mx-auto">
          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-4 px-2 max-w-lg mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/30">1</div>
              <span className="text-[11px] text-indigo-600 font-bold mt-2">Cart</span>
            </div>
            <div className="h-[2px] bg-gray-200 flex-1 mx-4 relative overflow-hidden">
               <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-indigo-600 to-transparent opacity-50"></div>
            </div>
            <div className="flex flex-col items-center opacity-50">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-[11px] text-gray-500 font-bold mt-2">Address</span>
            </div>
            <div className="h-[2px] bg-gray-200 flex-1 mx-4"></div>
            <div className="flex flex-col items-center opacity-50">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-[11px] text-gray-500 font-bold mt-2">Payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {items.map(item => (
              <div key={`${item.product.id}-${item.variant?.size || 'default'}`} className="animate-cart-item bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all p-4 flex gap-4 relative">
                <button 
                  onClick={() => removeFromCart(item.product.id, item.variant)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <div className="w-24 h-24 bg-gray-50 rounded-xl shrink-0 p-2 border border-gray-100">
                  <img src={getCartImage(item.product)} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                
                <div className="flex flex-col justify-between py-1 flex-grow pr-8">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight mb-2">{item.product.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <p className="text-[11px] text-gray-600 font-bold bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md inline-block">
                        {item.variant?.size || 'Standard'}
                      </p>
                      {item.product.color && (
                        <p className="text-[11px] text-indigo-600 font-bold bg-indigo-600/10 border border-indigo-600/20 px-2 py-0.5 rounded-md inline-block">
                          {item.product.color}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between mt-4">
                    <div className="font-extrabold text-xl text-gray-900">₹{item.variant?.price || item.product.price}</div>
                    
                    <div className="flex items-center w-28 bg-gray-50 border border-gray-200 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.variant, Math.max(1, item.qty - 1))}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-indigo-600/10 hover:text-indigo-600 rounded-md transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center text-[13px] font-bold text-gray-900">{item.qty}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.variant, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-indigo-600/10 hover:text-indigo-600 rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>            {/* Right Column: Summary & Checkout */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              {/* Coupon */}
              <div className="animate-cart-summary bg-white rounded-2xl border border-gray-100 p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-gray-900" />
                  <span className="text-base font-bold text-gray-900 font-sans">Apply Coupon</span>
                </div>
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-900" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{coupon.code}</p>
                        <p className="text-xs text-gray-900/80">You save ₹{discount}</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-400 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter coupon code"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-indigo-600 transition-all placeholder-gray-400 focus:bg-white"
                      />
                      <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                        className="bg-indigo-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50">
                        {couponLoading ? '...' : 'APPLY'}
                      </button>
                    </div>
                    {couponError && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-red-400">
                        <AlertCircle className="w-4 h-4" /> {couponError}
                      </div>
                    )}
                  </>
                )}
              </div>

          {/* Bill Details */}
          <div className="animate-cart-summary bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100 text-lg flex items-center gap-2 font-sans">
              <span className="w-1.5 h-5 bg-indigo-600 rounded-full inline-block"></span>
              Price Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-[15px] text-gray-600">
                <span>Item Total ({items.length} items)</span>
                <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[15px] text-gray-600">
                <span>Delivery Charges</span>
                <span className="font-medium text-gray-900">
                  {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[15px] text-indigo-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discount.toFixed(2)}</span>
                </div>
              )}
                <div className="flex justify-between font-extrabold text-gray-900 text-xl pt-5 mt-4 border-t border-dashed border-gray-200">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">₹{grandTotal.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="hidden lg:flex w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl py-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all items-center justify-center gap-2"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Checkout Bar - Mobile Only */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 mx-auto w-full bg-white border-t border-gray-100 p-4 pb-safe z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Amount</p>
              <p className="text-xl font-bold text-gray-900 leading-none">₹{grandTotal.toFixed(2)}</p>
            </div>
            <button 
              onClick={handleCheckout}
              className="flex-1 sm:max-w-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[15px] rounded-full py-4 shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <span className="w-1 h-1 bg-white/50 rounded-full mx-1" />
              Step 2
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trash2, Plus, Minus, Tag, CheckCircle, ShieldCheck, MapPin, Truck, CreditCard, Banknote, Navigation, MessageCircle, ChevronLeft, UserCircle2, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotal, getSubtotal, deliveryCharge, clearCart } = useCartStore();
  const { token, user } = useAuthStore();
  const { showToast } = useToastStore();
  
  const [step, setStep] = useState(token ? 2 : 1); // 1: Auth, 2: Address, 3: Payment
  const [address, setAddress] = useState({
    name: user?.name || '',
    email: user?.email || '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    mobile: user?.phone || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const overlayRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  const grandTotal = getTotal();
  const couponCode = location.state?.couponCode || '';

  const handleProceedToPayment = () => {
    if (!address.name.trim() || !address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.trim() || !address.mobile.trim()) {
      showToast("Please fill in all required address fields.", "error");
      return;
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      showToast("Pincode must be exactly 6 digits.", "error");
      return;
    }
    if (!/^\d{10}$/.test(address.mobile.trim())) {
      showToast("Mobile number must be exactly 10 digits.", "error");
      return;
    }
    setStep(3);
  };

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder) {
      navigate('/cart');
    }
  }, [items, navigate, isPlacingOrder]);

  // If user logs in mid-way
  useEffect(() => {
    if (token && step === 1) {
      setStep(2);
      if (user) {
        setAddress(prev => ({ ...prev, name: user.name, mobile: user.phone }));
      }
    }
  }, [token, step, user]);

  useGSAP(() => {
    if (isPlacingOrder) {
      const tl = gsap.timeline();
      
      tl.from(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        .from(iconRef.current, { scale: 0, rotation: -180, duration: 0.6, ease: 'back.out(1.7)' })
        .from(textRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' }, "-=0.2")
        .to(iconRef.current, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut', delay: 0.2 });
    }
  }, { dependencies: [isPlacingOrder] });

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const COD_ADVANCE = 1;
  const codRemaining = grandTotal - COD_ADVANCE;

  const createOrder = async (pMethod) => {
    const endpoint = token ? `${BACKEND_URL}/auth/orders` : `${BACKEND_URL}/general/orders`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items,
        address,
        total: grandTotal,
        coupon_code: couponCode,
        payment_method: pMethod,
      })
    });
    return res.json();
  };

  const handleWhatsAppOrder = () => {
    const phone = "917353473534";
    const itemList = items.map(i => {
      const variantObj = typeof i.variant === 'object' ? i.variant : {};
      const variantName = variantObj.size || variantObj.name || (typeof i.variant === 'string' ? i.variant : 'Standard');
      const price = variantObj.our_price || variantObj.price || i.product.price || 0;
      
      return `- ${i.product.name} ${variantName !== 'Standard' ? `(Size: ${variantName})` : ''} x ${i.qty} = ₹${(Number(price) * i.qty).toFixed(2)}`;
    }).join('\n');
    const msg = `Hello, I would like to place an order!

*Order Details:*
${itemList}

*Summary:*
Subtotal: ₹${getSubtotal().toFixed(2)}
Delivery: ₹${deliveryCharge}
*Total Payable: ₹${grandTotal.toFixed(2)}*

*Shipping Address:*
${address.name}
${address.mobile}
${address.line1}, ${address.city}
${address.state} - ${address.pincode}`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsPlacingOrder(false);
        return;
      }

      // Amount to charge online: ₹1 for COD, full amount for prepaid
      const chargeAmount = paymentMethod === 'cod' ? COD_ADVANCE : grandTotal;

      // Create Razorpay Order
      const orderRes = await fetch(`${BACKEND_URL}/general/razorpay/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: chargeAmount })
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert('Failed to initialize payment');
        setIsPlacingOrder(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Tradition Store',
        description: paymentMethod === 'cod'
          ? `COD Advance Payment (₹${COD_ADVANCE})`
          : 'Order Payment',
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await fetch(`${BACKEND_URL}/general/razorpay/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              const createOrderData = await createOrder(paymentMethod);
              if (createOrderData.success) {
                setTimeout(() => {
                  clearCart();
                  navigate(`/order-tracking/${createOrderData.order.order_number}`);
                }, 2000);
              } else {
                alert('Failed to place order after payment.');
                setIsPlacingOrder(false);
              }
            } else {
              alert('Payment verification failed');
              setIsPlacingOrder(false);
            }
          } catch (err) {
            console.error(err);
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: address.name,
          contact: address.mobile
        },
        theme: { color: '#4f46e5' },
        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      setIsPlacingOrder(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-6 px-4 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
      <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/cart')}>
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-600/30">✓</div>
        <span className="text-[11px] text-indigo-600 font-bold mt-2">Cart</span>
      </div>
      <div className={`h-[2px] flex-1 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
      
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 2 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
          {step > 2 ? '✓' : (token ? '✓' : '1')}
        </div>
        <span className={`text-[11px] font-bold mt-2 ${step >= 2 ? 'text-indigo-600' : 'text-gray-500'}`}>{token ? 'Auth' : 'Login'}</span>
      </div>
      <div className={`h-[2px] flex-1 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>

      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 2 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
          {step > 2 ? '✓' : '2'}
        </div>
        <span className={`text-[11px] font-bold mt-2 ${step >= 2 ? 'text-indigo-600' : 'text-gray-500'}`}>Address</span>
      </div>
      <div className={`h-[2px] flex-1 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
      <div className={`flex flex-col items-center ${step < 3 ? 'opacity-50' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 3 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>3</div>
        <span className={`text-[11px] font-bold mt-2 ${step >= 3 ? 'text-indigo-600' : 'text-gray-500'}`}>Payment</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pb-36 font-sans">
      {/* Mobile App Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-center md:hidden">
        <button onClick={() => step === 3 ? setStep(2) : step === 2 ? setStep(1) : navigate('/cart')} className="absolute left-4 p-2 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg text-gray-900 tracking-wide">Checkout</h1>
      </div>
      
      <div className="p-4 md:p-8 space-y-4 md:space-y-8 md:max-w-7xl mx-auto">
        {renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-8 space-y-6">
            {step === 1 && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-brand-blue/30 shadow-sm flex items-center justify-center">
                    <UserCircle2 className="w-5 h-5 text-brand-blue" />
                  </div>
                  Authentication
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Login Option */}
                  <div className="bg-orange-50/50 p-6 rounded-3xl shadow-sm border border-indigo-600/30 flex flex-col justify-between hover:border-indigo-600 hover:shadow-md transition-all">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-3 font-sans">Login / Sign Up</h3>
                      <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">Access your saved addresses, track orders easily, and get exclusive offers.</p>
                    </div>
                    <button 
                      onClick={() => navigate('/login?redirect=/checkout')}
                      className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-md hover:bg-[#033429] transition-all hover:-translate-y-1"
                    >
                      Login to Continue
                    </button>
                  </div>
                  
                  {/* Guest Checkout Option */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-gray-200 transition-all">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-3">Guest Checkout</h3>
                      <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">Proceed without an account. You can track your order using the order ID.</p>
                    </div>
                    <button 
                      onClick={() => setStep(2)}
                      className="w-full bg-gray-50 text-gray-900 border border-gray-200 font-bold py-4 rounded-xl hover:bg-gray-100 transition-all"
                    >
                      Checkout as Guest
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-8 font-sans">
              <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-indigo-600/30 shadow-sm flex items-center justify-center">
                <MapPin className="w-5 h-5 text-indigo-600" />
              </div>
              Delivery Address
            </h2>
            
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-600/10 to-transparent rounded-bl-full pointer-events-none opacity-50 blur-xl"></div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Full Name</label>
                  <input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full text-lg font-bold text-gray-900 border-b-2 border-gray-200 py-2 focus:outline-none focus:border-brand-blue transition-colors bg-transparent placeholder-gray-400" placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Address Line 1</label>
                  <input value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} className="w-full text-base text-gray-900 border-b border-gray-200 py-2 focus:outline-none focus:border-brand-blue transition-colors bg-transparent placeholder-gray-400" placeholder="House number, Street name" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">City</label>
                    <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full text-base text-gray-900 border-b border-gray-200 py-2 focus:outline-none focus:border-brand-blue transition-colors bg-transparent placeholder-gray-400" placeholder="City" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">State</label>
                    <input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full text-base text-gray-900 border-b border-gray-200 py-2 focus:outline-none focus:border-brand-blue transition-colors bg-transparent placeholder-gray-400" placeholder="State" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Pincode</label>
                    <input value={address.pincode} inputMode="numeric" maxLength={6} onChange={e => setAddress({...address, pincode: e.target.value.replace(/\D/g, '')})} className="w-full text-base text-gray-900 border-b border-gray-200 py-2 focus:outline-none focus:border-brand-blue transition-colors bg-transparent placeholder-gray-400" placeholder="6 Digits" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Mobile</label>
                    <input value={address.mobile} inputMode="numeric" maxLength={10} onChange={e => setAddress({...address, mobile: e.target.value.replace(/\D/g, '')})} className="w-full text-base text-gray-900 border-b border-gray-200 py-2 focus:outline-none focus:border-brand-blue transition-colors bg-transparent placeholder-gray-400" placeholder="10 Digits" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Email (for order confirmation)</label>
                  <input type="email" value={address.email} onChange={e => setAddress({...address, email: e.target.value})} placeholder="your@email.com" className="w-full text-base text-gray-900 border-b border-gray-200 py-2 focus:outline-none focus:border-brand-blue transition-colors bg-transparent placeholder-gray-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-8 font-sans">
              <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-indigo-600/30 shadow-sm flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-indigo-600" />
              </div>
              Payment Method
            </h2>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                {/* Online Payment */}
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-indigo-600 bg-orange-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center mr-4 shrink-0 shadow-sm">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1" onClick={() => setPaymentMethod('razorpay')}>
                    <span className="text-lg font-bold text-gray-900 block">Online Payment</span>
                    <span className="text-sm text-gray-600 mt-0.5 block">Credit/Debit Card, UPI, NetBanking</span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="w-5 h-5 accent-indigo-600 bg-transparent border-gray-200"
                  />
                </label>

                {/* COD */}
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mr-4 shrink-0 shadow-sm">
                    <Banknote className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1" onClick={() => setPaymentMethod('cod')}>
                    <span className="text-lg font-bold text-gray-900 block">Cash on Delivery</span>
                    <span className="text-sm text-gray-600 mt-0.5 block">Pay ₹1 now + ₹{Math.max(0, codRemaining).toFixed(0)} at your door</span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-5 h-5 accent-green-500 bg-transparent border-gray-200"
                  />
                </label>
              </div>
            </div>

            {/* COD Info Banner */}
            {paymentMethod === 'cod' && (
              <div className="flex gap-4 bg-green-50 border border-green-200 shadow-sm rounded-2xl p-5">
                <Info className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-bold text-green-700 mb-2">How COD works</p>
                  <ul className="space-y-2">
                    <li className="text-sm text-green-700">✓ Pay <strong className="text-gray-900">₹{COD_ADVANCE}</strong> advance online now (via Razorpay)</li>
                    <li className="text-sm text-green-700">✓ Remaining <strong className="text-gray-900">₹{Math.max(0, codRemaining).toFixed(0)}</strong> is collected at your door by the delivery person</li>
                    <li className="text-sm text-green-700">✓ Your order will be confirmed instantly after the ₹1 advance</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Order Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 text-xl flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-blue rounded-full inline-block"></span>
                Order Summary
              </h3>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar pr-2 mb-6">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.variant?.size}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 p-1 shrink-0">
                      <img src={item.product.images?.[0] || item.product.image_url} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">Qty: {item.qty} | {item.variant?.size || 'Std'}</p>
                      <p className="text-sm font-bold text-brand-blue mt-1">₹{(item.variant?.price || item.product.price) * item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-5 mb-6">
                <div className="flex justify-between font-extrabold text-gray-900 text-xl">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {step === 1 ? (
                <button 
                  disabled
                  className="w-full bg-gray-50 text-gray-400 font-bold text-base rounded-xl py-4 flex items-center justify-center cursor-not-allowed border border-gray-200"
                >
                  Select Checkout Method
                </button>
              ) : step >= 2 ? (
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full text-white font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-all bg-green-500 hover:bg-green-600 shadow-lg hover:-translate-y-1 hover:shadow-green-500/30"
                >
                  <MessageCircle className="w-5 h-5" />
                  Order via WhatsApp
                </button>
              ) : null}
              
              <div className="flex items-center justify-center gap-2 mt-5 text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-medium">100% Secure Transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] mx-auto w-full">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              {step === 3 && paymentMethod === 'cod' ? (
                <>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pay Now (Advance)</p>
                  <p className="text-2xl font-bold text-green-600 leading-none">₹{COD_ADVANCE}</p>
                  <p className="text-[10px] text-gray-500 mt-1">+ ₹{Math.max(0, codRemaining).toFixed(0)} at delivery</p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Payable Amount</p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">₹{grandTotal.toFixed(2)}</p>
                </>
              )}
            </div>
          </div>
          
          {step === 1 ? (
            <button 
              disabled
              className="w-full bg-gray-50 text-gray-400 font-bold text-base rounded-xl py-4 flex items-center justify-center cursor-not-allowed border border-gray-200"
            >
              Select Checkout Method
            </button>
          ) : step >= 2 ? (
            <button
              onClick={handleWhatsAppOrder}
              className="w-full text-white font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-all bg-green-500 hover:bg-green-600 shadow-lg hover:-translate-y-1 hover:shadow-green-500/30"
            >
              <MessageCircle className="w-5 h-5" />
              Order via WhatsApp
            </button>
          ) : null}
        
        <div className="flex items-center justify-center gap-2 mt-4">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          <span className="text-[10px] text-gray-500 font-medium">Your order is safe and secure</span>
        </div>
        </div>
      </div>

      {/* Order Placed Success Overlay */}
      {isPlacingOrder && (
        <div ref={overlayRef} className="fixed inset-0 z-[100] bg-[#020617]/90 backdrop-blur-md flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center gap-5">
            <div ref={iconRef} className="w-24 h-24 bg-indigo-600/20 border-2 border-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,123,0,0.5)]">
              <CheckCircle className="w-12 h-12 text-indigo-600" strokeWidth={2.5} />
            </div>
            <h2 ref={textRef} className="text-3xl font-extrabold text-white glow-text tracking-tight">Order Confirmed!</h2>
            <p className="text-sm text-brand-text-muted animate-pulse">Redirecting to tracking...</p>
          </div>
        </div>
      )}
    </div>
  );
}

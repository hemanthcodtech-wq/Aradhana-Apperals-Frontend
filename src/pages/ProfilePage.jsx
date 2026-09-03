import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin, Settings, LogOut, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';

export function ProfilePage() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f4f6f5] flex flex-col items-center justify-center gap-4 pb-20">
        <Header title="My Profile" />
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-gray-200 mt-20">
          <User className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl text-gray-900 font-extrabold mt-2 tracking-tight">You're not logged in</h2>
        <p className="text-gray-500 text-sm max-w-[250px] text-center">Log in to view your orders, saved addresses, and profile details.</p>
        <div className="flex flex-col gap-3 w-full max-w-[280px] mt-4">
          <Link to="/login" className="bg-gradient-to-r from-[#022A21] to-[#054335] text-white font-bold px-8 py-3.5 rounded-xl text-[15px] shadow-[0_4px_20px_rgba(2,42,33,0.3)] hover:shadow-[0_8px_30px_rgba(2,42,33,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all text-center">Log In to Account</Link>
          <Link to="/signup" className="text-[#022A21] text-[15px] font-bold hover:bg-[#022A21]/5 py-3.5 rounded-xl transition-colors text-center border-2 border-transparent hover:border-[#022A21]/10">Create New Account</Link>
        </div>
      </div>
    );
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const menuItems = [
    { icon: Package, label: 'My Orders', action: () => navigate('/my-orders') },
    { icon: Heart, label: 'My Wishlist', action: () => navigate('/wishlist') },
    { icon: MapPin, label: 'Saved Addresses', action: () => navigate('/my-addresses') },
    { icon: Settings, label: 'Account Settings', action: () => navigate('/account-settings') },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f5] pb-24">
      <Header title="My Profile" />
      
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-[#022A21] to-[#054335] text-white px-6 pt-8 pb-10 shadow-[0_10px_30px_rgba(2,42,33,0.4)] relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-xl"></div>
        
        <div className="max-w-4xl mx-auto flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0 shadow-inner shadow-white/10">
            <span className="text-3xl font-black text-white tracking-widest">{initials}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold font-sans tracking-tight leading-tight">{user?.name}</h1>
            <p className="text-sm text-gray-300 mt-1 font-medium flex items-center gap-1.5 opacity-90">
              {user?.phone || user?.email}
            </p>
            {user?.role === 'admin' && (
              <Link to="/admin"
                className="mt-3 inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm text-[11px] uppercase tracking-wider font-bold px-4 py-2 rounded-full border border-white/20 transition-all shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button key={index} onClick={item.action}
                className="group w-full flex items-center justify-between p-4 bg-white hover:bg-[#022A21]/5 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-4 text-gray-900">
                  <div className="w-10 h-10 rounded-full bg-[#022A21]/5 group-hover:bg-[#022A21]/10 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-[#022A21]" />
                  </div>
                  <span className="text-[15px] font-bold group-hover:translate-x-1 transition-transform">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#022A21] group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-2">
          <button onClick={() => { logout(); navigate('/'); }}
            className="group w-full flex items-center justify-between p-4 bg-white hover:bg-red-50 rounded-2xl transition-all duration-300">
            <div className="flex items-center gap-4 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-[15px] font-bold group-hover:translate-x-1 transition-transform">Log Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-200 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
        
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-gray-400 font-medium">App Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

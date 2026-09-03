import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, CheckCircle2, ShieldCheck, RefreshCcw } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { useStoreData } from '../store/useStoreData';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function HomePage() {
  const container = useRef(null);
  const navigate = useNavigate();
  const { products, categories, loading } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');
  const [banners, setBanners] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    fetch(`${url}/general/banners?type=homepage_top_banner`)
      .then(r => r.json())
      .then(d => { if (d.banners) setBanners(d.banners); })
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBannerIdx(prev => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  useGSAP(() => {
    if (!loading) {
      gsap.from('.animate-section', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all'
      });
    }
  }, { scope: container, dependencies: [loading] });

  // Dummy data for visual match if real data is missing or doesn't match the sports theme


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div ref={container} className="bg-[#f8f9fa] flex-1 pb-4 md:pb-12">
      <Header variant="home" />

      {/* 1. Hero Banner */}
      <div className="animate-section px-4 mt-4 md:mt-8 mb-6 md:mb-12 md:max-w-7xl md:mx-auto">
        {banners.length > 0 ? (
          <div className="relative w-full rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] shadow-sm flex items-center cursor-pointer group" onClick={() => { if (banners[currentBannerIdx].link_url) navigate(banners[currentBannerIdx].link_url) }}>
            {banners.map((b, idx) => (
              <img 
                key={b.id} 
                src={b.image_url} 
                alt={b.title || 'Banner'} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
              />
            ))}
            
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                {banners.map((_, idx) => (
                  <div key={idx} onClick={(e) => { e.stopPropagation(); setCurrentBannerIdx(idx); }} className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${idx === currentBannerIdx ? 'bg-indigo-600 scale-110 shadow' : 'bg-white/70 hover:bg-white'}`}></div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-400 aspect-[16/9] md:aspect-[21/9] shadow-sm flex items-center">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            
            <div className="relative z-10 px-6 py-6 md:px-10 flex flex-col justify-center h-full w-[60%]">
              <h2 className="text-white text-2xl md:text-4xl font-black mb-1 leading-tight tracking-wide">
                PERFORMANCE<br/>MEETS<br/>STYLE
              </h2>
              <p className="text-white/90 font-medium text-xs md:text-sm mb-4">
                Gear up. Stand out.
              </p>
              <button onClick={() => navigate('/category/all')} className="bg-white text-indigo-600 text-xs font-bold py-2 px-4 rounded-full w-max shadow-sm hover:bg-[#f8f9fa] active:scale-95 transition-all">
                SHOP NOW
              </button>
            </div>

            {/* Banner Images Decoration */}
            <div className="absolute right-[-10%] top-0 bottom-0 w-[55%] flex items-center justify-center opacity-100">
              <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80" alt="Gear" className="w-full h-full object-cover rounded-l-full rotate-12 scale-150" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Shop by Category */}
      <div className="animate-section px-4 mb-6 md:mb-14 md:max-w-7xl md:mx-auto">
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <h3 className="text-[17px] md:text-2xl font-bold text-gray-900 tracking-tight">Shop by Category</h3>
          <Link to="/category/all" className="text-indigo-600 text-xs md:text-sm font-bold flex items-center gap-0.5 hover:text-indigo-700">View all <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" /></Link>
        </div>
        <div className="flex md:grid md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-6 overflow-x-auto md:overflow-visible hide-scrollbar pb-2">
          {categories.length > 0 ? categories.map((cat, idx) => (
            <Link key={cat.id || idx} to={`/category/${cat.id || cat.name}`} className="flex flex-col gap-2 shrink-0 w-[75px] md:w-full group">
              <div className="w-full aspect-square rounded-[18px] overflow-hidden bg-gray-100 border border-gray-200/50 relative shadow-sm">
                <img src={cat.image_url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
              </div>
              <span className="text-[12px] font-bold text-gray-800 text-center">{cat.name}</span>
            </Link>
          )) : (
            <div className="text-sm text-gray-500 italic px-2">No categories found.</div>
          )}
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="animate-section px-4 mb-8 md:mb-16 md:max-w-3xl md:mx-auto">
        <form onSubmit={handleSearch} className="relative w-full shadow-[0_2px_15px_rgba(0,0,0,0.04)] md:shadow-lg md:shadow-indigo-600/5 rounded-full md:hover:-translate-y-1 transition-transform duration-300">
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search for bags, bats, t-shirts, jeans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-full py-3.5 md:py-4 pl-12 md:pl-16 pr-4 md:text-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-shadow"
          />
        </form>
      </div>

      {/* 4. Top Picks (Festive Collections) */}
      <div className="animate-section px-4 mb-8 md:mb-16 md:max-w-7xl md:mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-8">
          <h3 className="text-[17px] md:text-2xl font-bold text-gray-900 tracking-tight">Top Picks</h3>
          <Link to="/collection/top-picks" className="text-indigo-600 text-xs md:text-sm font-bold flex items-center gap-0.5 hover:text-indigo-700">View all <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" /></Link>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {products.slice(0, 5).map((product, idx) => (
              <div key={product.id} className={`${idx === 4 ? 'hidden lg:block' : ''}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-[20px] aspect-square animate-pulse"></div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Trending Now */}
      {products.filter(p => p.is_trending).length > 0 && (
        <div className="animate-section px-4 mb-8 md:mb-16 md:max-w-7xl md:mx-auto">
          <div className="flex justify-between items-center mb-4 md:mb-8">
            <h3 className="text-[17px] md:text-2xl font-bold text-gray-900 tracking-tight">Trending</h3>
            <Link to="/collection/trending" className="text-indigo-600 text-xs md:text-sm font-bold flex items-center gap-0.5 hover:text-indigo-700">View all <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" /></Link>
          </div>
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 overflow-x-auto md:overflow-visible gap-3 md:gap-6 hide-scrollbar pb-2 snap-x">
            {products.filter(p => p.is_trending).slice(0, 5).map((product, idx) => (
              <div key={product.id} className={`w-[160px] md:w-full flex-shrink-0 snap-start ${idx === 4 ? 'md:hidden lg:block' : ''}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Best Sellers */}
      {products.filter(p => p.is_bestseller).length > 0 && (
        <div className="animate-section px-4 mb-8 md:mb-16 md:max-w-7xl md:mx-auto">
          <div className="flex justify-between items-center mb-4 md:mb-8">
            <h3 className="text-[17px] md:text-2xl font-bold text-gray-900 tracking-tight">Best Sellers</h3>
            <Link to="/collection/best-sellers" className="text-indigo-600 text-xs md:text-sm font-bold flex items-center gap-0.5 hover:text-indigo-700">View all <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {products.filter(p => p.is_bestseller).slice(0, 5).map((product, idx) => (
              <div key={product.id} className={`${idx === 4 ? 'hidden lg:block' : ''}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Recommended For You */}
      {products.length > 4 && (
        <div className="animate-section px-4 mb-8 md:mb-16 md:max-w-7xl md:mx-auto">
          <div className="flex justify-between items-center mb-4 md:mb-8">
            <h3 className="text-[17px] md:text-2xl font-bold text-gray-900 tracking-tight">Recommended</h3>
            <Link to="/collection/recommended" className="text-indigo-600 text-xs md:text-sm font-bold flex items-center gap-0.5 hover:text-indigo-700">View all <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" /></Link>
          </div>
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 overflow-x-auto md:overflow-visible gap-3 md:gap-6 hide-scrollbar pb-2 snap-x">
            {products.filter(p => !p.is_trending && !p.is_bestseller).slice(0, 5).map((product, idx) => (
              <div key={`rec-${product.id}`} className={`w-[160px] md:w-full flex-shrink-0 snap-start ${idx === 4 ? 'md:hidden lg:block' : ''}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Features Block */}
      <div className="animate-section px-4 mb-2 md:mb-12 md:max-w-4xl md:mx-auto">
        <div className="bg-white rounded-xl md:rounded-3xl p-4 md:p-8 flex justify-between items-center shadow-sm md:shadow-lg md:shadow-indigo-600/5 border border-gray-100">
          <div className="flex flex-col items-center gap-1.5 md:gap-3 flex-1 group">
            <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-[#f8f9fa] group-hover:bg-indigo-50 transition-colors flex items-center justify-center">
              <svg className="w-4 h-4 md:w-8 md:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </div>
            <div className="text-center">
              <p className="text-[10px] md:text-sm font-extrabold text-gray-900 leading-tight">Free Shipping</p>
              <p className="text-[9px] md:text-xs text-gray-500 leading-tight md:mt-1">On orders above<br className="md:hidden"/>₹999</p>
            </div>
          </div>
          
          <div className="w-px h-10 md:h-20 bg-gray-100"></div>

          <div className="flex flex-col items-center gap-1.5 md:gap-3 flex-1 group">
            <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p className="text-[10px] md:text-sm font-extrabold text-gray-900 leading-tight">100% Original</p>
              <p className="text-[9px] md:text-xs text-gray-500 leading-tight md:mt-1">Authentic sports<br className="md:hidden"/>products</p>
            </div>
          </div>

          <div className="w-px h-10 md:h-20 bg-gray-100"></div>

          <div className="flex flex-col items-center gap-1.5 md:gap-3 flex-1 group">
            <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-[#f8f9fa] group-hover:bg-indigo-50 transition-colors flex items-center justify-center">
              <RefreshCcw className="w-4 h-4 md:w-7 md:h-7 text-indigo-600" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="text-[10px] md:text-sm font-extrabold text-gray-900 leading-tight">Easy Returns</p>
              <p className="text-[9px] md:text-xs text-gray-500 leading-tight md:mt-1">7-day return<br className="md:hidden"/>policy</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

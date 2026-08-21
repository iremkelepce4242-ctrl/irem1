import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  RotateCcw,
  Wifi,
  Battery,
  Signal,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { HomeFragment } from './HomeFragment';
import { CariListeFragment } from './CariListeFragment';
import { StokListesiFragment } from './StokListesiFragment';
import { SatisFragment } from './SatisFragment';
import { AlimFragment } from './AlimFragment';
import { CekSenetFragment } from './CekSenetFragment';
import { RaporlarFragment } from './RaporlarFragment';
import { YilDevirModal } from './YilDevirModal';

export const AndroidPhoneLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    aktifYil,
    setAktifYil,
    cart
  } = useApp();

  const [showDevirModal, setShowDevirModal] = useState(false);
  const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const getTitle = () => {
    switch (activeTab) {
      case 'home': return 'İrem Kelepçe Yeni';
      case 'cariler': return 'Cari Hesap Listesi';
      case 'stoklar': return 'Stok Listesi';
      case 'satis': return 'Satış Yap';
      case 'alim': return 'Alım Yap';
      case 'cek_senet': return 'Çek & Senet Takip';
      case 'raporlar': return 'Mali Raporlar';
      default: return 'İrem Kelepçe Yeni';
    }
  };

  return (
    <div className="flex justify-center items-center py-2 px-1 sm:px-4">
      
      {/* Realistic Android Phone Device Frame */}
      <div className="w-full max-w-[440px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-black/30 relative overflow-hidden flex flex-col h-[850px]">
        
        {/* Android Screen Area */}
        <div className="bg-[#F1F5F9] rounded-[34px] w-full h-full flex flex-col overflow-hidden relative border border-slate-200">
          
          {/* 1. Android Status Bar (Matching Screenshot: 17:03 on left, 4.5G & Battery on right) */}
          <div className="bg-[#1E88E5] pt-2 px-5 pb-1 flex justify-between items-center text-[12px] text-white/90 font-semibold z-20 select-none">
            <span>{currentTime}</span>
            <div className="flex items-center gap-2 text-white">
              <span className="text-[10px] font-bold">4.5G</span>
              <Signal className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <Battery className="w-4 h-4 fill-white" />
                <span className="text-[10px] font-bold">95</span>
              </div>
            </div>
          </div>

          {/* 2. Top Android App Toolbar (Matching Screenshot: Solid Blue #1E88E5 with "İrem Kelepçe Yeni") */}
          <div className="px-4 py-3 bg-[#1E88E5] text-white flex items-center justify-between z-20 shrink-0 shadow-md shadow-blue-600/20">
            <div className="flex items-center gap-2.5">
              {activeTab !== 'home' && (
                <button
                  onClick={() => setActiveTab('home')}
                  className="p-1 -ml-1 rounded-full hover:bg-white/20 active:scale-90 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <h1 className="font-extrabold text-lg text-white tracking-tight">
                {getTitle()}
              </h1>
            </div>

            {/* Year Selector & Devir Button */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={aktifYil}
                  onChange={e => setAktifYil(Number(e.target.value))}
                  className="appearance-none bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs pl-2.5 pr-6 py-1 rounded-lg border border-white/30 focus:outline-hidden cursor-pointer"
                >
                  <option value={2024} className="text-slate-800">2024</option>
                  <option value={2025} className="text-slate-800">2025</option>
                  <option value={2026} className="text-slate-800">2026</option>
                </select>
                <ChevronDown className="w-3 h-3 text-white absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                id="btn-nav-devir"
                onClick={() => setShowDevirModal(true)}
                title="Yıl Sonu Devir İşlemi (PostgreSQL RPC)"
                className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center hover:bg-white/30 border border-white/30 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Screen Container (Scrollable) */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {activeTab === 'home' && <HomeFragment />}
            {activeTab === 'cariler' && <CariListeFragment />}
            {activeTab === 'stoklar' && <StokListesiFragment />}
            {activeTab === 'satis' && <SatisFragment />}
            {activeTab === 'alim' && <AlimFragment />}
            {activeTab === 'cek_senet' && <CekSenetFragment />}
            {activeTab === 'raporlar' && <RaporlarFragment onOpenYilDevir={() => setShowDevirModal(true)} />}
          </div>

          {/* 4. Android Bottom 3-Button Navigation Bar (Recent Apps, Home, Back - Matching Screenshot) */}
          <div className="bg-[#1E88E5] px-8 py-2.5 flex items-center justify-around text-white/90 shrink-0 select-none">
            
            {/* Recent Apps Button (|||) */}
            <button
              onClick={() => setActiveTab('home')}
              className="p-1 hover:text-white active:scale-90 transition-all font-bold text-sm tracking-widest"
            >
              |||
            </button>

            {/* Home Button (O) */}
            <button
              onClick={() => setActiveTab('home')}
              className="w-4 h-4 rounded-full border-2 border-white hover:bg-white/20 active:scale-90 transition-all"
            />

            {/* Back Button (<) */}
            <button
              onClick={() => {
                if (activeTab !== 'home') setActiveTab('home');
              }}
              className="p-1 hover:text-white active:scale-90 transition-all font-bold text-lg"
            >
              &lt;
            </button>
          </div>

        </div>
      </div>

      {/* Year Devir Modal */}
      {showDevirModal && <YilDevirModal onClose={() => setShowDevirModal(false)} />}

    </div>
  );
};

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
  Calendar,
  Sparkles,
  FileCheck,
  PackagePlus,
  Layers,
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
      case 'home': return 'Stok & Cari Takip';
      case 'cariler': return 'Cari Hesap Yönetimi';
      case 'stoklar': return 'Stok & Depo Envanteri';
      case 'satis': return 'Hızlı Satış & POS';
      case 'alim': return 'Mal Alım Faturası';
      case 'cek_senet': return 'Çek & Senet Portföyü';
      case 'raporlar': return 'Mali Raporlar & Analiz';
      default: return 'Stok & Cari Takip';
    }
  };

  return (
    <div className="flex justify-center items-center py-2 px-1 sm:px-4">
      
      {/* Realistic Android Phone Device Shell */}
      <div className="w-full max-w-[440px] bg-slate-950 rounded-[40px] p-2.5 shadow-2xl border-4 border-slate-800 ring-1 ring-white/10 relative overflow-hidden flex flex-col h-[850px]">
        
        {/* Notch / Dynamic Island */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-30 flex items-center justify-center gap-2 border border-slate-800/80">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900" />
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Android Screen Area */}
        <div className="bg-slate-950 rounded-[32px] w-full h-full flex flex-col overflow-hidden relative border border-slate-800/60">
          
          {/* 1. Android Status Bar (Matching Android System UI) */}
          <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[11px] text-slate-400 font-medium z-20 select-none">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">98%</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* 2. Modern Android App Toolbar (Matching toolbar.xml) */}
          <div className="px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h1 className="font-extrabold text-sm text-white tracking-tight">{getTitle()}</h1>
              </div>
              <p className="text-[10px] text-slate-400">PostgreSQL (Supabase) Çevrimdışı/Bulut</p>
            </div>

            {/* Year Selector Dropdown & Devir Trigger */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={aktifYil}
                  onChange={e => setAktifYil(Number(e.target.value))}
                  className="appearance-none bg-slate-800 hover:bg-slate-750 text-amber-300 font-extrabold text-xs pl-2.5 pr-6 py-1 rounded-lg border border-amber-500/30 focus:outline-hidden cursor-pointer"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
                <ChevronDown className="w-3 h-3 text-amber-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                id="btn-nav-devir"
                onClick={() => setShowDevirModal(true)}
                title="Yıl Sonu Devir İşlemi (PostgreSQL RPC)"
                className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center hover:bg-amber-500/30 border border-amber-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Fragment Screen Container (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3.5 pt-3 no-scrollbar">
            {activeTab === 'home' && <HomeFragment />}
            {activeTab === 'cariler' && <CariListeFragment />}
            {activeTab === 'stoklar' && <StokListesiFragment />}
            {activeTab === 'satis' && <SatisFragment />}
            {activeTab === 'alim' && <AlimFragment />}
            {activeTab === 'cek_senet' && <CekSenetFragment />}
            {activeTab === 'raporlar' && <RaporlarFragment onOpenYilDevir={() => setShowDevirModal(true)} />}
          </div>

          {/* 4. Android Bottom Navigation Bar (Matching bottom_nav_menu.xml) */}
          <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around z-30">
            
            {/* Home */}
            <button
              id="tab-home"
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                activeTab === 'home' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Ana Sayfa</span>
            </button>

            {/* Cariler */}
            <button
              id="tab-cariler"
              onClick={() => setActiveTab('cariler')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                activeTab === 'cariler' ? 'text-purple-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Cariler</span>
            </button>

            {/* Satış / Hızlı Kasa (Center Highlighted Button) */}
            <button
              id="tab-satis"
              onClick={() => setActiveTab('satis')}
              className="relative -top-3.5 flex flex-col items-center group"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-active:scale-90 ${
                  activeTab === 'satis'
                    ? 'bg-emerald-400 text-slate-950 shadow-emerald-400/30'
                    : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-slate-900">
                    {cart.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-emerald-400 mt-0.5">Satış</span>
            </button>

            {/* Stoklar */}
            <button
              id="tab-stoklar"
              onClick={() => setActiveTab('stoklar')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                activeTab === 'stoklar' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Stoklar</span>
            </button>

            {/* Raporlar */}
            <button
              id="tab-raporlar"
              onClick={() => setActiveTab('raporlar')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                activeTab === 'raporlar' ? 'text-rose-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Rapor</span>
            </button>

          </div>

          {/* Android Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700 rounded-full z-40" />

        </div>
      </div>

      {/* Year Devir Modal */}
      {showDevirModal && <YilDevirModal onClose={() => setShowDevirModal(false)} />}

    </div>
  );
};

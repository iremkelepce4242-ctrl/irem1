import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Plus,
  Users,
  Menu,
  RotateCcw,
  FileText,
  Eye,
  Calendar,
  Wrench,
  TrendingUp,
  PackagePlus
} from 'lucide-react';
import { StokEkleModal } from './StokEkleModal';
import { TransferModal } from './TransferModal';
import { TekliflerModal } from './TekliflerModal';
import { CariGruplariModal } from './CariGruplariModal';
import { UrunGruplariModal } from './UrunGruplariModal';

export const HomeFragment: React.FC = () => {
  const {
    aktifYil,
    setActiveTab,
  } = useApp();

  const [showStokEkle, setShowStokEkle] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showTeklifler, setShowTeklifler] = useState(false);
  const [showCariGruplari, setShowCariGruplari] = useState(false);
  const [showUrunGruplari, setShowUrunGruplari] = useState(false);

  return (
    <div className="bg-[#F1F5F9] min-h-full pb-16 flex flex-col select-none">
      
      {/* 1. Header with Blue-to-Cyan Gradient Banner (Matching Screenshot 1) */}
      <div className="bg-gradient-to-b from-[#1E88E5] via-[#0288D1] to-[#00B4D8] pt-6 pb-20 px-5 relative overflow-hidden">
        {/* Subtle background glow circle */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          HOŞ GELDİNİZ
        </h1>
        <p className="text-xs text-blue-100/90 font-medium mt-0.5">
          {aktifYil} Çalışma Yılı • Supabase Bulut Veritabanı
        </p>
      </div>

      {/* 2. Main Floating White Card (Overlapping the Gradient) */}
      <div className="px-4 -mt-14 relative z-10">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl shadow-blue-950/10 border border-slate-100 flex flex-col gap-3.5">
          
          {/* Top 2 Big Action Buttons: SATIŞ YAP & ALIM YAP */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* SATIŞ YAP (Indigo / Royal Blue) */}
            <button
              id="btn-main-satis"
              onClick={() => setActiveTab('satis')}
              className="h-32 rounded-2xl bg-gradient-to-br from-[#303F9F] to-[#283593] hover:from-[#3949AB] hover:to-[#303F9F] text-white flex flex-col items-center justify-center gap-2.5 shadow-lg shadow-indigo-900/25 active:scale-96 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-7 h-7 text-white fill-white rotate-45 ml-1 -mt-1" />
              </div>
              <span className="font-extrabold text-sm sm:text-base tracking-wider">
                SATIŞ YAP
              </span>
            </button>

            {/* ALIM YAP (Teal / Emerald) */}
            <button
              id="btn-main-alim"
              onClick={() => setActiveTab('alim')}
              className="h-32 rounded-2xl bg-gradient-to-br from-[#00897B] to-[#00796B] hover:from-[#009688] hover:to-[#00897B] text-white flex flex-col items-center justify-center gap-2.5 shadow-lg shadow-teal-900/25 active:scale-96 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-sm sm:text-base tracking-wider">
                ALIM YAP
              </span>
            </button>
          </div>

          {/* Bottom 2 Wide Buttons: CARİ LİSTESİ & STOK LİSTESİ */}
          <div className="grid grid-cols-2 gap-3">
            {/* CARİ LİSTESİ */}
            <button
              id="btn-main-cariler"
              onClick={() => setActiveTab('cariler')}
              className="py-3.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-1.5 active:scale-96 transition-all cursor-pointer group"
            >
              <div className="text-[#0288D1] group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-wide">
                CARİ LİSTESİ
              </span>
            </button>

            {/* STOK LİSTESİ */}
            <button
              id="btn-main-stoklar"
              onClick={() => setActiveTab('stoklar')}
              className="py-3.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-1.5 active:scale-96 transition-all cursor-pointer group"
            >
              <div className="text-[#0288D1] group-hover:scale-110 transition-transform">
                <Menu className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-wide">
                STOK LİSTESİ
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Section: DİĞER İŞLEMLER (Matching Screenshot 1) */}
      <div className="px-4 mt-6">
        <h2 className="text-xs font-black text-[#546E7A] tracking-wider uppercase mb-3 px-1">
          DİĞER İŞLEMLER
        </h2>

        {/* 2-Column Grid for Secondary Operations */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* STOK EKLE */}
          <button
            id="btn-other-stok-ekle"
            onClick={() => setShowStokEkle(true)}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2 active:scale-96 transition-all cursor-pointer group"
          >
            <div className="text-[#00BCD4] group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-black text-xs text-slate-700 tracking-wide text-center">
              STOK EKLE
            </span>
          </button>

          {/* TRANSFER */}
          <button
            id="btn-other-transfer"
            onClick={() => setShowTransfer(true)}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2 active:scale-96 transition-all cursor-pointer group"
          >
            <div className="text-[#00BCD4] group-hover:scale-110 transition-transform">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-black text-xs text-slate-700 tracking-wide text-center">
              TRANSFER
            </span>
          </button>

          {/* TEKLİFLER */}
          <button
            id="btn-other-teklifler"
            onClick={() => setShowTeklifler(true)}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2 active:scale-96 transition-all cursor-pointer group"
          >
            <div className="text-[#00BCD4] group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="font-black text-xs text-slate-700 tracking-wide text-center">
              TEKLİFLER
            </span>
          </button>

          {/* ÇEK/SENET */}
          <button
            id="btn-other-ceksenet"
            onClick={() => setActiveTab('cek_senet')}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2 active:scale-96 transition-all cursor-pointer group"
          >
            <div className="text-[#00BCD4] group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="font-black text-xs text-slate-700 tracking-wide text-center">
              ÇEK/SENET
            </span>
          </button>

          {/* CARİ GRUPLARI */}
          <button
            id="btn-other-cari-gruplari"
            onClick={() => setShowCariGruplari(true)}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2 active:scale-96 transition-all cursor-pointer group"
          >
            <div className="text-[#00BCD4] group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="font-black text-xs text-slate-700 tracking-wide text-center">
              CARİ GRUPLARI
            </span>
          </button>

          {/* ÜRÜN GRUPLARI */}
          <button
            id="btn-other-urun-gruplari"
            onClick={() => setShowUrunGruplari(true)}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2 active:scale-96 transition-all cursor-pointer group"
          >
            <div className="text-[#00BCD4] group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="font-black text-xs text-slate-700 tracking-wide text-center">
              ÜRÜN GRUPLARI
            </span>
          </button>

        </div>
      </div>

      {/* 4. Secondary Action: Mali Raporlar Button */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setActiveTab('raporlar')}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all"
        >
          <TrendingUp className="w-4 h-4" />
          <span>{aktifYil} YILI MALİ RAPORLAR & ANALİZ</span>
        </button>
      </div>

      {/* Modals for secondary actions */}
      {showStokEkle && <StokEkleModal onClose={() => setShowStokEkle(false)} />}
      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} />}
      {showTeklifler && <TekliflerModal onClose={() => setShowTeklifler(false)} />}
      {showCariGruplari && <CariGruplariModal onClose={() => setShowCariGruplari(false)} />}
      {showUrunGruplari && <UrunGruplariModal onClose={() => setShowUrunGruplari(false)} />}

    </div>
  );
};

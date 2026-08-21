import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  RotateCcw,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Package,
  Users
} from 'lucide-react';

interface Props {
  onOpenYilDevir: () => void;
}

export const RaporlarFragment: React.FC<Props> = ({ onOpenYilDevir }) => {
  const { aktifYil, getYillikOzetRapor, cariler, stoklar, satislar } = useApp();
  const ozet = getYillikOzetRapor(aktifYil);

  return (
    <div className="p-4 space-y-3 pb-20 bg-[#F1F5F9] min-h-full">
      
      {/* Financial Summary Header Card */}
      <div className="bg-gradient-to-br from-[#1E88E5] to-[#0288D1] p-5 rounded-3xl text-white shadow-lg shadow-blue-500/25 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-blue-100">
              {aktifYil} YILI SUPABASE POSTGRESQL MALİ RAPORU
            </span>
            <h2 className="text-2xl font-black mt-0.5">
              {ozet.toplam_satis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </h2>
            <p className="text-xs text-blue-100/90 font-medium">Toplam Yıllık Ciro ({ozet.satis_adedi} Satış)</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20">
          <div className="bg-white/10 rounded-2xl p-2.5">
            <span className="text-[10px] text-blue-100 block">Tahsil Edilen</span>
            <span className="text-xs font-black text-white">
              +{ozet.toplam_tahsilat.toLocaleString('tr-TR')} TL
            </span>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5">
            <span className="text-[10px] text-blue-100 block">Açık Cari Alacak</span>
            <span className="text-xs font-black text-amber-200">
              {ozet.toplam_cari_alacak.toLocaleString('tr-TR')} TL
            </span>
          </div>
        </div>
      </div>

      {/* Devir Callout Button */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800">Yıl Sonu Devir Sihirbazı</h4>
            <p className="text-[11px] text-slate-500">Mevcut yıl bakiyelerini yeni yıla devredin.</p>
          </div>
        </div>

        <button
          onClick={onOpenYilDevir}
          className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-98 transition-all"
        >
          {aktifYil} Yılı Kapanış & Devir Başlat
        </button>
      </div>

      {/* Metrics List */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-[#1E88E5]" />
          <span>Detaylı İstatistikler</span>
        </h4>

        <div className="space-y-2">
          <div className="p-2.5 bg-slate-50 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-600 font-semibold">Kayıtlı Aktif Cari Sayısı</span>
            <span className="text-xs font-black text-slate-900">{cariler.filter(c => c.yil === aktifYil).length} Cari</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-600 font-semibold">Toplam Stok Çeşidi</span>
            <span className="text-xs font-black text-slate-900">{stoklar.filter(s => s.yil === aktifYil).length} Ürün</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-600 font-semibold">Kritik Stok Uyarısı</span>
            <span className="text-xs font-black text-red-600">
              {stoklar.filter(s => s.yil === aktifYil && s.miktar <= s.kritik_miktar).length} Ürün
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

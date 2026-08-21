import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Receipt,
  FileText,
  BadgeAlert,
  Wallet
} from 'lucide-react';

export const HomeFragment: React.FC = () => {
  const {
    aktifYil,
    cariler,
    stoklar,
    satislar,
    tahsilatlar,
    setActiveTab,
    getYillikOzetRapor,
    setDetailCari
  } = useApp();

  const ozet = getYillikOzetRapor(aktifYil);
  const kritikStoklar = stoklar.filter(s => s.yil === aktifYil && s.aktif && s.miktar <= s.kritik_miktar);
  const sonSatislar = satislar.filter(s => s.yil === aktifYil).slice(0, 4);

  return (
    <div className="space-y-4 pb-20">
      
      {/* 1. Header Banner & Revenue Card (Matching Android bg_home_header.xml) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-5 text-white shadow-xl border border-blue-800/40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-300">
              {aktifYil} YILI MALİ DURUM ÖZETİ
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-0.5 text-white">
              {ozet.toplam_satis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </h2>
            <p className="text-xs text-blue-200/80 mt-0.5">Yıllık Toplam Ciro ({ozet.satis_adedi} Satış)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 shadow-inner">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Sub-Metrics Pill Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <span className="text-[10px] text-blue-200 block">Tahsilat</span>
            <span className="text-xs font-bold text-emerald-300">
              +{ozet.toplam_tahsilat.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
            </span>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <span className="text-[10px] text-blue-200 block">Cari Alacak</span>
            <span className="text-xs font-bold text-amber-300">
              {ozet.toplam_cari_alacak.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
            </span>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <span className="text-[10px] text-blue-200 block">Kritik Stok</span>
            <span className={`text-xs font-bold ${kritikStoklar.length > 0 ? 'text-red-400' : 'text-emerald-300'}`}>
              {kritikStoklar.length} Ürün
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Grid (Matching Android fragment_home.xml buttons) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1 flex items-center justify-between">
          <span>Hızlı İşlemler</span>
          <span className="text-[10px] text-emerald-400 font-medium">Supabase Triggers Aktif</span>
        </h3>
        
        <div className="grid grid-cols-4 gap-2">
          {/* Satış Yap */}
          <button
            id="btn-quick-satis"
            onClick={() => setActiveTab('satis')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-all group active:scale-95 text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">Satış Yap</span>
            <span className="text-[9px] text-slate-400">Hızlı Kasa</span>
          </button>

          {/* Mal Alımı */}
          <button
            id="btn-quick-alim"
            onClick={() => setActiveTab('alim')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-all group active:scale-95 text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">Mal Alımı</span>
            <span className="text-[9px] text-slate-400">Alış Faturası</span>
          </button>

          {/* Cariler */}
          <button
            id="btn-quick-cariler"
            onClick={() => setActiveTab('cariler')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-all group active:scale-95 text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">Cariler</span>
            <span className="text-[9px] text-slate-400">Müşteri/Tedarik</span>
          </button>

          {/* Stoklar */}
          <button
            id="btn-quick-stoklar"
            onClick={() => setActiveTab('stoklar')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-all group active:scale-95 text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">Stoklar</span>
            <span className="text-[9px] text-slate-400">Depo Sayımı</span>
          </button>

          {/* Çek & Senet */}
          <button
            id="btn-quick-cek"
            onClick={() => setActiveTab('cek_senet')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-all group active:scale-95 text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">Çek & Senet</span>
            <span className="text-[9px] text-slate-400">Portföy Takip</span>
          </button>

          {/* Raporlar */}
          <button
            id="btn-quick-raporlar"
            onClick={() => setActiveTab('raporlar')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-all group active:scale-95 text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">Raporlar</span>
            <span className="text-[9px] text-slate-400">RPC Dashboard</span>
          </button>

          {/* Tahsilat Ekle */}
          <button
            onClick={() => setActiveTab('cariler')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-all group active:scale-95 text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">Tahsilat</span>
            <span className="text-[9px] text-slate-400">Nakit / Havale</span>
          </button>

          {/* Teklifler */}
          <button
            onClick={() => setActiveTab('satis')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-all group active:scale-95 text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">Teklifler</span>
            <span className="text-[9px] text-slate-400">Fiyat Teklifi</span>
          </button>
        </div>
      </div>

      {/* 3. Critical Stock Alert Banner (If Any) */}
      {kritikStoklar.length > 0 && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-red-200 block">Kritik Stok Uyarısı!</span>
              <p className="text-[11px] text-red-300/80">
                {kritikStoklar.length} ürün kritik eşiğin altına düştü ({kritikStoklar[0].ad})
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('stoklar')}
            className="text-xs font-bold text-red-300 hover:text-white bg-red-900/50 hover:bg-red-800/60 px-2.5 py-1.5 rounded-lg border border-red-700/50 shrink-0"
          >
            İncele
          </button>
        </div>
      )}

      {/* 4. Recent Sales & Invoices */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Son Satış Fişleri ({aktifYil})</span>
          </h3>
          <button
            onClick={() => setActiveTab('satis')}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
          >
            <span>Tümü</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {sonSatislar.length > 0 ? (
            sonSatislar.map(s => {
              const cari = cariler.find(c => c.id === s.cari_id);
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (cari) setDetailCari(cari);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-200 truncate">{s.cari_adi || cari?.ad || 'Müşteri'}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-mono">{s.fatura_no}</span>
                        <span>•</span>
                        <span>{s.odeme_turu}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs text-emerald-400">
                      {s.net_tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {new Date(s.tarih).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              Bu yıla ait henüz satış bulunmuyor. "Satış Yap" ile başlayabilirsiniz.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  RotateCcw,
  Sparkles,
  DollarSign,
  Package,
  Layers,
  Award,
  Calendar,
  CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Props {
  onOpenYilDevir: () => void;
}

export const RaporlarFragment: React.FC<Props> = ({ onOpenYilDevir }) => {
  const { aktifYil, getYillikOzetRapor, stoklar } = useApp();

  const ozet = getYillikOzetRapor(aktifYil);

  // Monthly Sales Chart Data
  const monthlyData = [
    { ay: 'Oca', satis: ozet.toplam_satis * 0.08 },
    { ay: 'Şub', satis: ozet.toplam_satis * 0.07 },
    { ay: 'Mar', satis: ozet.toplam_satis * 0.12 },
    { ay: 'Nis', satis: ozet.toplam_satis * 0.09 },
    { ay: 'May', satis: ozet.toplam_satis * 0.11 },
    { ay: 'Haz', satis: ozet.toplam_satis * 0.14 },
    { ay: 'Tem', satis: ozet.toplam_satis * 0.13 },
    { ay: 'Ağu', satis: ozet.toplam_satis * 0.10 },
    { ay: 'Eyl', satis: ozet.toplam_satis * 0.16 }
  ];

  // Payment Breakdown
  const odemeData = [
    { name: 'Nakit', value: ozet.nakit_satis, color: '#10b981' },
    { name: 'Kredi Kartı', value: ozet.kredi_karti_satis, color: '#3b82f6' },
    { name: 'Veresiye', value: ozet.veresiye_satis, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-4 pb-20">
      
      {/* 1. Header RPC Aggregated Banner (Matching fragment_raporlar.xml) */}
      <div className="p-4 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 rounded-2xl border border-rose-900/40 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Supabase RPC: fn_yillik_ozet_rapor({aktifYil})</span>
          </div>
          <h3 className="font-extrabold text-xl text-white mt-0.5">
            {ozet.toplam_satis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ciro: {ozet.toplam_satis.toFixed(2)} TL • Tahsilat: {ozet.toplam_tahsilat.toFixed(2)} TL
          </p>
        </div>

        <button
          onClick={onOpenYilDevir}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Yıl Devri Yap</span>
        </button>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">Toplam Alacak</span>
          <span className="text-sm font-extrabold text-amber-400 mt-0.5 block">
            {ozet.toplam_cari_alacak.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </span>
          <span className="text-[9px] text-slate-500">Müşterilerden beklenen</span>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">Toplam Stok Değeri</span>
          <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">
            {ozet.toplam_stok_maliyeti.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </span>
          <span className="text-[9px] text-slate-500">Depo envanter maliyeti</span>
        </div>
      </div>

      {/* 3. Monthly Sales Bar Chart */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-xs text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Aylık Satış Dağılımı (TL)</span>
          </span>
          <span className="text-[10px] text-slate-400">{aktifYil} Mali Yılı</span>
        </h4>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="ay" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  color: '#fff'
                }}
                formatter={(val: any) => [`${Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, 'Satış']}
              />
              <Bar dataKey="satis" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Payment Types Breakdown */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-blue-400" />
          <span>Ödeme Tiplerine Göre Satış Dağılımı</span>
        </h4>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
            <span className="text-[10px] text-emerald-300 block">Nakit Satış</span>
            <span className="font-bold text-white text-xs mt-0.5 block">
              {ozet.nakit_satis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </span>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl">
            <span className="text-[10px] text-blue-300 block">Kredi Kartı</span>
            <span className="font-bold text-white text-xs mt-0.5 block">
              {ozet.kredi_karti_satis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </span>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
            <span className="text-[10px] text-amber-300 block">Veresiye</span>
            <span className="font-bold text-white text-xs mt-0.5 block">
              {ozet.veresiye_satis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </span>
          </div>
        </div>
      </div>

      {/* 5. Top Selling Products */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          <span>En Çok Satan Ürünler (RPC Aggregation)</span>
        </h4>

        <div className="space-y-2">
          {ozet.en_cok_satanlar.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="font-semibold text-slate-200">{item.ad}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400 block">{item.adet} Adet</span>
                <span className="text-[10px] text-slate-400">{item.tutar.toFixed(2)} TL</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

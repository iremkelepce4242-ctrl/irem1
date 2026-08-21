import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, Search, Plus, Trash2, CheckCircle2, Building, ArrowDownLeft } from 'lucide-react';

export const AlimFragment: React.FC = () => {
  const { aktifYil, cariler, stoklar, updateStok } = useApp();
  const [selectedCariId, setSelectedCariId] = useState(cariler[1]?.id || cariler[0]?.id || '');
  const [selectedStokId, setSelectedStokId] = useState(stoklar[0]?.id || '');
  const [miktar, setMiktar] = useState('');
  const [birimFiyat, setBirimFiyat] = useState('');
  const [faturaNo, setFaturaNo] = useState(`ALM-${aktifYil}-001`);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const yearCariler = cariler.filter(c => c.yil === aktifYil && c.aktif);
  const yearStoklar = stoklar.filter(s => s.yil === aktifYil && s.aktif);

  const handleAlimKaydet = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(miktar);
    const price = parseFloat(birimFiyat);
    if (!qty || !price) return;

    // Simulate Supabase Trigger: trg_alim_stok (Stoğa ekle)
    const targetStok = yearStoklar.find(s => s.id === selectedStokId);
    if (targetStok) {
      updateStok({
        ...targetStok,
        miktar: targetStok.miktar + qty,
        alis_fiyati: price
      });
    }

    setSuccessMsg(`Mal alımı tamamlandı! ${qty} adet ürün stoğa otomatik eklendi (trg_alim_stok).`);
    setMiktar('');
    setBirimFiyat('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header Banner (Matching Android bg_card_alim.xml) */}
      <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl border border-blue-800/40 text-white flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-blue-300 uppercase">Giriş İrsaliyesi & Faturası</span>
          <h3 className="font-bold text-base text-white">Mal Alım Faturası Girişi</h3>
          <p className="text-xs text-blue-200/80 mt-0.5">
            Ürün stoğunu artırır ve tedarikçi bakiyesini günceller.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Alım Form */}
      <form onSubmit={handleAlimKaydet} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3.5 text-xs">
        
        <div>
          <label className="block font-semibold text-slate-400 mb-1">Tedarikçi / Cari Seçimi</label>
          <select
            value={selectedCariId}
            onChange={e => setSelectedCariId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold outline-hidden"
          >
            {yearCariler.map(c => (
              <option key={c.id} value={c.id}>
                {c.ad} ({c.grup})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-400 mb-1">Alış Fatura No</label>
            <input
              type="text"
              required
              value={faturaNo}
              onChange={e => setFaturaNo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-hidden"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-400 mb-1">Alınan Ürün</label>
            <select
              value={selectedStokId}
              onChange={e => setSelectedStokId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
            >
              {yearStoklar.map(s => (
                <option key={s.id} value={s.id}>
                  {s.ad} (Mevcut: {s.miktar} {s.birim})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-400 mb-1">Alınan Miktar</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={miktar}
              onChange={e => setMiktar(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-blue-400 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">Birim Alış Fiyatı (TL)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={birimFiyat}
              onChange={e => setBirimFiyat(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-hidden"
            />
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300">
          <strong>Supabase PostgreSQL Trigger:</strong> Alış faturası kaydedildiğinde `trg_alim_stok` ve `trg_alim_bakiye` otomatik çalışır.
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
        >
          Alış Faturasını Kaydet & Stoğa Ekle
        </button>
      </form>

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Package, DollarSign, Layers } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const StokEkleModal: React.FC<Props> = ({ onClose }) => {
  const { aktifYil, addStok } = useApp();
  const [ad, setAd] = useState('');
  const [kod, setKod] = useState('');
  const [grup, setGrup] = useState('Standart');
  const [alisFiyati, setAlisFiyati] = useState('0');
  const [satisFiyati, setSatisFiyati] = useState('0');
  const [miktar, setMiktar] = useState('0');
  const [birim, setBirim] = useState('Adet');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ad.trim()) return;

    addStok({
      ad: ad.trim(),
      kod: kod.trim() || `STK-${Date.now().toString().slice(-4)}`,
      grup,
      alis_fiyati: parseFloat(alisFiyati) || 0,
      satis_fiyati: parseFloat(satisFiyati) || 0,
      miktar: parseFloat(miktar) || 0,
      birim,
      kritik_miktar: 5,
      yil: aktifYil,
      aktif: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#00BCD4] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Yeni Stok Ekle</h3>
              <p className="text-[11px] text-slate-400">{aktifYil} Yılı Ürün Tanımlama</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Ürün Adı *</label>
            <input
              type="text"
              required
              value={ad}
              onChange={e => setAd(e.target.value)}
              placeholder="Örn: 1/2 Kelepçe Standart"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Ürün Kodu</label>
              <input
                type="text"
                value={kod}
                onChange={e => setKod(e.target.value)}
                placeholder="Örn: KLP-01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Grup</label>
              <select
                value={grup}
                onChange={e => setGrup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
              >
                <option value="Standart">Standart Kelepçe</option>
                <option value="Ağır Hizmet">Ağır Hizmet</option>
                <option value="Somunlu">Somunlu Kelepçe</option>
                <option value="Aksesuar">Aksesuar / Vida</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Satış Fiyatı (TL)</label>
              <input
                type="number"
                step="0.01"
                value={satisFiyati}
                onChange={e => setSatisFiyati(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Başlangıç Miktarı</label>
              <input
                type="number"
                value={miktar}
                onChange={e => setMiktar(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-extrabold text-xs shadow-md shadow-cyan-500/20"
            >
              Kaydet (Supabase)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PackagePlus,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Building2,
  ArrowRight,
  Zap,
  TrendingDown
} from 'lucide-react';

export const AlimFragment: React.FC = () => {
  const {
    aktifYil,
    cariler,
    stoklar,
    addAlim
  } = useApp();

  const [selectedTedarikciId, setSelectedTedarikciId] = useState('');
  const [faturaNo, setFaturaNo] = useState(`ALM-${aktifYil}-${Date.now().toString().slice(-4)}`);
  const [alimKalemleri, setAlimKalemleri] = useState<Array<{ stokId: string; ad: string; miktar: number; birimFiyat: number }>>([]);
  const [odemeTuru, setOdemeTuru] = useState<'VERESIYE' | 'NAKIT' | 'HAVALE'>('VERESIYE');
  const [aciklama, setAciklama] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [success, setSuccess] = useState(false);

  const tedarikciler = cariler.filter(c => c.yil === aktifYil && c.aktif);
  const yearStoklar = stoklar.filter(s => s.yil === aktifYil && s.aktif);

  const seciliTedarikci = tedarikciler.find(c => c.id === selectedTedarikciId) || tedarikciler[0];

  const filteredStoklar = yearStoklar.filter(s =>
    s.ad.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addItemToAlim = (stok: any) => {
    const existing = alimKalemleri.find(i => i.stokId === stok.id);
    if (existing) {
      setAlimKalemleri(alimKalemleri.map(i =>
        i.stokId === stok.id ? { ...i, miktar: i.miktar + 1 } : i
      ));
    } else {
      setAlimKalemleri([...alimKalemleri, {
        stokId: stok.id,
        ad: stok.ad,
        miktar: 1,
        birimFiyat: stok.alis_fiyati || 10
      }]);
    }
  };

  const toplamTutar = alimKalemleri.reduce((sum, item) => sum + (item.miktar * item.birimFiyat), 0);

  const handleSaveAlim = (e: React.FormEvent) => {
    e.preventDefault();
    if (alimKalemleri.length === 0 || !seciliTedarikci) return;

    addAlim({
      cari_id: seciliTedarikci.id,
      fatura_no: faturaNo,
      tarih: new Date().toISOString().split('T')[0],
      toplam_tutar: toplamTutar,
      odeme_turu: odemeTuru,
      aciklama,
      yil: aktifYil,
      kalemler: alimKalemleri.map(k => ({
        stok_id: k.stokId,
        miktar: k.miktar,
        birim_fiyat: k.birimFiyat,
        toplam_tutar: k.miktar * k.birimFiyat,
        yil: aktifYil
      }))
    });

    setSuccess(true);
    setAlimKalemleri([]);
    setTimeout(() => {
      setSuccess(false);
      setFaturaNo(`ALM-${aktifYil}-${Date.now().toString().slice(-4)}`);
    }, 2000);
  };

  return (
    <div className="p-4 space-y-3 pb-20 bg-[#F1F5F9] min-h-full">
      
      {success && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-3xl space-y-2 animate-in fade-in duration-200 text-slate-800 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-100 text-[#00897B] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Mal Alımı Kaydedildi!</h4>
              <p className="text-[11px] text-teal-700 font-semibold">
                Stoklar depoya otomatik eklendi ve tedarikçi bakiyesi güncellendi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Selector */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2">
        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#00897B]" />
          <span>Tedarikçi / Cari Seçimi</span>
        </label>
        <select
          value={selectedTedarikciId || seciliTedarikci?.id}
          onChange={e => setSelectedTedarikciId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-800 font-bold outline-hidden"
        >
          {tedarikciler.map(t => (
            <option key={t.id} value={t.id}>
              {t.ad} ({t.grup}) — Bakiye: {t.bakiye.toFixed(2)} TL
            </option>
          ))}
        </select>
      </div>

      {/* Alım List */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
            <PackagePlus className="w-4 h-4 text-[#00897B]" />
            <span>Alış Kalemleri ({alimKalemleri.length})</span>
          </h3>
          {alimKalemleri.length > 0 && (
            <button
              onClick={() => setAlimKalemleri([])}
              className="text-[10px] text-red-500 font-bold"
            >
              Temizle
            </button>
          )}
        </div>

        {alimKalemleri.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {alimKalemleri.map(item => (
              <div key={item.stokId} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-slate-800 truncate">{item.ad}</h4>
                  <div className="text-[10px] text-slate-500">
                    Birim: {item.birimFiyat.toFixed(2)} TL x {item.miktar} = {(item.birimFiyat * item.miktar).toFixed(2)} TL
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={item.miktar}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 1;
                      setAlimKalemleri(alimKalemleri.map(i => i.stokId === item.stokId ? { ...i, miktar: val } : i));
                    }}
                    className="w-12 bg-white border border-slate-200 rounded-xl px-1.5 py-1 text-center font-bold text-xs"
                  />
                  <button
                    onClick={() => setAlimKalemleri(alimKalemleri.filter(i => i.stokId !== item.stokId))}
                    className="w-6 h-6 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] text-teal-700 font-bold block">TOPLAM ALIM FATURASI</span>
                <span className="text-xl font-black text-[#00897B]">
                  {toplamTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </span>
              </div>
              <button
                onClick={handleSaveAlim}
                className="px-5 py-2.5 rounded-2xl bg-[#00897B] hover:bg-[#00796B] text-white font-extrabold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all"
              >
                Faturayı Kaydet
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            Alış faturası için aşağıdaki listeden ürün seçin.
          </div>
        )}
      </div>

      {/* Product list */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2">
        <h3 className="font-extrabold text-xs text-slate-800">Ürün Seçimi</h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
          {filteredStoklar.map(stok => (
            <div
              key={stok.id}
              onClick={() => addItemToAlim(stok)}
              className="p-2 bg-slate-50 hover:bg-teal-50/70 border border-slate-100 hover:border-teal-200 rounded-2xl cursor-pointer flex items-center justify-between transition-all"
            >
              <span className="font-bold text-xs text-slate-800">{stok.ad}</span>
              <span className="w-6 h-6 rounded-lg bg-[#00897B] text-white flex items-center justify-center text-xs font-bold">+</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

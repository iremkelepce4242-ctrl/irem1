import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Stok } from '../../types';
import {
  Search,
  Plus,
  Package,
  Barcode,
  AlertTriangle,
  ChevronRight,
  Filter,
  Layers,
  X,
  Scan,
  ShoppingCart
} from 'lucide-react';

export const StokListesiFragment: React.FC = () => {
  const { stoklar, aktifYil, addStok, addToCart, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('TÜMÜ');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Stock Form
  const [newAd, setNewAd] = useState('');
  const [newBarkod, setNewBarkod] = useState('');
  const [newGrup, setNewGrup] = useState('Standart Kelepçe');
  const [newBirim, setNewBirim] = useState('Adet');
  const [newAlisFiyat, setNewAlisFiyat] = useState('');
  const [newSatisFiyat, setNewSatisFiyat] = useState('');
  const [newMiktar, setNewMiktar] = useState('');
  const [newKritikMiktar, setNewKritikMiktar] = useState('5');

  const yearStoklar = stoklar.filter(s => s.yil === aktifYil && s.aktif);
  const groups = ['TÜMÜ', ...Array.from(new Set(yearStoklar.map(s => s.grup)))];

  const filteredStoklar = yearStoklar.filter(s => {
    const matchesSearch =
      s.ad.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.barkod && s.barkod.includes(searchQuery)) ||
      (s.kod && s.kod.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedGroup !== 'TÜMÜ' && s.grup !== selectedGroup) return false;

    return true;
  });

  const handleCreateStok = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.trim()) return;

    addStok({
      ad: newAd.trim(),
      kod: `STK-${Date.now().toString().slice(-4)}`,
      barkod: newBarkod.trim() || undefined,
      grup: newGrup,
      birim: newBirim,
      alis_fiyati: parseFloat(newAlisFiyat) || 0,
      satis_fiyati: parseFloat(newSatisFiyat) || 0,
      miktar: parseFloat(newMiktar) || 0,
      kritik_miktar: parseFloat(newKritikMiktar) || 5,
      yil: aktifYil,
      aktif: true
    });

    setNewAd('');
    setNewBarkod('');
    setNewAlisFiyat('');
    setNewSatisFiyat('');
    setNewMiktar('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 space-y-3 pb-16 bg-[#F1F5F9] min-h-full">
      
      {/* Search Header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ürün adı, grup veya barkod ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/80 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#1E88E5] outline-hidden shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          id="btn-add-stok-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-2xl shadow-md shadow-blue-500/20 shrink-0 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Ürün</span>
        </button>
      </div>

      {/* Group Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {groups.map(grp => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              selectedGroup === grp
                ? 'bg-[#1E88E5] text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Stock Cards (item_product.xml) */}
      <div className="space-y-2">
        {filteredStoklar.length > 0 ? (
          filteredStoklar.map(stok => {
            const isKritik = stok.miktar <= stok.kritik_miktar;
            return (
              <div
                key={stok.id}
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/70 transition-all flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isKritik
                        ? 'bg-red-50 text-red-600'
                        : 'bg-cyan-50 text-[#00BCD4]'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs text-slate-800 truncate">
                        {stok.ad}
                      </h4>
                      {isKritik && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-red-100 text-red-700 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Kritik
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-medium">{stok.grup}</span>
                      <span>•</span>
                      <span className={`font-bold ${isKritik ? 'text-red-600' : 'text-slate-700'}`}>
                        Mevcut: {stok.miktar} {stok.birim}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Quick Sell Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">
                      {stok.satis_fiyati.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Alış: {stok.alis_fiyati.toLocaleString('tr-TR')} TL
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(stok, 1);
                      setActiveTab('satis');
                    }}
                    title="Sepete Ekle & Sat"
                    className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white flex items-center justify-center transition-colors shadow-xs active:scale-90"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200/80 p-6">
            Kayıtlı ürün bulunamadı.
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">Yeni Stok Tanımla</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStok} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Ürün Adı *</label>
                <input
                  type="text"
                  required
                  value={newAd}
                  onChange={e => setNewAd(e.target.value)}
                  placeholder="Örn: 2 İnç Ağır Hizmet Kelepçe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Ürün Grubu</label>
                  <select
                    value={newGrup}
                    onChange={e => setNewGrup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                  >
                    <option value="Standart Kelepçe">Standart Kelepçe</option>
                    <option value="Ağır Hizmet">Ağır Hizmet</option>
                    <option value="Somunlu Kelepçe">Somunlu Kelepçe</option>
                    <option value="Tirfonlu Kelepçe">Tirfonlu Kelepçe</option>
                    <option value="Aksesuar">Aksesuar</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Birim</label>
                  <select
                    value={newBirim}
                    onChange={e => setNewBirim(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                  >
                    <option value="Adet">Adet</option>
                    <option value="Paket">Paket</option>
                    <option value="Koli">Koli</option>
                    <option value="Metre">Metre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Alış Fiyatı (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAlisFiyat}
                    onChange={e => setNewAlisFiyat(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Satış Fiyatı (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSatisFiyat}
                    onChange={e => setNewSatisFiyat(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Stok Miktarı</label>
                  <input
                    type="number"
                    value={newMiktar}
                    onChange={e => setNewMiktar(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Kritik Uyarı Sınırı</label>
                  <input
                    type="number"
                    value={newKritikMiktar}
                    onChange={e => setNewKritikMiktar(e.target.value)}
                    placeholder="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1E88E5] text-white font-extrabold text-xs shadow-md shadow-blue-500/20"
                >
                  Kaydet (Supabase)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

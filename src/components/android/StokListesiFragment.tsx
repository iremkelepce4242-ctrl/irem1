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
  Scan
} from 'lucide-react';

export const StokListesiFragment: React.FC = () => {
  const { stoklar, aktifYil, addStok, addToCart, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('TÜMÜ');
  const [showAddModal, setShowAddModal] = useState(false);
  const [scannerSim, setScannerSim] = useState(false);

  // New Stock Form
  const [newAd, setNewAd] = useState('');
  const [newBarkod, setNewBarkod] = useState('');
  const [newGrup, setNewGrup] = useState('Elektrikli El Aletleri');
  const [newBirim, setNewBirim] = useState('Adet');
  const [newAlisFiyat, setNewAlisFiyat] = useState('');
  const [newSatisFiyat, setNewSatisFiyat] = useState('');
  const [newMiktar, setNewMiktar] = useState('');
  const [newKritikMiktar, setNewKritikMiktar] = useState('5');
  const [newRafKodu, setNewRafKodu] = useState('');

  const yearStoklar = stoklar.filter(s => s.yil === aktifYil && s.aktif);

  const groups = ['TÜMÜ', ...Array.from(new Set(yearStoklar.map(s => s.grup)))];

  const filteredStoklar = yearStoklar.filter(s => {
    const matchesSearch =
      s.ad.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.barkod && s.barkod.includes(searchQuery)) ||
      (s.raf_kodu && s.raf_kodu.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedGroup !== 'TÜMÜ' && s.grup !== selectedGroup) return false;

    return true;
  });

  const handleCreateStok = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.trim()) return;

    addStok({
      ad: newAd.trim(),
      barkod: newBarkod.trim() || undefined,
      grup: newGrup,
      birim: newBirim,
      alis_fiyati: parseFloat(newAlisFiyat) || 0,
      satis_fiyati: parseFloat(newSatisFiyat) || 0,
      kdv_orani: 20,
      miktar: parseFloat(newMiktar) || 0,
      kritik_miktar: parseFloat(newKritikMiktar) || 5,
      raf_kodu: newRafKodu.trim() || undefined,
      yil: aktifYil,
      aktif: true
    });

    setNewAd('');
    setNewBarkod('');
    setNewAlisFiyat('');
    setNewSatisFiyat('');
    setNewMiktar('');
    setNewRafKodu('');
    setShowAddModal(false);
  };

  const handleBarcodeSim = (barkod: string) => {
    setSearchQuery(barkod);
    setScannerSim(false);
  };

  return (
    <div className="space-y-3 pb-20">
      
      {/* Top Search & Barcode Scan Bar (Matching fragment_stok_listesi.xml) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ürün adı, barkod veya raf kodu ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-hidden"
          />
          <button
            onClick={() => setScannerSim(!scannerSim)}
            title="Barkod Tarayıcı Simülatörü"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-amber-400 hover:text-amber-300"
          >
            <Scan className="w-4 h-4" />
          </button>
        </div>

        <button
          id="btn-add-stok-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Stok Ekle</span>
        </button>
      </div>

      {/* Barcode Scanner Simulator Panel */}
      {scannerSim && (
        <div className="p-3 bg-slate-900 border border-amber-500/40 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Barcode className="w-4 h-4" />
              <span>Kamera / Barkod Okuma Simülatörü (ZXing)</span>
            </span>
            <button onClick={() => setScannerSim(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400">Okutmak istediğiniz örnek barkoda tıklayın:</p>
          <div className="flex flex-wrap gap-1.5">
            {yearStoklar.slice(0, 5).map(s => (
              <button
                key={s.id}
                onClick={() => handleBarcodeSim(s.barkod || '')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 font-mono text-[10px] border border-slate-700"
              >
                {s.barkod} ({s.ad.slice(0, 12)}...)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Group Categories Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {groups.map(grp => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedGroup === grp
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-850 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Stock Cards (Matching item_product.xml) */}
      <div className="space-y-2">
        {filteredStoklar.length > 0 ? (
          filteredStoklar.map(stok => {
            const isKritik = stok.miktar <= stok.kritik_miktar;
            return (
              <div
                key={stok.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 transition-all flex items-center justify-between gap-3 shadow-xs hover:border-slate-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isKritik ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-200 truncate">{stok.ad}</h4>
                      {isKritik && (
                        <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Kritik
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono text-amber-300/90">{stok.barkod || 'Barkodsuz'}</span>
                      <span>•</span>
                      <span>{stok.grup}</span>
                      {stok.raf_kodu && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500">Raf: {stok.raf_kodu}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Quantity & Price + Fast Sale Action */}
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <span className="font-extrabold text-xs text-white block">
                      {stok.satis_fiyati.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                    <span
                      className={`text-[10px] font-bold block ${
                        isKritik ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {stok.miktar} {stok.birim}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(stok, 1);
                      setActiveTab('satis');
                    }}
                    title="Sepete Ekle & Satışa Git"
                    className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            Aranan kriterlere uygun stok kartı bulunamadı.
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <h3 className="font-bold text-sm text-white">Yeni Stok Kartı Oluştur</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStok} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ürün / Stok Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Bosch Darbeli Matkap 750W"
                  value={newAd}
                  onChange={e => setNewAd(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Barkod Numarası</label>
                  <input
                    type="text"
                    placeholder="8690123456..."
                    value={newBarkod}
                    onChange={e => setNewBarkod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ürün Grubu</label>
                  <select
                    value={newGrup}
                    onChange={e => setNewGrup(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  >
                    <option value="Elektrikli El Aletleri">Elektrikli El Aletleri</option>
                    <option value="Boya & Kimyasallar">Boya & Kimyasallar</option>
                    <option value="İnşaat Malzemeleri">İnşaat Malzemeleri</option>
                    <option value="Elektrik Tesisatı">Elektrik Tesisatı</option>
                    <option value="Hırdavat & Nalburiye">Hırdavat & Nalburiye</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Birim</label>
                  <select
                    value={newBirim}
                    onChange={e => setNewBirim(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white outline-hidden"
                  >
                    <option value="Adet">Adet</option>
                    <option value="Metre">Metre</option>
                    <option value="Kg">Kg</option>
                    <option value="Teneke">Teneke</option>
                    <option value="Plaka">Plaka</option>
                    <option value="Paket">Paket</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Alış Fiyatı (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAlisFiyat}
                    onChange={e => setNewAlisFiyat(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Satış Fiyatı (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newSatisFiyat}
                    onChange={e => setNewSatisFiyat(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-amber-400 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mevcut Miktar</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newMiktar}
                    onChange={e => setNewMiktar(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kritik Eşik</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5"
                    value={newKritikMiktar}
                    onChange={e => setNewKritikMiktar(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Raf Kodu</label>
                  <input
                    type="text"
                    placeholder="A-12"
                    value={newRafKodu}
                    onChange={e => setNewRafKodu(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Stoğu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

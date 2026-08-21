import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cari } from '../../types';
import {
  Search,
  Plus,
  Users,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Filter,
  UserPlus,
  X,
  Building
} from 'lucide-react';
import { CariDetayModal } from './CariDetayModal';

export const CariListeFragment: React.FC = () => {
  const { cariler, aktifYil, addCari, detailCari, setDetailCari } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BORCLU' | 'ALACAKLI' | 'MUSTERI' | 'TEDARIKCI'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Cari Form
  const [newAd, setNewAd] = useState('');
  const [newYetkili, setNewYetkili] = useState('');
  const [newTelefon, setNewTelefon] = useState('');
  const [newSehir, setNewSehir] = useState('');
  const [newGrup, setNewGrup] = useState('Müşteri');
  const [newVergiNo, setNewVergiNo] = useState('');

  const yearCariler = cariler.filter(c => c.yil === aktifYil && c.aktif);

  const filteredCariler = yearCariler.filter(c => {
    const matchesSearch =
      c.ad.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.telefon && c.telefon.includes(searchQuery)) ||
      (c.sehir && c.sehir.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'BORCLU') return c.bakiye > 0;
    if (filterType === 'ALACAKLI') return c.bakiye < 0;
    if (filterType === 'MUSTERI') return c.grup === 'Müşteri';
    if (filterType === 'TEDARIKCI') return c.grup === 'Tedarikçi';

    return true;
  });

  const handleCreateCari = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.trim()) return;

    addCari({
      ad: newAd.trim(),
      yetkili: newYetkili.trim() || undefined,
      telefon: newTelefon.trim() || undefined,
      sehir: newSehir.trim() || undefined,
      grup: newGrup,
      vergi_no: newVergiNo.trim() || undefined,
      yil: aktifYil,
      aktif: true
    });

    setNewAd('');
    setNewYetkili('');
    setNewTelefon('');
    setNewSehir('');
    setNewVergiNo('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-3 pb-20">
      
      {/* Search and Add Header (Matching fragment_cari_liste.xml) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari adı, telefon veya şehir ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          id="btn-add-cari-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Cari</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {[
          { id: 'ALL', label: `Tümü (${yearCariler.length})` },
          { id: 'BORCLU', label: 'Borçlu Olanlar' },
          { id: 'ALACAKLI', label: 'Alacaklı Olanlar' },
          { id: 'MUSTERI', label: 'Müşteriler' },
          { id: 'TEDARIKCI', label: 'Tedarikçiler' }
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => setFilterType(chip.id as any)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              filterType === chip.id
                ? 'bg-purple-500 text-white shadow-xs font-bold'
                : 'bg-slate-850 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Cari List (Matching item_cari.xml) */}
      <div className="space-y-2">
        {filteredCariler.length > 0 ? (
          filteredCariler.map(cari => (
            <div
              key={cari.id}
              onClick={() => setDetailCari(cari)}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    cari.grup === 'Tedarikçi'
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'bg-purple-500/15 text-purple-400'
                  }`}
                >
                  {cari.ad.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-slate-200 truncate group-hover:text-purple-300 transition-colors">
                      {cari.ad}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                      {cari.grup}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {cari.sehir || 'Şehir Yok'} {cari.telefon ? `• ${cari.telefon}` : ''}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <span
                    className={`font-extrabold text-xs block ${
                      cari.bakiye > 0
                        ? 'text-red-400'
                        : cari.bakiye < 0
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {Math.abs(cari.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </span>
                  <span className="text-[9px] text-slate-400 block font-medium">
                    {cari.bakiye > 0 ? 'Borçlu' : cari.bakiye < 0 ? 'Alacaklı' : 'Sıfır'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            Aranan kriterlere uygun cari hesap bulunamadı.
          </div>
        )}
      </div>

      {/* Add Cari Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <h3 className="font-bold text-sm text-white">Yeni Cari Hesap Kartı Aç</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCari} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cari Ünvanı / Firma Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Özkan İnşaat Ltd."
                  value={newAd}
                  onChange={e => setNewAd(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cari Grubu</label>
                  <select
                    value={newGrup}
                    onChange={e => setNewGrup(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  >
                    <option value="Müşteri">Müşteri</option>
                    <option value="Tedarikçi">Tedarikçi</option>
                    <option value="Toptancı">Toptancı</option>
                    <option value="Bayi">Bayi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Telefon</label>
                  <input
                    type="text"
                    placeholder="0532 ..."
                    value={newTelefon}
                    onChange={e => setNewTelefon(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Yetkili Kişi</label>
                  <input
                    type="text"
                    placeholder="Ahmet Bey"
                    value={newYetkili}
                    onChange={e => setNewYetkili(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Şehir / İlçe</label>
                  <input
                    type="text"
                    placeholder="İstanbul / Kadıköy"
                    value={newSehir}
                    onChange={e => setNewSehir(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Vergi Numarası / TCKN</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={newVergiNo}
                  onChange={e => setNewVergiNo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
                />
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
                  className="px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/20"
                >
                  Cariyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cari Detay & Ekstre Modal */}
      {detailCari && <CariDetayModal cari={detailCari} onClose={() => setDetailCari(null)} />}

    </div>
  );
};

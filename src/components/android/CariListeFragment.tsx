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
    <div className="p-4 space-y-3 pb-16 bg-[#F1F5F9] min-h-full">
      
      {/* Search and Add Header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari adı, telefon veya şehir ara..."
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
          id="btn-add-cari-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-2xl shadow-md shadow-blue-500/20 shrink-0 active:scale-95 transition-all"
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
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              filterType === chip.id
                ? 'bg-[#1E88E5] text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Cari List (Item Cari) */}
      <div className="space-y-2">
        {filteredCariler.length > 0 ? (
          filteredCariler.map(cari => (
            <div
              key={cari.id}
              onClick={() => setDetailCari(cari)}
              className="p-3.5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/70 cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-xs active:scale-98"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    cari.grup === 'Tedarikçi'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-blue-50 text-[#1E88E5]'
                  }`}
                >
                  {cari.ad.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-xs text-slate-800 truncate">
                      {cari.ad}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                      {cari.grup}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                    {cari.telefon ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {cari.telefon}
                      </span>
                    ) : (
                      <span>{cari.sehir || 'Şehir Belirtilmedi'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bakiye */}
              <div className="text-right shrink-0">
                <span
                  className={`text-xs font-black block ${
                    cari.bakiye > 0
                      ? 'text-red-600'
                      : cari.bakiye < 0
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  }`}
                >
                  {Math.abs(cari.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </span>
                <span className="text-[10px] text-slate-400">
                  {cari.bakiye > 0 ? 'Borçlu' : cari.bakiye < 0 ? 'Alacaklı' : 'Bakiye Sıfır'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200/80 p-6">
            Kayıtlı cari hesap bulunamadı.
          </div>
        )}
      </div>

      {/* Cari Detay Ekstresi Modalı */}
      {detailCari && (
        <CariDetayModal cari={detailCari} onClose={() => setDetailCari(null)} />
      )}

      {/* Yeni Cari Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">Yeni Cari Hesap Tanımla</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCari} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Cari / Firma Adı *</label>
                <input
                  type="text"
                  required
                  value={newAd}
                  onChange={e => setNewAd(e.target.value)}
                  placeholder="Örn: Yılmaz İnşaat Ltd."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Telefon</label>
                  <input
                    type="text"
                    value={newTelefon}
                    onChange={e => setNewTelefon(e.target.value)}
                    placeholder="0532..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Cari Grubu</label>
                  <select
                    value={newGrup}
                    onChange={e => setNewGrup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                  >
                    <option value="Müşteri">Müşteri</option>
                    <option value="Tedarikçi">Tedarikçi</option>
                    <option value="Toptancı">Toptancı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Şehir</label>
                <input
                  type="text"
                  value={newSehir}
                  onChange={e => setNewSehir(e.target.value)}
                  placeholder="Örn: İstanbul"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                />
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

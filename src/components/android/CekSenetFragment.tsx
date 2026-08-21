import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Eye,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';

export const CekSenetFragment: React.FC = () => {
  const { aktifYil, cariler, cekSenetler, addCekSenet } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'ALINAN' | 'VERILEN'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [tur, setTur] = useState<'CEK' | 'SENET'>('CEK');
  const [yon, setYon] = useState<'ALINAN' | 'VERILEN'>('ALINAN');
  const [evrakNo, setEvrakNo] = useState('');
  const [banka, setBanka] = useState('Ziraat Bankası');
  const [vadeTarihi, setVadeTarihi] = useState('');
  const [tutar, setTutar] = useState('');
  const [seciliCariId, setSeciliCariId] = useState(cariler[0]?.id || '');

  const yearEvraklar = cekSenetler.filter(c => c.yil === aktifYil);

  const filtered = yearEvraklar.filter(e => {
    if (filterType === 'ALINAN') return e.yon === 'ALINAN';
    if (filterType === 'VERILEN') return e.yon === 'VERILEN';
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutar || !vadeTarihi) return;

    addCekSenet({
      cari_id: seciliCariId,
      tur,
      yon,
      evrak_no: evrakNo || `EVR-${Date.now().toString().slice(-4)}`,
      banka,
      vade_tarihi: vadeTarihi,
      tutar: parseFloat(tutar),
      durum: 'PORTFOYDE',
      yil: aktifYil
    });

    setTutar('');
    setEvrakNo('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 space-y-3 pb-20 bg-[#F1F5F9] min-h-full">
      
      {/* Header & Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'ALL', label: `Tümü (${yearEvraklar.length})` },
            { id: 'ALINAN', label: 'Alınan Çekler' },
            { id: 'VERILEN', label: 'Verilen Çekler' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-[#1E88E5] text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-extrabold text-xs px-3.5 py-2 rounded-2xl shadow-md shadow-blue-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Evrak Ekle</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map(item => {
            const cari = cariler.find(c => c.id === item.cari_id);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      item.yon === 'ALINAN'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {item.tur === 'CEK' ? 'Ç' : 'S'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs text-slate-800 truncate">
                        {cari?.ad || 'Cari Belirtilmedi'}
                      </h4>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        item.yon === 'ALINAN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.yon}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{item.banka}</span>
                      <span>•</span>
                      <span>Vade: {item.vade_tarihi}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900 block">
                    {item.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {item.durum}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200/80 p-6">
            Kayıtlı çek veya senet bulunamadı.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">Çek / Senet Girişi</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tür</label>
                  <select
                    value={tur}
                    onChange={e => setTur(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="CEK">Çek</option>
                    <option value="SENET">Senet</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Yön</label>
                  <select
                    value={yon}
                    onChange={e => setYon(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="ALINAN">Alınan (Müşteri)</option>
                    <option value="VERILEN">Verilen (Kendi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Cari Hesap</label>
                <select
                  value={seciliCariId}
                  onChange={e => setSeciliCariId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  {cariler.filter(c => c.yil === aktifYil).map(c => (
                    <option key={c.id} value={c.id}>{c.ad}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Banka</label>
                  <input
                    type="text"
                    value={banka}
                    onChange={e => setBanka(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Vade Tarihi</label>
                  <input
                    type="date"
                    required
                    value={vadeTarihi}
                    onChange={e => setVadeTarihi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tutar (TL) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={tutar}
                  onChange={e => setTutar(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
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
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

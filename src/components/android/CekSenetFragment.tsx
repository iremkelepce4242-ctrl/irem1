import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileCheck, Search, Plus, Calendar, Building, Check, Clock, X } from 'lucide-react';
import { CekSenet } from '../../types';

export const CekSenetFragment: React.FC = () => {
  const { cekSenetler, aktifYil, cariler } = useApp();
  const [filterTur, setFilterTur] = useState<'ALL' | 'CEK' | 'SENET'>('ALL');
  const [filterDurum, setFilterDurum] = useState<'ALL' | 'PORTFOYDE' | 'TAHSIL_EDILDI'>('ALL');

  const yearList = cekSenetler.filter(c => c.yil === aktifYil);

  const filtered = yearList.filter(c => {
    if (filterTur !== 'ALL' && c.tur !== filterTur) return false;
    if (filterDurum !== 'ALL' && c.durum !== filterDurum) return false;
    return true;
  });

  const toplamPortfoy = filtered
    .filter(c => c.durum === 'PORTFOYDE')
    .reduce((acc, curr) => acc + curr.tutar, 0);

  return (
    <div className="space-y-3 pb-20">
      
      {/* Top Banner (Matching fragment_cek_senet.xml) */}
      <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl border border-indigo-800/40 text-white flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-indigo-300 uppercase">
            {aktifYil} Portföy Durumu
          </span>
          <h3 className="font-extrabold text-xl text-white">
            {toplamPortfoy.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </h3>
          <p className="text-xs text-indigo-200/80 mt-0.5">Bekleyen Çek & Senet Toplamı</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <FileCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'ALL', label: 'Tüm Evraklar' },
          { id: 'CEK', label: 'Çekler' },
          { id: 'SENET', label: 'Senetler' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setFilterTur(item.id as any)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              filterTur === item.id
                ? 'bg-indigo-500 text-white font-bold shadow-xs'
                : 'bg-slate-850 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* List (Matching item_cek_senet.xml) */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {item.tur === 'CEK' ? 'Ç' : 'S'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{item.tur} - {item.evrak_no}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        item.durum === 'PORTFOYDE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.durum}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.cari_adi}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>Vade: {new Date(item.vade_tarihi).toLocaleDateString('tr-TR')}</span>
                    {item.banka && <span>• {item.banka}</span>}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-extrabold text-xs text-white block">
                  {item.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </span>
                <span className="text-[10px] text-indigo-400">{item.yon}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            Kayıtlı çek/senet evrakı bulunamadı.
          </div>
        )}
      </div>

    </div>
  );
};

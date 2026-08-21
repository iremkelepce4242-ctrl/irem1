import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FileText, Plus, CheckCircle2, Clock, Trash2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const TekliflerModal: React.FC<Props> = ({ onClose }) => {
  const { aktifYil, cariler } = useApp();
  const [teklifListesi, setTeklifListesi] = useState([
    { id: '1', teklifNo: 'TK-2025-01', cariAd: 'Yılmaz İnşaat Ltd.', tutar: 14500, durum: 'Bekliyor', tarih: '2025-02-14' },
    { id: '2', teklifNo: 'TK-2025-02', cariAd: 'Demir Ticaret A.Ş.', tutar: 28900, durum: 'Onaylandı', tarih: '2025-02-18' },
    { id: '3', teklifNo: 'TK-2025-03', cariAd: 'Anadolu Metal Sanayi', tutar: 8400, durum: 'Bekliyor', tarih: '2025-02-20' },
  ]);

  const [yeniTeklifForm, setYeniTeklifForm] = useState(false);
  const [seciliCari, setSeciliCari] = useState(cariler[0]?.ad || '');
  const [tutar, setTutar] = useState('');

  const handleAddTeklif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutar) return;
    const yeni = {
      id: Date.now().toString(),
      teklifNo: `TK-${aktifYil}-${(teklifListesi.length + 1).toString().padStart(2, '0')}`,
      cariAd: seciliCari,
      tutar: parseFloat(tutar),
      durum: 'Bekliyor',
      tarih: new Date().toISOString().split('T')[0]
    };
    setTeklifListesi([yeni, ...teklifListesi]);
    setYeniTeklifForm(false);
    setTutar('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#00BCD4] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Fiyat Teklifleri</h3>
              <p className="text-[11px] text-slate-400">{aktifYil} Yılı Müşteri Teklif Formları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto py-3 space-y-3">
          {yeniTeklifForm ? (
            <form onSubmit={handleAddTeklif} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-xs text-slate-800">Yeni Teklif Oluştur</h4>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Müşteri / Cari</label>
                <select
                  value={seciliCari}
                  onChange={e => setSeciliCari(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                >
                  {cariler.filter(c => c.yil === aktifYil).map(c => (
                    <option key={c.id} value={c.ad}>{c.ad}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Teklif Tutarı (TL)</label>
                <input
                  type="number"
                  required
                  value={tutar}
                  onChange={e => setTutar(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setYeniTeklifForm(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#00BCD4] text-white font-extrabold text-xs shadow-xs"
                >
                  Teklifi Kaydet
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setYeniTeklifForm(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-cyan-50 hover:bg-cyan-100/70 text-[#00BCD4] border border-cyan-200 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Teklif Formu Ekle</span>
            </button>
          )}

          {/* List */}
          <div className="space-y-2">
            {teklifListesi.map(item => (
              <div key={item.id} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded-md">
                      {item.teklifNo}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{item.cariAd}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>{item.tarih}</span>
                    <span className={`font-semibold ${item.durum === 'Onaylandı' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      • {item.durum}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block">
                    {item.tutar.toLocaleString('tr-TR')} TL
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

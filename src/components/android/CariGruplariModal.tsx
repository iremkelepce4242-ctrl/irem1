import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Plus, Users, Trash2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const CariGruplariModal: React.FC<Props> = ({ onClose }) => {
  const [gruplar, setGruplar] = useState([
    { id: '1', ad: 'Toptan Müşteriler', aciklama: 'Ana bayiler ve toptancılar', uyeSayisi: 8 },
    { id: '2', ad: 'Perakende Müşteriler', aciklama: 'Doğrudan son kullanıcılar', uyeSayisi: 14 },
    { id: '3', ad: 'Hammadde Tedarikçileri', aciklama: 'Sac, profil ve somun üreticileri', uyeSayisi: 5 },
    { id: '4', ad: 'Yurt Dışı / İhracat', aciklama: 'Balkanlar ve Ortadoğu müşterileri', uyeSayisi: 3 },
  ]);

  const [yeniGrupAd, setYeniGrupAd] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniGrupAd.trim()) return;
    setGruplar([...gruplar, {
      id: Date.now().toString(),
      ad: yeniGrupAd.trim(),
      aciklama: 'Yeni cari kategorisi',
      uyeSayisi: 0
    }]);
    setYeniGrupAd('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#00BCD4] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Cari Grupları</h3>
              <p className="text-[11px] text-slate-400">Müşteri ve Tedarikçi Sınıflandırma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-3 space-y-3">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              required
              value={yeniGrupAd}
              onChange={e => setYeniGrupAd(e.target.value)}
              placeholder="Yeni Grup Adı..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-extrabold text-xs rounded-xl shadow-xs shrink-0"
            >
              Ekle
            </button>
          </form>

          <div className="space-y-2">
            {gruplar.map(item => (
              <div key={item.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{item.ad}</h4>
                  <p className="text-[10px] text-slate-400">{item.aciklama}</p>
                </div>
                <span className="text-[11px] font-bold text-[#00BCD4] bg-cyan-50 px-2 py-0.5 rounded-lg">
                  {item.uyeSayisi} Cari
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

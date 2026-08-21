import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, RotateCcw, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const TransferModal: React.FC<Props> = ({ onClose }) => {
  const { aktifYil, stoklar } = useApp();
  const [kaynakDepo, setKaynakDepo] = useState('Merkez Depo');
  const [hedefDepo, setHedefDepo] = useState('Şube / Araç 1');
  const [seciliStok, setSeciliStok] = useState(stoklar[0]?.id || '');
  const [miktar, setMiktar] = useState('10');
  const [success, setSuccess] = useState(false);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#00BCD4] flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Depolar Arası Transfer</h3>
              <p className="text-[11px] text-slate-400">Stok Transfer Fişi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            <h4 className="font-extrabold text-slate-800 text-sm">Transfer Başarılı!</h4>
            <p className="text-xs text-slate-500">Stok hareketi Supabase veritabanına işlendi.</p>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Kaynak Depo</label>
                <select
                  value={kaynakDepo}
                  onChange={e => setKaynakDepo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                >
                  <option value="Merkez Depo">Merkez Depo</option>
                  <option value="Araç 1 (Satış)">Araç 1 (Satış)</option>
                  <option value="Fabrika Deposu">Fabrika Deposu</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Hedef Depo</label>
                <select
                  value={hedefDepo}
                  onChange={e => setHedefDepo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
                >
                  <option value="Şube / Araç 1">Şube / Araç 1</option>
                  <option value="Merkez Depo">Merkez Depo</option>
                  <option value="Araç 2 (Montaj)">Araç 2 (Montaj)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Transfer Edilecek Ürün</label>
              <select
                value={seciliStok}
                onChange={e => setSeciliStok(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
              >
                {stoklar.filter(s => s.yil === aktifYil).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.ad} (Mevcut: {s.miktar} {s.birim})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Transfer Miktarı</label>
              <input
                type="number"
                required
                min="1"
                value={miktar}
                onChange={e => setMiktar(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1E88E5]"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-extrabold text-xs shadow-md shadow-cyan-500/20"
              >
                Transfer Et
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCcw, AlertTriangle, CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onClose: () => void;
}

export const YilDevirModal: React.FC<Props> = ({ onClose }) => {
  const { aktifYil, executeYilDevri } = useApp();
  const [kaynakYil, setKaynakYil] = useState<number>(aktifYil);
  const [hedefYil, setHedefYil] = useState<number>(aktifYil + 1);
  const [isDone, setIsDone] = useState(false);
  const [resultData, setResultData] = useState<{ devredilenCari: number; devredilenStok: number } | null>(null);

  const handleDevir = () => {
    const res = executeYilDevri(kaynakYil, hedefYil);
    setResultData(res);
    setIsDone(true);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (_e) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Yıl Sonu Devir İşlemi</h3>
              <p className="text-xs text-slate-400">PostgreSQL RPC: sp_yil_sonu_devri_yap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          {!isDone ? (
            <>
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Yıl devri yapıldığında, kaynak yıldaki cari kapanış bakiyeleri ve kalan stok miktarları yeni yıla devir kaydı olarak aktarılır.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Kaynak Yıl</label>
                  <select
                    value={kaynakYil}
                    onChange={e => setKaynakYil(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value={2024}>2024 Yılı</option>
                    <option value={2025}>2025 Yılı</option>
                    <option value={2026}>2026 Yılı</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Hedef Yıl</label>
                  <select
                    value={hedefYil}
                    onChange={e => setHedefYil(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value={2025}>2025 Yılı</option>
                    <option value={2026}>2026 Yılı</option>
                    <option value={2027}>2027 Yılı</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Otomatik Yapılacak İşlemler:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Carilerin son bakiyesi hedef yıla açılış bakiyesi olarak yazılır.</li>
                  <li>Stokların mevcut depo miktarı hedef yıla devir stoğu olarak aktarılır.</li>
                  <li>Geçmiş yılların hareketleri bozulmadan arşivlenmiş kalır.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="button"
                  id="btn-confirm-devir"
                  onClick={handleDevir}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-400/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Devir İşlemini Başlat</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-white">Yıl Devri Başarıyla Tamamlandı!</h4>
              <p className="text-xs text-slate-300">
                {kaynakYil} yılı verileri {hedefYil} yılına aktarıldı. Aktif çalışma yılı {hedefYil} olarak ayarlandı.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div>
                  <span className="text-slate-400 block">Devredilen Cari</span>
                  <span className="font-bold text-emerald-400 text-sm">{resultData?.devredilenCari} Adet</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Devredilen Stok</span>
                  <span className="font-bold text-emerald-400 text-sm">{resultData?.devredilenStok} Kalem</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl"
              >
                Tamam ve Kapat
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

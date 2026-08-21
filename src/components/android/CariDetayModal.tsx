import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cari, Tahsilat, Odeme } from '../../types';
import {
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  TrendingUp,
  History,
  Building,
  Check
} from 'lucide-react';

interface Props {
  cari: Cari;
  onClose: () => void;
}

export const CariDetayModal: React.FC<Props> = ({ cari, onClose }) => {
  const {
    aktifYil,
    getCariEkstre,
    addTahsilat,
    addOdeme,
    setThermalPrintData,
    setPdfPrintData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ekstre' | 'tahsilat' | 'odeme'>('ekstre');
  const [tahsilatTutar, setTahsilatTutar] = useState('');
  const [tahsilatTur, setTahsilatTur] = useState<Tahsilat['tur']>('NAKIT');
  const [tahsilatAciklama, setTahsilatAciklama] = useState('');

  const [odemeTutar, setOdemeTutar] = useState('');
  const [odemeTur, setOdemeTur] = useState<Odeme['tur']>('NAKIT');
  const [odemeAciklama, setOdemeAciklama] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);

  const ekstre = getCariEkstre(cari.id, aktifYil);

  const handleSaveTahsilat = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tahsilatTutar);
    if (!val || val <= 0) return;

    addTahsilat({
      cari_id: cari.id,
      cari_adi: cari.ad,
      tutar: val,
      tur: tahsilatTur,
      makbuz_no: `MK-${aktifYil}-${Math.floor(100 + Math.random() * 900)}`,
      aciklama: tahsilatAciklama || 'Tahsilat',
      yil: aktifYil
    });

    setTahsilatTutar('');
    setTahsilatAciklama('');
    setFeedback('Tahsilat başarıyla eklendi! (Trigger bakiyeyi düşürdü)');
    setTimeout(() => {
      setFeedback(null);
      setActiveTab('ekstre');
    }, 1200);
  };

  const handleSaveOdeme = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(odemeTutar);
    if (!val || val <= 0) return;

    addOdeme({
      cari_id: cari.id,
      cari_adi: cari.ad,
      tutar: val,
      tur: odemeTur,
      makbuz_no: `OD-${aktifYil}-${Math.floor(100 + Math.random() * 900)}`,
      aciklama: odemeAciklama || 'Ödeme',
      yil: aktifYil
    });

    setOdemeTutar('');
    setOdemeAciklama('');
    setFeedback('Ödeme başarıyla eklendi! (Trigger borcumuzu güncelledi)');
    setTimeout(() => {
      setFeedback(null);
      setActiveTab('ekstre');
    }, 1200);
  };

  const handleOpenPdfEkstre = () => {
    setPdfPrintData({
      type: 'ekstre',
      cari,
      ekstre
    });
  };

  const handleOpenThermalEkstre = () => {
    setThermalPrintData({
      cari,
      ekstre
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
              {cari.ad.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{cari.ad}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  {cari.grup}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {cari.sehir || 'Şehir Belirtilmemiş'} {cari.telefon ? `• ${cari.telefon}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Card & Quick Action Bar */}
        <div className="p-4 bg-slate-850/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
          
          {/* Balance */}
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Güncel Bakiye ({aktifYil})</span>
              <span
                className={`text-xl font-extrabold ${
                  cari.bakiye > 0 ? 'text-red-400' : cari.bakiye < 0 ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {Math.abs(cari.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
              <span className="text-[10px] text-slate-400 block">
                {cari.bakiye > 0 ? '(Müşteri Borçlu)' : cari.bakiye < 0 ? '(Tedarikçiye Borcumuz Var)' : '(Hesap Kapalı)'}
              </span>
            </div>
          </div>

          {/* Action Buttons: PDF, Print, Tahsilat, Ödeme */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOpenPdfEkstre}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Ekstre</span>
            </button>
            <button
              onClick={handleOpenThermalEkstre}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Termal Fiş</span>
            </button>
            <button
              onClick={() => setActiveTab('tahsilat')}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'tahsilat'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Tahsilat Ekle</span>
            </button>
            <button
              onClick={() => setActiveTab('odeme')}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'odeme'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Ödeme Yap</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-5 gap-4 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ekstre')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'ekstre' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Hesap Ekstresi & Hareketler ({ekstre.length})
          </button>
          <button
            onClick={() => setActiveTab('tahsilat')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'tahsilat' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Para Tahsil Et
          </button>
          <button
            onClick={() => setActiveTab('odeme')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'odeme' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Ödeme Yap
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {feedback && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{feedback}</span>
            </div>
          )}

          {activeTab === 'ekstre' && (
            <div className="space-y-2">
              {ekstre.length > 0 ? (
                ekstre.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{item.tur}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({item.evrak_no})</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{item.aciklama}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.tarih).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    <div className="text-right">
                      {item.borc > 0 && (
                        <div className="font-bold text-red-400">+{item.borc.toFixed(2)} TL (Borç)</div>
                      )}
                      {item.alacak > 0 && (
                        <div className="font-bold text-emerald-400">-{item.alacak.toFixed(2)} TL (Alacak)</div>
                      )}
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Bakiye: {item.bakiye.toFixed(2)} TL
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Bu yıla ({aktifYil}) ait hesap hareketi bulunamadı.
                </div>
              )}
            </div>
          )}

          {activeTab === 'tahsilat' && (
            <form onSubmit={handleSaveTahsilat} className="space-y-4 max-w-md mx-auto py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tahsilat Tutarı (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={tahsilatTutar}
                  onChange={e => setTahsilatTutar(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tahsilat Türü</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['NAKIT', 'HAVALE', 'KREDI_KARTI', 'CEK', 'SENET'] as const).map(tur => (
                    <button
                      key={tur}
                      type="button"
                      onClick={() => setTahsilatTur(tur)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        tahsilatTur === tur
                          ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {tur}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama</label>
                <input
                  type="text"
                  placeholder="Tahsilat açıklaması (opsiyonel)"
                  value={tahsilatAciklama}
                  onChange={e => setTahsilatAciklama(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                />
              </div>

              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-[11px] text-teal-300">
                <strong>Supabase Trigger:</strong> trg_tahsilat_bakiye fonksiyonu çalışacak ve cari bakiyesinden bu tutar otomatik düşülecektir.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20"
              >
                Tahsilatı Kaydet (Bakiye Düş)
              </button>
            </form>
          )}

          {activeTab === 'odeme' && (
            <form onSubmit={handleSaveOdeme} className="space-y-4 max-w-md mx-auto py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ödeme Tutarı (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={odemeTutar}
                  onChange={e => setOdemeTutar(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:ring-2 focus:ring-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ödeme Kanalı</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['NAKIT', 'HAVALE', 'KREDI_KARTI', 'CEK'] as const).map(tur => (
                    <button
                      key={tur}
                      type="button"
                      onClick={() => setOdemeTur(tur)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        odemeTur === tur
                          ? 'bg-rose-500 text-white border-rose-400 font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {tur}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama</label>
                <input
                  type="text"
                  placeholder="Ödeme açıklaması (opsiyonel)"
                  value={odemeAciklama}
                  onChange={e => setOdemeAciklama(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-rose-500 outline-hidden"
                />
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300">
                <strong>Supabase Trigger:</strong> trg_odeme_bakiye fonksiyonu çalışacak ve borcumuz kapatılacaktır.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20"
              >
                Ödemeyi Kaydet
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download, Printer, X, Building, CheckCircle2 } from 'lucide-react';

export const PdfPreviewModal: React.FC = () => {
  const { pdfPrintData, setPdfPrintData } = useApp();

  if (!pdfPrintData) return null;

  const { type, satis, cari, kalemler, ekstre } = pdfPrintData;
  const nowStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100 my-auto flex flex-col max-h-[95vh]">
        
        {/* Top bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {type === 'fatura' ? 'A4 Satış Faturası PDF Önizleme' : 'Cari Hesap Ekstresi PDF Önizleme'}
              </h3>
              <p className="text-xs text-slate-400">Android PdfDocument / Canvas Standardı</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              onClick={() => setPdfPrintData(null)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Page A4 Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
          <div
            id="printable-pdf"
            className="w-full max-w-[650px] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl rounded-sm text-xs leading-normal"
            style={{ minHeight: '800px' }}
          >
            {/* PDF Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-900 pb-5">
              <div>
                <h1 className="text-xl font-extrabold text-blue-950 tracking-tight">ÖZDEMİR TİCARET & YAPI SAN. TİC. LTD. ŞTİ.</h1>
                <p className="text-slate-500 text-[11px] mt-0.5">İnşaat, Hırdavat, Elektrik ve Boya Toptan Dağıtım</p>
                <p className="text-slate-500 text-[10px]">Ostim OSB 1204. Cadde No:45 Yenimahalle / ANKARA</p>
                <p className="text-slate-500 text-[10px]">Tel: 0312 444 00 99 • Vergi No: 6480192837 (Ostim V.D.)</p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-blue-950 text-white px-3 py-1 font-bold text-sm tracking-wider uppercase rounded-xs">
                  {type === 'fatura' ? 'SATIŞ FATURASI' : 'HESAP EKSTRESİ'}
                </div>
                <div className="mt-2 text-[11px] text-slate-600">
                  <div><strong>Belge No:</strong> {satis?.faturaNo || 'FTR-2025-00101'}</div>
                  <div><strong>Tarih:</strong> {nowStr}</div>
                  <div><strong>Ödeme:</strong> {satis?.odeme_turu || 'VERESIYE'}</div>
                </div>
              </div>
            </div>

            {/* Customer Box */}
            <div className="mt-5 grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">SAYIN / MÜŞTERİ</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{cari?.ad || 'Perakende Müşteri'}</span>
                <span className="text-slate-600 text-[11px] block mt-0.5">{cari?.adres || cari?.sehir || 'Kadıköy / İstanbul'}</span>
                {cari?.telefon && <span className="text-slate-600 text-[11px] block">Tel: {cari.telefon}</span>}
              </div>
              <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                <div><strong>Vergi Dairesi:</strong> {cari?.vergi_dairesi || '-'}</div>
                <div><strong>Vergi Numarası:</strong> {cari?.vergi_no || '-'}</div>
                <div><strong>Cari Grup:</strong> {cari?.grup || 'Genel'}</div>
                <div><strong>Bakiye Durumu:</strong> {(cari?.bakiye || 0).toFixed(2)} TL</div>
              </div>
            </div>

            {/* Table */}
            {type === 'fatura' ? (
              <div className="mt-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-300">
                      <th className="py-2.5 px-3">Sıra</th>
                      <th className="py-2.5 px-3">Ürün / Hizmet Açıklaması</th>
                      <th className="py-2.5 px-3 text-center">Miktar</th>
                      <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                      <th className="py-2.5 px-3 text-center">KDV</th>
                      <th className="py-2.5 px-3 text-right">Toplam Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {kalemler && kalemler.length > 0 ? (
                      kalemler.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{item.stok_adi || item.stok?.ad || 'Ürün'}</td>
                          <td className="py-2.5 px-3 text-center">{item.miktar} Adet</td>
                          <td className="py-2.5 px-3 text-right">{item.birim_fiyat.toFixed(2)} TL</td>
                          <td className="py-2.5 px-3 text-center">%{item.kdv_orani || 20}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.toplam_tutar.toFixed(2)} TL</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400">Kalem bulunamadı</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Calculation Box */}
                <div className="mt-6 flex justify-end">
                  <div className="w-64 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Ara Toplam:</span>
                      <span className="font-semibold">{satis?.toplam_tutar?.toFixed(2) || '0.00'} TL</span>
                    </div>
                    {satis?.iskonto_tutari ? (
                      <div className="flex justify-between text-red-600">
                        <span>İskonto İndirimi:</span>
                        <span className="font-semibold">-{satis.iskonto_tutari.toFixed(2)} TL</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-slate-600">
                      <span>Hesaplanan KDV (%20):</span>
                      <span className="font-semibold">{((satis?.net_tutar || 0) * 0.20).toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-blue-950 border-t-2 border-blue-900 pt-2">
                      <span>GENEL TOPLAM:</span>
                      <span>{satis?.net_tutar?.toFixed(2) || '0.00'} TL</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Ekstre Table */
              <div className="mt-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-300">
                      <th className="py-2 px-3">Tarih</th>
                      <th className="py-2 px-3">İşlem Türü</th>
                      <th className="py-2 px-3">Evrak No</th>
                      <th className="py-2 px-3">Açıklama</th>
                      <th className="py-2 px-3 text-right">Borç (+)</th>
                      <th className="py-2 px-3 text-right">Alacak (-)</th>
                      <th className="py-2 px-3 text-right">Bakiye</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {ekstre && ekstre.length > 0 ? (
                      ekstre.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 text-slate-600 font-mono">{new Date(item.tarih).toLocaleDateString('tr-TR')}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{item.tur}</td>
                          <td className="py-2 px-3 text-slate-600 font-mono">{item.evrak_no}</td>
                          <td className="py-2 px-3 text-slate-600">{item.aciklama}</td>
                          <td className="py-2 px-3 text-right text-red-600 font-medium">{item.borc > 0 ? `${item.borc.toFixed(2)} TL` : '-'}</td>
                          <td className="py-2 px-3 text-right text-emerald-600 font-medium">{item.alacak > 0 ? `${item.alacak.toFixed(2)} TL` : '-'}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{item.bakiye.toFixed(2)} TL</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-slate-400">Hareket kaydı yok</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signature Area */}
            <div className="mt-16 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-600">
              <div className="border-t border-slate-300 pt-3">
                <p className="font-bold text-slate-900">Teslim Eden</p>
                <p className="text-[10px] text-slate-400 mt-1">İmza / Kaşe</p>
              </div>
              <div className="border-t border-slate-300 pt-3">
                <p className="font-bold text-slate-900">Teslim Alan (Müşteri)</p>
                <p className="text-[10px] text-slate-400 mt-1">İmza / Kaşe</p>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
              Bu belge Supabase Veritabanı ve Android Stok-Cari Otomasyonu tarafından oluşturulmuştur.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

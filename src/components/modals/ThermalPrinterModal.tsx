import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, X, Bluetooth, Check, FileText, Sparkles, Copy, Layers } from 'lucide-react';

export const ThermalPrinterModal: React.FC = () => {
  const { thermalPrintData, setThermalPrintData, aktifYil } = useApp();
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [isConnected, setIsConnected] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'escpos'>('preview');

  if (!thermalPrintData) return null;

  const { satis, cari, kalemler, ekstre } = thermalPrintData;
  const firmaAdi = "ÖZDEMİR TİCARET & YAPI MARKET";
  const nowStr = new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });

  // Generate simulated ESC/POS command hex/text preview
  const generateEscPosCommands = () => {
    let output = "";
    output += "[ESC @]  // Initialize Printer\n";
    output += "[ESC a 1] // Align Center\n";
    output += "[ESC E 1] // Bold ON\n";
    output += `[TEXT: ${firmaAdi}]\n`;
    output += "[ESC E 0] // Bold OFF\n";
    output += `[TEXT: SATIŞ BİLGİ FİŞİ]\n`;
    output += `[TEXT: --------------------------------]\n`;
    output += "[ESC a 0] // Align Left\n";
    output += `[TEXT: Fatura No : ${satis?.faturaNo || 'FTR-2025-00101'}]\n`;
    output += `[TEXT: Tarih     : ${nowStr}]\n`;
    output += `[TEXT: Müşteri   : ${cari?.ad || 'Müşteri'}]\n`;
    output += `[TEXT: Ödeme     : ${satis?.odeme_turu || 'VERESIYE'}]\n`;
    output += `[TEXT: --------------------------------]\n`;
    output += `[TEXT: ÜRÜN            MİK      TUTAR]\n`;
    output += `[TEXT: --------------------------------]\n`;
    kalemler?.forEach((k: any) => {
      const name = (k.stok_adi || 'Ürün').slice(0, 15).padEnd(15);
      const qty = `${k.miktar}`.padStart(4);
      const total = `${k.toplam_tutar.toFixed(2)} TL`.padStart(11);
      output += `[TEXT: ${name} ${qty} ${total}]\n`;
    });
    output += `[TEXT: ================================]\n`;
    output += "[ESC a 2] // Align Right\n";
    output += `[TEXT: Ara Toplam : ${satis?.toplam_tutar?.toFixed(2) || '0.00'} TL]\n`;
    if (satis?.iskonto_tutari) {
      output += `[TEXT: İskonto    : -${satis.iskonto_tutari.toFixed(2)} TL]\n`;
    }
    output += `[ESC E 1] // Bold ON\n`;
    output += `[TEXT: GENEL TOPLAM: ${satis?.net_tutar?.toFixed(2) || '0.00'} TL]\n`;
    output += `[ESC E 0] // Bold OFF\n`;
    output += `[TEXT: --------------------------------]\n`;
    output += `[TEXT: GÜNCEL BAKİYE: ${(cari?.bakiye || 0).toFixed(2)} TL]\n`;
    output += "[ESC a 1] // Align Center\n";
    output += `[TEXT: \\nBizi tercih ettiğiniz için teşekkür ederiz.\\nMali değeri yoktur.\\n\\n]\n`;
    output += `[ESC d 3] // Feed 3 lines\n`;
    output += `[GS V 65 0] // Cut Paper\n`;
    return output;
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 600);
  };

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(generateEscPosCommands());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Bluetooth Termal Yazıcı (ESC/POS)</h3>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  <Bluetooth className="w-3 h-3" />
                  <span>Bağlı: RPP02N (58mm)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">CP857 / ISO-8859-9 Türkçe Kod Sayfası</p>
            </div>
          </div>
          <button
            onClick={() => setThermalPrintData(null)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Paper Size & Tab Selector */}
        <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-850 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('preview')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'preview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fiş Görünümü
            </button>
            <button
              onClick={() => setActiveTab('escpos')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'escpos' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ESC/POS Komutları
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-1">Rulo:</span>
            <button
              onClick={() => setPaperWidth('58mm')}
              className={`px-2 py-0.5 rounded font-bold ${
                paperWidth === '58mm' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              58mm
            </button>
            <button
              onClick={() => setPaperWidth('80mm')}
              className={`px-2 py-0.5 rounded font-bold ${
                paperWidth === '80mm' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              80mm
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
          
          {activeTab === 'preview' ? (
            /* Thermal Receipt Roll Visual */
            <div
              id="thermal-receipt"
              style={{
                width: paperWidth === '58mm' ? '300px' : '380px',
                fontFamily: 'Courier, monospace'
              }}
              className="bg-amber-50/95 text-slate-900 text-[11px] leading-tight p-4 shadow-xl border-t-8 border-b-8 border-slate-300 relative select-none rounded-xs"
            >
              {/* Receipt Top Zigzag effect */}
              <div className="text-center font-bold text-xs pb-1">{firmaAdi}</div>
              <div className="text-center text-[10px] text-slate-700">AKILLI STOK & CARİ TAKİP</div>
              <div className="text-center font-bold text-[11px] pt-1">SATIŞ BİLGİ FİŞİ</div>
              <div className="border-b border-dashed border-slate-500 my-1.5" />

              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Fatura No:</span>
                  <span className="font-bold">{satis?.faturaNo || 'FTR-2025-00101'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tarih:</span>
                  <span>{nowStr}</span>
                </div>
                <div className="flex justify-between">
                  <span>Müşteri:</span>
                  <span className="font-bold">{cari?.ad || 'Perakende Müşteri'}</span>
                </div>
                {cari?.telefon && (
                  <div className="flex justify-between">
                    <span>Telefon:</span>
                    <span>{cari.telefon}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ödeme Türü:</span>
                  <span className="font-bold">{satis?.odeme_turu || 'VERESIYE'}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-500 my-1.5" />

              {/* Items Table */}
              <div className="font-bold flex justify-between text-[10px] border-b border-slate-400 pb-0.5 mb-1">
                <span>ÜRÜN AÇIKLAMASI</span>
                <span>MİK x FİYAT</span>
                <span>TUTAR</span>
              </div>

              <div className="space-y-1 text-[10px]">
                {kalemler && kalemler.length > 0 ? (
                  kalemler.map((item: any, idx: number) => (
                    <div key={idx} className="border-b border-dotted border-slate-300 pb-0.5">
                      <div className="font-semibold text-slate-900 truncate">{item.stok_adi || item.stok?.ad || 'Ürün'}</div>
                      <div className="flex justify-between text-slate-700">
                        <span>{item.miktar} x {item.birim_fiyat.toFixed(2)} TL</span>
                        <span className="font-bold text-slate-900">{item.toplam_tutar.toFixed(2)} TL</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-center text-slate-500">Kalem bilgisi yok</div>
                )}
              </div>

              <div className="border-b-2 border-slate-800 my-2" />

              {/* Totals */}
              <div className="space-y-0.5 text-right text-[10px]">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span>{satis?.toplam_tutar?.toFixed(2) || '0.00'} TL</span>
                </div>
                {satis?.iskonto_tutari ? (
                  <div className="flex justify-between text-red-600">
                    <span>İskonto:</span>
                    <span>-{satis.iskonto_tutari.toFixed(2)} TL</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-extrabold text-xs text-slate-950 border-t border-slate-400 pt-0.5">
                  <span>GENEL TOPLAM:</span>
                  <span>{satis?.net_tutar?.toFixed(2) || '0.00'} TL</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-500 my-1.5" />

              {/* Balance */}
              <div className="text-[10px] space-y-0.5 bg-amber-100/70 p-1.5 rounded-xs">
                <div className="flex justify-between">
                  <span>Önceki Bakiye:</span>
                  <span>{(cari?.bakiye || 0).toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Güncel Bakiye:</span>
                  <span>
                    {(
                      (cari?.bakiye || 0) +
                      (satis?.odeme_turu === 'VERESIYE' ? satis?.net_tutar || 0 : 0)
                    ).toFixed(2)} TL
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[9px] text-slate-600 pt-3 space-y-0.5">
                <div>Bizi tercih ettiğiniz için teşekkür ederiz.</div>
                <div className="font-semibold text-slate-500">Mali değeri yoktur. Bilgi fişidir.</div>
                <div className="font-mono text-[8px] pt-1">*** SUPABASE TRIGGER MOTORU ***</div>
              </div>
            </div>
          ) : (
            /* ESC/POS Commands Inspector */
            <div className="w-full text-xs font-mono bg-slate-900 p-4 rounded-xl border border-slate-800 text-emerald-300 overflow-x-auto relative">
              <button
                onClick={handleCopyCommands}
                className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-sans px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
              <pre className="whitespace-pre-wrap">{generateEscPosCommands()}</pre>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Bluetooth SPP UUID: 00001101-...</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setThermalPrintData(null)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              Kapat
            </button>
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? 'Yazdırılıyor...' : 'Yazıcıya Gönder (Fiş Bas)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

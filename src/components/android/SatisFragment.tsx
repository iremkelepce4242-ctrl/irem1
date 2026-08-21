import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Stok, Satis } from '../../types';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  FileText,
  CheckCircle2,
  Zap,
  Tag,
  CreditCard,
  Banknote,
  Building,
  User,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SatisFragment: React.FC = () => {
  const {
    aktifYil,
    cariler,
    stoklar,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    selectedCariId,
    setSelectedCariId,
    completeSale,
    setThermalPrintData,
    setPdfPrintData
  } = useApp();

  const [productSearch, setProductSearch] = useState('');
  const [iskonto, setIskonto] = useState<number>(0);
  const [odemeTuru, setOdemeTuru] = useState<'VERESIYE' | 'NAKIT' | 'KREDI_KARTI' | 'HAVALE'>('VERESIYE');
  const [aciklama, setAciklama] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<Satis | null>(null);

  const yearCariler = cariler.filter(c => c.yil === aktifYil && c.aktif);
  const yearStoklar = stoklar.filter(s => s.yil === aktifYil && s.aktif);

  const selectedCari = yearCariler.find(c => c.id === selectedCariId) || yearCariler[0];

  const filteredStoklar = yearStoklar.filter(s =>
    s.ad.toLowerCase().includes(productSearch.toLowerCase()) ||
    (s.barkod && s.barkod.includes(productSearch))
  );

  const netTotal = Math.max(0, cartTotal - iskonto);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const saleResult = await completeSale(odemeTuru, iskonto, aciklama);
      setLastSale(saleResult);
      setIskonto(0);
      setAciklama('');
      try {
        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch (_e) {}
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintThermal = () => {
    if (!lastSale) return;
    setThermalPrintData({
      satis: lastSale,
      cari: selectedCari,
      kalemler: lastSale.kalemler
    });
  };

  const handlePrintPdf = () => {
    if (!lastSale) return;
    setPdfPrintData({
      type: 'fatura',
      satis: lastSale,
      cari: selectedCari,
      kalemler: lastSale.kalemler
    });
  };

  return (
    <div className="space-y-3 pb-24">
      
      {/* If a sale was just completed, show success banner with Thermal & PDF actions */}
      {lastSale && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl space-y-3 animate-in fade-in zoom-in duration-200 text-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Satış Başarıyla Kaydedildi!</h4>
                <p className="text-[10px] text-emerald-300">
                  {lastSale.fatura_no} • {lastSale.net_tutar.toFixed(2)} TL ({lastSale.odeme_turu})
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastSale(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
            >
              Kapat
            </button>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded-xl text-[11px] text-slate-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>PostgreSQL Triggers Çalıştı:</strong> Stoklar depodan düşüldü ve {selectedCari?.ad} bakiyesine işlendi.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="btn-print-thermal-after-sale"
              onClick={handlePrintThermal}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Termal Fiş Bas (58mm)</span>
            </button>
            <button
              id="btn-print-pdf-after-sale"
              onClick={handlePrintPdf}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-md shadow-blue-600/20"
            >
              <FileText className="w-4 h-4" />
              <span>A4 PDF Fatura</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Select Customer (Cari Seçici) */}
      <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Müşteri / Cari Seçimi</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Bakiye: {(selectedCari?.bakiye || 0).toFixed(2)} TL
          </span>
        </label>
        
        <select
          value={selectedCariId}
          onChange={e => setSelectedCariId(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:ring-2 focus:ring-purple-500 outline-hidden"
        >
          {yearCariler.map(c => (
            <option key={c.id} value={c.id}>
              {c.ad} ({c.grup}) — Bakiye: {c.bakiye.toFixed(2)} TL
            </option>
          ))}
        </select>
      </div>

      {/* 2. Product Fast Search & Add Grid */}
      <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Sepete eklemek için ürün veya barkod ara..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        {productSearch && (
          <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-slate-800/60 bg-slate-850 p-2 rounded-xl border border-slate-700/60">
            {filteredStoklar.length > 0 ? (
              filteredStoklar.map(stk => (
                <div
                  key={stk.id}
                  onClick={() => {
                    addToCart(stk, 1);
                    setProductSearch('');
                  }}
                  className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-800 rounded-lg text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{stk.ad}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Barkod: {stk.barkod || '-'} • Depo: {stk.miktar} {stk.birim}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-400">{stk.satis_fiyati.toFixed(2)} TL</span>
                </div>
              ))
            ) : (
              <div className="p-2 text-center text-slate-400 text-xs">Eşleşen ürün bulunamadı</div>
            )}
          </div>
        )}
      </div>

      {/* 3. Shopping Cart (Sepet Listesi - Matching item_sepet.xml) */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span>Satış Sepeti ({cart.length} Kalem)</span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Sepeti Boşalt</span>
            </button>
          )}
        </div>

        {cart.length > 0 ? (
          <div className="space-y-2.5">
            {cart.map(item => (
              <div
                key={item.stok.id}
                className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-slate-200 truncate">{item.stok.ad}</h5>
                  <span className="text-[10px] text-slate-400">
                    Birim: {item.birim_fiyat.toFixed(2)} TL • Kalan Depo: {item.stok.miktar}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => updateCartQuantity(item.stok.id, item.miktar - 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-white px-1 text-xs">{item.miktar}</span>
                  <button
                    onClick={() => updateCartQuantity(item.stok.id, item.miktar + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-xs text-emerald-400 block">
                    {item.toplam_tutar.toFixed(2)} TL
                  </span>
                  <button
                    onClick={() => removeFromCart(item.stok.id)}
                    className="text-[10px] text-slate-500 hover:text-red-400"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            Sepetiniz boş. Yukarıdaki aramadan ürün seçin veya stok listesinden ekleyin.
          </div>
        )}
      </div>

      {/* 4. Payment & Discount Options */}
      {cart.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 text-xs">
          
          {/* Payment Type */}
          <div>
            <label className="block font-semibold text-slate-400 mb-1.5">Ödeme Türü</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'VERESIYE', label: 'Veresiye (Açık Hesap)' },
                { id: 'NAKIT', label: 'Nakit Kasa' },
                { id: 'KREDI_KARTI', label: 'Kredi Kartı' },
                { id: 'HAVALE', label: 'Banka / Havale' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOdemeTuru(opt.id as any)}
                  className={`py-2 px-1.5 rounded-xl font-bold text-center border transition-all text-[11px] ${
                    odemeTuru === opt.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                      : 'bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Discount & Note */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">İskonto / İndirim (TL)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={iskonto || ''}
                onChange={e => setIskonto(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Fatura Açıklaması</label>
              <input
                type="text"
                placeholder="Açıklama (opsiyonel)"
                value={aciklama}
                onChange={e => setAciklama(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden"
              />
            </div>
          </div>

          {/* Final Totals Box */}
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Ara Toplam:</span>
              <span>{cartTotal.toFixed(2)} TL</span>
            </div>
            {iskonto > 0 && (
              <div className="flex justify-between text-red-400 text-xs">
                <span>İskonto İndirimi:</span>
                <span>-{iskonto.toFixed(2)} TL</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-white border-t border-slate-700 pt-2">
              <span>ÖDENECEK TUTAR:</span>
              <span className="text-emerald-400">{netTotal.toFixed(2)} TL</span>
            </div>
          </div>

          {/* Complete Button */}
          <button
            id="btn-complete-sale"
            onClick={handleCompleteSale}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <PackageCheck className="w-5 h-5" />
            <span>{isProcessing ? 'Veritabanı İşleniyor...' : 'SATIŞI TAMAMLA (TRIGGER ÇALIŞTIR)'}</span>
          </button>
        </div>
      )}

    </div>
  );
};

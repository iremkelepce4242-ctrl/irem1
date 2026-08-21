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
    <div className="p-4 space-y-3 pb-20 bg-[#F1F5F9] min-h-full">
      
      {/* If a sale was just completed, show success banner with Thermal & PDF actions */}
      {lastSale && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-3 animate-in fade-in zoom-in duration-200 text-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">Satış Başarıyla Kaydedildi!</h4>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  {lastSale.fatura_no} • {lastSale.net_tutar.toFixed(2)} TL ({lastSale.odeme_turu})
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastSale(null)}
              className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 bg-white border border-slate-200 rounded-xl"
            >
              Kapat
            </button>
          </div>

          <div className="p-2.5 bg-white rounded-2xl border border-emerald-100 text-[11px] text-slate-600 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              <strong>Supabase Trigger:</strong> Stoklar depodan düşüldü ve {selectedCari?.ad} bakiyesine işlendi.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="btn-print-thermal-after-sale"
              onClick={handlePrintThermal}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#1E88E5] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Termal Fiş (58mm)</span>
            </button>
            <button
              id="btn-print-pdf-after-sale"
              onClick={handlePrintPdf}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#00897B] text-white font-extrabold text-xs shadow-md shadow-teal-500/20 active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>A4 PDF Fatura</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Customer Selector */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2">
        <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#1E88E5]" />
            <span>Müşteri / Cari Seçimi</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            Bakiye: {(selectedCari?.bakiye || 0).toFixed(2)} TL
          </span>
        </label>
        
        <select
          value={selectedCariId}
          onChange={e => setSelectedCariId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-[#1E88E5] outline-hidden"
        >
          {yearCariler.map(c => (
            <option key={c.id} value={c.id}>
              {c.ad} ({c.grup}) — Bakiye: {c.bakiye.toFixed(2)} TL
            </option>
          ))}
        </select>
      </div>

      {/* 2. Cart Items */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-[#1E88E5]" />
            <h3 className="font-extrabold text-xs text-slate-800">
              Satış Sepeti ({cart.length} Kalem)
            </h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold"
            >
              Sepeti Boşalt
            </button>
          )}
        </div>

        {cart.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
            {cart.map(item => (
              <div
                key={item.stok.id}
                className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-slate-800 truncate">{item.stok.ad}</h4>
                  <div className="text-[10px] text-slate-500">
                    {item.fiyat.toFixed(2)} TL x {item.miktar} ={' '}
                    <strong className="text-slate-800 font-extrabold">{(item.fiyat * item.miktar).toFixed(2)} TL</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl">
                    <button
                      onClick={() => updateCartQuantity(item.stok.id, item.miktar - 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-xl"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-bold text-xs text-slate-800">
                      {item.miktar}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.stok.id, item.miktar + 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-xl"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.stok.id)}
                    className="w-7 h-7 text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            Sepetiniz boş. Aşağıdaki listeden ürün ekleyin.
          </div>
        )}

        {/* Total & Payment Options */}
        {cart.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">İskonto / İndirim (TL)</label>
                <input
                  type="number"
                  min="0"
                  value={iskonto || ''}
                  onChange={e => setIskonto(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Ödeme Türü</label>
                <select
                  value={odemeTuru}
                  onChange={e => setOdemeTuru(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold outline-hidden"
                >
                  <option value="VERESIYE">Veresiye (Açık Hesap)</option>
                  <option value="NAKIT">Nakit (Kasa Girişi)</option>
                  <option value="KREDI_KARTI">Kredi Kartı / POS</option>
                  <option value="HAVALE">Havale / EFT</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-700 font-bold block">ÖDENECEK NET TUTAR</span>
                <span className="text-xl font-black text-[#1E88E5]">
                  {netTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </span>
              </div>

              <button
                id="btn-complete-sale"
                disabled={isProcessing}
                onClick={handleCompleteSale}
                className="px-5 py-3 rounded-2xl bg-[#1E88E5] hover:bg-[#1976D2] text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <span>Kaydediliyor...</span>
                ) : (
                  <>
                    <span>Satışı Tamamla</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Product Catalog to Add to Cart */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/70 shadow-xs space-y-2">
        <h3 className="font-extrabold text-xs text-slate-800">Ürün Listesinden Ekle</h3>
        
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hızlı ürün ara..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 outline-hidden"
          />
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar">
          {filteredStoklar.map(stok => (
            <div
              key={stok.id}
              onClick={() => addToCart(stok, 1)}
              className="p-2 bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 rounded-2xl cursor-pointer flex items-center justify-between transition-all"
            >
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-800 truncate block">{stok.ad}</span>
                <span className="text-[10px] text-slate-500">Stok: {stok.miktar} {stok.birim}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-extrabold text-xs text-slate-900">{stok.satis_fiyati.toFixed(2)} TL</span>
                <span className="w-6 h-6 rounded-lg bg-[#1E88E5] text-white flex items-center justify-center text-xs font-bold">+</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

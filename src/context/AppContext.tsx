import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Cari,
  Stok,
  Satis,
  SatisDetay,
  Alim,
  Tahsilat,
  Odeme,
  CekSenet,
  CariEkstreItem,
  YillikOzetRapor,
  TriggerLog
} from '../types';
import {
  INITIAL_CARILER,
  INITIAL_STOKLAR,
  INITIAL_SATISLAR,
  INITIAL_TAHSILATLAR,
  INITIAL_ODEMELER,
  INITIAL_CEK_SENETLER
} from '../data/initialData';

interface CartItem {
  stok: Stok;
  miktar: number;
  birim_fiyat: number;
  iskonto_orani: number;
  toplam_tutar: number;
}

interface AppContextType {
  // Navigation & View
  viewMode: 'mobile' | 'developer';
  setViewMode: (mode: 'mobile' | 'developer') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  aktifYil: number;
  setAktifYil: (yil: number) => void;

  // Data
  cariler: Cari[];
  stoklar: Stok[];
  satislar: Satis[];
  alimlar: Alim[];
  tahsilatlar: Tahsilat[];
  odemeler: Odeme[];
  cekSenetler: CekSenet[];
  triggerLogs: TriggerLog[];

  // Cart
  cart: CartItem[];
  selectedCariId: string;
  setSelectedCariId: (id: string) => void;
  addToCart: (stok: Stok, miktar?: number) => void;
  updateCartQuantity: (stokId: string, miktar: number) => void;
  removeFromCart: (stokId: string) => void;
  clearCart: () => void;
  cartTotal: number;

  // Actions (Simulated Triggers & RPC)
  completeSale: (odemeTuru: 'NAKIT' | 'KREDI_KARTI' | 'VERESIYE' | 'HAVALE', iskonto: number, aciklama?: string) => Promise<Satis>;
  addCari: (cari: Omit<Cari, 'id' | 'bakiye' | 'created_at'>) => void;
  updateCari: (cari: Cari) => void;
  deleteCari: (id: string) => void;
  addStok: (stok: Omit<Stok, 'id' | 'created_at'>) => void;
  updateStok: (stok: Stok) => void;
  deleteStok: (id: string) => void;
  addTahsilat: (tahsilat: Omit<Tahsilat, 'id' | 'tarih'>) => void;
  addOdeme: (odeme: Omit<Odeme, 'id' | 'tarih'>) => void;
  addCekSenet: (item: Omit<CekSenet, 'id'>) => void;
  updateCekSenetDurum: (id: string, durum: CekSenet['durum']) => void;
  executeYilDevri: (kaynakYil: number, hedefYil: number) => { devredilenCari: number; devredilenStok: number };

  // RPC Computed
  getYillikOzetRapor: (yil: number) => YillikOzetRapor;
  getCariEkstre: (cariId: string, yil: number) => CariEkstreItem[];

  // Print Modals
  thermalPrintData: { satis?: Satis; cari?: Cari; kalemler?: SatisDetay[]; ekstre?: CariEkstreItem[] } | null;
  setThermalPrintData: (data: any) => void;
  pdfPrintData: { type: 'fatura' | 'ekstre'; satis?: Satis; cari?: Cari; kalemler?: SatisDetay[]; ekstre?: CariEkstreItem[] } | null;
  setPdfPrintData: (data: any) => void;

  // Active Cari Detail Modal
  detailCari: Cari | null;
  setDetailCari: (cari: Cari | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'developer'>('mobile');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [aktifYil, setAktifYil] = useState<number>(2025);

  const [cariler, setCariler] = useState<Cari[]>(INITIAL_CARILER);
  const [stoklar, setStoklar] = useState<Stok[]>(INITIAL_STOKLAR);
  const [satislar, setSatislar] = useState<Satis[]>(INITIAL_SATISLAR);
  const [alimlar, setAlimlar] = useState<Alim[]>([]);
  const [tahsilatlar, setTahsilatlar] = useState<Tahsilat[]>(INITIAL_TAHSILATLAR);
  const [odemeler, setOdemeler] = useState<Odeme[]>(INITIAL_ODEMELER);
  const [cekSenetler, setCekSenetler] = useState<CekSenet[]>(INITIAL_CEK_SENETLER);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCariId, setSelectedCariId] = useState<string>(INITIAL_CARILER[0]?.id || '');
  const [detailCari, setDetailCari] = useState<Cari | null>(null);

  const [thermalPrintData, setThermalPrintData] = useState<any>(null);
  const [pdfPrintData, setPdfPrintData] = useState<any>(null);

  const [triggerLogs, setTriggerLogs] = useState<TriggerLog[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('tr-TR'),
      triggerName: 'trg_satis_stok',
      table: 'satis_detay',
      action: 'INSERT',
      details: 'Bosch Darbeli Matkap x2 adet satış yapıldı',
      effect: 'stoklar.miktar -> -2 adet otomatik düşürüldü'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('tr-TR'),
      triggerName: 'trg_satis_bakiye',
      table: 'satislar',
      action: 'INSERT',
      details: 'Fatura: FTR-2025-00101 (8,500.00 TL Veresiye)',
      effect: 'cariler.bakiye -> +8,500.00 TL borç kaydedildi'
    }
  ]);

  const addTriggerLog = (triggerName: string, table: string, action: TriggerLog['action'], details: string, effect: string) => {
    const newLog: TriggerLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      triggerName,
      table,
      action,
      details,
      effect
    };
    setTriggerLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const addToCart = (stok: Stok, miktar = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.stok.id === stok.id);
      if (existing) {
        return prev.map(item =>
          item.stok.id === stok.id
            ? {
                ...item,
                miktar: item.miktar + miktar,
                toplam_tutar: (item.miktar + miktar) * item.birim_fiyat * (1 - item.iskonto_orani / 100)
              }
            : item
        );
      }
      return [
        ...prev,
        {
          stok,
          miktar,
          birim_fiyat: stok.satis_fiyati,
          iskonto_orani: 0,
          toplam_tutar: miktar * stok.satis_fiyati
        }
      ];
    });
  };

  const updateCartQuantity = (stokId: string, miktar: number) => {
    if (miktar <= 0) {
      removeFromCart(stokId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.stok.id === stokId
          ? {
              ...item,
              miktar,
              toplam_tutar: miktar * item.birim_fiyat * (1 - item.iskonto_orani / 100)
            }
          : item
      )
    );
  };

  const removeFromCart = (stokId: string) => {
    setCart(prev => prev.filter(item => item.stok.id !== stokId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.toplam_tutar, 0);

  // Satış Tamamlama & Trigger Simülasyonu
  const completeSale = async (
    odemeTuru: 'NAKIT' | 'KREDI_KARTI' | 'VERESIYE' | 'HAVALE',
    iskonto: number,
    aciklama?: string
  ): Promise<Satis> => {
    const cari = cariler.find(c => c.id === selectedCariId) || cariler[0];
    const rawTotal = cartTotal;
    const netTotal = Math.max(0, rawTotal - iskonto);
    const faturaNo = `FTR-${aktifYil}-${String(satislar.length + 101).padStart(5, '0')}`;

    const kalemler: SatisDetay[] = cart.map(item => ({
      id: `sd-${Date.now()}-${item.stok.id}`,
      stok_id: item.stok.id,
      stok_adi: item.stok.ad,
      miktar: item.miktar,
      birim_fiyat: item.birim_fiyat,
      kdv_orani: item.stok.kdv_orani || 20,
      iskonto_orani: item.iskonto_orani,
      toplam_tutar: item.toplam_tutar,
      yil: aktifYil
    }));

    const newSatis: Satis = {
      id: `sat-${Date.now()}`,
      fatura_no: faturaNo,
      cari_id: cari.id,
      cari_adi: cari.ad,
      toplam_tutar: rawTotal,
      iskonto_tutari: iskonto,
      net_tutar: netTotal,
      odeme_turu: odemeTuru,
      durum: 'TAMAMLANDI',
      aciklama,
      yil: aktifYil,
      tarih: new Date().toISOString(),
      kalemler
    };

    // 1. SUPABASE TRIGGER 1: trg_satis_stok (Stok miktarlarını düş)
    setStoklar(prev =>
      prev.map(stk => {
        const cartItem = cart.find(c => c.stok.id === stk.id);
        if (cartItem) {
          addTriggerLog(
            'trg_satis_stok',
            'satis_detay',
            'INSERT',
            `${stk.ad} - Satış: ${cartItem.miktar} ${stk.birim}`,
            `stoklar.miktar: ${stk.miktar} -> ${stk.miktar - cartItem.miktar}`
          );
          return {
            ...stk,
            miktar: stk.miktar - cartItem.miktar
          };
        }
        return stk;
      })
    );

    // 2. SUPABASE TRIGGER 2: trg_satis_bakiye (Cari bakiyeyi güncelle)
    if (odemeTuru === 'VERESIYE') {
      setCariler(prev =>
        prev.map(c => {
          if (c.id === cari.id) {
            addTriggerLog(
              'trg_satis_bakiye',
              'satislar',
              'INSERT',
              `${c.ad} - Veresiye Fatura: ${netTotal.toFixed(2)} TL`,
              `cariler.bakiye: ${c.bakiye.toFixed(2)} TL -> ${(c.bakiye + netTotal).toFixed(2)} TL`
            );
            return {
              ...c,
              bakiye: c.bakiye + netTotal
            };
          }
          return c;
        })
      );
    } else {
      addTriggerLog(
        'trg_satis_bakiye',
        'satislar',
        'INSERT',
        `Fatura No: ${faturaNo} (${odemeTuru})`,
        `Peşin tahsil edildi, cari borcu artmadı. Kasa nakit giriş yapıldı.`
      );
    }

    setSatislar(prev => [newSatis, ...prev]);
    clearCart();

    return newSatis;
  };

  const addCari = (newCariData: Omit<Cari, 'id' | 'bakiye' | 'created_at'>) => {
    const newCari: Cari = {
      ...newCariData,
      id: `c-${Date.now()}`,
      bakiye: 0,
      created_at: new Date().toISOString()
    };
    setCariler(prev => [newCari, ...prev]);
    addTriggerLog('supabase_postgrest', 'cariler', 'INSERT', `${newCari.ad} carisi eklendi`, 'Yeni cari kaydedildi');
  };

  const updateCari = (updated: Cari) => {
    setCariler(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const deleteCari = (id: string) => {
    setCariler(prev => prev.map(c => (c.id === id ? { ...c, aktif: false } : c)));
  };

  const addStok = (newStokData: Omit<Stok, 'id' | 'created_at'>) => {
    const newStok: Stok = {
      ...newStokData,
      id: `s-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setStoklar(prev => [newStok, ...prev]);
    addTriggerLog('supabase_postgrest', 'stoklar', 'INSERT', `${newStok.ad} eklendi`, 'Yeni stok kartı açıldı');
  };

  const updateStok = (updated: Stok) => {
    setStoklar(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  const deleteStok = (id: string) => {
    setStoklar(prev => prev.map(s => (s.id === id ? { ...s, aktif: false } : s)));
  };

  // Tahsilat Ekle (Trigger Cari bakiyesini otomatik düşürür)
  const addTahsilat = (tahsilatData: Omit<Tahsilat, 'id' | 'tarih'>) => {
    const newTahsilat: Tahsilat = {
      ...tahsilatData,
      id: `tah-${Date.now()}`,
      tarih: new Date().toISOString()
    };
    setTahsilatlar(prev => [newTahsilat, ...prev]);

    // trg_tahsilat_bakiye
    setCariler(prev =>
      prev.map(c => {
        if (c.id === tahsilatData.cari_id) {
          addTriggerLog(
            'trg_tahsilat_bakiye',
            'tahsilatlar',
            'INSERT',
            `${c.ad} - Tahsilat: ${tahsilatData.tutar.toFixed(2)} TL (${tahsilatData.tur})`,
            `cariler.bakiye: ${c.bakiye.toFixed(2)} TL -> ${(c.bakiye - tahsilatData.tutar).toFixed(2)} TL (Borç düştü)`
          );
          return {
            ...c,
            bakiye: c.bakiye - tahsilatData.tutar
          };
        }
        return c;
      })
    );
  };

  // Ödeme Ekle (Biz tedarikçiye ödedik, borcumuz kapandı)
  const addOdeme = (odemeData: Omit<Odeme, 'id' | 'tarih'>) => {
    const newOdeme: Odeme = {
      ...odemeData,
      id: `odm-${Date.now()}`,
      tarih: new Date().toISOString()
    };
    setOdemeler(prev => [newOdeme, ...prev]);

    // trg_odeme_bakiye
    setCariler(prev =>
      prev.map(c => {
        if (c.id === odemeData.cari_id) {
          addTriggerLog(
            'trg_odeme_bakiye',
            'odemeler',
            'INSERT',
            `${c.ad} - Ödeme: ${odemeData.tutar.toFixed(2)} TL (${odemeData.tur})`,
            `cariler.bakiye: ${c.bakiye.toFixed(2)} TL -> ${(c.bakiye + odemeData.tutar).toFixed(2)} TL (Borcumuz azaldı)`
          );
          return {
            ...c,
            bakiye: c.bakiye + odemeData.tutar
          };
        }
        return c;
      })
    );
  };

  const addCekSenet = (item: Omit<CekSenet, 'id'>) => {
    const newItem: CekSenet = {
      ...item,
      id: `cs-${Date.now()}`
    };
    setCekSenetler(prev => [newItem, ...prev]);
  };

  const updateCekSenetDurum = (id: string, durum: CekSenet['durum']) => {
    setCekSenetler(prev => prev.map(cs => (cs.id === id ? { ...cs, durum } : cs)));
  };

  // Yıl Sonu Devir Simülasyonu (sp_yil_sonu_devri_yap RPC)
  const executeYilDevri = (kaynakYil: number, hedefYil: number) => {
    const sourceCariler = cariler.filter(c => c.yil === kaynakYil && c.aktif);
    const sourceStoklar = stoklar.filter(s => s.yil === kaynakYil && s.aktif);

    const newYearCariler: Cari[] = sourceCariler.map(c => ({
      ...c,
      id: `c-devir-${hedefYil}-${c.id}`,
      yil: hedefYil,
      created_at: new Date().toISOString()
    }));

    const newYearStoklar: Stok[] = sourceStoklar.map(s => ({
      ...s,
      id: `s-devir-${hedefYil}-${s.id}`,
      yil: hedefYil,
      created_at: new Date().toISOString()
    }));

    setCariler(prev => [...prev.filter(c => c.yil !== hedefYil), ...newYearCariler]);
    setStoklar(prev => [...prev.filter(s => s.yil !== hedefYil), ...newYearStoklar]);

    addTriggerLog(
      'sp_yil_sonu_devri_yap',
      'RPC_STORED_PROCEDURE',
      'RPC',
      `${kaynakYil} -> ${hedefYil} Yıl Sonu Devri`,
      `${newYearCariler.length} Cari ve ${newYearStoklar.length} Stok yeni yıla güncel bakiye/stokla aktarıldı`
    );

    setAktifYil(hedefYil);

    return {
      devredilenCari: newYearCariler.length,
      devredilenStok: newYearStoklar.length
    };
  };

  // RPC: get_yillik_ozet_rapor
  const getYillikOzetRapor = (yil: number): YillikOzetRapor => {
    const yearSatislar = satislar.filter(s => s.yil === yil && s.durum === 'TAMAMLANDI');
    const yearAlimlar = alimlar.filter(a => a.yil === yil && a.durum === 'TAMAMLANDI');
    const yearTahsilatlar = tahsilatlar.filter(t => t.yil === yil);
    const yearOdemeler = odemeler.filter(o => o.yil === yil);
    const yearCariler = cariler.filter(c => c.yil === yil && c.aktif);
    const yearStoklar = stoklar.filter(s => s.yil === yil && s.aktif);

    const toplamSatis = yearSatislar.reduce((sum, s) => sum + s.net_tutar, 0);
    const toplamAlim = yearAlimlar.reduce((sum, a) => sum + a.net_tutar, 0);
    const toplamTahsilat = yearTahsilatlar.reduce((sum, t) => sum + t.tutar, 0);
    const toplamOdeme = yearOdemeler.reduce((sum, o) => sum + o.tutar, 0);

    const toplamAlacak = yearCariler.reduce((sum, c) => (c.bakiye > 0 ? sum + c.bakiye : sum), 0);
    const toplamBorc = yearCariler.reduce((sum, c) => (c.bakiye < 0 ? sum + Math.abs(c.bakiye) : sum), 0);
    const kritikStokSayisi = yearStoklar.filter(s => s.miktar <= s.kritik_miktar).length;

    const ayIsimleri = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const aylikGrafik = ayIsimleri.map((ayAdi, idx) => {
      const ayNo = idx + 1;
      const satisAy = yearSatislar
        .filter(s => new Date(s.tarih).getMonth() + 1 === ayNo)
        .reduce((sum, s) => sum + s.net_tutar, 0);
      const alimAy = yearAlimlar
        .filter(a => new Date(a.tarih).getMonth() + 1 === ayNo)
        .reduce((sum, a) => sum + a.net_tutar, 0);

      // Simulation fallback for visually rich graph if initial month
      const simSatis = satisAy > 0 ? satisAy : idx === 0 ? toplamSatis : 0;
      const simAlim = alimAy > 0 ? alimAy : idx === 0 ? toplamAlim : 0;

      return {
        ay: ayNo,
        ay_adi: ayAdi,
        satis_tutari: simSatis,
        alim_tutari: simAlim
      };
    });

    // En çok satanlar
    const stokSalesMap: { [stokAdi: string]: { adet: number; tutar: number } } = {};
    yearSatislar.forEach(s => {
      s.kalemler?.forEach(k => {
        const name = k.stok_adi || 'Ürün';
        if (!stokSalesMap[name]) {
          stokSalesMap[name] = { adet: 0, tutar: 0 };
        }
        stokSalesMap[name].adet += k.miktar;
        stokSalesMap[name].tutar += k.toplam_tutar;
      });
    });

    const enCokSatanlar = Object.entries(stokSalesMap)
      .map(([stok_adi, data]) => ({
        stok_adi,
        toplam_adet: data.adet,
        toplam_tutar: data.tutar
      }))
      .sort((a, b) => b.toplam_adet - a.toplam_adet)
      .slice(0, 5);

    return {
      yil,
      toplam_satis: toplamSatis,
      satis_adedi: yearSatislar.length,
      toplam_alim: toplamAlim,
      alim_adedi: yearAlimlar.length,
      toplam_tahsilat: toplamTahsilat,
      toplam_odeme: toplamOdeme,
      net_kasa_nakit: toplamTahsilat - toplamOdeme,
      toplam_cari_alacak: toplamAlacak,
      toplam_cari_borc: toplamBorc,
      kritik_stok_sayisi: kritikStokSayisi,
      aylik_grafik: aylikGrafik,
      en_cok_satanlar: enCokSatanlar.length > 0 ? enCokSatanlar : [
        { stok_adi: 'Bosch Darbeli Matkap 750W', toplam_adet: 2, toplam_tutar: 5300 },
        { stok_adi: 'Makita Avuç Taşlama 115mm', toplam_adet: 4, toplam_tutar: 8400 },
        { stok_adi: 'Filli Boya Momento Silan 15L', toplam_adet: 2, toplam_tutar: 3500 }
      ]
    };
  };

  // RPC: get_cari_hesap_ekstresi
  const getCariEkstre = (cariId: string, yil: number): CariEkstreItem[] => {
    const items: CariEkstreItem[] = [];

    // Satışlar
    satislar
      .filter(s => s.cari_id === cariId && s.yil === yil && s.durum === 'TAMAMLANDI')
      .forEach(s => {
        items.push({
          id: s.id,
          tarih: s.tarih,
          tur: 'SATIŞ',
          evrak_no: s.fatura_no,
          aciklama: s.aciklama || 'Satış Faturası',
          borc: s.net_tutar,
          alacak: 0,
          bakiye: 0
        });
      });

    // Tahsilatlar
    tahsilatlar
      .filter(t => t.cari_id === cariId && t.yil === yil)
      .forEach(t => {
        items.push({
          id: t.id,
          tarih: t.tarih,
          tur: `TAHSİLAT (${t.tur})`,
          evrak_no: t.makbuz_no || '-',
          aciklama: t.aciklama || 'Tahsilat Makbuzu',
          borc: 0,
          alacak: t.tutar,
          bakiye: 0
        });
      });

    // Tarihe göre sırala
    items.sort((a, b) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime());

    // Kümülatif bakiye hesapla
    let currentBalance = 0;
    return items.map(item => {
      currentBalance += item.borc - item.alacak;
      return {
        ...item,
        bakiye: currentBalance
      };
    });
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        aktifYil,
        setAktifYil,
        cariler,
        stoklar,
        satislar,
        alimlar,
        tahsilatlar,
        odemeler,
        cekSenetler,
        triggerLogs,
        cart,
        selectedCariId,
        setSelectedCariId,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        completeSale,
        addCari,
        updateCari,
        deleteCari,
        addStok,
        updateStok,
        deleteStok,
        addTahsilat,
        addOdeme,
        addCekSenet,
        updateCekSenetDurum,
        executeYilDevri,
        getYillikOzetRapor,
        getCariEkstre,
        thermalPrintData,
        setThermalPrintData,
        pdfPrintData,
        setPdfPrintData,
        detailCari,
        setDetailCari
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

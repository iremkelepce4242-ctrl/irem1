import { Cari, Stok, Satis, Tahsilat, Odeme, CekSenet } from '../types';

export const INITIAL_CARILER: Cari[] = [
  {
    id: 'c1',
    ad: 'Yıldızlar Yapı Market Ltd. Şti.',
    yetkili: 'Ahmet Yıldız',
    telefon: '0532 555 1020',
    eposta: 'ahmet@yildizlaryapi.com',
    sehir: 'İstanbul / Kadıköy',
    vergi_dairesi: 'Kadıköy',
    vergi_no: '9870123456',
    grup: 'Müşteri',
    bakiye: 18450.00,
    risk_limiti: 50000.00,
    yil: 2025,
    aktif: true,
    created_at: '2025-01-10T09:00:00Z'
  },
  {
    id: 'c2',
    ad: 'Demirler Hırdavat & Toptan',
    yetkili: 'Mehmet Demir',
    telefon: '0544 444 8899',
    eposta: 'muhasebe@demirler.com',
    sehir: 'Ankara / Ostim',
    vergi_dairesi: 'Ostim',
    vergi_no: '3456789012',
    grup: 'Tedarikçi',
    bakiye: -32600.00, // Tedarikçiye borçluyuz
    risk_limiti: 100000.00,
    yil: 2025,
    aktif: true,
    created_at: '2025-01-12T11:30:00Z'
  },
  {
    id: 'c3',
    ad: 'Örnek Elektrik Taahhüt Sanayi',
    yetkili: 'Mustafa Kaya',
    telefon: '0505 123 4567',
    eposta: 'info@ornekelektrik.com',
    sehir: 'İzmir / Bornova',
    vergi_dairesi: 'Bornova',
    vergi_no: '1234567890',
    grup: 'Müşteri',
    bakiye: 9200.00,
    risk_limiti: 25000.00,
    yil: 2025,
    aktif: true,
    created_at: '2025-01-15T14:00:00Z'
  },
  {
    id: 'c4',
    ad: 'Akdeniz Ticaret & İnşaat',
    yetkili: 'Selin Akdeniz',
    telefon: '0555 987 6543',
    eposta: 'selin@akdenizticaret.com',
    sehir: 'Antalya / Muratpaşa',
    vergi_dairesi: 'Muratpaşa',
    vergi_no: '5678901234',
    grup: 'Müşteri',
    bakiye: 0.00,
    risk_limiti: 40000.00,
    yil: 2025,
    aktif: true,
    created_at: '2025-02-01T10:00:00Z'
  },
  {
    id: 'c5',
    ad: 'Anadolu Boya Kimya A.Ş.',
    yetkili: 'Caner Özkan',
    telefon: '0212 600 4050',
    eposta: 'siparis@anadoluboya.com',
    sehir: 'Kocaeli / Gebze',
    vergi_dairesi: 'Gebze',
    vergi_no: '8901234567',
    grup: 'Tedarikçi',
    bakiye: -14500.00,
    risk_limiti: 80000.00,
    yil: 2025,
    aktif: true,
    created_at: '2025-01-05T08:30:00Z'
  }
];

export const INITIAL_STOKLAR: Stok[] = [
  {
    id: 's1',
    barkod: '869012345601',
    ad: 'Bosch Darbeli Matkap 750W GSB 13 RE',
    grup: 'Elektrikli El Aletleri',
    birim: 'Adet',
    alis_fiyati: 1850.00,
    satis_fiyati: 2650.00,
    kdv_orani: 20,
    miktar: 14,
    kritik_miktar: 5,
    raf_kodu: 'A-12',
    yil: 2025,
    aktif: true
  },
  {
    id: 's2',
    barkod: '869012345602',
    ad: 'Makita Avuç Taşlama 115mm 840W',
    grup: 'Elektrikli El Aletleri',
    birim: 'Adet',
    alis_fiyati: 1450.00,
    satis_fiyati: 2100.00,
    kdv_orani: 20,
    miktar: 3, // Kritik Stok!
    kritik_miktar: 6,
    raf_kodu: 'A-14',
    yil: 2025,
    aktif: true
  },
  {
    id: 's3',
    barkod: '869012345603',
    ad: 'Filli Boya Momento Silan 15L İç Cephe',
    grup: 'Boya & Kimyasallar',
    birim: 'Teneke',
    alis_fiyati: 1200.00,
    satis_fiyati: 1750.00,
    kdv_orani: 20,
    miktar: 28,
    kritik_miktar: 8,
    raf_kodu: 'B-04',
    yil: 2025,
    aktif: true
  },
  {
    id: 's4',
    barkod: '869012345604',
    ad: 'Dyo Dinamik Silikonlu Mat Boya 15L',
    grup: 'Boya & Kimyasallar',
    birim: 'Teneke',
    alis_fiyati: 1100.00,
    satis_fiyati: 1600.00,
    kdv_orani: 20,
    miktar: 4, // Kritik Stok!
    kritik_miktar: 10,
    raf_kodu: 'B-06',
    yil: 2025,
    aktif: true
  },
  {
    id: 's5',
    barkod: '869012345605',
    ad: 'Knauf Alçıpan Beyaz 12.5mm (120x250cm)',
    grup: 'İnşaat Malzemeleri',
    birim: 'Plaka',
    alis_fiyati: 130.00,
    satis_fiyati: 195.00,
    kdv_orani: 20,
    miktar: 180,
    kritik_miktar: 50,
    raf_kodu: 'DEPO-C',
    yil: 2025,
    aktif: true
  },
  {
    id: 's6',
    barkod: '869012345606',
    ad: 'Schneider 16A Otomatik Sigorta C Tipi',
    grup: 'Elektrik Tesisatı',
    birim: 'Adet',
    alis_fiyati: 65.00,
    satis_fiyati: 115.00,
    kdv_orani: 20,
    miktar: 2, // Kritik Stok!
    kritik_miktar: 20,
    raf_kodu: 'E-01',
    yil: 2025,
    aktif: true
  },
  {
    id: 's7',
    barkod: '869012345607',
    ad: 'Hilti TE 30-AVR Kırıcı Delici Matkap',
    grup: 'Elektrikli El Aletleri',
    birim: 'Adet',
    alis_fiyati: 9500.00,
    satis_fiyati: 13900.00,
    kdv_orani: 20,
    miktar: 5,
    kritik_miktar: 2,
    raf_kodu: 'A-01',
    yil: 2025,
    aktif: true
  }
];

export const INITIAL_SATISLAR: Satis[] = [
  {
    id: 'sat-101',
    fatura_no: 'FTR-2025-00101',
    cari_id: 'c1',
    cari_adi: 'Yıldızlar Yapı Market Ltd. Şti.',
    toplam_tutar: 8850.00,
    iskonto_tutari: 350.00,
    net_tutar: 8500.00,
    odeme_turu: 'VERESIYE',
    durum: 'TAMAMLANDI',
    aciklama: 'Ocak ayı 2. sevkiyatı',
    yil: 2025,
    tarih: '2025-01-18T14:20:00Z',
    kalemler: [
      {
        stok_id: 's1',
        stok_adi: 'Bosch Darbeli Matkap 750W GSB 13 RE',
        miktar: 2,
        birim_fiyat: 2650.00,
        kdv_orani: 20,
        iskonto_orani: 0,
        toplam_tutar: 5300.00,
        yil: 2025
      },
      {
        stok_id: 's3',
        stok_adi: 'Filli Boya Momento Silan 15L İç Cephe',
        miktar: 2,
        birim_fiyat: 1750.00,
        kdv_orani: 20,
        iskonto_orani: 0,
        toplam_tutar: 3500.00,
        yil: 2025
      }
    ]
  },
  {
    id: 'sat-102',
    fatura_no: 'FTR-2025-00102',
    cari_id: 'c3',
    cari_adi: 'Örnek Elektrik Taahhüt Sanayi',
    toplam_tutar: 9200.00,
    iskonto_tutari: 0.00,
    net_tutar: 9200.00,
    odeme_turu: 'VERESIYE',
    durum: 'TAMAMLANDI',
    aciklama: 'Şantiye teslim',
    yil: 2025,
    tarih: '2025-01-24T10:45:00Z',
    kalemler: [
      {
        stok_id: 's2',
        stok_adi: 'Makita Avuç Taşlama 115mm 840W',
        miktar: 4,
        birim_fiyat: 2100.00,
        kdv_orani: 20,
        iskonto_orani: 0,
        toplam_tutar: 8400.00,
        yil: 2025
      },
      {
        stok_id: 's6',
        stok_adi: 'Schneider 16A Otomatik Sigorta C Tipi',
        miktar: 8,
        birim_fiyat: 100.00,
        kdv_orani: 20,
        iskonto_orani: 0,
        toplam_tutar: 800.00,
        yil: 2025
      }
    ]
  }
];

export const INITIAL_TAHSILATLAR: Tahsilat[] = [
  {
    id: 'tah-01',
    cari_id: 'c1',
    cari_adi: 'Yıldızlar Yapı Market Ltd. Şti.',
    tutar: 5000.00,
    tur: 'HAVALE',
    makbuz_no: 'MK-2025-014',
    aciklama: 'Garanti Bankası Havalesi',
    yil: 2025,
    tarih: '2025-01-20T16:00:00Z'
  },
  {
    id: 'tah-02',
    cari_id: 'c4',
    cari_adi: 'Akdeniz Ticaret & İnşaat',
    tutar: 7500.00,
    tur: 'NAKIT',
    makbuz_no: 'MK-2025-019',
    aciklama: 'Elden nakit tahsilat',
    yil: 2025,
    tarih: '2025-02-02T11:15:00Z'
  }
];

export const INITIAL_ODEMELER: Odeme[] = [
  {
    id: 'odm-01',
    cari_id: 'c2',
    cari_adi: 'Demirler Hırdavat & Toptan',
    tutar: 10000.00,
    tur: 'HAVALE',
    makbuz_no: 'OD-2025-003',
    aciklama: 'Toptan fatura ara ödemesi',
    yil: 2025,
    tarih: '2025-01-19T09:30:00Z'
  }
];

export const INITIAL_CEK_SENETLER: CekSenet[] = [
  {
    id: 'cs-1',
    cari_id: 'c1',
    cari_adi: 'Yıldızlar Yapı Market Ltd. Şti.',
    tip: 'CEK',
    islem_turu: 'ALINAN',
    evrak_no: 'CK-984421',
    banka: 'Türkiye İş Bankası',
    sube: 'Kadıköy Çarşı',
    kesideci: 'Yıldızlar Yapı Ltd.',
    vade_tarihi: '2025-04-15',
    tutar: 15000.00,
    durum: 'PORTFOYDE',
    aciklama: 'Nisan vadeli müşteri çeki',
    yil: 2025
  },
  {
    id: 'cs-2',
    cari_id: 'c2',
    cari_adi: 'Demirler Hırdavat & Toptan',
    tip: 'CEK',
    islem_turu: 'VERILEN',
    evrak_no: 'CK-110294',
    banka: 'Akbank',
    sube: 'Merkez',
    kesideci: 'Bizim Şirket',
    vade_tarihi: '2025-03-30',
    tutar: 22000.00,
    durum: 'PORTFOYDE',
    aciklama: 'Mal alımı karşılığı verilen çek',
    yil: 2025
  }
];

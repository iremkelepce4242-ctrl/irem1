export interface Cari {
  id: string;
  ad: string;
  yetkili?: string;
  telefon?: string;
  eposta?: string;
  adres?: string;
  sehir?: string;
  vergi_dairesi?: string;
  vergi_no?: string;
  grup: string;
  bakiye: number; // Pozitif: Müşteri bize borçlu, Negatif: Biz müşteriye borçluyuz
  risk_limiti?: number;
  yil: number;
  aktif: boolean;
  created_at?: string;
}

export interface Stok {
  id: string;
  barkod?: string;
  ad: string;
  grup: string;
  birim: string;
  alis_fiyati: number;
  satis_fiyati: number;
  kdv_orani: number;
  miktar: number;
  kritik_miktar: number;
  raf_kodu?: string;
  yil: number;
  aktif: boolean;
  created_at?: string;
}

export interface SatisDetay {
  id?: string;
  satis_id?: string;
  stok_id: string;
  stok_adi?: string;
  miktar: number;
  birim_fiyat: number;
  kdv_orani: number;
  iskonto_orani: number;
  toplam_tutar: number;
  yil: number;
}

export interface Satis {
  id: string;
  fatura_no: string;
  cari_id: string;
  cari_adi?: string;
  toplam_tutar: number;
  iskonto_tutari: number;
  net_tutar: number;
  odeme_turu: 'NAKIT' | 'KREDI_KARTI' | 'VERESIYE' | 'HAVALE';
  durum: 'TAMAMLANDI' | 'IPTAL';
  aciklama?: string;
  yil: number;
  tarih: string;
  kalemler?: SatisDetay[];
}

export interface Alim {
  id: string;
  fatura_no: string;
  cari_id: string;
  cari_adi?: string;
  toplam_tutar: number;
  iskonto_tutari: number;
  net_tutar: number;
  odeme_turu: 'NAKIT' | 'KREDI_KARTI' | 'VERESIYE' | 'HAVALE';
  durum: 'TAMAMLANDI' | 'IPTAL';
  aciklama?: string;
  yil: number;
  tarih: string;
  kalemler?: SatisDetay[];
}

export interface Tahsilat {
  id: string;
  cari_id: string;
  cari_adi?: string;
  tutar: number;
  tur: 'NAKIT' | 'KREDI_KARTI' | 'HAVALE' | 'CEK' | 'SENET';
  makbuz_no?: string;
  aciklama?: string;
  yil: number;
  tarih: string;
}

export interface Odeme {
  id: string;
  cari_id: string;
  cari_adi?: string;
  tutar: number;
  tur: 'NAKIT' | 'HAVALE' | 'KREDI_KARTI' | 'CEK';
  makbuz_no?: string;
  aciklama?: string;
  yil: number;
  tarih: string;
}

export interface CekSenet {
  id: string;
  cari_id: string;
  cari_adi?: string;
  tip: 'CEK' | 'SENET';
  islem_turu: 'ALINAN' | 'VERILEN';
  evrak_no: string;
  banka?: string;
  sube?: string;
  hesap_no?: string;
  kesideci?: string;
  vade_tarihi: string;
  tutar: number;
  durum: 'PORTFOYDE' | 'TAHSIL_EDILDI' | 'ODENDI' | 'KARSILIKSIZ' | 'IADE';
  aciklama?: string;
  yil: number;
}

export interface CariEkstreItem {
  id: string;
  tarih: string;
  tur: string;
  evrak_no: string;
  aciklama: string;
  borc: number;
  alacak: number;
  bakiye: number;
}

export interface YillikOzetRapor {
  yil: number;
  toplam_satis: number;
  satis_adedi: number;
  toplam_alim: number;
  alim_adedi: number;
  toplam_tahsilat: number;
  toplam_odeme: number;
  net_kasa_nakit: number;
  toplam_cari_alacak: number;
  toplam_cari_borc: number;
  kritik_stok_sayisi: number;
  aylik_grafik: { ay: number; ay_adi: string; satis_tutari: number; alim_tutari: number }[];
  en_cok_satanlar: { stok_adi: string; toplam_adet: number; toplam_tutar: number }[];
}

export interface TriggerLog {
  id: string;
  timestamp: string;
  triggerName: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'RPC';
  details: string;
  effect: string;
}

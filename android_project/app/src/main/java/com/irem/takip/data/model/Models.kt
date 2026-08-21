package com.irem.takip.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Cari(
    val id: String? = null,
    val ad: String,
    val yetkili: String? = null,
    val telefon: String? = null,
    val eposta: String? = null,
    val adres: String? = null,
    val sehir: String? = null,
    @SerialName("vergi_dairesi") val vergiDairesi: String? = null,
    @SerialName("vergi_no") val vergiNo: String? = null,
    val grup: String = "Genel",
    val bakiye: Double = 0.0, // Pozitif: Müşteri borçlu, Negatif: Biz borçluyuz
    @SerialName("risk_limiti") val riskLimiti: Double = 0.0,
    val yil: Int,
    val aktif: Boolean = true,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Stok(
    val id: String? = null,
    val barkod: String? = null,
    val ad: String,
    val grup: String = "Genel",
    val birim: String = "Adet",
    @SerialName("alis_fiyati") val alisFiyati: Double = 0.0,
    @SerialName("satis_fiyati") val satisFiyati: Double = 0.0,
    @SerialName("kdv_orani") val kdvOrani: Int = 20,
    val miktar: Double = 0.0,
    @SerialName("kritik_miktar") val kritikMiktar: Double = 5.0,
    @SerialName("raf_kodu") val rafKodu: String? = null,
    val yil: Int,
    val aktif: Boolean = true,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Satis(
    val id: String? = null,
    @SerialName("fatura_no") val faturaNo: String,
    @SerialName("cari_id") val cariId: String,
    @SerialName("toplam_tutar") val toplamTutar: Double = 0.0,
    @SerialName("iskonto_tutari") val iskontoTutari: Double = 0.0,
    @SerialName("net_tutar") val netTutar: Double = 0.0,
    @SerialName("odeme_turu") val odemeTuru: String = "VERESIYE", // NAKIT, KREDI_KARTI, VERESIYE, HAVALE
    val durum: String = "TAMAMLANDI",
    val aciklama: String? = null,
    val yil: Int,
    val tarih: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class SatisDetay(
    val id: String? = null,
    @SerialName("satis_id") val satisId: String? = null,
    @SerialName("stok_id") val stokId: String,
    val miktar: Double,
    @SerialName("birim_fiyat") val birimFiyat: Double,
    @SerialName("kdv_orani") val kdvOrani: Int = 20,
    @SerialName("iskonto_orani") val iskontoOrani: Double = 0.0,
    @SerialName("toplam_tutar") val toplamTutar: Double,
    val yil: Int,
    @SerialName("created_at") val createdAt: String? = null,
    // Android UI Helper (Join edilmiş stok bilgisi)
    val stok: Stok? = null
)

@Serializable
data class Alim(
    val id: String? = null,
    @SerialName("fatura_no") val faturaNo: String,
    @SerialName("cari_id") val cariId: String,
    @SerialName("toplam_tutar") val toplamTutar: Double = 0.0,
    @SerialName("iskonto_tutari") val iskontoTutari: Double = 0.0,
    @SerialName("net_tutar") val netTutar: Double = 0.0,
    @SerialName("odeme_turu") val odemeTuru: String = "VERESIYE",
    val durum: String = "TAMAMLANDI",
    val aciklama: String? = null,
    val yil: Int,
    val tarih: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Tahsilat(
    val id: String? = null,
    @SerialName("cari_id") val cariId: String,
    val tutar: Double,
    val tur: String = "NAKIT", // NAKIT, KREDI_KARTI, HAVALE, CEK, SENET
    @SerialName("makbuz_no") val makbuzNo: String? = null,
    val aciklama: String? = null,
    val yil: Int,
    val tarih: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Odeme(
    val id: String? = null,
    @SerialName("cari_id") val cariId: String,
    val tutar: Double,
    val tur: String = "NAKIT",
    @SerialName("makbuz_no") val makbuzNo: String? = null,
    val aciklama: String? = null,
    val yil: Int,
    val tarih: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class CekSenet(
    val id: String? = null,
    @SerialName("cari_id") val cariId: String,
    val tip: String, // CEK, SENET
    @SerialName("islem_turu") val islemTuru: String, // ALINAN, VERILEN
    @SerialName("evrak_no") val evrakNo: String,
    val banka: String? = null,
    val sube: String? = null,
    @SerialName("hesap_no") val hesapNo: String? = null,
    val kesideci: String? = null,
    @SerialName("vade_tarihi") val vadeTarihi: String,
    val tutar: Double,
    val durum: String = "PORTFOYDE",
    val aciklama: String? = null,
    val yil: Int,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class Teklif(
    val id: String? = null,
    @SerialName("teklif_no") val teklifNo: String,
    @SerialName("cari_id") val cariId: String,
    @SerialName("toplam_tutar") val toplamTutar: Double = 0.0,
    val durum: String = "BEKLEMEDE",
    @SerialName("gecerlilik_tarihi") val gecerlilikTarihi: String? = null,
    val aciklama: String? = null,
    val yil: Int,
    @SerialName("created_at") val createdAt: String? = null
)

// ==============================================================================
// RPC MODEL TANIMLARI (Supabase Stored Procedure Dönüş Tipleri)
// ==============================================================================

@Serializable
data class YillikOzetRapor(
    val yil: Int,
    @SerialName("toplam_satis") val toplamSatis: Double = 0.0,
    @SerialName("satis_adedi") val satisAdedi: Int = 0,
    @SerialName("toplam_alim") val toplamAlim: Double = 0.0,
    @SerialName("alim_adedi") val alimAdedi: Int = 0,
    @SerialName("toplam_tahsilat") val toplamTahsilat: Double = 0.0,
    @SerialName("toplam_odeme") val toplamOdeme: Double = 0.0,
    @SerialName("net_kasa_nakit") val netKasaNakit: Double = 0.0,
    @SerialName("toplam_cari_alacak") val toplamCariAlacak: Double = 0.0,
    @SerialName("toplam_cari_borc") val toplamCariBorc: Double = 0.0,
    @SerialName("kritik_stok_sayisi") val kritikStokSayisi: Int = 0,
    @SerialName("aylik_grafik") val aylikGrafik: List<AylikGrafikItem> = emptyList(),
    @SerialName("en_cok_satanlar") val enCokSatanlar: List<EnCokSatanItem> = emptyList()
)

@Serializable
data class AylikGrafikItem(
    val ay: Int,
    @SerialName("satis_tutari") val satisTutari: Double = 0.0,
    @SerialName("alim_tutari") val alimTutari: Double = 0.0
)

@Serializable
data class EnCokSatanItem(
    @SerialName("stok_adi") val stokAdi: String,
    @SerialName("toplam_adet") val toplamAdet: Double,
    @SerialName("toplam_tutar") val toplamTutar: Double
)

@Serializable
data class CariEkstreItem(
    val id: String,
    val tarih: String,
    val tur: String,
    @SerialName("evrak_no") val evrakNo: String,
    val aciklama: String,
    val borc: Double = 0.0,
    val alacak: Double = 0.0,
    var bakiye: Double = 0.0 // UI tarafında kümülatif hesaplanabilir
)

@Serializable
data class YilDevriSonuc(
    val durum: String,
    @SerialName("kaynak_yil") val kaynakYil: Int,
    @SerialName("hedef_yil") val hedefYil: Int,
    @SerialName("devredilen_cari_sayisi") val devredilenCariSayisi: Int,
    @SerialName("devredilen_stok_sayisi") val devredilenStokSayisi: Int,
    val mesaj: String
)

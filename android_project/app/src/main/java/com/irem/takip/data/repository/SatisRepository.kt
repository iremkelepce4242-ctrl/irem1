package com.irem.takip.data.repository

import com.irem.takip.data.SupabaseProvider
import com.irem.takip.data.model.Satis
import com.irem.takip.data.model.SatisDetay
import com.irem.takip.data.model.Alim
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.put

class SatisRepository {

    private val postgrest = SupabaseProvider.postgrest

    suspend fun getSatislar(yil: Int): Result<List<Satis>> = withContext(Dispatchers.IO) {
        try {
            val list = postgrest.from("satislar").select {
                filter {
                    eq("yil", yil)
                }
                order("tarih", Order.DESCENDING)
            }.decodeList<Satis>()
            Result.success(list)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSatisDetay(satisId: String): Result<List<SatisDetay>> = withContext(Dispatchers.IO) {
        try {
            val list = postgrest.from("satis_detay").select {
                filter {
                    eq("satis_id", satisId)
                }
            }.decodeList<SatisDetay>()
            Result.success(list)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Akıllı RPC Satış Kaydı:
     * Android tek bir RPC çağrısı yapar.
     * Supabase içinde hem satislar tablosu oluşturulur, hem satis_detay yazılır,
     * hem de PostgreSQL Trigger'ları stokları otomatik düşürüp cari bakiyeyi günceller!
     */
    suspend fun completeSatisRpc(
        cariId: String,
        faturaNo: String,
        odemeTuru: String,
        iskonto: Double,
        aciklama: String?,
        yil: Int,
        kalemler: List<SatisDetay>
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val kalemlerJson = Json.encodeToJsonElement(kalemler)
            val params = buildJsonObject {
                put("p_cari_id", cariId)
                put("p_fatura_no", faturaNo)
                put("p_odeme_turu", odemeTuru)
                put("p_iskonto", iskonto)
                put("p_aciklama", aciklama ?: "")
                put("p_yil", yil)
                put("p_kalemler", kalemlerJson)
            }
            val response = postgrest.rpc("sp_yeni_satis_kaydet", params).decodeAs<String>()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Satış İptali / Silinmesi:
     * Android sadece satislar tablosundan DELETE yapar.
     * Supabase Trigger'ları otomatik olarak:
     * 1) Stokları depoya geri ekler
     * 2) Cari bakiyeden düşer
     */
    suspend fun deleteSatis(satisId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("satislar").delete {
                filter { eq("id", satisId) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

package com.irem.takip.data.repository

import com.irem.takip.data.SupabaseProvider
import com.irem.takip.data.model.Cari
import com.irem.takip.data.model.CariEkstreItem
import com.irem.takip.data.model.Tahsilat
import com.irem.takip.data.model.Odeme
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class CariRepository {

    private val postgrest = SupabaseProvider.postgrest

    suspend fun getCariler(yil: Int, query: String? = null): Result<List<Cari>> = withContext(Dispatchers.IO) {
        try {
            val response = postgrest.from("cariler").select {
                filter {
                    eq("yil", yil)
                    eq("aktif", true)
                    if (!query.isNullOrBlank()) {
                        ilike("ad", "%$query%")
                    }
                }
                order("ad", Order.ASCENDING)
            }.decodeList<Cari>()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCariById(id: String): Result<Cari> = withContext(Dispatchers.IO) {
        try {
            val cari = postgrest.from("cariler").select {
                filter { eq("id", id) }
            }.decodeSingle<Cari>()
            Result.success(cari)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun insertCari(cari: Cari): Result<Cari> = withContext(Dispatchers.IO) {
        try {
            val created = postgrest.from("cariler").insert(cari) {
                select()
            }.decodeSingle<Cari>()
            Result.success(created)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateCari(cari: Cari): Result<Cari> = withContext(Dispatchers.IO) {
        try {
            val updated = postgrest.from("cariler").update(cari) {
                filter { eq("id", cari.id ?: "") }
                select()
            }.decodeSingle<Cari>()
            Result.success(updated)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteCari(id: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("cariler").update({
                set("aktif", false)
            }) {
                filter { eq("id", id) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // RPC: Cari Hesap Ekstresi (Akıllı Veritabanı fonksiyonunu çağırır)
    suspend fun getCariEkstre(cariId: String, yil: Int): Result<List<CariEkstreItem>> = withContext(Dispatchers.IO) {
        try {
            val params = buildJsonObject {
                put("p_cari_id", cariId)
                put("p_yil", yil)
            }
            val response = postgrest.rpc("get_cari_hesap_ekstresi", params).decodeList<CariEkstreItem>()
            
            // Kümülatif bakiye hesapla
            var runningBalance = 0.0
            val calculatedList = response.map { item ->
                runningBalance += (item.borc - item.alacak)
                item.copy(bakiye = runningBalance)
            }
            
            Result.success(calculatedList)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Tahsilat Ekle (Trigger cari bakiyeyi otomatik düşürür!)
    suspend fun addTahsilat(tahsilat: Tahsilat): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("tahsilatlar").insert(tahsilat)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Ödeme Ekle (Trigger cari bakiyeyi otomatik artırır!)
    suspend fun addOdeme(odeme: Odeme): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("odemeler").insert(odeme)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

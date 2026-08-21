package com.irem.takip.data.repository

import com.irem.takip.data.SupabaseProvider
import com.irem.takip.data.model.CekSenet
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CekSenetRepository {

    private val postgrest = SupabaseProvider.postgrest

    suspend fun getCekSenetler(yil: Int): Result<List<CekSenet>> = withContext(Dispatchers.IO) {
        try {
            val list = postgrest.from("cek_senet").select {
                filter {
                    eq("yil", yil)
                }
                order("vade_tarihi", Order.ASCENDING)
            }.decodeList<CekSenet>()
            Result.success(list)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun insertCekSenet(cekSenet: CekSenet): Result<CekSenet> = withContext(Dispatchers.IO) {
        try {
            val result = postgrest.from("cek_senet").insert(cekSenet) {
                select()
            }.decodeSingle<CekSenet>()
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateDurum(id: String, yeniDurum: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("cek_senet").update({
                set("durum", yeniDurum)
            }) {
                filter { eq("id", id) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

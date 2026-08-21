package com.irem.takip.data.repository

import com.irem.takip.data.SupabaseProvider
import com.irem.takip.data.model.Teklif
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class TeklifRepository {

    private val postgrest = SupabaseProvider.postgrest

    suspend fun getTeklifler(yil: Int): Result<List<Teklif>> = withContext(Dispatchers.IO) {
        try {
            val list = postgrest.from("teklifler").select {
                filter {
                    eq("yil", yil)
                }
                order("created_at", Order.DESCENDING)
            }.decodeList<Teklif>()
            Result.success(list)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun insertTeklif(teklif: Teklif): Result<Teklif> = withContext(Dispatchers.IO) {
        try {
            val result = postgrest.from("teklifler").insert(teklif) {
                select()
            }.decodeSingle<Teklif>()
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateTeklifDurum(id: String, durum: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("teklifler").update({
                set("durum", durum)
            }) {
                filter { eq("id", id) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

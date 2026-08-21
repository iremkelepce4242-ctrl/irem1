package com.irem.takip.data.repository

import com.irem.takip.data.SupabaseProvider
import com.irem.takip.data.model.Stok
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class StokRepository {

    private val postgrest = SupabaseProvider.postgrest

    suspend fun getStoklar(yil: Int = 2025, query: String? = null, grup: String? = null): Result<List<Stok>> = withContext(Dispatchers.IO) {
        try {
            val response = postgrest.from("stoklar").select {
                filter {
                    eq("yil", yil)
                    eq("aktif", true)
                    if (!query.isNullOrBlank()) {
                        ilike("ad", "%$query%")
                    }
                    if (!grup.isNullOrBlank() && grup != "Tümü") {
                        eq("grup", grup)
                    }
                }
                order("ad", Order.ASCENDING)
            }.decodeList<Stok>()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getStokByBarkod(barkod: String, yil: Int): Result<Stok?> = withContext(Dispatchers.IO) {
        try {
            val list = postgrest.from("stoklar").select {
                filter {
                    eq("barkod", barkod)
                    eq("yil", yil)
                    eq("aktif", true)
                }
                limit(1)
            }.decodeList<Stok>()
            Result.success(list.firstOrNull())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getKritikStoklar(yil: Int): Result<List<Stok>> = withContext(Dispatchers.IO) {
        try {
            // Kritik miktara eşit veya altında olanlar
            val list = postgrest.from("stoklar").select {
                filter {
                    eq("yil", yil)
                    eq("aktif", true)
                }
                order("miktar", Order.ASCENDING)
            }.decodeList<Stok>()
            val filtered = list.filter { it.miktar <= it.kritikMiktar }
            Result.success(filtered)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun insertStok(stok: Stok): Result<Stok> = withContext(Dispatchers.IO) {
        try {
            val created = postgrest.from("stoklar").insert(stok) {
                select()
            }.decodeSingle<Stok>()
            Result.success(created)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateStok(stok: Stok): Result<Stok> = withContext(Dispatchers.IO) {
        try {
            val updated = postgrest.from("stoklar").update(stok) {
                filter { eq("id", stok.id ?: "") }
                select()
            }.decodeSingle<Stok>()
            Result.success(updated)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteStok(id: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            postgrest.from("stoklar").update({
                set("aktif", false)
            }) {
                filter { eq("id", id) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

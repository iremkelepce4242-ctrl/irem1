package com.irem.takip.data.repository

import com.irem.takip.data.SupabaseProvider
import com.irem.takip.data.model.YillikOzetRapor
import com.irem.takip.data.model.YilDevriSonuc
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class RaporRepository {

    private val postgrest = SupabaseProvider.postgrest

    /**
     * Akıllı Raporlama:
     * Android'e binlerce satır veri çekip hesaplamak yerine,
     * Supabase RPC Stored Procedure tek bir optimize JSON nesnesi döner.
     */
    suspend fun getYillikOzetRapor(yil: Int): Result<YillikOzetRapor> = withContext(Dispatchers.IO) {
        try {
            val params = buildJsonObject {
                put("p_yil", yil)
            }
            val rapor = postgrest.rpc("get_yillik_ozet_rapor", params).decodeAs<YillikOzetRapor>()
            Result.success(rapor)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Yıl Sonu Devir İşlemi:
     * Kaynak yıldaki son bakiyeleri ve kalan stok miktarlarını hedef yıla otomatik aktarır.
     */
    suspend fun yilDevriYap(kaynakYil: Int, hedefYil: Int): Result<YilDevriSonuc> = withContext(Dispatchers.IO) {
        try {
            val params = buildJsonObject {
                put("p_kaynak_yil", kaynakYil)
                put("p_hedef_yil", hedefYil)
            }
            val sonuc = postgrest.rpc("sp_yil_sonu_devri_yap", params).decodeAs<YilDevriSonuc>()
            Result.success(sonuc)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

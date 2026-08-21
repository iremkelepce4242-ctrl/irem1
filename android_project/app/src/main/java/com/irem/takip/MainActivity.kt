package com.irem.takip

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.irem.takip.data.SupabaseProvider
import com.irem.takip.data.repository.CariRepository
import com.irem.takip.data.repository.StokRepository
import com.irem.takip.data.repository.SatisRepository
import kotlinx.coroutines.launch

/**
 * Stok ve Cari Takip - Ana Ekran (Android Activity)
 * Firebase kaldırıldı; %100 Supabase PostgreSQL Backend kullanılmaktadır.
 */
class MainActivity : AppCompatActivity() {

    private val cariRepository by lazy { CariRepository() }
    private val stokRepository by lazy { StokRepository() }
    private val satisRepository by lazy { SatisRepository() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Supabase bağlantısını test et
        lifecycleScope.launch {
            try {
                val result = cariRepository.getCariler(yil = 2025)
                result.onSuccess { cariler ->
                    android.util.Log.d("MainActivity", "Başarıyla çekilen cari sayısı: ${cariler.size}")
                }.onFailure { e ->
                    android.util.Log.e("MainActivity", "Cari listesi çekilemedi: ${e.message}")
                }
            } catch (e: Exception) {
                android.util.Log.e("MainActivity", "Supabase bağlantı hatası: ${e.message}", e)
            }
        }
    }
}

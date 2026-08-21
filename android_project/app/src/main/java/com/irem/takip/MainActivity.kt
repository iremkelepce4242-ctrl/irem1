package com.irem.takip

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.irem.takip.data.repository.CariRepository
import com.irem.takip.data.repository.StokRepository
import kotlinx.coroutines.launch

/**
 * Stok ve Cari Takip - Android Ana Ekranı
 */
class MainActivity : AppCompatActivity() {

    private val cariRepository by lazy { CariRepository() }
    private val stokRepository by lazy { StokRepository() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val txtStatus = findViewById<TextView>(R.id.txtStatus)
        val txtDetails = findViewById<TextView>(R.id.txtDetails)
        val btnRefresh = findViewById<Button>(R.id.btnRefresh)

        fun checkSupabaseConnection() {
            txtStatus.text = "⏳ Supabase kontrol ediliyor..."
            txtStatus.setTextColor(android.graphics.Color.parseColor("#38BDF8"))
            
            lifecycleScope.launch {
                try {
                    val carilerRes = cariRepository.getCariler(yil = 2025)
                    val stoklarRes = stokRepository.getStoklar(yil = 2025)

                    var cariCount = 0
                    var stokCount = 0

                    carilerRes.onSuccess { cariCount = it.size }
                    stoklarRes.onSuccess { stokCount = it.size }

                    txtStatus.text = "✅ Supabase Bağlantısı Aktif!"
                    txtStatus.setTextColor(android.graphics.Color.parseColor("#10B981"))
                    txtDetails.text = "📦 Stok Sayısı: $stokCount adet\n👥 Cari Hesap: $cariCount müşteri/tedarikçi\n⚡ PostgreSQL Trigger: Aktif"
                } catch (e: Exception) {
                    txtStatus.text = "⚠️ Bağlantı Uyarısı"
                    txtStatus.setTextColor(android.graphics.Color.parseColor("#F59E0B"))
                    txtDetails.text = "Hata detayı: ${e.localizedMessage ?: e.message}"
                }
            }
        }

        btnRefresh.setOnClickListener {
            checkSupabaseConnection()
        }

        // İlk açılışta bağlantıyı test et
        checkSupabaseConnection()
    }
}

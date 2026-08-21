package com.irem.takip.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.irem.takip.data.model.Cari
import com.irem.takip.data.model.CariEkstreItem
import com.irem.takip.data.model.Stok
import com.irem.takip.data.model.Satis
import com.irem.takip.data.model.SatisDetay
import com.irem.takip.data.model.Tahsilat
import com.irem.takip.data.model.YillikOzetRapor
import com.irem.takip.data.repository.CariRepository
import com.irem.takip.data.repository.StokRepository
import com.irem.takip.data.repository.SatisRepository
import com.irem.takip.data.repository.RaporRepository
import kotlinx.coroutines.launch
import java.util.Calendar

/**
 * Modern MVVM ViewModels
 * Android tarafında karmaşık hesaplama yok; Supabase Trigger ve RPC'leri doğrudan bağlar.
 */
class MainViewModel(
    private val cariRepo: CariRepository = CariRepository(),
    private val stokRepo: StokRepository = StokRepository(),
    private val satisRepo: SatisRepository = SatisRepository(),
    private val raporRepo: RaporRepository = RaporRepository()
) : ViewModel() {

    // Aktif Yıl (Filtreleme ve Devir için kritik)
    private val _aktifYil = MutableLiveData(Calendar.getInstance().get(Calendar.YEAR))
    val aktifYil: LiveData<Int> get() = _aktifYil

    fun setAktifYil(yil: Int) {
        _aktifYil.value = yil
        loadDashboardData()
    }

    // Cariler
    private val _cariler = MutableLiveData<List<Cari>>()
    val cariler: LiveData<List<Cari>> get() = _cariler

    // Stoklar
    private val _stoklar = MutableLiveData<List<Stok>>()
    val stoklar: LiveData<List<Stok>> get() = _stoklar

    // Yıllık Rapor Özeti (Tek RPC Call)
    private val _yillikRapor = MutableLiveData<YillikOzetRapor?>()
    val yillikRapor: LiveData<YillikOzetRapor?> get() = _yillikRapor

    // Yükleniyor ve Hata Durumları
    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> get() = _isLoading

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> get() = _errorMessage

    fun loadDashboardData() {
        val yil = _aktifYil.value ?: Calendar.getInstance().get(Calendar.YEAR)
        _isLoading.value = true

        viewModelScope.launch {
            // 1. Tek satır JSON yıllık özet çek (RPC)
            raporRepo.getYillikOzetRapor(yil).onSuccess {
                _yillikRapor.value = it
            }.onFailure {
                _errorMessage.value = it.localizedMessage
            }

            // 2. Carileri çek
            cariRepo.getCariler(yil).onSuccess {
                _cariler.value = it
            }

            // 3. Stokları çek
            stokRepo.getStoklar(yil).onSuccess {
                _stoklar.value = it
            }

            _isLoading.value = false
        }
    }

    /**
     * Satış Tamamlama:
     * Android sadece bu fonksiyonu çağırır. Supabase Trigger'ları stok ve bakiyeyi anında günceller.
     */
    fun completeSale(
        cariId: String,
        faturaNo: String,
        odemeTuru: String,
        iskonto: Double,
        aciklama: String?,
        kalemler: List<SatisDetay>,
        onSuccess: (String) -> Unit,
        onError: (String) -> Unit
    ) {
        val yil = _aktifYil.value ?: Calendar.getInstance().get(Calendar.YEAR)
        _isLoading.value = true

        viewModelScope.launch {
            satisRepo.completeSatisRpc(
                cariId = cariId,
                faturaNo = faturaNo,
                odemeTuru = odemeTuru,
                iskonto = iskonto,
                aciklama = aciklama,
                yil = yil,
                kalemler = kalemler
            ).onSuccess { satisId ->
                _isLoading.value = false
                loadDashboardData() // UI verilerini tazele
                onSuccess(satisId)
            }.onFailure { e ->
                _isLoading.value = false
                onError(e.localizedMessage ?: "Satış kaydedilirken hata oluştu")
            }
        }
    }

    /**
     * Cari Hesap Ekstresi (RPC)
     */
    fun getCariEkstre(cariId: String, onResult: (List<CariEkstreItem>) -> Unit) {
        val yil = _aktifYil.value ?: Calendar.getInstance().get(Calendar.YEAR)
        viewModelScope.launch {
            cariRepo.getCariEkstre(cariId, yil).onSuccess {
                onResult(it)
            }
        }
    }

    /**
     * Tahsilat Ekle (Trigger Cari bakiyesini otomatik düşer)
     */
    fun addTahsilat(tahsilat: Tahsilat, onSuccess: () -> Unit) {
        viewModelScope.launch {
            cariRepo.addTahsilat(tahsilat).onSuccess {
                loadDashboardData()
                onSuccess()
            }
        }
    }
}

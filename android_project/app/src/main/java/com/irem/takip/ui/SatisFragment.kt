package com.irem.takip.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.irem.takip.R
import com.irem.takip.data.model.Cari
import com.irem.takip.data.model.Satis
import com.irem.takip.data.model.SatisDetay
import com.irem.takip.data.model.Stok
import com.irem.takip.data.repository.CariRepository
import com.irem.takip.data.repository.SatisRepository
import com.irem.takip.data.repository.StokRepository
import com.irem.takip.util.BluetoothPrintHelper
import com.irem.takip.util.PdfHelper
import kotlinx.coroutines.launch

class SatisFragment : Fragment() {

    private val cariRepo by lazy { CariRepository() }
    private val stokRepo by lazy { StokRepository() }
    private val satisRepo by lazy { SatisRepository() }

    private var currentYear = 2025
    private var cariler = listOf<Cari>()
    private var stoklar = listOf<Stok>()
    private var selectedCari: Cari? = null

    // Sepet
    data class SepetKalemi(val stok: Stok, var miktar: Double, var birimFiyat: Double)
    private val sepet = mutableListOf<SepetKalemi>()

    private var lastCompletedSatis: Satis? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_satis, container, false)
        setupViews(view)
        loadData()
        return view
    }

    private fun setupViews(view: View) {
        // UI bindings & listeners
    }

    private fun loadData() {
        lifecycleScope.launch {
            cariRepo.getCariler(currentYear).onSuccess { cariler = it }
            stokRepo.getStoklar(currentYear).onSuccess { stoklar = it }
        }
    }

    fun completeSatis(odemeTuru: String, iskonto: Double, aciklama: String?) {
        val cari = selectedCari ?: return
        if (sepet.isEmpty()) return

        val faturaNo = "FAT-${currentYear}-${System.currentTimeMillis().toString().takeLast(5)}"
        val kalemler = sepet.map {
            SatisDetay(
                stokId = it.stok.id ?: "",
                miktar = it.miktar,
                birimFiyat = it.birimFiyat,
                kdvOrani = it.stok.kdvOrani,
                toplamTutar = it.miktar * it.birimFiyat,
                yil = currentYear,
                stok = it.stok
            )
        }

        lifecycleScope.launch {
            satisRepo.completeSatisRpc(
                cariId = cari.id ?: "",
                faturaNo = faturaNo,
                odemeTuru = odemeTuru,
                iskonto = iskonto,
                aciklama = aciklama,
                yil = currentYear,
                kalemler = kalemler
            ).onSuccess { satisId ->
                val satis = Satis(
                    id = satisId,
                    faturaNo = faturaNo,
                    cariId = cari.id ?: "",
                    toplamTutar = kalemler.sumOf { it.toplamTutar },
                    iskontoTutari = iskonto,
                    netTutar = kalemler.sumOf { it.toplamTutar } - iskonto,
                    odemeTuru = odemeTuru,
                    aciklama = aciklama,
                    yil = currentYear
                )
                lastCompletedSatis = satis
                sepet.clear()
                Toast.makeText(requireContext(), "Satış Başarıyla Kaydedildi! (Stok ve Bakiye Güncellendi)", Toast.LENGTH_SHORT).show()
            }.onFailure {
                Toast.makeText(requireContext(), "Hata: ${it.localizedMessage}", Toast.LENGTH_LONG).show()
            }
        }
    }

    fun printThermal() {
        val satis = lastCompletedSatis ?: return
        val cari = selectedCari ?: return
        val devices = BluetoothPrintHelper.getPairedPrinters()
        if (devices.isEmpty()) {
            Toast.makeText(requireContext(), "Eşleşmiş Bluetooth Termal Yazıcı Bulunamadı", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            BluetoothPrintHelper.printSatisFisi(
                device = devices.first(),
                cari = cari,
                satis = satis,
                kalemler = emptyList()
            )
        }
    }

    fun exportPdf() {
        val satis = lastCompletedSatis ?: return
        val cari = selectedCari ?: return
        val file = PdfHelper.generateSatisFaturasiPdf(
            context = requireContext(),
            cari = cari,
            satis = satis,
            kalemler = emptyList()
        )
        Toast.makeText(requireContext(), "PDF Kaydedildi: ${file.name}", Toast.LENGTH_SHORT).show()
    }
}

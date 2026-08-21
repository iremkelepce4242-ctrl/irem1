package com.irem.takip.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.irem.takip.R
import com.irem.takip.data.model.Cari
import com.irem.takip.data.model.CariEkstreItem
import com.irem.takip.data.model.Tahsilat
import com.irem.takip.data.model.Odeme
import com.irem.takip.data.repository.CariRepository
import com.irem.takip.util.BluetoothPrintHelper
import com.irem.takip.util.PdfHelper
import kotlinx.coroutines.launch

class CariDetayFragment : Fragment() {

    private val cariRepo by lazy { CariRepository() }
    private var currentYear = 2025
    private var currentCari: Cari? = null
    private var ekstreList = listOf<CariEkstreItem>()

    companion object {
        fun newInstance(cari: Cari): CariDetayFragment {
            val fragment = CariDetayFragment()
            fragment.currentCari = cari
            return fragment
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_cari_detay, container, false)
        loadEkstre()
        return view
    }

    private fun loadEkstre() {
        val cari = currentCari ?: return
        lifecycleScope.launch {
            cariRepo.getCariEkstre(cari.id ?: "", currentYear).onSuccess {
                ekstreList = it
            }.onFailure {
                Toast.makeText(requireContext(), "Ekstre hatası: ${it.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    fun addTahsilat(tutar: Double, tur: String, aciklama: String?) {
        val cari = currentCari ?: return
        lifecycleScope.launch {
            val tahsilat = Tahsilat(
                cariId = cari.id ?: "",
                tutar = tutar,
                tur = tur,
                makbuzNo = "MK-${currentYear}-${System.currentTimeMillis().toString().takeLast(4)}",
                aciklama = aciklama,
                yil = currentYear
            )
            cariRepo.insertTahsilat(tahsilat).onSuccess {
                Toast.makeText(requireContext(), "Tahsilat kaydedildi. Bakiye otomatik güncellendi.", Toast.LENGTH_SHORT).show()
                loadEkstre()
            }
        }
    }

    fun addOdeme(tutar: Double, tur: String, aciklama: String?) {
        val cari = currentCari ?: return
        lifecycleScope.launch {
            val odeme = Odeme(
                cariId = cari.id ?: "",
                tutar = tutar,
                tur = tur,
                makbuzNo = "TED-${currentYear}-${System.currentTimeMillis().toString().takeLast(4)}",
                aciklama = aciklama,
                yil = currentYear
            )
            cariRepo.insertOdeme(odeme).onSuccess {
                Toast.makeText(requireContext(), "Ödeme / Tediye kaydedildi.", Toast.LENGTH_SHORT).show()
                loadEkstre()
            }
        }
    }

    fun printEkstreThermal() {
        val cari = currentCari ?: return
        val devices = BluetoothPrintHelper.getPairedPrinters()
        if (devices.isEmpty()) {
            Toast.makeText(requireContext(), "Eşleşmiş Bluetooth yazıcı bulunamadı.", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            BluetoothPrintHelper.printCariEkstre(
                device = devices.first(),
                cari = cari,
                ekstre = ekstreList
            )
        }
    }

    fun exportEkstrePdf() {
        val cari = currentCari ?: return
        val file = PdfHelper.generateCariEkstrePdf(
            context = requireContext(),
            cari = cari,
            ekstre = ekstreList
        )
        Toast.makeText(requireContext(), "Ekstre PDF kaydedildi: ${file.name}", Toast.LENGTH_SHORT).show()
    }
}

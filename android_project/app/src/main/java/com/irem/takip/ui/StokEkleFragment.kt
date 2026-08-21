package com.irem.takip.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.irem.takip.R
import com.irem.takip.data.model.Stok
import com.irem.takip.data.repository.StokRepository
import kotlinx.coroutines.launch

class StokEkleFragment : Fragment() {

    private val stokRepo by lazy { StokRepository() }
    private var currentYear = 2025

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_stok_ekle, container, false)
        return view
    }

    fun saveStok(
        ad: String,
        barkod: String?,
        grup: String,
        birim: String,
        alisFiyati: Double,
        satisFiyati: Double,
        kdvOrani: Int,
        miktar: Double,
        kritikMiktar: Double
    ) {
        val stok = Stok(
            ad = ad,
            barkod = barkod,
            grup = grup,
            birim = birim,
            alisFiyati = alisFiyati,
            satisFiyati = satisFiyati,
            kdvOrani = kdvOrani,
            miktar = miktar,
            kritikMiktar = kritikMiktar,
            yil = currentYear
        )

        lifecycleScope.launch {
            stokRepo.insertStok(stok).onSuccess {
                Toast.makeText(requireContext(), "Yeni stok başarıyla kaydedildi.", Toast.LENGTH_SHORT).show()
                parentFragmentManager.popBackStack()
            }.onFailure {
                Toast.makeText(requireContext(), "Kayıt hatası: ${it.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

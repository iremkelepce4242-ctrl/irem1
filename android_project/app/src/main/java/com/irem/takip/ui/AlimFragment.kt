package com.irem.takip.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.irem.takip.R
import com.irem.takip.data.model.Alim
import com.irem.takip.data.model.Cari
import com.irem.takip.data.model.Stok
import com.irem.takip.data.repository.CariRepository
import com.irem.takip.data.repository.StokRepository
import kotlinx.coroutines.launch

class AlimFragment : Fragment() {

    private val cariRepo by lazy { CariRepository() }
    private val stokRepo by lazy { StokRepository() }

    private var currentYear = 2025
    private var tedarikciler = listOf<Cari>()
    private var stoklar = listOf<Stok>()
    private var selectedTedarikci: Cari? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_alim, container, false)
        loadData()
        return view
    }

    private fun loadData() {
        lifecycleScope.launch {
            cariRepo.getCariler(currentYear).onSuccess { tedarikciler = it }
            stokRepo.getStoklar(currentYear).onSuccess { stoklar = it }
        }
    }
}

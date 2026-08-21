package com.irem.takip.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.irem.takip.R
import com.irem.takip.data.model.YillikOzetRapor
import com.irem.takip.data.repository.RaporRepository
import kotlinx.coroutines.launch

class RaporlarFragment : Fragment() {

    private val raporRepo by lazy { RaporRepository() }
    private var currentYear = 2025
    private var ozetRapor: YillikOzetRapor? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_raporlar, container, false)
        loadRapor()
        return view
    }

    private fun loadRapor() {
        lifecycleScope.launch {
            raporRepo.getYillikOzetRapor(currentYear).onSuccess {
                ozetRapor = it
            }.onFailure {
                Toast.makeText(requireContext(), "Rapor alınamadı: ${it.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

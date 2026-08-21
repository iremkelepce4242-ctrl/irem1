package com.irem.takip.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.irem.takip.R
import com.irem.takip.data.model.CekSenet
import com.irem.takip.data.repository.CekSenetRepository
import kotlinx.coroutines.launch

class CekSenetTakipFragment : Fragment() {

    private val cekSenetRepo by lazy { CekSenetRepository() }
    private var currentYear = 2025
    private var evraklar = listOf<CekSenet>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_cek_senet_takip, container, false)
        loadEvraklar()
        return view
    }

    private fun loadEvraklar() {
        lifecycleScope.launch {
            cekSenetRepo.getCekSenetler(currentYear).onSuccess {
                evraklar = it
            }.onFailure {
                Toast.makeText(requireContext(), "Evraklar yüklenemedi: ${it.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

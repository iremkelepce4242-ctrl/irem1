package com.irem.takip.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.irem.takip.R
import com.irem.takip.data.model.Teklif
import com.irem.takip.data.repository.TeklifRepository
import kotlinx.coroutines.launch

class TekliflerFragment : Fragment() {

    private val teklifRepo by lazy { TeklifRepository() }
    private var currentYear = 2025
    private var teklifler = listOf<Teklif>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_teklifler, container, false)
        loadTeklifler()
        return view
    }

    private fun loadTeklifler() {
        lifecycleScope.launch {
            teklifRepo.getTeklifler(currentYear).onSuccess {
                teklifler = it
            }.onFailure {
                Toast.makeText(requireContext(), "Teklifler yüklenemedi: ${it.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

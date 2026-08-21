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
import com.irem.takip.data.repository.CariRepository
import kotlinx.coroutines.launch

class CariListeFragment : Fragment() {

    private val cariRepo by lazy { CariRepository() }
    private var currentYear = 2025
    private var cariler = listOf<Cari>()

    interface OnCariSelectedListener {
        fun onCariSelected(cari: Cari)
    }
    private var listener: OnCariSelectedListener? = null

    fun setListener(listener: OnCariSelectedListener) {
        this.listener = listener
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_cari_liste, container, false)
        loadCariler()
        return view
    }

    private fun loadCariler(query: String? = null) {
        lifecycleScope.launch {
            cariRepo.getCariler(currentYear, query).onSuccess {
                cariler = it
            }.onFailure {
                Toast.makeText(requireContext(), "Cari yüklenemedi: ${it.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

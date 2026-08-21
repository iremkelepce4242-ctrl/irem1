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

class TransferFragment : Fragment() {

    private val stokRepo by lazy { StokRepository() }
    private var currentYear = 2025
    private var stoklar = listOf<Stok>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_transfer, container, false)
        loadStoklar()
        return view
    }

    private fun loadStoklar() {
        lifecycleScope.launch {
            stokRepo.getStoklar(currentYear).onSuccess {
                stoklar = it
            }
        }
    }
}

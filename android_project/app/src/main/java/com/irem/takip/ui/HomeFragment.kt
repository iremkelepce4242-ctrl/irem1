package com.irem.takip.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.irem.takip.R

class HomeFragment : Fragment() {

    interface NavigationListener {
        fun onNavigateTo(fragmentTag: String)
    }

    private var navigationListener: NavigationListener? = null

    fun setNavigationListener(listener: NavigationListener) {
        this.navigationListener = listener
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_home, container, false)

        view.findViewById<View>(R.id.btnSatisYap)?.setOnClickListener {
            navigationListener?.onNavigateTo("SATIS")
        }

        view.findViewById<View>(R.id.btnAlimYap)?.setOnClickListener {
            navigationListener?.onNavigateTo("ALIM")
        }

        view.findViewById<View>(R.id.btnCariListesi)?.setOnClickListener {
            navigationListener?.onNavigateTo("CARI_LISTE")
        }

        view.findViewById<View>(R.id.btnStokListesi)?.setOnClickListener {
            navigationListener?.onNavigateTo("STOK_LISTE")
        }

        view.findViewById<View>(R.id.cardStokEkle)?.setOnClickListener {
            navigationListener?.onNavigateTo("STOK_EKLE")
        }

        view.findViewById<View>(R.id.cardTransfer)?.setOnClickListener {
            navigationListener?.onNavigateTo("TRANSFER")
        }

        view.findViewById<View>(R.id.cardTeklifler)?.setOnClickListener {
            navigationListener?.onNavigateTo("TEKLIFLER")
        }

        view.findViewById<View>(R.id.cardCekSenet)?.setOnClickListener {
            navigationListener?.onNavigateTo("CEK_SENET")
        }

        view.findViewById<View>(R.id.cardCariGruplari)?.setOnClickListener {
            navigationListener?.onNavigateTo("CARI_GRUPLARI")
        }

        view.findViewById<View>(R.id.cardUrunGruplari)?.setOnClickListener {
            navigationListener?.onNavigateTo("URUN_GRUPLARI")
        }

        return view
    }
}

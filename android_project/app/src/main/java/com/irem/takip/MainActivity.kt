package com.irem.takip

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.fragment.app.Fragment
import com.irem.takip.data.model.Cari
import com.irem.takip.ui.*

/**
 * Stok ve Cari Takip - Android Ana Ekranı & Navigasyon Yöneticisi
 */
class MainActivity : AppCompatActivity(), HomeFragment.NavigationListener, CariListeFragment.OnCariSelectedListener {

    private lateinit var toolbar: Toolbar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)

        toolbar.setNavigationOnClickListener {
            if (supportFragmentManager.backStackEntryCount > 0) {
                supportFragmentManager.popBackStack()
            }
        }

        supportFragmentManager.addOnBackStackChangedListener {
            val hasBackStack = supportFragmentManager.backStackEntryCount > 0
            supportActionBar?.setDisplayHomeAsUpEnabled(hasBackStack)
            if (!hasBackStack) {
                toolbar.title = "İrem Stok & Cari"
                toolbar.subtitle = "Supabase PostgreSQL"
            }
        }

        if (savedInstanceState == null) {
            val homeFragment = HomeFragment()
            homeFragment.setNavigationListener(this)
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, homeFragment)
                .commit()
        }
    }

    override fun onNavigateTo(fragmentTag: String) {
        val fragment: Fragment = when (fragmentTag) {
            "SATIS" -> {
                toolbar.title = "Hızlı Satış Yap"
                toolbar.subtitle = "Fatura & Fiş Kesimi"
                SatisFragment()
            }
            "ALIM" -> {
                toolbar.title = "Mal Alımı Yap"
                toolbar.subtitle = "Tedarikçi Girişi"
                AlimFragment()
            }
            "CARI_LISTE" -> {
                toolbar.title = "Cari Hesaplar"
                toolbar.subtitle = "Müşteri & Tedarikçi Listesi"
                val f = CariListeFragment()
                f.setListener(this)
                f
            }
            "STOK_LISTE" -> {
                toolbar.title = "Stok Listesi"
                toolbar.subtitle = "Mevcut Ürünler & Fiyatlar"
                StokListesiFragment()
            }
            "STOK_EKLE" -> {
                toolbar.title = "Yeni Stok Kartı"
                toolbar.subtitle = "Ürün Tanımlama"
                StokEkleFragment()
            }
            "TRANSFER" -> {
                toolbar.title = "Stok Transferi"
                toolbar.subtitle = "Depolar Arası Fiş"
                TransferFragment()
            }
            "TEKLIFLER" -> {
                toolbar.title = "Teklifler"
                toolbar.subtitle = "Fiyat Teklif Yönetimi"
                TekliflerFragment()
            }
            "CEK_SENET" -> {
                toolbar.title = "Çek & Senet Takip"
                toolbar.subtitle = "Portföy & Vadeler"
                CekSenetTakipFragment()
            }
            "CARI_GRUPLARI" -> {
                toolbar.title = "Cari Grupları"
                toolbar.subtitle = "Müşteri Kategori Yönetimi"
                CariGruplariFragment()
            }
            "URUN_GRUPLARI" -> {
                toolbar.title = "Ürün Grupları"
                toolbar.subtitle = "Kategori Yönetimi"
                GruplarFragment()
            }
            "RAPORLAR" -> {
                toolbar.title = "Yıllık Raporlar"
                toolbar.subtitle = "Ciro, Maliyet & Alacaklar"
                RaporlarFragment()
            }
            else -> HomeFragment()
        }

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .addToBackStack(fragmentTag)
            .commit()
    }

    override fun onCariSelected(cari: Cari) {
        toolbar.title = cari.ad
        toolbar.subtitle = "Cari Ekstresi & Hesap Detayı"
        val detailFragment = CariDetayFragment.newInstance(cari)
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, detailFragment)
            .addToBackStack("CARI_DETAY")
            .commit()
    }
}

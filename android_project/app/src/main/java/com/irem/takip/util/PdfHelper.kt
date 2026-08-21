package com.irem.takip.util

import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import com.irem.takip.data.model.Cari
import com.irem.takip.data.model.CariEkstreItem
import com.irem.takip.data.model.Satis
import com.irem.takip.data.model.SatisDetay
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Android Standart PdfDocument ve Canvas ile Fatura & Ekstre PDF Oluşturucu
 * Harici ağır kütüphanelere gerek kalmadan hafif ve hızlı PDF çıktısı üretir.
 */
object PdfHelper {

    fun generateSatisFaturasiPdf(
        context: Context,
        firmaAdi: String = "AKILLI STOK & CARİ TAKİP SİSTEMİ",
        cari: Cari,
        satis: Satis,
        kalemler: List<SatisDetay>
    ): File {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4 boyutu (points)
        val page = pdfDocument.startPage(pageInfo)
        val canvas: Canvas = page.canvas

        val paint = Paint()
        val titlePaint = Paint().apply {
            color = Color.parseColor("#1E3A8A") // Koyu Mavi
            textSize = 18f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
        val headerPaint = Paint().apply {
            color = Color.parseColor("#374151")
            textSize = 12f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
        val textPaint = Paint().apply {
            color = Color.parseColor("#111827")
            textSize = 10f
        }
        val rightTextPaint = Paint().apply {
            color = Color.parseColor("#111827")
            textSize = 10f
            textAlign = Paint.Align.RIGHT
        }
        val linePaint = Paint().apply {
            color = Color.parseColor("#E5E7EB")
            strokeWidth = 1f
        }

        var y = 50f

        // 1. Firma Başlığı
        canvas.drawText(firmaAdi, 40f, y, titlePaint)
        y += 20f
        textPaint.color = Color.parseColor("#6B7280")
        canvas.drawText("SATIŞ FATURASI / BİLGİ FİŞİ", 40f, y, textPaint)
        textPaint.color = Color.parseColor("#111827")

        // Fatura Numarası & Tarih Sağ Üstte
        val tarihStr = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale("tr")).format(Date())
        canvas.drawText("Fatura No: ${satis.faturaNo}", 555f, 50f, rightTextPaint)
        canvas.drawText("Tarih: $tarihStr", 555f, 65f, rightTextPaint)
        canvas.drawText("Ödeme: ${satis.odemeTuru}", 555f, 80f, rightTextPaint)

        y += 35f
        canvas.drawLine(40f, y, 555f, y, linePaint)
        y += 20f

        // 2. Müşteri Bilgileri
        canvas.drawText("SAYIN / MÜŞTERİ:", 40f, y, headerPaint)
        y += 15f
        canvas.drawText(cari.ad, 40f, y, textPaint)
        if (!cari.telefon.isNullOrBlank()) {
            y += 12f
            canvas.drawText("Telefon: ${cari.telefon}", 40f, y, textPaint)
        }
        if (!cari.vergiNo.isNullOrBlank()) {
            y += 12f
            canvas.drawText("V.Dairesi: ${cari.vergiDairesi ?: "-"} / V.No: ${cari.vergiNo}", 40f, y, textPaint)
        }

        y += 25f
        // 3. Tablo Başlığı
        val tableBgPaint = Paint().apply { color = Color.parseColor("#F3F4F6") }
        canvas.drawRect(40f, y, 555f, y + 24f, tableBgPaint)

        canvas.drawText("Ürün / Hizmet Açıklaması", 50f, y + 16f, headerPaint)
        canvas.drawText("Miktar", 330f, y + 16f, headerPaint)
        canvas.drawText("B.Fiyat", 410f, y + 16f, headerPaint)
        canvas.drawText("Tutar", 545f, y + 16f, Paint(headerPaint).apply { textAlign = Paint.Align.RIGHT })

        y += 30f

        // 4. Tablo Satırları
        for (kalem in kalemler) {
            val urunAdi = kalem.stok?.ad ?: "Ürün"
            canvas.drawText(urunAdi, 50f, y, textPaint)
            canvas.drawText("${kalem.miktar} Adet", 330f, y, textPaint)
            canvas.drawText("%.2f TL".format(kalem.birimFiyat), 410f, y, textPaint)
            canvas.drawText("%.2f TL".format(kalem.toplamTutar), 545f, y, rightTextPaint)

            y += 8f
            canvas.drawLine(40f, y, 555f, y, linePaint)
            y += 16f
        }

        y += 15f

        // 5. Toplamlar Bölümü
        canvas.drawText("Ara Toplam:", 420f, y, textPaint)
        canvas.drawText("%.2f TL".format(satis.toplamTutar), 545f, y, rightTextPaint)
        y += 16f

        if (satis.iskontoTutari > 0) {
            canvas.drawText("İskonto:", 420f, y, textPaint)
            canvas.drawText("-%.2f TL".format(satis.iskontoTutari), 545f, y, rightTextPaint)
            y += 16f
        }

        val totalBoxPaint = Paint().apply {
            color = Color.parseColor("#1E3A8A")
            textSize = 12f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
        val totalBoxRight = Paint().apply {
            color = Color.parseColor("#1E3A8A")
            textSize = 12f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            textAlign = Paint.Align.RIGHT
        }

        canvas.drawText("GENEL TOPLAM:", 420f, y, totalBoxPaint)
        canvas.drawText("%.2f TL".format(satis.netTutar), 545f, y, totalBoxRight)

        pdfDocument.finishPage(page)

        val file = File(context.cacheDir, "Fatura_${satis.faturaNo}.pdf")
        val outputStream = FileOutputStream(file)
        pdfDocument.writeTo(outputStream)
        pdfDocument.close()
        outputStream.close()

        return file
    }

    fun sharePdf(context: Context, file: File) {
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(intent, "Faturayı Paylaş"))
    }
}

package com.irem.takip.util

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.Context
import com.irem.takip.data.model.Cari
import com.irem.takip.data.model.CariEkstreItem
import com.irem.takip.data.model.Satis
import com.irem.takip.data.model.SatisDetay
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.OutputStream
import java.nio.charset.Charset
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

/**
 * 58mm / 80mm ESC/POS Bluetooth Termal Fiş Yazıcı Yardımcısı
 * Türkçe Karakter Destekli (CP857 / ISO-8859-9) ve ESC/POS Komut Seti
 */
object BluetoothPrintHelper {

    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    // ESC/POS Komutları
    private val ESC_INIT = byteArrayOf(0x1B, 0x40) // Başlat
    private val ESC_ALIGN_LEFT = byteArrayOf(0x1B, 0x61, 0x00)
    private val ESC_ALIGN_CENTER = byteArrayOf(0x1B, 0x61, 0x01)
    private val ESC_ALIGN_RIGHT = byteArrayOf(0x1B, 0x61, 0x02)
    private val ESC_BOLD_ON = byteArrayOf(0x1B, 0x45, 0x01)
    private val ESC_BOLD_OFF = byteArrayOf(0x1B, 0x45, 0x00)
    private val ESC_DOUBLE_HEIGHT_ON = byteArrayOf(0x1B, 0x21, 0x10)
    private val ESC_DOUBLE_HEIGHT_OFF = byteArrayOf(0x1B, 0x21, 0x00)
    private val ESC_FEED_LINES = byteArrayOf(0x1B, 0x64, 0x03)
    private val GS_CUT_PAPER = byteArrayOf(0x1D, 0x56, 0x41, 0x00) // Kağıt Kesme

    @SuppressLint("MissingPermission")
    fun getPairedPrinters(): List<BluetoothDevice> {
        val adapter = BluetoothAdapter.getDefaultAdapter() ?: return emptyList()
        return adapter.bondedDevices?.filter {
            it.bluetoothClass?.majorDeviceClass == android.bluetooth.BluetoothClass.Device.Major.IMAGING ||
            it.name.contains("printer", ignoreCase = true) ||
            it.name.contains("pos", ignoreCase = true) ||
            it.name.contains("rpp", ignoreCase = true) ||
            it.name.contains("bt", ignoreCase = true)
        } ?: emptyList()
    }

    /**
     * Satış Faturası / Fişi Termal Yazıcıya Basma
     */
    @SuppressLint("MissingPermission")
    suspend fun printSatisFisi(
        device: BluetoothDevice,
        firmaAdi: String = "STOK VE CARİ TAKİP",
        cari: Cari,
        satis: Satis,
        kalemler: List<SatisDetay>,
        is80mm: Boolean = false
    ): Result<Unit> = withContext(Dispatchers.IO) {
        var socket: BluetoothSocket? = null
        var outputStream: OutputStream? = null

        try {
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
            socket.connect()
            outputStream = socket.outputStream

            val width = if (is80mm) 48 else 32
            val lineSeparator = "-".repeat(width)
            val doubleLine = "=".repeat(width)

            // Başlat
            outputStream.write(ESC_INIT)

            // Başlık
            outputStream.write(ESC_ALIGN_CENTER)
            outputStream.write(ESC_BOLD_ON)
            outputStream.write(ESC_DOUBLE_HEIGHT_ON)
            outputStream.write(encodeText("$firmaAdi\n"))
            outputStream.write(ESC_DOUBLE_HEIGHT_OFF)
            outputStream.write(ESC_BOLD_OFF)
            outputStream.write(encodeText("SATIŞ BİLGİ FİŞİ\n"))
            outputStream.write(encodeText("$doubleLine\n"))

            // Üst Bilgiler
            outputStream.write(ESC_ALIGN_LEFT)
            val tarihStr = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale("tr")).format(Date())
            outputStream.write(encodeText("Fatura No : ${satis.faturaNo}\n"))
            outputStream.write(encodeText("Tarih     : $tarihStr\n"))
            outputStream.write(encodeText("Müşteri   : ${cari.ad}\n"))
            if (!cari.telefon.isNullOrBlank()) {
                outputStream.write(encodeText("Telefon   : ${cari.telefon}\n"))
            }
            outputStream.write(encodeText("Ödeme Türü: ${satis.odemeTuru}\n"))
            outputStream.write(encodeText("$lineSeparator\n"))

            // Tablo Başlığı
            outputStream.write(ESC_BOLD_ON)
            if (is80mm) {
                outputStream.write(encodeText(formatColumns("ÜRÜN", "MİK", "FİYAT", "TUTAR", 20, 6, 10, 12)))
            } else {
                outputStream.write(encodeText(formatColumns("ÜRÜN", "MİK", "TUTAR", 16, 6, 10)))
            }
            outputStream.write(ESC_BOLD_OFF)
            outputStream.write(encodeText("\n$lineSeparator\n"))

            // Kalemler
            for (kalem in kalemler) {
                val urunAdi = kalem.stok?.ad ?: "Ürün"
                val mikStr = "%.2f".format(kalem.miktar)
                val tutarStr = "%.2f TL".format(kalem.toplamTutar)

                if (is80mm) {
                    val fiyatStr = "%.2f".format(kalem.birimFiyat)
                    outputStream.write(encodeText(formatColumns(urunAdi, mikStr, fiyatStr, tutarStr, 20, 6, 10, 12) + "\n"))
                } else {
                    outputStream.write(encodeText(formatColumns(urunAdi, mikStr, tutarStr, 16, 6, 10) + "\n"))
                }
            }

            outputStream.write(encodeText("$doubleLine\n"))

            // Alt Toplamlar
            outputStream.write(ESC_ALIGN_RIGHT)
            outputStream.write(encodeText("Ara Toplam : %.2f TL\n".format(satis.toplamTutar)))
            if (satis.iskontoTutari > 0) {
                outputStream.write(encodeText("İskonto    : -%.2f TL\n".format(satis.iskontoTutari)))
            }
            outputStream.write(ESC_BOLD_ON)
            outputStream.write(encodeText("GENEL TOPLAM: %.2f TL\n".format(satis.netTutar)))
            outputStream.write(ESC_BOLD_OFF)

            // Güncel Bakiye Bilgisi
            outputStream.write(encodeText("$lineSeparator\n"))
            outputStream.write(encodeText("Önceki Bakiye: %.2f TL\n".format(cari.bakiye)))
            val yeniBakiye = if (satis.odemeTuru == "VERESIYE") cari.bakiye + satis.netTutar else cari.bakiye
            outputStream.write(ESC_BOLD_ON)
            outputStream.write(encodeText("GÜNCEL BAKİYE: %.2f TL\n".format(yeniBakiye)))
            outputStream.write(ESC_BOLD_OFF)

            // Dipnot
            outputStream.write(ESC_ALIGN_CENTER)
            outputStream.write(encodeText("\nBizi tercih ettiğiniz için teşekkür ederiz.\nMali değeri yoktur.\n\n\n"))
            outputStream.write(ESC_FEED_LINES)
            outputStream.write(GS_CUT_PAPER)

            outputStream.flush()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            try { outputStream?.close() } catch (_: Exception) {}
            try { socket?.close() } catch (_: Exception) {}
        }
    }

    /**
     * Cari Hesap Ekstresi Termal Çıktısı
     */
    @SuppressLint("MissingPermission")
    suspend fun printCariEkstre(
        device: BluetoothDevice,
        cari: Cari,
        ekstreList: List<CariEkstreItem>,
        yil: Int
    ): Result<Unit> = withContext(Dispatchers.IO) {
        var socket: BluetoothSocket? = null
        var outputStream: OutputStream? = null

        try {
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
            socket.connect()
            outputStream = socket.outputStream

            outputStream.write(ESC_INIT)
            outputStream.write(ESC_ALIGN_CENTER)
            outputStream.write(ESC_BOLD_ON)
            outputStream.write(encodeText("CARİ HESAP EKSTRESİ ($yil)\n"))
            outputStream.write(ESC_BOLD_OFF)
            outputStream.write(encodeText("${cari.ad}\n"))
            outputStream.write(encodeText("=".repeat(32) + "\n"))

            outputStream.write(ESC_ALIGN_LEFT)
            for (item in ekstreList) {
                val tarih = if (item.tarih.length >= 10) item.tarih.substring(0, 10) else item.tarih
                outputStream.write(encodeText("$tarih | ${item.tur}\n"))
                if (item.borc > 0) outputStream.write(encodeText("  Borç  : +%.2f TL\n".format(item.borc)))
                if (item.alacak > 0) outputStream.write(encodeText("  Alacak: -%.2f TL\n".format(item.alacak)))
                outputStream.write(encodeText("  Bakiye: %.2f TL\n".format(item.bakiye)))
                outputStream.write(encodeText("-".repeat(32) + "\n"))
            }

            outputStream.write(ESC_ALIGN_RIGHT)
            outputStream.write(ESC_BOLD_ON)
            outputStream.write(encodeText("SON BAKİYE: %.2f TL\n".format(cari.bakiye)))
            outputStream.write(ESC_BOLD_OFF)
            outputStream.write(ESC_FEED_LINES)

            outputStream.flush()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            try { outputStream?.close() } catch (_: Exception) {}
            try { socket?.close() } catch (_: Exception) {}
        }
    }

    private fun encodeText(text: String): ByteArray {
        // Türkçe karakterleri CP857 veya ISO-8859-9 ile encode et
        return try {
            text.toByteArray(Charset.forName("ISO-8859-9"))
        } catch (e: Exception) {
            text.toByteArray(Charsets.UTF_8)
        }
    }

    private fun formatColumns(c1: String, c2: String, c3: String, w1: Int, w2: Int, w3: Int): String {
        val s1 = if (c1.length > w1) c1.substring(0, w1 - 1) + "." else c1.padEnd(w1)
        val s2 = if (c2.length > w2) c2.substring(0, w2) else c2.padStart(w2)
        val s3 = if (c3.length > w3) c3.substring(0, w3) else c3.padStart(w3)
        return "$s1$s2$s3"
    }

    private fun formatColumns(c1: String, c2: String, c3: String, c4: String, w1: Int, w2: Int, w3: Int, w4: Int): String {
        val s1 = if (c1.length > w1) c1.substring(0, w1 - 1) + "." else c1.padEnd(w1)
        val s2 = if (c2.length > w2) c2.substring(0, w2) else c2.padStart(w2)
        val s3 = if (c3.length > w3) c3.substring(0, w3) else c3.padStart(w3)
        val s4 = if (c4.length > w4) c4.substring(0, w4) else c4.padStart(w4)
        return "$s1$s2$s3$s4"
    }
}

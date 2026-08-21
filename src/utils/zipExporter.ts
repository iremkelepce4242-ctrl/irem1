import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabaseSqlSchema } from '../data/supabaseSchema';

export const GITHUB_WORKFLOW_YML = `name: Android CI - Supabase APK Derleme

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    name: 🚀 APK Derle ve Paketle
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Kaynak Kodları Çek
        uses: actions/checkout@v4

      - name: ☕ JDK 17 Kurulumu
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: 📱 Android SDK Kurulumu
        uses: android-actions/setup-android@v3

      - name: 🔍 Proje Dizinini Tespit Et
        run: |
          if [ -d "android_project" ]; then
            echo "PROJECT_DIR=android_project" >> $GITHUB_ENV
          else
            echo "PROJECT_DIR=." >> $GITHUB_ENV
          fi

      - name: ⚙️ Gradle 8.9 Kurulumu
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.9'
          build-root-directory: \${{ env.PROJECT_DIR }}
          cache-read-only: false

      - name: 🔧 Eksik Kaynak Dosyalarını Otomatik Oluştur (Auto-Fix Resources)
        run: |
          RES_DIR="\${{ env.PROJECT_DIR }}/app/src/main/res"
          mkdir -p "$RES_DIR/values" "$RES_DIR/xml" "$RES_DIR/drawable" "$RES_DIR/mipmap-anydpi-v26"

          if [ ! -f "$RES_DIR/values/themes.xml" ]; then
            cat << 'EOF' > "$RES_DIR/values/themes.xml"
          <resources>
              <style name="Theme.Takip" parent="Theme.Material3.Dark.NoActionBar">
                  <item name="colorPrimary">#10B981</item>
                  <item name="android:statusBarColor">#0F172A</item>
              </style>
          </resources>
          EOF
          fi

          if [ ! -f "$RES_DIR/xml/file_paths.xml" ]; then
            cat << 'EOF' > "$RES_DIR/xml/file_paths.xml"
          <?xml version="1.0" encoding="utf-8"?>
          <paths xmlns:android="http://schemas.android.com/apk/res/android">
              <external-files-path name="my_pdf_docs" path="documents/" />
              <external-path name="external" path="." />
              <cache-path name="cache" path="." />
              <files-path name="internal_files" path="." />
          </paths>
          EOF
          fi

          cat << 'EOF' > "$RES_DIR/drawable/ic_launcher_background.xml"
          <?xml version="1.0" encoding="utf-8"?>
          <vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
              <path android:fillColor="#10B981" android:pathData="M0,0h108v108h-108z" />
          </vector>
          EOF

          cat << 'EOF' > "$RES_DIR/drawable/ic_launcher_foreground.xml"
          <?xml version="1.0" encoding="utf-8"?>
          <vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
              <path android:fillColor="#FFFFFF" android:pathData="M54,24L30,36v24c0,16.57 10.24,32.08 24,36c13.76-3.92 24-19.43 24-36V36L54,24z M54,48c4.42,0 8,3.58 8,8s-3.58,8-8,8s-8-3.58-8-8S49.58,48 54,48z" />
          </vector>
          EOF

          cat << 'EOF' > "$RES_DIR/mipmap-anydpi-v26/ic_launcher.xml"
          <?xml version="1.0" encoding="utf-8"?>
          <adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
              <background android:drawable="@drawable/ic_launcher_background" />
              <foreground android:drawable="@drawable/ic_launcher_foreground" />
          </adaptive-icon>
          EOF

          cat << 'EOF' > "$RES_DIR/mipmap-anydpi-v26/ic_launcher_round.xml"
          <?xml version="1.0" encoding="utf-8"?>
          <adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
              <background android:drawable="@drawable/ic_launcher_background" />
              <foreground android:drawable="@drawable/ic_launcher_foreground" />
          </adaptive-icon>
          EOF

      - name: 🔨 Debug APK Derle (assembleDebug)
        working-directory: \${{ env.PROJECT_DIR }}
        run: |
          gradle assembleDebug --no-daemon --stacktrace

      - name: 📦 Debug APK'yı İndirilebilir Yap
        uses: actions/upload-artifact@v4
        with:
          name: StokCariTakip-Debug-APK
          path: \${{ env.PROJECT_DIR }}/app/build/outputs/apk/debug/*.apk
          retention-days: 30
          if-no-files-found: error

      - name: 📝 Derleme Özeti Ekle
        run: |
          echo "## 🎉 Android APK Başarıyla Derlendi!" >> $GITHUB_STEP_SUMMARY
          echo "- **Derleme Tipi:** Debug APK" >> $GITHUB_STEP_SUMMARY
          echo "- **Supabase:** %100 Entegre" >> $GITHUB_STEP_SUMMARY
          echo "- **İndirme:** Sayfanın altındaki **Artifacts** bölümünden \\\`StokCariTakip-Debug-APK\\\` dosyasını telefonunuza yükleyebilirsiniz." >> $GITHUB_STEP_SUMMARY
`;

const BUILD_GRADLE_KTS_ROOT = `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.serialization) apply false
}
`;

const SETTINGS_GRADLE_KTS = `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://jitpack.io") }
    }
}

rootProject.name = "StokCariTakip"
include(":app")
`;

const GRADLE_PROPERTIES = `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`;

const LIBS_VERSIONS_TOML = `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
appcompat = "1.7.0"
material = "1.12.0"
constraintlayout = "2.2.0"
lifecycle = "2.8.7"
navigation = "2.8.5"
supabase = "3.1.0"
ktor = "3.0.3"
coroutines = "1.10.1"
serialization = "1.7.3"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-constraintlayout = { group = "androidx.constraintlayout", name = "constraintlayout", version.ref = "constraintlayout" }
androidx-lifecycle-viewmodel = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-ktx", version.ref = "lifecycle" }
androidx-lifecycle-livedata = { group = "androidx.lifecycle", name = "lifecycle-livedata-ktx", version.ref = "lifecycle" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
`;

const GRADLE_WRAPPER_PROPERTIES = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

const GRADLEW_SH = `#!/bin/sh
PRG="$0"
while [ -h "$PRG" ] ; do
    ls=\`ls -ld "$PRG"\`
    link=\`expr "$ls" : '.*-> \\(.*\\)$'\`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=\`dirname "$PRG"\`"/$link"
    fi
done
SAVED="\`pwd\`"
cd "\`dirname \\"$PRG\\"\`/" >/dev/null
APP_HOME="\`pwd -P\`"
cd "$SAVED" >/dev/null

APP_NAME="Gradle"
APP_BASE_NAME=\`basename "$0"\`
DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'

CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
JAVACMD="java"

exec "$JAVACMD" $DEFAULT_JVM_OPTS -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
`;

const APP_BUILD_GRADLE = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.irem.takip"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.irem.takip"
        minSdk = 24
        targetSdk = 35
        versionCode = 2
        versionName = "2.0.0-supabase"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // AndroidX & Lifecycle
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")

    // Supabase Kotlin SDK (%100 Firebase-Free)
    implementation(platform("io.github.jan-tennert.supabase:bom:3.1.1"))
    implementation("io.github.jan-tennert.supabase:postgrest-kt")
    implementation("io.github.jan-tennert.supabase:auth-kt")
    implementation("io.github.jan-tennert.supabase:realtime-kt")
    implementation("io.github.jan-tennert.supabase:storage-kt")

    // Ktor Client (OkHttp Engine for Android)
    implementation("io.ktor:ktor-client-okhttp:3.0.3")

    // Kotlinx Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
`;

const ANDROID_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Internet & Network -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Bluetooth for Thermal Printers (ESC/POS) -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Material3.Dark.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`;

const SUPABASE_CLIENT_KT = `package com.irem.takip.data

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.storage.Storage

/**
 * Merkezi Supabase İstemcisi
 * Eski Firebase ve Firestore yapısı tamamen kaldırılmıştır.
 */
object SupabaseConfig {
    // Supabase Proje Bilgilerinizi buraya giriniz
    const val SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"
    const val SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"

    val client: SupabaseClient = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_ANON_KEY
    ) {
        install(Postgrest)
        install(Auth)
        install(Realtime)
        install(Storage)
    }
}
`;

const MODELS_KT = `package com.irem.takip.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CariDto(
    val id: String? = null,
    val yil: Int = 2025,
    @SerialName("unvan") val unvan: String,
    @SerialName("yetkili_kisi") val yetkiliKisi: String? = null,
    @SerialName("telefon") val telefon: String? = null,
    @SerialName("adres") val adres: String? = null,
    @SerialName("vergi_dairesi") val vergiDairesi: String? = null,
    @SerialName("vergi_no") val vergiNo: String? = null,
    @SerialName("bakiye") val bakiye: Double = 0.0,
    @SerialName("risk_limiti") val riskLimiti: Double = 0.0,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class StokDto(
    val id: String? = null,
    val yil: Int = 2025,
    @SerialName("stok_kodu") val stokKodu: String,
    @SerialName("stok_adi") val stokAdi: String,
    @SerialName("barkod") val barkod: String? = null,
    @SerialName("kategori") val kategori: String = "Genel",
    @SerialName("birim") val birim: String = "Adet",
    @SerialName("alis_fiyati") val alisFiyati: Double = 0.0,
    @SerialName("satis_fiyati") val satisFiyati: Double = 0.0,
    @SerialName("kdv_orani") val kdvOrani: Int = 20,
    @SerialName("mevcut_miktar") val mevcutMiktar: Double = 0.0,
    @SerialName("kritik_seviye") val kritikSeviye: Double = 5.0
)

@Serializable
data class SatisDto(
    val id: String? = null,
    val yil: Int = 2025,
    @SerialName("fis_no") val fisNo: String,
    @SerialName("cari_id") val cariId: String,
    @SerialName("odeme_tipi") val odemeTipi: String = "Açık Hesap (Veresiye)",
    @SerialName("ara_toplam") val araToplam: Double = 0.0,
    @SerialName("kdv_tutari") val kdvTutari: Double = 0.0,
    @SerialName("genel_toplam") val genelToplam: Double = 0.0,
    @SerialName("tarih") val tarih: String? = null,
    @SerialName("aciklama") val aciklama: String? = null
)

@Serializable
data class SatisKalemiDto(
    val id: String? = null,
    @SerialName("satis_id") val satisId: String,
    @SerialName("stok_id") val stokId: String,
    @SerialName("miktar") val miktar: Double,
    @SerialName("birim_fiyat") val birimFiyat: Double,
    @SerialName("kdv_orani") val kdvOrani: Int = 20,
    @SerialName("toplam_tutar") val toplamTutar: Double
)

@Serializable
data class TahsilatDto(
    val id: String? = null,
    val yil: Int = 2025,
    @SerialName("cari_id") val cariId: String,
    @SerialName("tutar") val tutar: Double,
    @SerialName("odeme_araci") val odemeAraci: String = "Nakit",
    @SerialName("aciklama") val aciklama: String? = null,
    @SerialName("tarih") val tarih: String? = null
)
`;

const SATIS_REPOSITORY_KT = `package com.irem.takip.data.repository

import com.irem.takip.data.SupabaseConfig
import com.irem.takip.data.model.SatisDto
import com.irem.takip.data.model.SatisKalemiDto
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Satış Repository
 * DİKKAT: Android tarafında stok düşme döngüsü veya cari bakiye toplama kodu YOKTUR!
 * Supabase PostgreSQL Trigger'ları (trg_satis_kalemi_stok ve trg_satis_bakiye) 
 * stok düşme ve cari bakiye artışını veritabanında atomik olarak yapar.
 */
class SatisRepository {
    private val client = SupabaseConfig.client

    suspend fun satisOlustur(satis: SatisDto, kalemler: List<SatisKalemiDto>): Result<SatisDto> = withContext(Dispatchers.IO) {
        try {
            // 1. Ana Fiş Kaydı
            val createdSatis = client.from("satislar")
                .insert(satis) { select() }
                .decodeSingle<SatisDto>()

            val satisId = createdSatis.id ?: throw IllegalStateException("Satış ID alınamadı")

            // 2. Kalemlerin Eklenmesi (Trigger otomatik olarak her kalemin stok miktarını düşer)
            val updatedKalemler = kalemler.map { it.copy(satisId = satisId) }
            client.from("satis_kalemleri").insert(updatedKalemler)

            Result.success(createdSatis)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun satisSil(satisId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            // Satış silindiğinde trigger'lar stokları anında iade eder ve cari bakiyeyi düzeltir
            client.from("satislar").delete {
                filter { eq("id", satisId) }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
`;

const BLUETOOTH_PRINT_HELPER_KT = `package com.irem.takip.util

import android.bluetooth.BluetoothSocket
import java.io.OutputStream
import java.nio.charset.Charset

/**
 * 58mm & 80mm ESC/POS Bluetooth Termal Fiş Yazıcı Motoru
 * Türkçe karakter desteği (CP857 / ISO-8859-9) ile entegre.
 */
class BluetoothPrintHelper(private val socket: BluetoothSocket) {

    private val outputStream: OutputStream = socket.outputStream
    private val turkishCharset: Charset = Charset.forName("ISO-8859-9")

    fun yaziciyiHazirla() {
        // ESC @ : Initialize printer
        outputStream.write(byteArrayOf(0x1B, 0x40))
        // ESC t 18 : Select Turkish Code Table
        outputStream.write(byteArrayOf(0x1B, 0x74, 18))
    }

    fun fisYazdir(
        baslik: String,
        fisNo: String,
        cariUnvan: String,
        kalemler: List<Triple<String, Double, Double>>,
        genelToplam: Double,
        kdvTutari: Double
    ) {
        yaziciyiHazirla()

        // Başlık (Ortalı ve Kalın)
        outputStream.write(byteArrayOf(0x1B, 0x61, 0x01)) // Center
        outputStream.write(byteArrayOf(0x1B, 0x45, 0x01)) // Bold ON
        yaz("=== $baslik ===\\n")
        outputStream.write(byteArrayOf(0x1B, 0x45, 0x00)) // Bold OFF

        // Bilgiler (Sola Yaslı)
        outputStream.write(byteArrayOf(0x1B, 0x61, 0x00))
        yaz("--------------------------------\\n")
        yaz("Fis No : $fisNo\\n")
        yaz("Cari   : $cariUnvan\\n")
        yaz("--------------------------------\\n")
        yaz("Urun             Mik x Fiyat   Tutar\\n")
        yaz("--------------------------------\\n")

        // Kalemler
        for (item in kalemler) {
            val satir = String.format("%-14s %2.0fx%-6.2f %7.2f TL\\n",
                item.first.take(14), item.second, item.third, (item.second * item.third))
            yaz(satir)
        }

        yaz("--------------------------------\\n")
        yaz(String.format("KDV Tutari   : %15.2f TL\\n", kdvTutari))
        outputStream.write(byteArrayOf(0x1B, 0x45, 0x01)) // Bold ON
        yaz(String.format("TOPLAM TUTAR : %15.2f TL\\n", genelToplam))
        outputStream.write(byteArrayOf(0x1B, 0x45, 0x00)) // Bold OFF
        yaz("--------------------------------\\n")
        yaz("Mali degeri yoktur.\\n\\n\\n")

        // Kağıt Besleme ve Kesme (GS V 66 0)
        outputStream.write(byteArrayOf(0x1D, 0x56, 0x42, 0x00))
        outputStream.flush()
    }

    private fun yaz(metin: String) {
        outputStream.write(metin.toByteArray(turkishCharset))
    }
}
`;

const PDF_HELPER_KT = `package com.irem.takip.util

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import java.io.File
import java.io.FileOutputStream

/**
 * A4 Boyutunda Vektörel Satış Faturası ve Cari Ekstre Oluşturucu
 * Sayfa boyutu: 595 x 842 pt (Standart A4 @ 72 DPI)
 */
object PdfHelper {

    fun a4FaturaOlustur(
        hedefDosya: File,
        firmaUnvan: String,
        fisNo: String,
        tarih: String,
        cariUnvan: String,
        kalemler: List<Triple<String, Double, Double>>,
        araToplam: Double,
        kdvTutari: Double,
        genelToplam: Double
    ) {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas: Canvas = page.canvas
        val paint = Paint()

        // 1. Üst Başlık & Logo Alanı
        paint.color = Color.rgb(16, 185, 129) // Emerald Theme
        canvas.drawRect(40f, 40f, 555f, 95f, paint)

        paint.color = Color.WHITE
        paint.textSize = 20f
        paint.isFakeBoldText = true
        canvas.drawText(firmaUnvan, 55f, 75f, paint)

        // 2. Fatura & Cari Bilgileri
        paint.color = Color.DKGRAY
        paint.textSize = 10f
        paint.isFakeBoldText = false
        canvas.drawText("Fiş / Fatura No: $fisNo", 400f, 65f, paint)
        canvas.drawText("Tarih: $tarih", 400f, 80f, paint)

        paint.color = Color.BLACK
        paint.textSize = 12f
        paint.isFakeBoldText = true
        canvas.drawText("Sayın: $cariUnvan", 40f, 125f, paint)

        // 3. Tablo Başlıkları
        paint.color = Color.rgb(241, 245, 249)
        canvas.drawRect(40f, 150f, 555f, 175f, paint)

        paint.color = Color.BLACK
        paint.textSize = 10f
        canvas.drawText("Ürün / Hizmet Açıklaması", 50f, 166f, paint)
        canvas.drawText("Miktar", 330f, 166f, paint)
        canvas.drawText("Birim Fiyat", 410f, 166f, paint)
        canvas.drawText("Tutar", 500f, 166f, paint)

        // 4. Tablo Satırları
        var y = 195f
        for (item in kalemler) {
            canvas.drawText(item.first, 50f, y, paint)
            canvas.drawText(String.format("%.2f", item.second), 330f, y, paint)
            canvas.drawText(String.format("%.2f TL", item.third), 410f, y, paint)
            canvas.drawText(String.format("%.2f TL", item.second * item.third), 500f, y, paint)
            y += 22f
        }

        // 5. Alt Toplamlar
        y += 20f
        canvas.drawLine(350f, y, 555f, y, paint)
        y += 20f
        canvas.drawText("Ara Toplam:", 370f, y, paint)
        canvas.drawText(String.format("%.2f TL", araToplam), 480f, y, paint)
        y += 18f
        canvas.drawText("KDV Tutarı (%20):", 370f, y, paint)
        canvas.drawText(String.format("%.2f TL", kdvTutari), 480f, y, paint)
        y += 22f
        paint.textSize = 12f
        paint.isFakeBoldText = true
        canvas.drawText("GENEL TOPLAM:", 370f, y, paint)
        canvas.drawText(String.format("%.2f TL", genelToplam), 480f, y, paint)

        pdfDocument.finishPage(page)

        FileOutputStream(hedefDosya).use { out ->
            pdfDocument.writeTo(out)
        }
        pdfDocument.close()
    }
}
`;

const MAIN_ACTIVITY_KT = `package com.irem.takip

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.irem.takip.data.repository.CariRepository
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private val cariRepository by lazy { CariRepository() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            try {
                val result = cariRepository.getCariler(yil = 2025)
                result.onSuccess { cariler ->
                    android.util.Log.d("MainActivity", "Yüklenen Cari Sayısı: \${cariler.size}")
                }
            } catch (e: Exception) {
                android.util.Log.e("MainActivity", "Hata: \${e.message}", e)
            }
        }
    }
}
`;

const README_GUIDE = `# Stok & Cari Takip - Supabase + Android Studio + GitHub Actions CI/CD Paketi

Bu paket, Firebase bağımlılıkları tamamen kaldırılmış, **%100 Supabase (PostgreSQL) Akıllı Veritabanı** mimarisine sahip Android uygulamasının kaynak kodlarını, SQL veritabanı şemasını ve **GitHub Actions ile Otomatik APK Derleme CI/CD Workflow** dosyasını içerir.

---

## 🚀 GitHub Actions ile Otomatik APK Derleme (2 Adım)

1. Bu ZIP paketini bilgisayarınızda çıkartıp GitHub reponuza \`push\` yapın:
   \`\`\`bash
   git init
   git add .
   git commit -m "feat: %100 Supabase mimarisine gecis ve CI/CD workflow"
   git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
   git branch -M main
   git push -u origin main
   \`\`\`
2. GitHub deponuzdaki **Actions** sekmesine gidin.
3. \`Android CI - Supabase APK Derleme\` workflow'u otomatik başlayacak, JDK 17, Android SDK ve Gradle bağımlılıklarını kurup **Debug APK** derleyecektir.
4. İşlem bittiğinde sayfanın altındaki **Artifacts** bölümünden \`StokCariTakip-Debug-APK\` dosyasını tek tıkla indirip telefonunuza yükleyebilirsiniz!

---

## 🗄️ Supabase Veritabanı Kurulumu

1. [supabase.com](https://supabase.com) adresinde oturum açıp yeni bir proje oluşturun.
2. Sol menüden **SQL Editor** sayfasına geçin.
3. Bu ZIP'teki \`supabase_schema.sql\` dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın ve **Run** tuşuna basın.
4. Tablolar, PostgreSQL Trigger'ları ve Yıl Devir RPC'leri otomatik kurulur.
`;

export async function generateAndDownloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file('supabase_schema.sql', supabaseSqlSchema);
  zip.file('README_KURULUM.md', README_GUIDE);
  zip.file('settings.gradle.kts', SETTINGS_GRADLE_KTS);
  zip.file('build.gradle.kts', BUILD_GRADLE_KTS_ROOT);
  zip.file('gradle.properties', GRADLE_PROPERTIES);
  zip.file('gradlew', GRADLEW_SH);

  // GitHub Actions Workflow
  const githubFolder = zip.folder('.github');
  const workflowsFolder = githubFolder?.folder('workflows');
  if (workflowsFolder) {
    workflowsFolder.file('android_build.yml', GITHUB_WORKFLOW_YML);
  }

  // Gradle wrapper & version catalog
  const gradleFolder = zip.folder('gradle');
  if (gradleFolder) {
    gradleFolder.file('libs.versions.toml', LIBS_VERSIONS_TOML);
    const wrapperFolder = gradleFolder.folder('wrapper');
    if (wrapperFolder) {
      wrapperFolder.file('gradle-wrapper.properties', GRADLE_WRAPPER_PROPERTIES);
    }
  }

  // Android App module
  const appFolder = zip.folder('app');
  if (appFolder) {
    appFolder.file('build.gradle.kts', APP_BUILD_GRADLE);

    // src/main
    const mainFolder = appFolder.folder('src')?.folder('main');
    if (mainFolder) {
      mainFolder.file('AndroidManifest.xml', ANDROID_MANIFEST);

      // res/values
      const valuesFolder = mainFolder.folder('res')?.folder('values');
      if (valuesFolder) {
        valuesFolder.file(
          'strings.xml',
          `<resources>
    <string name="app_name">Stok &amp; Cari Takip</string>
</resources>`
        );
        valuesFolder.file(
          'colors.xml',
          `<resources>
    <color name="primary">#10B981</color>
    <color name="bg_dark">#0F172A</color>
</resources>`
        );
      }

      // java/com/irem/takip
      const codeFolder = mainFolder.folder('java')?.folder('com')?.folder('irem')?.folder('takip');
      if (codeFolder) {
        codeFolder.file('MainActivity.kt', MAIN_ACTIVITY_KT);

        // data & models
        const dataFolder = codeFolder.folder('data');
        if (dataFolder) {
          dataFolder.file('SupabaseClient.kt', SUPABASE_CLIENT_KT);
          dataFolder.folder('model')?.file('Models.kt', MODELS_KT);
          
          const repoFolder = dataFolder.folder('repository');
          if (repoFolder) {
            repoFolder.file('SatisRepository.kt', SATIS_REPOSITORY_KT);
          }
        }

        // util
        const utilFolder = codeFolder.folder('util');
        if (utilFolder) {
          utilFolder.file('BluetoothPrintHelper.kt', BLUETOOTH_PRINT_HELPER_KT);
          utilFolder.file('PdfHelper.kt', PDF_HELPER_KT);
        }
      }
    }
  }

  // Generate ZIP blob
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'StokCariTakip_Supabase_Android_Project.zip');
}

export function downloadSqlSchemaFile(): void {
  const blob = new Blob([supabaseSqlSchema], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'supabase_schema.sql');
}

export function downloadGithubWorkflowFile(): void {
  const blob = new Blob([GITHUB_WORKFLOW_YML], { type: 'text/yaml;charset=utf-8' });
  saveAs(blob, 'android_build.yml');
}

export function downloadReadmeFile(): void {
  const blob = new Blob([README_GUIDE], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, 'README_KURULUM.md');
}

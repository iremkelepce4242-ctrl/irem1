# Stok & Cari Takip - Supabase + Android Studio Kurulum Kılavuzu

Bu proje, eski Firebase bağımlılıklarından tamamen arındırılmış, **%100 Supabase (PostgreSQL) Akıllı Veritabanı** mimarisine sahip modern bir Android uygulamasıdır.

---

## 1. Supabase Kurulumu (2 Dakika)

1. [Supabase](https://supabase.com) hesabınıza giriş yapın ve yeni bir proje oluşturun.
2. Sol menüden **SQL Editor** bölümüne gelin.
3. Projedeki `supabase_schema.sql` dosyasının içeriğini kopyalayıp buraya yapıştırın ve **RUN** butonuna basın.
4. Bu işlem;
   - Tüm tabloları (`cariler`, `stoklar`, `satislar`, `satis_kalemleri`, `tahsilatlar`, `odemeler`, `cek_senetler`),
   - Otomatik stok düşen ve cari bakiye güncelleyen **PostgreSQL Trigger**'larını,
   - Yıl devir fonksiyonunu (`sp_yil_sonu_devri_yap`) ve rapor RPC'lerini otomatik olarak oluşturur.
5. Sol menüden **Project Settings -> API** bölümüne giderek:
   - **Project URL**
   - **anon / public key**
   değerlerini kopyalayın.

---

## 2. Android Studio Projesine Bağlama

1. Bu ZIP paketini bilgisayarınızda bir klasöre çıkartın.
2. **Android Studio**'yu açıp **Open** diyerek bu klasörü seçin (Gradle otomatik senkronize olacaktır).
3. `app/src/main/java/com/irem/takip/data/SupabaseClient.kt` dosyasını açın:
   ```kotlin
   const val SUPABASE_URL = "https://BURAYA_SUPABASE_PROJE_URLINIZI_YAZIN.supabase.co"
   const val SUPABASE_ANON_KEY = "BURAYA_SUPABASE_ANON_KEYINIZI_YAZIN"
   ```
4. Uygulamanızı emülatörde veya gerçek cihazda çalıştırın!

---

## 3. Akıllı Veritabanı ve Trigger Mantığı

- **Android tarafında stok düşme veya bakiye hesaplama matematik döngüleri YOKTUR.**
- Satış kaydı için sadece `satis_kalemleri` tablosuna `INSERT` yapılır; veritabanı trigger'ı ilgili stoktan adedi anında düşer.
- Fiş silindiğinde stoklar otomatik iade edilir.
- `yil` (INT) kolonu sayesinde her yılın verisi izoledir. Yıl devri için veritabanındaki `sp_yil_sonu_devri_yap` çağrılır.
- **ESC/POS 58mm/80mm Bluetooth Termal Yazıcı** ve **A4 PDF Fatura/Ekstre** modülleri `util` paketinde mevcuttur.

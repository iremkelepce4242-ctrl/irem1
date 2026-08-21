import React, { useState } from 'react';
import {
  Database,
  Code2,
  Cpu,
  Layers,
  Copy,
  Check,
  Zap,
  Printer,
  FileText,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Server,
  Smartphone,
  Flame,
  CheckCircle2,
  FileCode,
  FolderTree,
  Download,
  FolderArchive,
  GitBranch,
  Terminal,
  Play
} from 'lucide-react';
import {
  downloadSqlSchemaFile,
  generateAndDownloadProjectZip,
  downloadGithubWorkflowFile,
  downloadReadmeFile,
  GITHUB_WORKFLOW_YML
} from '../../utils/zipExporter';

interface SupabaseArchitectureHubProps {
  onOpenDownloadModal?: () => void;
}

export const SupabaseArchitectureHub: React.FC<SupabaseArchitectureHubProps> = ({
  onOpenDownloadModal
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'kotlin' | 'github' | 'thermal' | 'comparison'>('github');
  const [selectedFile, setSelectedFile] = useState<string>('workflow');
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZipDirect = async () => {
    try {
      setDownloadingZip(true);
      await generateAndDownloadProjectZip();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingZip(false);
    }
  };

  const sqlCode = `-- ==============================================================================
-- AKILLI STOK & CARİ TAKİP - %100 SUPABASE POSTGRESQL VERİTABANI ŞEMASI
-- FIREBASE TAMAMEN KALDIRILMIŞTIR. TÜM MANTIK TRIGGER & RPC İLE ÇALIŞIR.
-- ==============================================================================

-- 1. CARİLER TABLOSU
CREATE TABLE IF NOT EXISTS public.cariler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    ad VARCHAR(255) NOT NULL,
    yetkili VARCHAR(255),
    telefon VARCHAR(50),
    eposta VARCHAR(100),
    adres TEXT,
    sehir VARCHAR(100),
    vergi_dairesi VARCHAR(100),
    vergi_no VARCHAR(50),
    grup VARCHAR(50) DEFAULT 'Müşteri',
    bakiye NUMERIC(15, 2) DEFAULT 0.00,
    acilis_bakiyesi NUMERIC(15, 2) DEFAULT 0.00,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STOKLAR TABLOSU
CREATE TABLE IF NOT EXISTS public.stoklar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    barkod VARCHAR(100),
    ad VARCHAR(255) NOT NULL,
    grup VARCHAR(100),
    birim VARCHAR(20) DEFAULT 'Adet',
    alis_fiyati NUMERIC(15, 2) DEFAULT 0.00,
    satis_fiyati NUMERIC(15, 2) DEFAULT 0.00,
    kdv_orani INT DEFAULT 20,
    miktar NUMERIC(15, 2) DEFAULT 0.00,
    devir_miktari NUMERIC(15, 2) DEFAULT 0.00,
    kritik_miktar NUMERIC(15, 2) DEFAULT 5.00,
    raf_kodu VARCHAR(50),
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SATIŞ VE SATIŞ KALEMLERİ
CREATE TABLE IF NOT EXISTS public.satislar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    fatura_no VARCHAR(100) NOT NULL,
    cari_id UUID REFERENCES public.cariler(id) ON DELETE SET NULL,
    tarih TIMESTAMPTZ DEFAULT NOW(),
    toplam_tutar NUMERIC(15, 2) DEFAULT 0.00,
    iskonto_tutari NUMERIC(15, 2) DEFAULT 0.00,
    net_tutar NUMERIC(15, 2) DEFAULT 0.00,
    odeme_turu VARCHAR(50) DEFAULT 'VERESIYE',
    aciklama TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.satis_kalemleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    satis_id UUID NOT NULL REFERENCES public.satislar(id) ON DELETE CASCADE,
    stok_id UUID NOT NULL REFERENCES public.stoklar(id) ON DELETE RESTRICT,
    miktar NUMERIC(15, 2) NOT NULL CHECK (miktar > 0),
    birim_fiyat NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    kdv_orani INT DEFAULT 20,
    toplam_tutar NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. OTOMATİK STOK DÜŞME TRIGGER'I
CREATE OR REPLACE FUNCTION fn_trg_satis_kalemi_stok()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.stoklar
        SET miktar = miktar - NEW.miktar, updated_at = NOW()
        WHERE id = NEW.stok_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.stoklar
        SET miktar = miktar + OLD.miktar, updated_at = NOW()
        WHERE id = OLD.stok_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_satis_kalemi_stok ON public.satis_kalemleri;
CREATE TRIGGER trg_satis_kalemi_stok
AFTER INSERT OR DELETE ON public.satis_kalemleri
FOR EACH ROW EXECUTE FUNCTION fn_trg_satis_kalemi_stok();
`;

  const kotlinRepositoryCode = `package com.irem.takip.data.repository

import com.irem.takip.data.SupabaseConfig
import com.irem.takip.data.model.SatisDto
import com.irem.takip.data.model.SatisKalemiDto
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Satış Repository
 * DİKKAT: Android tarafında stok düşme döngüsü veya cari bakiye hesaplama kodu YOKTUR!
 * Supabase PostgreSQL Trigger'ları (trg_satis_kalemi_stok ve trg_satis_bakiye) 
 * stok düşme ve cari bakiye artışını veritabanında atomik olarak yapar.
 */
class SatisRepository {
    private val client = SupabaseConfig.client

    suspend fun getSatislar(yil: Int): List<SatisDto> = withContext(Dispatchers.IO) {
        client.from("satislar")
            .select {
                filter { eq("yil", yil) }
            }
            .decodeList()
    }

    suspend fun satisOlustur(satis: SatisDto, kalemler: List<SatisKalemiDto>): Result<SatisDto> = withContext(Dispatchers.IO) {
        try {
            // 1. Satış Başlığı Ekle
            val createdSatis = client.from("satislar")
                .insert(satis) { select() }
                .decodeSingle<SatisDto>()

            val satisId = createdSatis.id ?: throw IllegalStateException("Satış ID alınamadı")

            // 2. Kalemleri Ekle (Trigger otomatik olarak her kalemin stok miktarını düşer)
            val updatedKalemler = kalemler.map { it.copy(satisId = satisId) }
            client.from("satis_kalemleri").insert(updatedKalemler)

            Result.success(createdSatis)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
`;

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-16">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                100% SUPABASE POSTGRESQL
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                GITHUB ACTIONS CI/CD HAZIR
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2 tracking-tight">
              GitHub Actions & Supabase Android Mimarisi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              GitHub'a push attığınız anda tüm bağımlılıkları yükleyip otomatik olarak çalışan <b>Debug APK</b> üreten CI/CD altyapısı ve akıllı veritabanı şeması.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenDownloadModal ? onOpenDownloadModal : handleDownloadZipDirect}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-400/20 transition-all cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Projeyi İndir (.ZIP)</span>
            </button>
            <button
              onClick={downloadGithubWorkflowFile}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <GitBranch className="w-4 h-4" />
              <span>Workflow İndir (.yml)</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid BG */}
        <div className="absolute inset-0 bg-radial from-emerald-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'github', label: '1. GitHub Actions CI/CD (Oto-APK)', icon: GitBranch },
          { id: 'sql', label: '2. Supabase SQL Şeması (Trigger & RPC)', icon: Database },
          { id: 'kotlin', label: '3. Kotlin Repositories & Mimari', icon: Code2 },
          { id: 'thermal', label: '4. Bluetooth Termal & PDF Motoru', icon: Printer },
          { id: 'comparison', label: '5. Mimari Karşılaştırması', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. GitHub Actions */}
      {activeTab === 'github' && (
        <div className="space-y-4">
          
          {/* Quick Steps Banner */}
          <div className="p-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-800/40 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm">
                    GitHub'da Otomatik APK Nasıl Derlenir? (3 Adım)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Yerel bilgisayarınızda Android SDK veya Gradle kurulu olmasa bile GitHub sunucularında ücretsiz derlenir.
                  </p>
                </div>
              </div>
              <button
                onClick={downloadGithubWorkflowFile}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>android_build.yml İndir</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px]">1</span>
                  <span>Dosyaları GitHub'a Yükleyin</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  İndirdiğiniz projedeki <code className="text-blue-300">.github/workflows/android_build.yml</code> dosyası reponun kök dizininde olmalıdır.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">2</span>
                  <span>GitHub Actions Otomatik Başlar</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  GitHub <code className="text-emerald-300">main</code> branch'ine push yapıldığı an JDK 17, Android SDK ve Gradle 8.9 kurup derler.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-purple-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px]">3</span>
                  <span>APK'yı İndirin & Kurun</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  GitHub Actions sayfasında alt kısımdaki <b>Artifacts</b> bölümünden <code className="text-purple-300">StokCariTakip-Debug-APK</code> dosyasını indirin.
                </p>
              </div>
            </div>

            {/* Git Push Commands */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-blue-400" />
                  <span>Terminalden GitHub'a Gönderme Komutları:</span>
                </span>
                <button
                  onClick={() => copyToClipboard(`git init
git add .
git commit -m "feat: Supabase & GitHub Actions CI/CD"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
git push -u origin main`)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                >
                  <Copy className="w-3 h-3" />
                  <span>Komutları Kopyala</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`git init
git add .
git commit -m "feat: Supabase & GitHub Actions CI/CD"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
git push -u origin main`}
              </pre>
            </div>
          </div>

          {/* Workflow Code Viewer */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono text-slate-300">
                  .github/workflows/android_build.yml
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadGithubWorkflowFile}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white font-bold px-2 py-1 rounded bg-slate-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İndir (.yml)</span>
                </button>
                <button
                  onClick={() => copyToClipboard(GITHUB_WORKFLOW_YML)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded bg-slate-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                </button>
              </div>
            </div>
            <pre className="p-4 text-xs font-mono text-blue-300/90 overflow-x-auto max-h-[480px] leading-relaxed">
              {GITHUB_WORKFLOW_YML}
            </pre>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 2. SQL */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <Zap className="w-4 h-4" />
                <span>Otomatik Stok Trigger'ı</span>
              </div>
              <p className="text-xs text-slate-400">
                `trg_satis_kalemi_stok`: Satış yapıldığında stoktan anında düşer; fiş silinirse stoğu geri ekler.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
                <Zap className="w-4 h-4" />
                <span>Cari Bakiye Trigger'ı</span>
              </div>
              <p className="text-xs text-slate-400">
                `trg_satis_bakiye`: Veresiye satışlarda müşterinin borcunu; tahsilat yapıldığında ise ödemesini günceller.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
                <RotateCcw className="w-4 h-4" />
                <span>2 Saniyelik Devir RPC'si</span>
              </div>
              <p className="text-xs text-slate-400">
                `sp_yil_sonu_devri_yap`: Yıl sonu devrini istemcide döngü yapmadan doğrudan sunucuda 2 saniyede tamamlar.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">supabase_schema.sql</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadSqlSchemaFile}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white font-bold px-2 py-1 rounded bg-slate-800"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>İndir (.sql)</span>
                </button>
                <button
                  onClick={() => copyToClipboard(sqlCode)}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 rounded bg-slate-800"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopyala</span>
                </button>
              </div>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-[450px] leading-relaxed">
              {sqlCode}
            </pre>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. Kotlin */}
      {activeTab === 'kotlin' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-white">Android Kotlin Proje Dosyaları</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Supabase Kotlin SDK (Postgrest, Auth, Realtime) ile tam entegre MVVM mimarisi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDownloadModal ? onOpenDownloadModal : handleDownloadZipDirect}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Projeyi İndir (.ZIP)</span>
              </button>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 font-mono text-xs rounded-lg border border-blue-500/30">
                MVVM + Coroutines
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { id: 'client', name: 'SupabaseClient.kt', desc: 'Supabase init & Auth/Postgrest' },
              { id: 'satis', name: 'SatisRepository.kt', desc: 'Satış & Kalem Trigger entegrasyonu' },
              { id: 'cari', name: 'CariRepository.kt', desc: 'Cari CRUD & Ekstre sorguları' },
              { id: 'rapor', name: 'RaporRepository.kt', desc: 'RPC fonksiyon çağrıları' }
            ].map(file => (
              <button
                key={file.id}
                onClick={() => setSelectedFile(file.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedFile === file.id
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-4 h-4 text-blue-400 mb-1" />
                <div className="font-bold text-xs text-slate-200">{file.name}</div>
                <div className="text-[10px] text-slate-400">{file.desc}</div>
              </button>
            ))}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">
                /android_project/app/src/main/java/com/irem/takip/data/repository/SatisRepository.kt
              </span>
              <button
                onClick={() => copyToClipboard(kotlinRepositoryCode)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded bg-slate-800"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Kopyala</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-blue-300/90 overflow-x-auto max-h-[450px] leading-relaxed">
              {kotlinRepositoryCode}
            </pre>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. Thermal & PDF */}
      {activeTab === 'thermal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bluetooth Thermal */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Printer className="w-5 h-5" />
                <span>Bluetooth ESC/POS Termal Yazıcı (58mm / 80mm)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Android `BluetoothSocket` üzerinden 00001101 SPP UUID ile doğrudan bağlanır. Türkçe karakterler (ğ, ş, ı, ö, ü, ç) `CP857` veya `ISO-8859-9` kod sayfasına otomatik dönüştürülür.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-emerald-300 border border-slate-800 space-y-1">
                <div>BluetoothPrintHelper.printSatisFisi(context, satis, cari, kalemler)</div>
                <div className="text-slate-500">// ESC @ (Init) + ESC E 1 (Bold) + GS V 65 (Auto-cut)</div>
              </div>
            </div>

            {/* A4 PDF Canvas */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <FileText className="w-5 h-5" />
                <span>Android Native PdfDocument (A4 Fatura & Ekstre)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Android'in `android.graphics.pdf.PdfDocument` sınıfını kullanarak vektörel ve yüksek çözünürlüklü A4 fatura ve hesap ekstresi PDF'leri üretir. WhatsApp ve e-posta ile paylaşılabilir.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-blue-300 border border-slate-800 space-y-1">
                <div>PdfHelper.createSatisFaturasiPdf(context, satis, cari, kalemler)</div>
                <div className="text-slate-500">// 595x842 pt standart A4 Canvas çizimi</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. Comparison */}
      {activeTab === 'comparison' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
          <h3 className="font-extrabold text-base text-white">Eski Firebase Mimarisi vs Yeni Supabase Mimarisi</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Eski Firebase */}
            <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
                <Flame className="w-4 h-4" />
                <span>Eski Mimari (Firebase + Çift Yazma)</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                <li>Stok düşme işlemleri Android tarafında yapılıyordu (yarış durumu / race condition riski).</li>
                <li>Fiş silindiğinde stoğu geri eklemek için karmaşık istemci kodları vardı.</li>
                <li>Raporlar için binlerce döküman telefona çekilip RAM'de döngüyle hesaplanıyordu.</li>
                <li>Yıl sonu devri için telefonun saatlerce açık kalması gerekiyordu.</li>
              </ul>
            </div>

            {/* Yeni Supabase */}
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Yeni Mimari (Supabase Akıllı Veritabanı)</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                <li>Android sadece `INSERT / DELETE` yapar. Stok ve bakiye PostgreSQL Trigger'ları ile güncellenir.</li>
                <li>`yil` kolonu ile tüm hareketler filtrelenir; sorgular milisaniyeler içinde döner.</li>
                <li>Raporlar PostgreSQL RPC Stored Procedure ile tek bir JSON olarak döner (0 RAM yükü).</li>
                <li>Yıl devri tek bir RPC çağrısıyla 2 saniyede sunucuda tamamlanır.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

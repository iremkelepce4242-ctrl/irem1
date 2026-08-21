import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { AndroidPhoneLayout } from './components/android/AndroidPhoneLayout';
import { SupabaseArchitectureHub } from './components/docs/SupabaseArchitectureHub';
import { ThermalPrinterModal } from './components/modals/ThermalPrinterModal';
import { PdfPreviewModal } from './components/modals/PdfPreviewModal';
import { DownloadProjectModal } from './components/modals/DownloadProjectModal';
import { generateAndDownloadProjectZip } from './utils/zipExporter';
import { Smartphone, Database, Zap, Sparkles, Printer, FileText, CheckCircle2, Download, FolderArchive } from 'lucide-react';

export function App() {
  const [activeView, setActiveView] = useState<'app' | 'architecture'>('app');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloadingFast, setIsDownloadingFast] = useState(false);

  const handleQuickZipDownload = async () => {
    try {
      setIsDownloadingFast(true);
      await generateAndDownloadProjectZip();
    } catch (e) {
      console.error('Download error', e);
    } finally {
      setIsDownloadingFast(false);
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        
        {/* Top App Header & Switcher */}
        <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20">
                ST
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    Stok & Cari Takip
                  </h1>
                  <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    %100 Supabase (No Firebase)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Android Kotlin + PostgreSQL Trigger Mimarisi</p>
              </div>
            </div>

            {/* Actions: View Switcher + Direct Download Button */}
            <div className="flex items-center gap-2">
              
              {/* Direct Download Button */}
              <button
                id="btn-header-download-zip"
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 transition-all cursor-pointer animate-pulse"
                title="Tüm Android Studio projesini ve SQL dosyasını indir"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dosyaları İndir (.ZIP)</span>
                <span className="md:hidden">İndir</span>
              </button>

              {/* View Switcher: App vs Architecture & SQL */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
                <button
                  id="btn-view-app"
                  onClick={() => setActiveView('app')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                    activeView === 'app'
                      ? 'bg-slate-700 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Android Önizleme</span>
                  <span className="sm:hidden">Önizleme</span>
                </button>

                <button
                  id="btn-view-architecture"
                  onClick={() => setActiveView('architecture')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                    activeView === 'architecture'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SQL &amp; Kotlin Kodları</span>
                  <span className="sm:hidden">Kodlar</span>
                </button>
              </div>

            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 py-4 px-2 sm:px-6 max-w-7xl mx-auto w-full">
          {activeView === 'app' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Interactive Android Device */}
              <div className="lg:col-span-6 flex justify-center">
                <AndroidPhoneLayout />
              </div>

              {/* Right Column: Live Trigger & Architecture Activity Feed */}
              <div className="lg:col-span-6 space-y-4 pt-2 hidden lg:block">
                
                {/* Download CTA Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <FolderArchive className="w-4 h-4" />
                      <span>Tam Proje Dosyaları Hazır</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ZIP Paketi
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-white">
                    Android Studio Projesi + Supabase SQL Şeması
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tüm Kotlin sınıfları (Repository'ler, View Model'ler, Bluetooth Termal Yazıcı, PDF Oluşturucu), Gradle yapılandırmaları ve Supabase PostgreSQL Trigger SQL dosyası tek bir ZIP içinde indirilmeye hazırdır.
                  </p>

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => setIsDownloadModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Dosyaları İndir (.ZIP / .SQL)</span>
                    </button>
                    <button
                      onClick={() => setActiveView('architecture')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                    >
                      Kodları İncele
                    </button>
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    <span>Akıllı Veritabanı (Smart Database) Çalışma Prensibi</span>
                  </div>
                  <h3 className="font-extrabold text-lg text-white">
                    Android Cihazda Sıfır Matematik Yükü
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Eski projedeki çift yazma ve istemci taraflı döngüler tamamen silindi. Android uygulamanız sadece <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded">satis_kalemleri</code> veya <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded">tahsilatlar</code> tablosuna tek bir <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded">INSERT</code> gönderir. Stok düşme, bakiye hesaplama ve kural denetimi Supabase PostgreSQL Trigger'ları tarafından atomik olarak gerçekleştirilir.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>yil (INT) Kolonu</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Her hareket tablosu yıl kolonuyla indekslenmiştir. Yıllar arası sorgularda veri kirliliği olmaz.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                      <div className="font-bold text-blue-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>2 Saniyede Yıl Devri</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        <code className="text-[10px]">sp_yil_sonu_devri_yap</code> RPC'si ile tek tıkla yeni yıla devir yapılır.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Print & PDF Highlights */}
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                    <Printer className="w-4 h-4" />
                    <span>Termal Yazıcı &amp; PDF Motoru Korundu</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Eski projenizdeki 58mm / 80mm ESC/POS Bluetooth termal yazıcı çıktıları ve A4 PDF fatura / ekstre oluşturma kodları modern Kotlin helper sınıflarına dönüştürüldü.
                  </p>
                </div>

              </div>

            </div>
          ) : (
            <SupabaseArchitectureHub onOpenDownloadModal={() => setIsDownloadModalOpen(true)} />
          )}
        </main>

        {/* Global Modals for Download, ESC/POS Thermal Receipt, and A4 PDF */}
        <DownloadProjectModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
        />
        <ThermalPrinterModal />
        <PdfPreviewModal />

      </div>
    </AppProvider>
  );
}
export default App;


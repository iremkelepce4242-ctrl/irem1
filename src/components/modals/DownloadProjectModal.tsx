import React, { useState } from 'react';
import {
  Download,
  FolderArchive,
  FileCode,
  FileText,
  Check,
  Sparkles,
  ExternalLink,
  Smartphone,
  Layers,
  Terminal,
  Copy,
  GitBranch
} from 'lucide-react';
import {
  generateAndDownloadProjectZip,
  downloadSqlSchemaFile,
  downloadGithubWorkflowFile,
  downloadReadmeFile
} from '../../utils/zipExporter';

interface DownloadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadProjectModal: React.FC<DownloadProjectModalProps> = ({ isOpen, onClose }) => {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadedZipSuccess, setDownloadedZipSuccess] = useState(false);
  const [downloadedSqlSuccess, setDownloadedSqlSuccess] = useState(false);
  const [downloadedWorkflowSuccess, setDownloadedWorkflowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      await generateAndDownloadProjectZip();
      setDownloadedZipSuccess(true);
      setTimeout(() => setDownloadedZipSuccess(false), 4000);
    } catch (e) {
      console.error('ZIP indirme hatası:', e);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadSql = () => {
    downloadSqlSchemaFile();
    setDownloadedSqlSuccess(true);
    setTimeout(() => setDownloadedSqlSuccess(false), 3000);
  };

  const handleDownloadWorkflow = () => {
    downloadGithubWorkflowFile();
    setDownloadedWorkflowSuccess(true);
    setTimeout(() => setDownloadedWorkflowSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Proje Dosyalarını İndir (.ZIP &amp; CI/CD)
              </h3>
              <p className="text-xs text-slate-400">
                Android Studio tam kaynak kodları, GitHub Actions CI/CD ve Supabase şeması
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300">
          
          {/* Main Action: 1-Click ZIP Package */}
          <div className="p-5 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/40 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                    ÖNERİLEN
                  </span>
                  <h4 className="font-bold text-white text-base">
                    Tüm Proje Paketi (.ZIP)
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  GitHub'a doğrudan push edip otomatik APK derleyebileceğiniz eksiksiz proje klasörü.
                </p>
              </div>

              <button
                id="btn-download-full-zip"
                onClick={handleDownloadZip}
                disabled={downloadingZip}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all shrink-0 cursor-pointer"
              >
                {downloadingZip ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Paketleniyor...</span>
                  </>
                ) : downloadedZipSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>İndirildi!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Hemen İndir (.ZIP)</span>
                  </>
                )}
              </button>
            </div>

            {/* ZIP Contents List */}
            <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
              <div className="text-emerald-400 font-bold text-[11px] mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>ZIP Paketi İçeriği:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-400">⚡</span>
                  <span>.github/workflows/android_build.yml</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">📁</span>
                  <span>/app/src/main/java/... (Kotlin MVVM)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-400">📄</span>
                  <span>supabase_schema.sql (Trigger &amp; RPC)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">⚙️</span>
                  <span>gradlew &amp; build.gradle.kts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-400">🖨️</span>
                  <span>BluetoothPrintHelper.kt &amp; PdfHelper.kt</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-300">📖</span>
                  <span>README_KURULUM.md (Rehber)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Separate Downloads */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* GitHub Workflow */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  <span>GitHub Actions Workflow</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mevcut reponuza eklemek için <code className="text-blue-300">android_build.yml</code> dosyası.
                </p>
              </div>

              <button
                id="btn-download-workflow-file"
                onClick={handleDownloadWorkflow}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                {downloadedWorkflowSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>İndirildi (.yml)</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Workflow İndir</span>
                  </>
                )}
              </button>
            </div>

            {/* SQL Only */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>SQL Şeması</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supabase SQL Editor için <code className="text-emerald-300">supabase_schema.sql</code>.
                </p>
              </div>

              <button
                id="btn-download-sql-file"
                onClick={handleDownloadSql}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                {downloadedSqlSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>İndirildi (.sql)</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>SQL İndir</span>
                  </>
                )}
              </button>
            </div>

            {/* Readme Guide */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Kılavuz (.md)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  GitHub &amp; Supabase adım adım kurulum dokümantasyonu.
                </p>
              </div>

              <button
                id="btn-download-readme-file"
                onClick={downloadReadmeFile}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>README İndir</span>
              </button>
            </div>

          </div>

          {/* 3 Step Android Studio Setup Guide */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>GitHub'a Nasıl Gönderilir?</span>
            </h5>
            <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto">
              <div>git init &amp;&amp; git add .</div>
              <div>git commit -m "feat: Supabase &amp; GitHub Actions CI/CD"</div>
              <div>git branch -M main</div>
              <div>git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git</div>
              <div>git push -u origin main</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  Smartphone,
  Code2,
  Calendar,
  Zap,
  RotateCcw,
  FileCode,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { YilDevirModal } from './android/YilDevirModal';

export const Header: React.FC = () => {
  const { viewMode, setViewMode, aktifYil, setAktifYil, triggerLogs } = useApp();
  const [showDevirModal, setShowDevirModal] = useState(false);

  return (
    <>
      <header id="main-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Architecture Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl">
              <Database className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">Stok & Cari Takip</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Supabase Backend
                </span>
                <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Firebase Yok (0% Çift Yazma)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PostgreSQL Triggers • Stored Procedures (RPC) • ESC/POS & PDF Fiş Çıktısı
              </p>
            </div>
          </div>

          {/* Right Controls: Year Selector, Devir Button, View Mode */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            
            {/* Year Selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-1">
              <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Yıl:</span>
              </span>
              {[2024, 2025, 2026].map(yr => (
                <button
                  key={yr}
                  id={`year-btn-${yr}`}
                  onClick={() => setAktifYil(yr)}
                  className={`text-xs px-2.5 py-1 rounded font-bold transition-all ${
                    aktifYil === yr
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Yıl Sonu Devir Butonu */}
            <button
              id="btn-yil-devri"
              onClick={() => setShowDevirModal(true)}
              title="Yıl Sonu Devir İşlemini Başlat (sp_yil_sonu_devri_yap RPC)"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Yıl Devir Sihirbazı</span>
              <span className="md:hidden">Devir</span>
            </button>

            {/* View Mode Toggle: Android UI vs. Developer Center */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
              <button
                id="btn-view-mobile"
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android UI</span>
              </button>
              <button
                id="btn-view-dev"
                onClick={() => setViewMode('developer')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'developer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase & Kotlin Kodları</span>
                {triggerLogs.length > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                    {triggerLogs.length}
                  </span>
                )}
              </button>
            </div>

          </div>

        </div>
      </header>

      {showDevirModal && <YilDevirModal onClose={() => setShowDevirModal(false)} />}
    </>
  );
};

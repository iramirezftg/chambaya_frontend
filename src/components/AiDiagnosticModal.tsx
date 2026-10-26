"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { api, AiDiagnosticResult } from '../lib/api';
import {
  X,
  Sparkles,
  Bot,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Wrench,
  Clock,
  ShieldCheck,
  Calendar,
  Radio,
  FileText,
  Copy,
  ChevronRight,
  Maximize2,
  Cpu,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AiDiagnosticModal = () => {
  const {
    showAiDiagnosticModal,
    setShowAiDiagnosticModal,
    setShowEmergencyModal,
    customerUser,
    refreshData
  } = usePlatform();

  const [presets, setPresets] = useState<any[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnostic, setDiagnostic] = useState<AiDiagnosticResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Load presets on mount
  useEffect(() => {
    if (showAiDiagnosticModal) {
      api.getAiPresets().then(setPresets).catch(() => {});
      setErrorMsg(null);
      setSuccessMsg(null);
      setBookingSuccess(null);
    }
  }, [showAiDiagnosticModal]);

  if (!showAiDiagnosticModal) return null;

  const handleSelectPreset = (p: any) => {
    setPhotoUrl(p.photoUrl);
    setDescription(p.description);
    setDiagnostic(null);
    setBookingSuccess(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description && !photoUrl) {
      setErrorMsg('Por favor escribe qué ocurre o ingresa la URL de una foto.');
      return;
    }

    try {
      setAnalyzing(true);
      setErrorMsg(null);
      setBookingSuccess(null);

      // Simular escaneo de red neuronal
      const res = await api.analyzeAiProblem({
        description,
        photoUrl: photoUrl || undefined
      });

      setDiagnostic(res);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al analizar con ChambaIA');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConvertBooking = async (isEmergency = false) => {
    if (!diagnostic) return;
    try {
      setAnalyzing(true);
      setErrorMsg(null);
      const res = await api.convertAiDiagnosticToBooking({
        diagnosticId: diagnostic.diagnosticId,
        customerName: customerUser?.name || 'Cliente ChambaIA',
        customerPhone: customerUser?.phone || '+52 55 7281 1933',
        customerEmail: customerUser?.email || 'cliente@gmail.com',
        customerAddress: customerUser?.address || 'Calle Orizaba 142, Col. Roma Norte, CDMX',
        isEmergency
      });
      setBookingSuccess(res);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al agendar orden');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyQuote = () => {
    if (!diagnostic) return;
    const summary = `📋 *Cotización ChambaIA #${diagnostic.diagnosticId}*\n🔧 Avería: ${diagnostic.problemTitle}\n💵 Rango Estimado: $${diagnostic.totalEstimatedRange.minMxn} - $${diagnostic.totalEstimatedRange.maxMxn} MXN\n⏱️ Mano de Obra: ~$${diagnostic.laborEstimate.typicalMxn} MXN (${diagnostic.laborEstimate.durationMinutes} min)\n🛡️ Garantía Escrow 48 hrs respaldada por ChambaYa México.`;
    navigator.clipboard.writeText(summary);
    setSuccessMsg('📋 Resumen de cotización copiado al portapapeles.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-violet-500/50 rounded-3xl shadow-[0_0_60px_rgba(139,92,246,0.3)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 border-b border-violet-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/40">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-full">
                  Motor Multimodal ChambaIA 🤖
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  v2.4 México
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">
                Cotizador Digital & Diagnóstico Fotográfico Asistido por IA
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowAiDiagnosticModal(false)}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Top Presets Gallery */}
          {!diagnostic && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span>Casos Típicos de Prueba (Haz clic para cargar muestra):</span>
                </label>
                <span className="text-[11px] text-slate-400">4 presets con fotos reales</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-violet-500/60 hover:bg-slate-800/40 text-left transition-all group"
                  >
                    <div className="relative rounded-lg overflow-hidden h-20 mb-2 border border-slate-800">
                      <img src={p.photoUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">
                        {p.category}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-200 line-clamp-1">{p.title}</div>
                    <div className="text-[10px] text-violet-400 font-semibold mt-0.5">{p.estimatedTotal}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          {!diagnostic ? (
            <form onSubmit={handleAnalyze} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Describe lo que ocurre (o lo que escuchas / hueles)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Tengo una fuga en un tubo de cobre saliendo de la pared..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    URL de Foto / Imagen de la Avería
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {photoUrl && (
                <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-slate-700">
                  <img src={photoUrl} alt="Vista previa de avería" className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2 right-2 p-1 bg-black/70 rounded-md text-white text-xs hover:bg-black"
                  >
                    Quitar foto
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={analyzing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>Analizando con Red Neuronal ChambaIA...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>⚡ Diagnosticar Avería & Calcular Presupuesto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* RESULTS VIEW */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              
              {/* Top Banner Result */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/40 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Folio #{diagnostic.diagnosticId}
                    </span>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {diagnostic.tradeCategory}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                      diagnostic.urgencyLevel === 'CRITICA' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      Prioridad {diagnostic.urgencyLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{diagnostic.confidenceScore}% Precisión Técnica</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white">{diagnostic.problemTitle}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {diagnostic.plainDescription}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">Normativa Mexicana: <strong className="text-slate-200">{diagnostic.nomReference}</strong></span>
                  <button
                    type="button"
                    onClick={() => setDiagnostic(null)}
                    className="text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    ← Analizar otra avería
                  </button>
                </div>
              </div>

              {/* Price Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Refacciones */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-2">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Refacciones Sugeridas</span>
                      </span>
                      <span>({diagnostic.materialsRequired.length})</span>
                    </div>
                    <div className="space-y-2">
                      {diagnostic.materialsRequired.map((m, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px]">
                          <div className="font-semibold text-slate-200">{m.item}</div>
                          <div className="flex justify-between items-center text-slate-400 mt-0.5">
                            <span className="text-[10px]">{m.store}</span>
                            <span className="font-bold text-amber-300">${m.estimatedCostMxn} MXN</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mano de Obra */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-indigo-400 font-bold mb-2 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Mano de Obra Certificada</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Tarifa Mínima:</span>
                        <span className="font-mono">${diagnostic.laborEstimate.minMxn} MXN</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800 font-bold text-white">
                        <span>Tarifa Típica Justa:</span>
                        <span className="font-mono text-indigo-400">${diagnostic.laborEstimate.typicalMxn} MXN</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Tarifa Compleja (Tope):</span>
                        <span className="font-mono">${diagnostic.laborEstimate.maxMxn} MXN</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tiempo estimado de obra: ~{diagnostic.laborEstimate.durationMinutes} minutos</span>
                  </div>
                </div>

                {/* Total Range */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/40 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Presupuesto Total Estimado</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
                      ${diagnostic.totalEstimatedRange.minMxn} – ${diagnostic.totalEstimatedRange.maxMxn}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Incluye refacciones obligatorias y mano de obra garantizada por 48 hrs en Bóveda Escrow.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyQuote}
                    className="mt-3 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Ficha de Cotización</span>
                  </button>
                </div>

              </div>

              {/* Safety Advice Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-xs text-amber-200 uppercase tracking-wider">
                    Medidas de Seguridad Inmediatas (Mientras llega el técnico)
                  </h4>
                </div>
                <ul className="text-xs text-amber-300/90 space-y-1 list-disc list-inside">
                  {diagnostic.safetyAdvice.map((adv, idx) => (
                    <li key={idx}>{adv}</li>
                  ))}
                </ul>
              </div>

              {/* Success Booking Notice */}
              {bookingSuccess && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white">
                      🎉 ¡Orden #{bookingSuccess.bookingId} agendada con éxito!
                    </div>
                    <div className="text-slate-300 mt-0.5">
                      PIN de Seguridad: <strong className="text-emerald-400 font-mono">{bookingSuccess.otp}</strong> • Fondos custodiados en Bóveda Escrow.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAiDiagnosticModal(false)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                  >
                    Ver en Mis Chambas
                  </button>
                </div>
              )}

              {/* Action Buttons Footer */}
              {!bookingSuccess && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleConvertBooking(false)}
                    disabled={analyzing}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar Cita Normal (${diagnostic.laborEstimate.typicalMxn} MXN)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAiDiagnosticModal(false);
                      setShowEmergencyModal(true);
                    }}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>🚨 Despachar por Emergencia SOS 24/7 (&lt; 30 min)</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>ChambaIA Tabulador de Precios Justos México • Tolerancia de Mano de Obra ±10%</span>
          </div>
          <button
            onClick={() => setShowAiDiagnosticModal(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

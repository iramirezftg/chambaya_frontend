"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { api, EmergencyQuote } from '../lib/api';
import {
  X,
  AlertTriangle,
  Zap,
  Droplets,
  KeyRound,
  Flame,
  Radio,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EMERGENCY_PRESETS = [
  {
    type: 'FUGA_AGUA' as const,
    title: 'Fuga de Agua / Inundación 💧',
    icon: Droplets,
    color: 'from-blue-600/30 to-cyan-500/10 border-blue-500/40 text-blue-400',
    accent: 'bg-blue-500',
    description: 'Tubería rota, fuga activa en baño/cocina, boiler derramando agua.',
    defaultNote: 'Tubería de cobre con fuga activa en codo de 1/2 pulgada. El agua se está acumulando.',
    severity: 'CRITICA' as const
  },
  {
    type: 'CORTO_CIRCUITO' as const,
    title: 'Cortocircuito / Sin Luz ⚡',
    icon: Zap,
    color: 'from-amber-600/30 to-yellow-500/10 border-amber-500/40 text-amber-400',
    accent: 'bg-amber-500',
    description: 'Pastilla botada, chispas en centro de carga, olor a quemado.',
    defaultNote: 'Chispas en pastilla térmica del centro de carga y departamento completamente sin energía.',
    severity: 'CRITICA' as const
  },
  {
    type: 'CERRADURA' as const,
    title: 'Cerradura Bloqueada / Llaves 🔑',
    icon: KeyRound,
    color: 'from-emerald-600/30 to-teal-500/10 border-emerald-500/40 text-emerald-400',
    accent: 'bg-emerald-500',
    description: 'Puerta trabada, chapa forzada, llaves olvidadas adentro.',
    defaultNote: 'Llave quebrada dentro de la chapa principal. Sin acceso al domicilio.',
    severity: 'ALTA' as const
  },
  {
    type: 'GAS_LP' as const,
    title: 'Fuga de Gas LP / Boiler 💨',
    icon: Flame,
    color: 'from-red-600/30 to-rose-500/10 border-red-500/40 text-red-400',
    accent: 'bg-red-500',
    description: 'Olor a gas en estufa, calentador o manguera de cilindro/estacionario.',
    defaultNote: 'Fuerte olor a gas cerca del regulador del calentador de agua en patio de servicio.',
    severity: 'CRITICA' as const
  }
];

export const EmergencySosModal = () => {
  const {
    showEmergencyModal,
    setShowEmergencyModal,
    customerUser,
    setTrackingBookingId,
    refreshData
  } = usePlatform();

  const [selectedType, setSelectedType] = useState<'FUGA_AGUA' | 'CORTO_CIRCUITO' | 'CERRADURA' | 'GAS_LP' | 'OTRO'>('FUGA_AGUA');
  const [severity, setSeverity] = useState<'CRITICA' | 'ALTA'>('CRITICA');
  const [address, setAddress] = useState(customerUser?.address || 'Calle Orizaba 142, Depto 4B, Col. Roma Norte, CDMX');
  const [phone, setPhone] = useState(customerUser?.phone || '+52 55 7281 1933');
  const [notes, setNotes] = useState('Tubería de cobre con fuga activa en llave de paso. Agua saliendo a presión.');

  // Quote State
  const [quote, setQuote] = useState<EmergencyQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Dispatch Mode State
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(45);
  const [techAccepted, setTechAccepted] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-quote when selection changes
  useEffect(() => {
    if (!showEmergencyModal) {
      setIsDispatching(false);
      setDispatchResult(null);
      setTechAccepted(null);
      return;
    }

    setLoadingQuote(true);
    api.quoteEmergency({
      emergencyType: selectedType,
      severity,
      address
    })
      .then(res => setQuote(res))
      .catch(err => console.error('Error al cotizar urgencia:', err))
      .finally(() => setLoadingQuote(false));
  }, [showEmergencyModal, selectedType, severity, address]);

  // Countdown timer during dispatch
  useEffect(() => {
    if (!isDispatching || techAccepted || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isDispatching, techAccepted, countdown]);

  if (!showEmergencyModal) return null;

  const handleLaunchEmergency = async () => {
    try {
      setIsDispatching(true);
      setErrorMsg(null);
      setCountdown(45);

      const res = await api.createEmergency({
        customerName: customerUser?.name || 'Cliente Emergencia',
        customerPhone: phone,
        customerEmail: customerUser?.email || 'contacto@ejemplo.com',
        customerAddress: address,
        emergencyType: selectedType,
        severity,
        incidentDescription: notes,
        paymentMethod: 'TARJETA_DIGITAL'
      });

      setDispatchResult(res);
      await refreshData();

      // Simular aceptación técnica tras 6 segundos de radar satelital
      setTimeout(() => {
        setTechAccepted({
          name: 'Carlos Mendoza',
          title: 'Técnico Certificado de Guardia',
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
          phone: '+52 55 4912 8831',
          etaMinutes: 18,
          distanceKm: 2.1,
          rating: 4.95,
          vehicle: 'Motocicleta Utilitaria Honda Cargo 150 (Herramientas completas)'
        });
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        refreshData();
      }, 6500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Error al emitir despacho de emergencia');
      setIsDispatching(false);
    }
  };

  const handleOpenLiveTracker = () => {
    if (dispatchResult?.bookingId) {
      setShowEmergencyModal(false);
      setTrackingBookingId(dispatchResult.bookingId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-red-500/60 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.3)] overflow-hidden text-slate-100">
        
        {/* Siren Warning Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/50 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-red-900 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-500 text-white rounded-md">
                  ChambaExpress 24/7
                </span>
                <span className="text-xs font-mono text-red-400 font-bold">
                  DESPACHO INMEDIATO
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">
                Auxilio Técnico de Emergencia en Domicilio
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowEmergencyModal(false)}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isDispatching ? (
            /* PASO 1: SELECCIÓN DE EMERGENCIA Y COTIZACIÓN */
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  1. ¿Qué tipo de avería o emergencia tienes ahora mismo?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EMERGENCY_PRESETS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedType === p.type;
                    return (
                      <button
                        key={p.type}
                        type="button"
                        onClick={() => {
                          setSelectedType(p.type);
                          setSeverity(p.severity);
                          setNotes(p.defaultNote);
                        }}
                        className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                          isSelected
                            ? `bg-gradient-to-br ${p.color} ring-2 ring-red-500 shadow-lg`
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">{p.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nivel de Severidad
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSeverity('CRITICA')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        severity === 'CRITICA'
                          ? 'bg-red-600/30 border-red-500 text-red-300 ring-1 ring-red-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🚨 Crítica (&lt;25m)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeverity('ALTA')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        severity === 'ALTA'
                          ? 'bg-amber-600/30 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚠️ Alta (&lt;35m)
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Detalle de lo que ocurre (para que el técnico traiga la herramienta exacta)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Fuga de agua incontrolable en codo..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Domicilio & Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>Domicilio del Siniestro / Avería</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Teléfono Móvil (El técnico te llamará al salir)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Fee Breakdown Box */}
              {quote && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-red-950/20 border border-red-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">
                        Compromiso de Arribo: {quote.targetEtaMinutes} minutos garantizados
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Técnicos a &lt; 5 km
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Mano de obra diagnóstica especializada:</span>
                      <span className="text-slate-200 font-mono">${quote.breakdown.estimatedServiceBase.toFixed(2)} MXN</span>
                    </div>
                    <div className="flex justify-between text-amber-300/90">
                      <span className="flex items-center gap-1">
                        <span>Recargo ChambaExpress 24/7 (Guardia prioritaria):</span>
                      </span>
                      <span className="font-mono font-bold">+${quote.breakdown.totalSurcharge.toFixed(2)} MXN</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                      <span className="font-bold text-white">Total a Proteger en Bóveda Escrow:</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        ${quote.breakdown.totalEstimated.toFixed(2)} MXN
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-1">
                    🛡️ Tu pago queda custodiado en garantía. El prestador sólo cobra tras resolver la avería y cotejar fotos.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleLaunchEmergency}
                disabled={loadingQuote}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm tracking-wide uppercase shadow-xl shadow-red-600/40 flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <Radio className="w-5 h-5 animate-pulse" />
                <span>🚨 Emitir Alerta SOS & Despachar Técnico Ahora</span>
              </button>
            </div>
          ) : (
            /* PASO 2: RADAR SATELITAL DE DESPACHO FLASH */
            <div className="py-6 space-y-6 text-center">
              
              {!techAccepted ? (
                /* Radar Scanning View */
                <div className="space-y-5">
                  <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                    {/* Concentric Radar Rings */}
                    <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping duration-1000" />
                    <div className="absolute inset-4 rounded-full border border-red-500/30" />
                    <div className="absolute inset-8 rounded-full border border-red-500/40" />
                    <div className="absolute inset-14 rounded-full border border-red-500/60" />
                    
                    {/* Rotating Scanner Needle */}
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(239,68,68,0.5)_360deg)] animate-spin" />

                    {/* Center Beacon */}
                    <div className="relative z-10 w-16 h-16 rounded-full bg-red-600 border-4 border-slate-900 text-white flex flex-col items-center justify-center shadow-xl shadow-red-600/50">
                      <span className="text-lg font-black font-mono leading-none">{countdown}</span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold">seg</span>
                    </div>

                    {/* Blips */}
                    <span className="absolute top-8 left-10 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="absolute bottom-10 right-8 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">
                      Transmitiendo Despacho Satelital en Radio de 5 km...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Hemos emitido la señal de auxilio a los 4 chambeadores certificados más cercanos en la zona de <strong className="text-slate-200">{address.slice(0, 32)}...</strong>
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Folio de Emergencia: <strong className="text-white font-mono">{dispatchResult?.bookingId || 'SOS-PENDIENTE'}</strong></span>
                  </div>
                </div>
              ) : (
                /* Technician Accepted State */
                <div className="space-y-5 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      ¡Despacho Flash Aceptado!
                    </span>
                    <h3 className="text-xl font-black text-white mt-2">
                      Tu Chambeador Viene en Camino 🛵
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      El técnico recibió la alerta y activó su sirena GPS en trayecto prioritario.
                    </p>
                  </div>

                  {/* Technician Card */}
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={techAccepted.avatar}
                        alt={techAccepted.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                      />
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{techAccepted.name}</span>
                          <span className="text-[11px] text-amber-400">★ {techAccepted.rating}</span>
                        </div>
                        <div className="text-xs text-slate-400">{techAccepted.title}</div>
                        <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                          Distancia: {techAccepted.distanceKm} km • ETA: {techAccepted.etaMinutes} minutos
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${techAccepted.phone}`}
                      className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all shrink-0"
                      title="Llamar al técnico"
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                  </div>

                  {/* Security PIN Display */}
                  <div className="max-w-md mx-auto p-3.5 bg-slate-950/80 border border-dashed border-emerald-500/50 rounded-2xl flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-[11px] text-slate-400">PIN de Verificación de Arranque</div>
                      <div className="text-xl font-black tracking-widest text-emerald-400 font-mono">
                        {dispatchResult?.otp || '4821'}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 text-right max-w-[200px]">
                      Muestra este PIN cuando el técnico llegue a tu puerta para autorizar el ingreso.
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleOpenLiveTracker}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Ver Radar GPS Satelital en Tiempo Real</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmergencyModal(false)}
                      className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Cerrar y Esperar Arribo
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Póliza de Responsabilidad Civil hasta $25,000 MXN incluida en todo servicio ChambaExpress</span>
          </div>
          <span className="font-mono text-slate-500">NOM-001 / NOM-002</span>
        </div>

      </div>
    </div>
  );
};

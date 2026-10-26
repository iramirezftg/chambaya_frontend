"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { api, BookingFieldOps, BookingEvidence, BookingMaterialItem } from '../lib/api';
import {
  X,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  ShoppingBag,
  ExternalLink,
  Plus,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Sparkles,
  Store,
  DollarSign,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Upload
} from 'lucide-react';

import confetti from 'canvas-confetti';

const PHOTO_PRESETS = [
  {
    type: 'BEFORE',
    label: 'Antes: Tubería con fuga severa',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    desc: 'Fuga de agua activa en conexión principal de cobre con sarro y humedad'
  },
  {
    type: 'AFTER',
    label: 'Después: Reparación con Cople y Válvula',
    url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    desc: 'Reemplazo con niple de latón, cople nuevo y teflón de alta densidad. Prueba de presión 0 fugas'
  },
  {
    type: 'BEFORE',
    label: 'Antes: Centro de carga con falso contacto',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    desc: 'Cables recalentados y termomagnético quemado en pastilla de 30A'
  },
  {
    type: 'AFTER',
    label: 'Después: Tablero peinado y balanceado',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    desc: 'Pastilla Square D instalada, calibre 10 THW normado, peinado y rotulado según NOM-001'
  }
];

const TICKET_PRESETS = [
  {
    store: 'Home Depot Mixcoac',
    desc: 'Cople de compresión 1/2 pulgada latón + Rollo Teflón grado plomería Truper',
    amount: 185,
    ticketUrl: 'https://images.unsplash.com/photo-1554415707-9e49667ff0d7?auto=format&fit=crop&w=800&q=80'
  },
  {
    store: 'Ferreterías Fix Narvarte',
    desc: 'Válvula de esfera roscable Urrea 3/4 + Sellador de roscas Permatex',
    amount: 220,
    ticketUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80'
  },
  {
    store: 'Tlapalería La Palma (Local)',
    desc: 'Interruptor termomagnético 1P 20A Square D QO original',
    amount: 340,
    ticketUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80'
  }
];

export const FieldOpsEvidenceModal = () => {
  const { fieldOpsBookingId, setFieldOpsBookingId, currentUser, refreshData } = usePlatform();

  const [activeTab, setActiveTab] = useState<'evidence' | 'materials'>('evidence');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BookingFieldOps | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Evidence Form State
  const [evidenceType, setEvidenceType] = useState<'BEFORE' | 'AFTER' | 'IN_PROGRESS'>('BEFORE');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [savingEvidence, setSavingEvidence] = useState(false);

  // New Material Form State
  const [matStoreName, setMatStoreName] = useState('Home Depot San Jerónimo');
  const [matDesc, setMatDesc] = useState('');
  const [matAmount, setMatAmount] = useState<number>(180);
  const [matTicketUrl, setMatTicketUrl] = useState('https://images.unsplash.com/photo-1554415707-9e49667ff0d7?auto=format&fit=crop&w=800&q=80');
  const [requestingMaterial, setRequestingMaterial] = useState(false);

  // Zoom preview
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Upload States
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [uploadingTicket, setUploadingTicket] = useState(false);

  const handleUploadEvidenceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingEvidence(true);
      setErrorMsg(null);
      const res = await api.uploadFile(file, 'evidence');
      setEvidencePhotoUrl(res.url);
      setSuccessMsg('✅ Foto de evidencia cargada exitosamente');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al subir foto de evidencia');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleUploadTicketFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingTicket(true);
      setErrorMsg(null);
      const res = await api.uploadFile(file, 'tickets');
      setMatTicketUrl(res.url);
      setSuccessMsg('✅ Ticket de compra cargado exitosamente');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al subir ticket');
    } finally {
      setUploadingTicket(false);
    }
  };

  const loadFieldOps = async () => {
    if (!fieldOpsBookingId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getFieldOps(fieldOpsBookingId);
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error cargando datos de campo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fieldOpsBookingId) {
      loadFieldOps();
      setSuccessMsg(null);
      setErrorMsg(null);
    } else {
      setData(null);
      setZoomedImage(null);
    }
  }, [fieldOpsBookingId]);

  if (!fieldOpsBookingId) return null;

  const handleAddEvidence = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!evidencePhotoUrl) {
      setErrorMsg('Debes ingresar la URL o capturar la foto de la evidencia');
      return;
    }

    try {
      setSavingEvidence(true);
      setErrorMsg(null);
      await api.addBookingEvidence(fieldOpsBookingId, {
        type: evidenceType,
        photoUrl: evidencePhotoUrl,
        description: evidenceDesc || `Evidencia fotográfica ${evidenceType === 'BEFORE' ? 'previa' : 'posterior'}`
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setSuccessMsg('📸 Evidencia fotográfica geolocalizada registrada con éxito');
      setEvidencePhotoUrl('');
      setEvidenceDesc('');
      await loadFieldOps();
      refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error guardando evidencia');
    } finally {
      setSavingEvidence(false);
    }
  };

  const handleRequestMaterial = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!matDesc || matAmount <= 0 || !matTicketUrl) {
      setErrorMsg('Por favor completa descripción, ticket y monto válido en MXN');
      return;
    }

    try {
      setRequestingMaterial(true);
      setErrorMsg(null);
      await api.requestMaterialItem(fieldOpsBookingId, {
        description: matDesc,
        storeName: matStoreName,
        ticketPhotoUrl: matTicketUrl,
        amount: Number(matAmount)
      });
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      setSuccessMsg('🛒 Solicitud enviada al cliente. Se le notificó en tiempo real para autorizar');
      setMatDesc('');
      await loadFieldOps();
      refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error solicitando refacción');
    } finally {
      setRequestingMaterial(false);
    }
  };

  const handleRespondMaterial = async (itemId: string, approved: boolean, reason?: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await api.respondMaterialItem(itemId, {
        approved,
        rejectionReason: reason || (approved ? undefined : 'No coincide con el alcance acordado')
      });
      if (approved) {
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
        setSuccessMsg('✅ Material aprobado. Se integró al costo total y se actualizó la Bóveda Escrow.');
      } else {
        setSuccessMsg('❌ Material rechazado. No se sumará a la cuenta de la chamba.');
      }
      await loadFieldOps();
      refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error respondiendo solicitud');
    } finally {
      setLoading(false);
    }
  };

  const beforeEvidences = data?.evidences.filter(e => e.type === 'BEFORE') || [];
  const afterEvidences = data?.evidences.filter(e => e.type === 'AFTER') || [];
  const inProgressEvidences = data?.evidences.filter(e => e.type === 'IN_PROGRESS') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Operaciones en Campo & Refacciones
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {fieldOpsBookingId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evidencias fotográficas geolocalizadas (Antes/Después) y autorización in-app de tickets de ferretería
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadFieldOps}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
              title="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              onClick={() => setFieldOpsBookingId(null)}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Financial Pill Header */}
        {data && (
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-400">Servicio:</span>{' '}
                <span className="font-semibold text-slate-200">{data.serviceTitle}</span>
              </div>
              <div>
                <span className="text-slate-400">Mano de Obra:</span>{' '}
                <span className="font-semibold text-white">${data.baseAmount.toFixed(2)} MXN</span>
              </div>
              <div>
                <span className="text-slate-400">Materiales Aprobados:</span>{' '}
                <span className="font-semibold text-amber-400">+${data.materialsCost.toFixed(2)} MXN</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md text-emerald-400 font-bold">
                Total Custodiado Escrow: ${data.totalAmount.toFixed(2)} MXN
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                data.summary.hasBeforePhoto ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {data.summary.hasBeforePhoto ? '✓ Foto Antes OK' : '⚠ Falta Foto Antes'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                data.summary.hasAfterPhoto ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {data.summary.hasAfterPhoto ? '✓ Foto Después OK' : 'Pendiente Foto Después'}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'evidence'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>📸 Inspección Antes & Después</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {data?.evidences.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'materials'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>🛒 Refacciones & Tickets Ferretería</span>
            {data && data.summary.pendingApprovalsCount > 0 ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-bold">
                {data.summary.pendingApprovalsCount} por aprobar
              </span>
            ) : (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {data?.materials.length || 0}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-slate-400">Cargando bitácora de campo y registros fotográficos...</p>
            </div>
          ) : activeTab === 'evidence' ? (
            /* TAB 1: EVIDENCIAS ANTES / DESPUES */
            <div className="space-y-6">
              {/* Split Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* BEFORE (ANTES) */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                        <h3 className="font-semibold text-sm text-amber-300 uppercase tracking-wide">
                          Condición Previa (Antes de Iniciar)
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {beforeEvidences.length} foto(s)
                      </span>
                    </div>

                    {beforeEvidences.length > 0 ? (
                      <div className="space-y-3">
                        {beforeEvidences.map(ev => (
                          <div key={ev.id} className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                            <img
                              src={ev.photoUrl}
                              alt="Evidencia Previa"
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => setZoomedImage(ev.photoUrl)}
                            />
                            <button
                              onClick={() => setZoomedImage(ev.photoUrl)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="p-2.5 text-xs bg-slate-900/90 border-t border-slate-800">
                              <p className="font-medium text-slate-200">{ev.description || 'Sin notas'}</p>
                              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {new Date(ev.capturedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                                  <MapPin className="w-3 h-3" />
                                  GPS 19.4124, -99.1628
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg">
                        <Camera className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-xs text-slate-400">Aún no se ha capturado foto de check-in.</p>
                        <p className="text-[11px] text-slate-500 mt-1">El prestador debe tomarla antes de comenzar a desarmar.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      Auditoría satelital anti-fraude y protección de póliza de daños
                    </span>
                  </div>
                </div>

                {/* AFTER (DESPUÉS) */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <h3 className="font-semibold text-sm text-emerald-300 uppercase tracking-wide">
                          Resultado Final (Check-out)
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {afterEvidences.length} foto(s)
                      </span>
                    </div>

                    {afterEvidences.length > 0 ? (
                      <div className="space-y-3">
                        {afterEvidences.map(ev => (
                          <div key={ev.id} className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                            <img
                              src={ev.photoUrl}
                              alt="Evidencia Posterior"
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => setZoomedImage(ev.photoUrl)}
                            />
                            <button
                              onClick={() => setZoomedImage(ev.photoUrl)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="p-2.5 text-xs bg-slate-900/90 border-t border-slate-800">
                              <p className="font-medium text-slate-200">{ev.description || 'Sin notas'}</p>
                              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {new Date(ev.capturedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                                  <MapPin className="w-3 h-3" />
                                  GPS 19.4125, -99.1627
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg">
                        <Camera className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-xs text-slate-400">Aún no se ha capturado foto de entrega final.</p>
                        <p className="text-[11px] text-slate-500 mt-1">Requerido para que el cliente firme y libere el saldo de garantía.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Garantía de Satisfacción 48 hrs respaldada por fotos
                    </span>
                  </div>
                </div>

              </div>

              {/* Serviceman Fast Check-in/Check-out Action Box */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-5 h-5 text-indigo-400" />
                  <h4 className="font-semibold text-sm text-white">
                    Captura Rápida de Campo (Prestador / Técnico)
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Sube foto directa de la cámara o selecciona una plantilla de prueba con metadatos reales para simular el flujo en terreno:
                </p>

                {/* Preset Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {PHOTO_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEvidenceType(p.type as any);
                        setEvidencePhotoUrl(p.url);
                        setEvidenceDesc(p.desc);
                      }}
                      className="text-left p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          p.type === 'BEFORE' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {p.type === 'BEFORE' ? 'Check-in (Antes)' : 'Check-out (Después)'}
                        </span>
                      </div>
                      <p className="font-medium text-slate-200 truncate">{p.label}</p>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAddEvidence} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Etapa de la Obra</label>
                      <select
                        value={evidenceType}
                        onChange={(e) => setEvidenceType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="BEFORE">Antes de Iniciar (Check-in)</option>
                        <option value="IN_PROGRESS">En Proceso / Diagnóstico</option>
                        <option value="AFTER">Después de Concluir (Check-out)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-medium text-slate-400">URL o Archivo de Evidencia</label>
                        <label className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 font-medium">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingEvidence ? 'Subiendo foto...' : 'Subir desde dispositivo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUploadEvidenceFile}
                            disabled={uploadingEvidence}
                          />
                        </label>
                      </div>
                      <input
                        type="url"
                        value={evidencePhotoUrl}
                        onChange={(e) => setEvidencePhotoUrl(e.target.value)}
                        placeholder="https://... o sube una foto desde tu cámara"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Descripción / Notas de Inspección</label>
                    <input
                      type="text"
                      value={evidenceDesc}
                      onChange={(e) => setEvidenceDesc(e.target.value)}
                      placeholder="Ej: Tubería con fuga activa en codo de 1/2 pulg..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingEvidence}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{savingEvidence ? 'Guardando...' : '📸 Registrar Foto de Evidencia'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* TAB 2: REFACCIONES Y FERRETERIA */
            <div className="space-y-6">
              
              {/* Financial Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mano de Obra Pautada</span>
                  </div>
                  <div className="text-xl font-bold text-slate-100">
                    ${data?.baseAmount.toFixed(2)} <span className="text-xs font-normal text-slate-400">MXN</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Acordado al solicitar la chamba</div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="text-amber-400 text-xs flex items-center gap-1.5 mb-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Materiales Autorizados</span>
                  </div>
                  <div className="text-xl font-bold text-amber-300">
                    +${data?.materialsCost.toFixed(2)} <span className="text-xs font-normal text-amber-500">MXN</span>
                  </div>
                  <div className="text-[11px] text-amber-400/70 mt-1">
                    {data?.materials.filter(m => m.status === 'APPROVED').length} ticket(s) con factura/nota
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-emerald-400 text-xs flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Total con Garantía Escrow</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    ${data?.totalAmount.toFixed(2)} <span className="text-xs font-normal text-emerald-500">MXN</span>
                  </div>
                  <div className="text-[11px] text-emerald-300/80 mt-1">Protegido hasta satisfacción</div>
                </div>
              </div>

              {/* Pending Approvals Callout */}
              {data && data.materials.filter(m => m.status === 'PENDING_APPROVAL').length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
                    <h4 className="font-semibold text-sm text-amber-200">
                      Materiales esperando tu autorización ({data.materials.filter(m => m.status === 'PENDING_APPROVAL').length})
                    </h4>
                  </div>
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    El prestador acudió a la ferretería y subió el ticket comprobatorio. Como cliente, revisa el recibo y aprueba el cargo para actualizar el saldo de la garantía Escrow sin necesidad de efectivo:
                  </p>

                  <div className="space-y-3 pt-1">
                    {data.materials.filter(m => m.status === 'PENDING_APPROVAL').map((item) => (
                      <div key={item.id} className="p-4 bg-slate-900 border border-amber-500/30 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={item.ticketPhotoUrl}
                            alt="Ticket Ferretería"
                            className="w-16 h-20 object-cover rounded-md border border-slate-700 cursor-pointer shrink-0"
                            onClick={() => setZoomedImage(item.ticketPhotoUrl)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-white">{item.description}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {item.storeName}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              Hora de compra: {new Date(item.requestedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-lg font-bold text-amber-400 mt-1">
                              ${item.amount.toFixed(2)} MXN
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleRespondMaterial(item.id, true)}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Aprobar Ticket</span>
                          </button>
                          <button
                            onClick={() => handleRespondMaterial(item.id, false, 'Precio no acordado')}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-all"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Rechazar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Materials List */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <h4 className="font-semibold text-sm text-white">Historial de Materiales de la Chamba</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {data?.materials.length || 0} registro(s)
                  </span>
                </div>

                {data && data.materials.length > 0 ? (
                  <div className="divide-y divide-slate-800">
                    {data.materials.map((m) => (
                      <div key={m.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.ticketPhotoUrl}
                            alt="Ticket"
                            className="w-12 h-12 object-cover rounded-md border border-slate-800 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setZoomedImage(m.ticketPhotoUrl)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs text-slate-200">{m.description}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({m.storeName})</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Solicitado: {new Date(m.requestedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                              {m.approvedAt && (
                                <span className="text-emerald-400 font-medium">✓ Aprobado</span>
                              )}
                              {m.rejectedReason && (
                                <span className="text-red-400">Motivo rechazo: {m.rejectedReason}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-sm text-white">${m.amount.toFixed(2)} MXN</div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                            m.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                            m.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {m.status === 'APPROVED' ? 'Autorizado' : m.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No se han registrado compras de materiales para este servicio.
                  </div>
                )}
              </div>

              {/* Request New Material Form (Serviceman flow) */}
              <div className="bg-gradient-to-r from-slate-900 to-amber-950/20 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-5 h-5 text-amber-400" />
                  <h4 className="font-semibold text-sm text-white">
                    Registrar Compra en Ferretería / Tlapalería (Prestador)
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  ¿Tuviste que comprar un niple, cable, válvula o refacción extra? Sube el comprobante y el monto exacto para que el cliente lo autorice desde su app en tiempo real:
                </p>

                {/* Ticket Presets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                  {TICKET_PRESETS.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMatStoreName(t.store);
                        setMatDesc(t.desc);
                        setMatAmount(t.amount);
                        setMatTicketUrl(t.ticketUrl);
                      }}
                      className="text-left p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-amber-400">{t.store}</span>
                        <span className="font-semibold text-white font-mono">${t.amount}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1">{t.desc}</p>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleRequestMaterial} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Tienda / Ferretería</label>
                      <input
                        type="text"
                        value={matStoreName}
                        onChange={(e) => setMatStoreName(e.target.value)}
                        placeholder="Ej: Home Depot Mixcoac"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Costo Total ($ MXN con IVA)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={matAmount}
                        onChange={(e) => setMatAmount(parseFloat(e.target.value) || 0)}
                        placeholder="185.00"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-medium text-slate-400">Foto o Archivo del Ticket</label>
                        <label className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1 font-medium">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingTicket ? 'Subiendo ticket...' : 'Subir archivo'}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleUploadTicketFile}
                            disabled={uploadingTicket}
                          />
                        </label>
                      </div>
                      <input
                        type="url"
                        value={matTicketUrl}
                        onChange={(e) => setMatTicketUrl(e.target.value)}
                        placeholder="https://... o sube foto del ticket"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Concepto / Refacciones adquiridas</label>
                    <input
                      type="text"
                      value={matDesc}
                      onChange={(e) => setMatDesc(e.target.value)}
                      placeholder="Ej: Cople de compresión 1/2 pulgada latón + cinta teflón..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={requestingMaterial}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{requestingMaterial ? 'Enviando...' : '📤 Solicitar Autorización al Cliente'}</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ChambaYa Garantía 48 Horas: Todos los materiales cuentan con ticket fiscal timbrado</span>
          </div>
          <button
            onClick={() => setFieldOpsBookingId(null)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium transition-colors"
          >
            Cerrar Bitácora
          </button>
        </div>

      </div>

      {/* Zoom Modal for Photos / Tickets */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={zoomedImage}
              alt="Vista ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-slate-700 shadow-2xl"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/70 rounded-full text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

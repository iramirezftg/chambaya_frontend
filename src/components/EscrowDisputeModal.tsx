"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { api, EscrowVault, EscrowDispute } from '../lib/api';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Clock,
  DollarSign,
  Scale,
  Sparkles,
  Camera,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EscrowDisputeModal = () => {
  const { disputeBookingId, setDisputeBookingId, bookings, refreshData } = usePlatform();

  const [loading, setLoading] = useState(false);
  const [vaultData, setVaultData] = useState<any>(null);
  const [activeDispute, setActiveDispute] = useState<EscrowDispute | null>(null);

  // Formulario de reclamo
  const [reason, setReason] = useState('TRABAJO_DEFECTUOSO');
  const [description, setDescription] = useState('');
  const [requestedRefund, setRequestedRefund] = useState<number>(0);
  const [evidencePhotos, setEvidencePhotos] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const booking = bookings.find(b => b.id === disputeBookingId);

  useEffect(() => {
    if (!disputeBookingId) {
      setVaultData(null);
      setActiveDispute(null);
      setErrorMsg(null);
      setSuccessMsg(null);
      setDescription('');
      return;
    }

    setLoading(true);
    api.getEscrowByBooking(disputeBookingId)
      .then(res => {
        setVaultData(res.escrowVault || res);
        const vault = res.escrowVault || res;
        if (vault?.disputes && vault.disputes.length > 0) {
          setActiveDispute(vault.disputes[0]);
        } else {
          setActiveDispute(null);
        }
        if (booking) {
          setRequestedRefund(booking.amount);
        }
      })
      .catch(err => {
        console.error('Error al consultar Escrow:', err);
        setErrorMsg('No se pudo cargar el estado de la bóveda de garantía.');
      })
      .finally(() => setLoading(false));
  }, [disputeBookingId, booking]);

  if (!disputeBookingId || !booking) return null;

  const handleOpenDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Por favor describe a detalle el motivo de tu inconformidad.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.openEscrowDispute(booking.id, {
        reason,
        description,
        evidencePhotos: evidencePhotos || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500',
        requestedRefund: requestedRefund || booking.amount
      });

      setActiveDispute(res.dispute);
      setVaultData(res.vault);
      setSuccessMsg('¡Disputa abierta con éxito! Los fondos están congelados preventivamente.');
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al levantar la disputa.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSatisfaction = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.confirmEscrowSatisfaction(booking.id, 5, 'Trabajo verificado a entera satisfacción');
      setVaultData(res.vault);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setSuccessMsg('🎉 ¡Fondos liberados exitosamente al chambeador! Muchas gracias por calificar.');
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al liberar fondos.');
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (r: string) => {
    switch (r) {
      case 'TRABAJO_DEFECTUOSO': return '🛠️ Trabajo Defectuoso / Mala Instalación';
      case 'SERVICIO_INCOMPLETO': return '⏱️ Servicio Incompleto / Tareas Faltantes';
      case 'INCUMPLIMIENTO_GARANTIA': return '🔁 Reincidencia de Falla (Garantía 30 Días)';
      case 'COBRO_INDEBIDO': return '💳 Cobro Indebido / Sobreprecio no Autorizado';
      case 'DAÑO_MATERIAL': return '💥 Daño Material a Instalaciones del Domicilio';
      default: return r;
    }
  };

  const getDisputeStatusBadge = (s: string) => {
    switch (s) {
      case 'OPEN':
        return <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>⚠️ En Mediación Abierta</span>;
      case 'UNDER_REVIEW':
        return <span style={{ background: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>🔍 En Revisión Técnica SAT / ChambaYa</span>;
      case 'RESOLVED_PROVIDER':
        return <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>✅ Resuelto a Favor del Proveedor</span>;
      case 'RESOLVED_CUSTOMER':
        return <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>↩️ Reembolso Emitido al Cliente</span>;
      case 'RESOLVED_SPLIT':
        return <span style={{ background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>🤝 Conciliación Mixta (Split)</span>;
      case 'RESOLVED_INSURANCE':
        return <span style={{ background: '#E0E7FF', color: '#3730A3', border: '1px solid #A5B4FC', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>🛡️ Póliza de Daños ChambaYa ($25,000 MXN)</span>;
      default:
        return <span>{s}</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setDisputeBookingId(null)}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}>
        {/* Header estilo Bóveda Escrow México */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFF', padding: '1.25rem 1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={12} /> Bóveda de Garantía ChambaYa 🇲🇽
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>#{booking.id}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#F8FAFC' }}>
                Garantía de Satisfacción 48 Horas
              </h3>
            </div>
            <button
              onClick={() => setDisputeBookingId(null)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '999px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Banner de fondos en custodia y seguro de daños */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem', background: 'rgba(255,255,255,0.06)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monto en Custodia Preventiva</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34D399' }}>
                ${(vaultData?.totalAmount || booking.amount).toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>MXN</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protección Daños Materiales</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FCD34D', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <Sparkles size={14} /> Hasta $25,000 MXN
              </div>
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.5rem', maxHeight: '72vh', overflowY: 'auto' }}>
          {errorMsg && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Información del chambeador y servicio */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.9rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Servicio contratado</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{booking.serviceTitle}</div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.15rem' }}>
                Técnico: <strong>{booking.servicemanName || 'Especialista asignado'}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Estado del Pago</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: vaultData?.status === 'RELEASED' ? '#16A34A' : '#D97706' }}>
                {vaultData?.status === 'RELEASED' ? '✅ Pago Liberado' : vaultData?.status === 'DISPUTED' ? '⚠️ Fondos Congelados' : '🔒 En Custodia Escrow'}
              </span>
            </div>
          </div>

          {/* Si ya hay una disputa activa */}
          {activeDispute ? (
            <div style={{ background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Expediente de Mediación</span>
                {getDisputeStatusBadge(activeDispute.status)}
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Motivo Reclamado:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                  {getReasonLabel(activeDispute.reason)}
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Descripción del Cliente:</div>
                <p style={{ fontSize: '0.82rem', color: '#334155', background: '#F1F5F9', padding: '0.65rem 0.85rem', borderRadius: '8px', margin: '0.25rem 0 0' }}>
                  {activeDispute.description}
                </p>
              </div>

              {activeDispute.evidencePhotos && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '0.25rem' }}>Evidencia Fotográfica:</div>
                  <img
                    src={activeDispute.evidencePhotos}
                    alt="Evidencia"
                    style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                </div>
              )}

              {activeDispute.adminNotes && (
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '0.85rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1D4ED8', fontSize: '0.8rem', fontWeight: 800 }}>
                    <Scale size={14} /> Dictamen de Mediación ChambaYa
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#1E3A8A', margin: '0.35rem 0 0' }}>
                    {activeDispute.adminNotes}
                  </p>
                  <div style={{ fontSize: '0.7rem', color: '#3B82F6', marginTop: '0.35rem' }}>
                    Mediador: {activeDispute.mediatorName || 'Torre de Control ChambaYa México'}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDisputeBookingId(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : vaultData?.status === 'RELEASED' ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                Garantía Concluida con Éxito
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                Confirmaste entera satisfacción de esta chamba y los fondos ya fueron transferidos al saldo del proveedor. ¡Tu póliza de cobertura de calidad sigue activa por 30 días!
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setDisputeBookingId(null)}
                style={{ background: '#10B981' }}
              >
                Aceptar
              </button>
            </div>
          ) : (
            <div>
              {/* Opciones del Cliente: Liberar fondos o Levantar Disputa */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>
                    ¿El trabajo quedó excelente y sin detalles?
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#14532D', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
                  Si el chambeador concluyó la labor de forma profesional, puedes liberar el pago anticipadamente a su monedero electrónico.
                </p>
                <button
                  type="button"
                  onClick={handleConfirmSatisfaction}
                  disabled={loading}
                  style={{
                    background: '#16A34A',
                    color: '#FFF',
                    border: 'none',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Sparkles size={14} /> Confirmar Entera Satisfacción & Liberar Pago
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldAlert size={18} color="#EF4444" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                  O abrir reclamo de garantía (Congelar pago)
                </h4>
              </div>

              <form onSubmit={handleOpenDispute} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Motivo principal del reclamo
                  </label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', background: '#FFF' }}
                  >
                    <option value="TRABAJO_DEFECTUOSO">🛠️ Trabajo Defectuoso / Mala Instalación</option>
                    <option value="SERVICIO_INCOMPLETO">⏱️ Servicio Incompleto / No terminó tareas</option>
                    <option value="INCUMPLIMIENTO_GARANTIA">🔁 Reincidencia de Falla (Garantía 30 Días)</option>
                    <option value="COBRO_INDEBIDO">💳 Cobro Indebido o Materiales no Comprobados</option>
                    <option value="DAÑO_MATERIAL">💥 Daño Material a Instalaciones (Aplica Seguro)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Monto Reembolso Solicitado (MXN)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '0.82rem', fontWeight: 700 }}>$</span>
                      <input
                        type="number"
                        min="0"
                        max={booking.amount}
                        value={requestedRefund}
                        onChange={e => setRequestedRefund(Number(e.target.value))}
                        style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 1.6rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Evidencia Fotográfica (URL)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Camera size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="https://... o foto de prueba"
                        value={evidencePhotos}
                        onChange={e => setEvidencePhotos(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Describe con detalle qué ocurrió *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Ej. La llave sigue goteando por el empaque posterior y no selló debidamente..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>

                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.72rem', color: '#92400E' }}>
                  ℹ️ Al presentar tu reclamo, los fondos quedan <strong>congelados de inmediato</strong> en la Bóveda Escrow hasta la resolución del equipo de mediación ChambaYa.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDisputeBookingId(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: '#DC2626',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.6rem 1.1rem',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ShieldAlert size={14} /> Abrir Reclamo & Congelar Pago
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

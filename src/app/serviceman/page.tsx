"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';
import {
  Navigation,
  Phone,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  ShieldCheck,
  Wrench,
  Award,
  AlertTriangle,
  ChevronRight,
  Radio,
  ShoppingBag,
  Receipt
} from 'lucide-react';
import { KycVerificationModal } from '../../components/KycVerificationModal';
import { RoleGuard } from '../../components/RoleGuard';
import { formatProtectedAddressMx, maskPhoneMx } from '../../lib/securityProtocol';

export default function ServicemanPage() {
  const {
    activeServicemanId,
    servicemen,
    bookings,
    updateBookingStatus,
    refreshData,
    setFieldOpsBookingId,
    setCertificateBookingId,
    getBookingSecurity,
    completeSelfieCheckIn,
    confirmPremisesExit,
    reportCustomerNoShow
  } = usePlatform();
  const tech = servicemen.find(s => s.id === activeServicemanId) || servicemen[0];

  const [otpInput, setOtpInput] = useState('');
  const [closingOtpInput, setClosingOtpInput] = useState('');
  const [closingError, setClosingError] = useState('');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<any | null>(null);

  useEffect(() => {
    const fetchEmergency = () => {
      api.getActiveEmergencies().then(res => {
        const searching = res.dispatches.find(d => d.status === 'SEARCHING');
        if (searching) {
          setActiveEmergency(searching);
        } else {
          setActiveEmergency(null);
        }
      }).catch(() => {});
    };
    fetchEmergency();
    const interval = setInterval(fetchEmergency, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptEmergency = async (bookingId: string) => {
    try {
      await api.acceptEmergency(bookingId, tech.id);
      confetti({ particleCount: 70, spread: 80 });
      setActiveEmergency(null);
      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Error al aceptar despacho');
    }
  };

  const assigned = bookings.find(b =>
    (b.servicemanId === tech?.id || b.id === tech?.activeBookingId) &&
    b.status !== 'completed' &&
    b.status !== 'cancelled'
  );

  const completed = bookings.filter(b => b.servicemanId === tech?.id && b.status === 'completed');
  const assignedSec = assigned ? getBookingSecurity(assigned) : null;

  const handleSelfieCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !assigned) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      completeSelfieCheckIn(assigned.id, typeof ev.target?.result === 'string' ? ev.target.result : null);
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteWithClosingPin = async () => {
    if (!assigned || !assignedSec) return;
    if (closingOtpInput.trim() !== assignedSec.closingOtp) {
      setClosingError(`PIN de Cierre incorrecto. Pide al cliente su PIN de Conformidad (${assignedSec.closingOtp}) para liberar el Escrow.`);
      return;
    }
    setClosingError('');
    setClosingOtpInput('');
    await updateBookingStatus(assigned.id, 'completed');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned': return 'Chamba Asignada';
      case 'on_the_way': return 'Voy en Camino 🛵';
      case 'in_progress': return 'Trabajo en Progreso 🛠️';
      case 'completed': return 'Finalizada ✅';
      default: return status;
    }
  };

  if (!tech) return <div style={{ padding: '2rem' }}>Cargando perfil del chambeador...</div>;

  return (
    <RoleGuard
      allowedRoles={['SERVICEMAN', 'ADMIN']}
      redirectLoginUrl="/serviceman/login"
      portalName="App de Campo Chambeador"
    >
      <div style={{ background: '#0F172A', minHeight: 'calc(100vh - 70px)', padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: '400px',
        maxWidth: '100%',
        minHeight: '700px',
        background: '#1E293B',
        color: '#FFF',
        borderRadius: '32px',
        padding: '1.25rem',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Top Tech Profile */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src={tech.avatar} alt={tech.name} style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', border: '1.5px solid #10B981' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{tech.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{tech.title} • {tech.phone}</div>
            </div>
          </div>
          <span style={{ fontSize: '0.65rem', background: '#10B981', color: '#FFF', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontWeight: 800 }}>
            {tech.status === 'available' ? 'DISPONIBLE' : 'EN TURNO'}
          </span>
        </div>

        {/* KYC Verification Status Banner */}
        <div style={{
          background: tech.isVerified ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${tech.isVerified ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '16px',
          padding: '0.85rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {tech.isVerified ? (
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F59E0B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} />
              </div>
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EF4444', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} />
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: tech.isVerified ? '#F59E0B' : '#FFF' }}>
                {tech.isVerified ? 'Chambeador Verificado Oficial ⭐' : 'Verificación KYC Requerida'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                {tech.isVerified ? 'Credencial INE y Antecedentes cotejados al 100%' : 'Sube tu INE y RFC para recibir órdenes prioritarias'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKycModal(true)}
            style={{
              background: tech.isVerified ? 'rgba(245, 158, 11, 0.2)' : '#10B981',
              color: tech.isVerified ? '#F59E0B' : '#FFF',
              border: 'none',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <span>{tech.isVerified ? 'Ver Credencial' : 'Validar KYC'}</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Incoming Emergency Dispatch Card */}
        {activeEmergency && (!assigned || assigned.id !== activeEmergency.bookingId) && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.15) 100%)',
            border: '2px solid #EF4444',
            borderRadius: '20px',
            padding: '1.2rem',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', background: '#EF4444', color: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 900, textTransform: 'uppercase' }}>
                🚨 Despacho Flash ChambaExpress
              </span>
              <span style={{ fontSize: '0.8rem', color: '#FCD34D', fontWeight: 900 }}>
                +${activeEmergency.surchargeAmount} MXN Bono Urgencia
              </span>
            </div>

            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#FFF' }}>
                {activeEmergency.booking?.serviceTitle || 'Emergencia Doméstica Crítica'}
              </h4>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: '#FCA5A5' }}>
                {activeEmergency.incidentDescription}
              </p>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#CBD5E1', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '10px' }}>
              <div>📍 <strong>Ubicación:</strong> {activeEmergency.emergencyAddress}</div>
              <div>⚡ <strong>Radio:</strong> A {activeEmergency.dispatchRadiusKm} km • Arribo &lt; {activeEmergency.targetEtaMinutes} min</div>
            </div>

            <button
              type="button"
              onClick={() => handleAcceptEmergency(activeEmergency.bookingId)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                background: '#EF4444',
                color: '#FFF',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.5)'
              }}
            >
              <Radio size={16} />
              <span>¡Aceptar Despacho de Emergencia Ahora!</span>
            </button>
          </div>
        )}

        {/* Assigned Order Lifecycle */}
        {assigned ? (
          <div style={{ background: '#0F172A', borderRadius: '20px', padding: '1.25rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span className={`status-pill ${assigned.status}`}>{getStatusLabel(assigned.status)}</span>
              <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 800 }}>#{assigned.id}</span>
            </div>

            <h4 style={{ margin: '0.4rem 0', fontSize: '1rem', color: '#FFF', fontWeight: 800 }}>{assigned.serviceTitle}</h4>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.75rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.75rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} color="#10B981" />
                <span>{formatProtectedAddressMx(assigned.customerAddress, assigned.status, 'SERVICEMAN')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} color="#10B981" />
                <span>Horario: {assigned.scheduledTimeSlot}</span>
              </div>
              {assignedSec && (
                <div style={{ fontSize: '0.7rem', color: '#6EE7B7', fontWeight: 700 }}>
                  🏢 Pase Caseta: {assignedSec.gatehouseAccess.passCode} • Gafete Puerta: {assignedSec.techVerifyCode}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.35rem' }}>
                <span>Cliente: <strong>{assigned.customerName}</strong> ({maskPhoneMx(assigned.customerPhone)})</span>
                <a href={`tel:${assigned.customerPhone}`} style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', fontWeight: 700 }}>
                  <Phone size={12} />
                  <span>Proxy</span>
                </a>
              </div>
            </div>

            {/* Step Actions */}
            {assigned.status === 'assigned' && assignedSec && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#C7D2FE', background: 'rgba(99, 102, 241, 0.14)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '0.5rem', borderRadius: '10px' }}>
                  <strong>Paso 1 (Biometría Pre-Ruta):</strong> Toma tu selfie en vivo antes de salir al domicilio.
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <label style={{
                    flex: 1,
                    background: assignedSec.selfieCheckIn ? 'rgba(16, 185, 129, 0.2)' : '#312E81',
                    border: `1px solid ${assignedSec.selfieCheckIn ? '#10B981' : '#6366F1'}`,
                    color: assignedSec.selfieCheckIn ? '#34D399' : '#FFF',
                    borderRadius: '10px',
                    padding: '0.55rem',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    {assignedSec.selfieCheckIn ? '✓ Selfie Biométrica Aprobada' : '📸 Tomar Selfie Biométrica'}
                    <input type="file" accept="image/*" capture="user" onChange={handleSelfieCameraChange} style={{ display: 'none' }} />
                  </label>
                  {!assignedSec.selfieCheckIn && (
                    <button
                      type="button"
                      onClick={() => completeSelfieCheckIn(assigned.id)}
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #475569', color: '#CBD5E1', borderRadius: '10px', padding: '0.5rem 0.65rem', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Validar ✓
                    </button>
                  )}
                </div>

                <button
                  className="btn btn-primary"
                  disabled={!assignedSec.selfieCheckIn}
                  onClick={() => updateBookingStatus(assigned.id, 'on_the_way')}
                  style={{ width: '100%', padding: '0.7rem', background: assignedSec.selfieCheckIn ? '#10B981' : '#334155', opacity: assignedSec.selfieCheckIn ? 1 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Navigation size={15} />
                  <span>2. Iniciar Ruta GPS (Voy en camino)</span>
                </button>
              </div>
            )}

            {assigned.status === 'on_the_way' && assignedSec && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(true)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid #6366F1',
                    color: '#C7D2FE',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🪪 Mostrar Gafete Digital Doble Llave ({assignedSec.techVerifyCode})
                </button>
                <div style={{ fontSize: '0.72rem', color: '#FDE68A' }}>
                  Tras mostrar tu Gafete ({assignedSec.techVerifyCode}), pide al cliente su PIN de Inicio de 4 dígitos:
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="PIN Inicio (4 dígitos)"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #475569', background: '#1E293B', color: '#FFF', textAlign: 'center', fontWeight: 800 }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => updateBookingStatus(assigned.id, 'in_progress', otpInput)}
                    style={{ background: '#10B981' }}
                  >
                    Validar PIN
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => reportCustomerNoShow(assigned.id)}
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                    color: '#FBBF24',
                    borderRadius: '8px',
                    padding: '0.45rem',
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {assignedSec.noShowReportedAt
                    ? `✓ No-Show GPS Reportado (${assignedSec.noShowReportedAt}) • Garantía $250 MXN`
                    : '🚫 Cliente No Abre Puerta (Reportar No-Show GPS • $250 MXN)'}
                </button>
              </div>
            )}

            {assigned.status === 'in_progress' && assignedSec && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setFieldOpsBookingId(assigned.id)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#A5B4FC',
                      padding: '0.6rem 0.5rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}
                  >
                    <Camera size={16} />
                    <span>📸 Fotos Antes/Después</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFieldOpsBookingId(assigned.id)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#FCD34D',
                      padding: '0.6rem 0.5rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}
                  >
                    <Receipt size={16} />
                    <span>🛒 Ticket Ferretería</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="PIN Cierre Conformidad"
                    value={closingOtpInput}
                    onChange={e => setClosingOtpInput(e.target.value)}
                    style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '1px solid #475569', background: '#1E293B', color: '#FFF', textAlign: 'center', fontWeight: 800, fontSize: '0.8rem' }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleCompleteWithClosingPin}
                    style={{ background: '#10B981', borderRadius: '8px', fontWeight: 800 }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Cerrar & Liberar</span>
                  </button>
                </div>
                {closingError && <div style={{ fontSize: '0.68rem', color: '#F87171' }}>{closingError}</div>}

                <button
                  type="button"
                  onClick={() => setCertificateBookingId(assigned.id)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#E2E8F0', borderRadius: '8px', padding: '0.45rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  📜 Ver Acta Criptográfica SHA-256 & Firma NOM-151
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: '#0F172A', borderRadius: '20px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Listo para la Próxima Chamba</h4>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              Telemetría GPS activa. En cuanto tu taller o negocio te despache una nueva solicitud, sonará aquí.
            </p>
          </div>
        )}

        {/* Shift History */}
        <div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, marginBottom: '0.4rem' }}>
            Chambas Realizadas Hoy ({completed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {completed.map(b => {
              const bSec = getBookingSecurity(b);
              return (
                <div key={b.id} style={{ background: '#0F172A', padding: '0.65rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.74rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>#{b.id} • {b.serviceTitle.slice(0, 22)}...</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>Completada ✓</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                    {!bSec.premisesExited ? (
                      <button
                        type="button"
                        onClick={() => confirmPremisesExit(b.id)}
                        style={{ flex: 1, background: 'rgba(16,185,129,0.2)', border: '1px solid #10B981', color: '#34D399', borderRadius: '6px', padding: '0.28rem 0.45rem', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        🛰️ Check-Out GPS: Confirmar Salida (&gt;50m)
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: '#34D399', fontWeight: 700 }}>
                        🛰️ Salida GPS Verificada ({bSec.exitTimestamp || 'OK'})
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCertificateBookingId(b.id)}
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: '#E2E8F0', borderRadius: '6px', padding: '0.28rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      📜 Acta SHA-256
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Gafete Digital Doble Llave */}
      {showBadgeModal && assigned && assignedSec && (
        <div className="modal-overlay" onClick={() => setShowBadgeModal(false)} style={{ zIndex: 3500 }}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', padding: '1.5rem', textAlign: 'center', background: '#0F172A', color: '#FFF', border: '2px solid #10B981' }}>
            <div style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              🛡️ Gafete Oficial Doble Llave ChambaYa
            </div>
            <img src={tech.avatar} alt={tech.name} style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10B981', margin: '0 auto 0.65rem auto' }} />
            <h3 style={{ margin: 0, color: '#FFF', fontSize: '1.15rem' }}>{tech.name}</h3>
            <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginBottom: '0.85rem' }}>{tech.title}</div>
            <div style={{ background: '#1E293B', border: '1px dashed #34D399', borderRadius: '12px', padding: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Código de Identidad en Puerta</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34D399', letterSpacing: '0.1em' }}>{assignedSec.techVerifyCode}</div>
              <div style={{ fontSize: '0.68rem', color: '#CBD5E1', marginTop: '0.25rem' }}>Pase Caseta: <strong>{assignedSec.gatehouseAccess.passCode}</strong></div>
            </div>
            <button type="button" className="btn btn-primary btn-sm" style={{ width: '100%', background: '#10B981' }} onClick={() => setShowBadgeModal(false)}>
              Cerrar Gafete
            </button>
          </div>
        </div>
      )}

      {/* Modal de Validación KYC */}
      {tech && (
        <KycVerificationModal
          serviceman={tech}
          isOpen={showKycModal}
          onClose={() => setShowKycModal(false)}
          onSuccess={() => {
            if (refreshData) refreshData();
          }}
        />
      )}
    </div>
    </RoleGuard>
  );
}

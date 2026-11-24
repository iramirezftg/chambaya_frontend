"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import {
  X,
  FileCheck2,
  Lock,
  MapPin,
  Award,
  Building2,
  UserCheck,
  Receipt
} from 'lucide-react';

export const ServiceCertificateModal = () => {
  const {
    certificateBookingId,
    setCertificateBookingId,
    setInvoicingBookingId,
    bookings,
    providers,
    servicemen,
    getBookingSecurity,
    signDigitalCertificate,
    confirmPremisesExit
  } = usePlatform();

  const booking = bookings.find(b => b.id === certificateBookingId);
  const [signerName, setSignerName] = useState('');

  useEffect(() => {
    if (booking) {
      setSignerName(booking.customerName || '');
    }
  }, [booking]);

  if (!certificateBookingId || !booking) return null;

  const provider = providers.find(p => p.id === booking.providerId);
  const tech = servicemen.find(s => s.id === booking.servicemanId);
  const sec = getBookingSecurity(booking);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) return;
    signDigitalCertificate(booking.id, signerName.trim());
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 3500 }} onClick={() => setCertificateBookingId(null)}>
      <div
        className="modal-card"
        style={{ maxWidth: '760px', width: '96%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.15rem 1.4rem',
          background: 'linear-gradient(135deg, #0F172A 0%, #064E3B 100%)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <span style={{
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: '0.66rem',
                fontWeight: 800,
                padding: '0.16rem 0.55rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Lock size={11} /> ACTA CRIPTOGRÁFICA SHA-256 & NOM-151
              </span>
              <span style={{ fontSize: '0.7rem', color: '#A7F3D0', fontFamily: 'monospace' }}>
                {sec.certificateHash}
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#FFFFFF' }}>
              Acta Digital de Entrega-Recepción — Orden #{booking.id}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setCertificateBookingId(null)}
            style={{ background: 'rgba(255,255,255,0.14)', border: 'none', color: '#FFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.4rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* I. Partes Contratantes */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1rem' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              I. Partes Contratantes y Deslinde Laboral (Contrato Mercantil B2B2C)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.78rem' }}>
              <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <UserCheck size={14} color="#10B981" /> Cliente / Titular del Domicilio
                </div>
                <div><strong>Nombre:</strong> {booking.customerName}</div>
                <div><strong>Domicilio:</strong> {booking.customerAddress}</div>
                <div><strong>Pase Caseta:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{sec.gatehouseAccess.passCode}</span></div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} color="#2563EB" /> Prestador Independiente & Técnico
                </div>
                <div><strong>Negocio:</strong> {booking.providerName} ({provider?.rfc || 'RFC Verificado'})</div>
                <div><strong>Póliza RC:</strong> {sec.insurancePolicyId} (Cobertura hasta $5M MXN)</div>
                <div><strong>Chambeador:</strong> {booking.servicemanName || 'En asignación'} {tech?.isVerified ? '✓ KYC OK' : ''}</div>
              </div>
            </div>
          </div>

          {/* II. Cadena de Custodia y Salida GPS */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1rem' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
              II. Cadena de Custodia Doble Llave y Check-Out Domiciliario (&gt;50m)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.65rem', fontSize: '0.77rem' }}>
              <div style={{ padding: '0.65rem', borderRadius: '10px', background: sec.selfieCheckIn ? '#ECFDF5' : '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 800, color: sec.selfieCheckIn ? '#065F46' : '#64748B' }}>
                  {sec.selfieCheckIn ? '✓ Selfie Biométrica Pre-Ruta OK' : '○ Selfie Pre-Ruta Pendiente'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>Identidad facial validada antes del arribo.</div>
              </div>

              <div style={{ padding: '0.65rem', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <div style={{ fontWeight: 800, color: '#065F46' }}>
                  ✓ Doble Llave: {sec.techVerifyCode}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#047857' }}>
                  PIN Inicio ({booking.otp}) • PIN Cierre ({sec.closingOtp})
                </div>
              </div>

              <div style={{
                padding: '0.65rem',
                borderRadius: '10px',
                background: sec.premisesExited ? '#ECFDF5' : '#FFFBEB',
                border: sec.premisesExited ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
                gridColumn: '1 / -1'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: sec.premisesExited ? '#065F46' : '#92400E', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} />
                    <span>
                      {sec.premisesExited
                        ? `✓ Salida Física del Domicilio Verificada (${sec.exitTimestamp || 'GPS >50m'})`
                        : '⏳ Licencia Temporal de Acceso Activa en Perímetro (<50m)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: sec.premisesExited ? '#047857' : '#B45309' }}>
                    {sec.premisesExited
                      ? 'El chambeador abandonó el perímetro del inmueble. Domicilio seguro.'
                      : 'Confirma el Check-Out GPS al finalizar para extinguir la licencia de acceso.'}
                  </div>
                </div>
                {!sec.premisesExited && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ background: '#059669', whiteSpace: 'nowrap' }}
                    onClick={() => confirmPremisesExit(booking.id)}
                  >
                    🛰️ Confirmar Salida GPS
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* III. Firma Electrónica NOM-151 */}
          <div style={{
            background: sec.digitalSignature ? '#F0FDF4' : '#EEF2FF',
            border: sec.digitalSignature ? '1px solid #86EFAC' : '1px solid #C7D2FE',
            borderRadius: '14px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: sec.digitalSignature ? '#14532D' : '#312E81', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={16} /> III. Firma Electrónica de Conformidad (NOM-151)
              </div>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                padding: '0.16rem 0.55rem',
                borderRadius: '9999px',
                background: sec.digitalSignature ? '#16A34A' : '#4F46E5',
                color: '#FFFFFF'
              }}>
                {sec.digitalSignature ? 'ACTA SELLADA INMUTABLE' : 'PENDIENTE DE FIRMA'}
              </span>
            </div>

            {sec.digitalSignature ? (
              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '0.8rem', border: '1px dashed #22C55E', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <div><strong>Firmante:</strong> {sec.digitalSignature.signerName}</div>
                  <div><strong>Estampado de Tiempo:</strong> {sec.digitalSignature.signedAt}</div>
                </div>
                <div style={{ color: '#475569', marginBottom: '0.25rem' }}><strong>Norma:</strong> {sec.digitalSignature.standard}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#15803D', fontWeight: 800 }}>
                  SELLO DIGITAL: {sec.digitalSignature.sealHash}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSign} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Nombre completo para estampar firma electrónica..."
                  style={{ flex: '1 1 240px', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', background: '#FFF' }}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#4F46E5' }}>
                  ✍️ Firmar y Sellar Acta SHA-256
                </button>
              </form>
            )}
          </div>

          {/* Link directo a Factura CFDI SAT */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', background: '#F8FAFC', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#334155' }}>
              <FileCheck2 size={14} style={{ display: 'inline', marginRight: '5px', color: '#059669' }} />
              <strong>Monto Total Protegido:</strong> ${booking.amount.toFixed(2)} MXN • Facturación Split CFDI 4.0 disponible.
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const id = booking.id;
                setCertificateBookingId(null);
                setInvoicingBookingId(id);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', borderColor: '#A7F3D0', background: '#ECFDF5' }}
            >
              <Receipt size={14} />
              <span>Abrir Factura CFDI 4.0 SAT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { api, Invoice } from '../lib/api';
import confetti from 'canvas-confetti';
import {
  X,
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Building,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const InvoiceModal = () => {
  const {
    invoicingBookingId,
    setInvoicingBookingId,
    bookings,
    customerUser
  } = usePlatform();

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario CFDI 4.0
  const [rfc, setRfc] = useState('GOMA920315HA1');
  const [nombre, setNombre] = useState('FERNANDA GOMEZ AVILA');
  const [cp, setCp] = useState('06700');
  const [regimen, setRegimen] = useState('605');
  const [usoCfdi, setUsoCfdi] = useState('G03');

  const booking = bookings.find(b => b.id === invoicingBookingId);

  useEffect(() => {
    if (!invoicingBookingId) {
      setInvoice(null);
      setErrorMsg(null);
      return;
    }

    // Consultar si ya tiene CFDI timbrado
    api.getCfdi(invoicingBookingId)
      .then(inv => {
        if (inv) setInvoice(inv);
      })
      .catch(() => setInvoice(null));
  }, [invoicingBookingId]);

  const handleTimbrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoicingBookingId) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const generated = await api.generateCfdi({
        bookingId: invoicingBookingId,
        rfcReceptor: rfc,
        nombreReceptor: nombre,
        domicilioFiscalReceptor: cp,
        regimenReceptor: regimen,
        usoCfdi: usoCfdi,
        formaPago: booking?.paymentMethod === 'stripe' ? '04' : booking?.paymentMethod === 'spei' ? '03' : '01'
      });
      setInvoice(generated);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al timbrar con el SAT');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXml = () => {
    if (!invoice) return;
    const blob = new Blob([invoice.xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CFDI_4.0_${invoice.uuid}.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!invoicingBookingId || !booking) return null;

  return (
    <div className="modal-overlay" onClick={() => setInvoicingBookingId(null)}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
          padding: '1.25rem 1.5rem',
          color: '#FFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{
                background: '#10B981',
                color: '#FFF',
                fontSize: '0.7rem',
                fontWeight: 900,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px'
              }}>
                MÓDULO FISCAL SAT CFDI 4.0
              </span>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>• Folio: {booking.id}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, color: '#FFF' }}>
              Facturación Electrónica de Servicio
            </h2>
          </div>
          <button
            onClick={() => setInvoicingBookingId(null)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENIDO: Formulario o Factura Timbrada */}
        {!invoice ? (
          <form onSubmit={handleTimbrar} style={{ padding: '1.5rem' }}>
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Servicio Realizado:</div>
                <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{booking.serviceTitle}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total con IVA (16%):</div>
                <strong style={{ fontSize: '1.3rem', color: '#059669', fontWeight: 900 }}>
                  ${booking.amount.toFixed(2)} MXN
                </strong>
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: '#FEF2F2',
                borderLeft: '4px solid #DC2626',
                color: '#991B1B',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
              Datos Fiscales del Receptor (Cliente)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  RFC del Receptor *
                </label>
                <input
                  type="text"
                  value={rfc}
                  onChange={e => setRfc(e.target.value.toUpperCase())}
                  placeholder="Ej. GOMA920315HA1"
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Código Postal Fiscal (5 dígitos) *
                </label>
                <input
                  type="text"
                  value={cp}
                  onChange={e => setCp(e.target.value)}
                  placeholder="06700"
                  maxLength={5}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Nombre Completo o Razón Social (tal como figura en tu Constancia SAT) *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value.toUpperCase())}
                  placeholder="FERNANDA GOMEZ AVILA"
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Régimen Fiscal del SAT *
                </label>
                <select
                  value={regimen}
                  onChange={e => setRegimen(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFF' }}
                >
                  <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados</option>
                  <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                  <option value="625">625 - Régimen de las Actividades con Ingresos de Plataformas Tecnológicas</option>
                  <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                  <option value="616">616 - Sin obligaciones fiscales</option>
                  <option value="601">601 - General de Ley Personas Morales</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Uso del CFDI *
                </label>
                <select
                  value={usoCfdi}
                  onChange={e => setUsoCfdi(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFF' }}
                >
                  <option value="G03">G03 - Gastos en general</option>
                  <option value="S01">S01 - Sin efectos fiscales</option>
                  <option value="CP01">CP01 - Pagos</option>
                  <option value="D01">D01 - Honorarios médicos y gastos de hospital</option>
                </select>
              </div>
            </div>

            <div style={{
              background: '#ECFDF5',
              padding: '0.85rem',
              borderRadius: '8px',
              border: '1px solid #A7F3D0',
              marginBottom: '1.25rem',
              fontSize: '0.78rem',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldCheck size={18} color="#059669" />
              <span>
                Emisor autorizado: <strong>CHAMBAYA MÉXICO SAPI DE CV (RFC: CHY240815MX1)</strong>. Certificación en tiempo real ante Proveedor Autorizado de Certificación (PAC SAT).
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                background: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Sparkles size={18} />
              <span>{loading ? 'Timbrando con el SAT...' : 'Timbrar Factura Electrónica CFDI 4.0'}</span>
            </button>
          </form>
        ) : (
          /* REPRESENTACIÓN GRÁFICA DEL CFDI 4.0 */
          <div style={{ padding: '1.5rem' }}>
            <div style={{
              background: '#FFF',
              border: '2px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              marginBottom: '1.25rem'
            }}>
              {/* Encabezado Fiscal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #059669', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {invoice.nombreEmisor}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                    <strong>RFC:</strong> {invoice.rfcEmisor} • <strong>Régimen Fiscal:</strong> 601 General de Ley Personas Morales
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    <strong>Lugar de Expedición:</strong> 06700 (CDMX) • <strong>Efecto:</strong> Ingreso (I)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: '#DCFCE7',
                    color: '#15803D',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    FACTURA ELECTRÓNICA VIGENTE
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, marginTop: '0.35rem', color: '#0F172A' }}>
                    Serie {invoice.serie} - Folio {invoice.folio}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Fecha: {new Date(invoice.fechaTimbrado).toLocaleString('es-MX')}
                  </div>
                </div>
              </div>

              {/* Folio Fiscal UUID destacado */}
              <div style={{
                background: '#F8FAFC',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                marginBottom: '1rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700 }}>FOLIO FISCAL (UUID DEL SAT):</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#2563EB', fontSize: '0.92rem' }}>
                  {invoice.uuid}
                </div>
              </div>

              {/* Datos del Receptor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Receptor / Cliente:</div>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{invoice.nombreReceptor}</div>
                  <div style={{ color: '#475569' }}><strong>RFC:</strong> {invoice.rfcReceptor}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Uso y Domicilio:</div>
                  <div style={{ color: '#0F172A' }}><strong>C.P.:</strong> {invoice.domicilioFiscalReceptor}</div>
                  <div style={{ color: '#475569' }}><strong>Régimen:</strong> {invoice.regimenReceptor} • <strong>Uso:</strong> {invoice.usoCfdi}</div>
                </div>
              </div>

              {/* Conceptos SAT */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '0.5rem' }}>Clave SAT</th>
                    <th style={{ padding: '0.5rem' }}>Cant / Unidad</th>
                    <th style={{ padding: '0.5rem' }}>Descripción del Servicio</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>P. Unitario</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{invoice.claveProdServ}</td>
                    <td style={{ padding: '0.5rem' }}>1.00 ({invoice.claveUnidad})</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{booking.serviceTitle}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>${invoice.subtotal.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700 }}>${invoice.subtotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totales desglosados */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <div style={{ width: '240px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                    <span style={{ color: '#64748B' }}>Subtotal:</span>
                    <strong>${invoice.subtotal.toFixed(2)} MXN</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                    <span style={{ color: '#64748B' }}>IVA Trasladado (16%):</span>
                    <strong>${invoice.iva.toFixed(2)} MXN</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: '2px solid #059669', fontSize: '1.05rem', fontWeight: 900 }}>
                    <span>Total Facturado:</span>
                    <span style={{ color: '#059669' }}>${invoice.total.toFixed(2)} MXN</span>
                  </div>
                </div>
              </div>

              {/* Sello Digital y QR SAT */}
              <div style={{
                borderTop: '1px dashed #CBD5E1',
                paddingTop: '1rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                fontSize: '0.68rem',
                color: '#64748B'
              }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: '#F1F5F9',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid #CBD5E1'
                }}>
                  <QrCode size={64} color="#0F172A" />
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.2rem' }}>
                    Cadena Original del Timbre Fiscal Digital del SAT:
                  </div>
                  <div style={{ fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: '#F8FAFC', padding: '0.3rem', borderRadius: '4px' }}>
                    {invoice.cadenaOriginal}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
                    <div><strong>No. Certificado SAT:</strong> {invoice.noCertificadoSat}</div>
                    <div><strong>PAC Certificador:</strong> SAT970701NN3</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDownloadXml}
                className="btn btn-primary"
                style={{ background: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={16} />
                <span>Descargar XML CFDI 4.0</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} />
                <span>Imprimir / Guardar PDF</span>
              </button>

              <a
                href={invoice.qrCodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                <ExternalLink size={16} />
                <span>Verificar en Portal SAT</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import { LegalModalSection } from '../lib/securityProtocol';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  Scale,
  CheckCircle2
} from 'lucide-react';

export const LegalCenterModal = () => {
  const { legalModalSection, setLegalModalSection } = usePlatform();

  if (!legalModalSection) return null;

  const tabs: { id: Exclude<LegalModalSection, null>; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'security_protocol', label: 'Protocolo Hogar Seguro', icon: ShieldCheck },
    { id: 'terms', label: 'Términos y Escrow', icon: Scale },
    { id: 'privacy', label: 'Privacidad LFPDPPP', icon: Lock },
    { id: 'provider_contract', label: 'Contrato B2B2C', icon: FileText }
  ];

  return (
    <div className="modal-overlay" onClick={() => setLegalModalSection(null)} style={{ zIndex: 3500 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '760px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.45rem',
          background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#34D399', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
              <ShieldCheck size={14} />
              <span>Marco Legal, Privacidad y Seguridad Domiciliaria • ChambaYa México</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', margin: '0.2rem 0 0 0' }}>
              Centro Legal y Protocolo &ldquo;Doble Llave&rdquo;
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setLegalModalSection(null)}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#FFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', padding: '0.7rem 1.25rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = legalModalSection === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setLegalModalSection(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '10px',
                  border: active ? '1px solid #10B981' : '1px solid #CBD5E1',
                  background: active ? '#10B981' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#334155',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '1.4rem', overflowY: 'auto', fontSize: '0.84rem', color: '#334155', lineHeight: 1.65 }}>
          {legalModalSection === 'security_protocol' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '0.9rem 1rem', color: '#065F46' }}>
                <strong>Certeza Mutua antes de abrir la puerta:</strong> ChambaYa protege tanto a la familia que recibe al técnico como al chambeador que acude al domicilio mediante 5 candados obligatorios.
              </div>
              <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: 0 }}>
                <li><strong>Verificación KYE/KYC del Chambeador:</strong> Validación de INE vigente, CURP, biometría facial y constancia de antecedentes antes de poder recibir despachos.</li>
                <li><strong>Selfie Biométrica Pre-Ruta & Pase QR de Caseta:</strong> El chambeador confirma identidad antes de salir y se genera un Pase de Acceso Temporal (<code>PASE-XXX</code>) para vigilancia de edificios o fraccionamientos.</li>
                <li><strong>Doble Llave en Puerta (<code>SAFE-XXX</code> + PIN de Inicio):</strong> El cliente exige el código del gafete digital antes de abrir, y solo entonces dicta el PIN de Inicio de 4 dígitos.</li>
                <li><strong>Evidencia Pericial + PIN de Cierre de Conformidad:</strong> El técnico sube fotos de <em>Antes y Después</em>; el dinero retenido en <strong>Escrow</strong> se libera únicamente cuando el cliente aprueba el cierre con su PIN de Conformidad.</li>
                <li><strong>Check-Out GPS (&gt;50m) y Botón SOS 24/7:</strong> Al concluir se registra el retiro físico del perímetro del inmueble, extinguiendo la licencia temporal de acceso.</li>
              </ol>
            </div>
          )}

          {legalModalSection === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <h4 style={{ margin: 0, color: '#0F172A', fontSize: '0.98rem' }}>Términos de Intermediación Tecnológica, Escrow y Garantía</h4>
              <p style={{ margin: 0 }}>
                <strong>1. Naturaleza de Intermediación Mercantil:</strong> ChambaYa opera como plataforma tecnológica de intermediación que conecta a usuarios con negocios y profesionales técnicos independientes. ChambaYa no sostiene relación laboral subordinada (Art. 13 y 15 LFT) con los prestadores ni sus técnicos.
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. Custodia de Pagos (Escrow) y Garantía:</strong> Los pagos realizados mediante SPEI, Tarjeta, OXXO Pay o Monedero se retienen en bóveda de garantía hasta el cierre verificado con conformidad del cliente. En caso de falla atribuible al servicio, aplica garantía de corrección o reembolso sujeto a arbitraje con fotos periciales Antes/Después.
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. Protección contra Inasistencia (No-Show):</strong> Si el chambeador arriba a la geocerca en horario pactado y el cliente no atiende tras 15 minutos de espera documentada, se aplica una tarifa de visita garantizada de <strong>$250 MXN</strong> a favor del prestador.
              </p>
              <p style={{ margin: 0 }}>
                <strong>4. Licencia Temporal de Acceso al Inmueble:</strong> La autorización de ingreso al domicilio se limita exclusivamente a la ventana horaria y áreas técnicas del servicio contratado, extinguiéndose automáticamente al confirmar el Check-Out GPS.
              </p>
            </div>
          )}

          {legalModalSection === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <h4 style={{ margin: 0, color: '#0F172A', fontSize: '0.98rem' }}>Aviso de Privacidad Integral (LFPDPPP — México)</h4>
              <p style={{ margin: 0 }}>
                <strong>1. Minimización y Enmascaramiento PII:</strong> Los números telefónicos se protegen en vistas operativas y la dirección exacta del inmueble permanece oculta hasta la asignación de un chambeador verificado, bloqueándose nuevamente al concluir la orden.
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. Datos Sensibles (Biometría y KYC):</strong> Las selfies de turno, identificaciones oficiales (INE/CURP) y antecedentes se resguardan cifrados exclusivamente para prevención de delitos, seguridad domiciliaria y arbitraje de disputas.
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. Derechos ARCO y Evidencia Pericial:</strong> Los titulares pueden ejercer Acceso, Rectificación, Cancelación y Oposición en <code>privacidad@chambaya.mx</code>, conservando únicamente registros fiscales (CFDI/SAT) y actas probatorias por el plazo legal aplicable.
              </p>
            </div>
          )}

          {legalModalSection === 'provider_contract' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <h4 style={{ margin: 0, color: '#0F172A', fontSize: '0.98rem' }}>Contrato Mercantil B2B2C con Agencias y Chambeadores</h4>
              <p style={{ margin: 0 }}>
                <strong>1. Autonomía Patronal y REPSE:</strong> Cada negocio proveedor es único patrón responsable de sus trabajadores técnicos, seguridad social (IMSS/INFONAVIT), herramienta y registro REPSE cuando corresponda.
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. Seguro de Responsabilidad Civil (RC Hogar) y Cláusula Anti-Bypass:</strong> Todas las órdenes y refacciones adicionales deben cursar dentro de la plataforma para mantener la cobertura de póliza RC y garantía de 30 días.
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. Cumplimiento Fiscal SAT (Plataformas Tecnológicas):</strong> ChambaYa emite constancias de retención de ISR/IVA conforme al régimen de Plataformas Tecnológicas y facilita el timbrado CFDI 4.0 con dispersión SPEI a cuenta CLABE verificada.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.85rem 1.4rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
            <CheckCircle2 size={15} />
            <span>Cumplimiento LFPDPPP • Art. 13 LFT • CFDI 4.0 SAT • NOM-151</span>
          </div>
          <button type="button" className="btn btn-primary btn-sm" style={{ background: '#10B981' }} onClick={() => setLegalModalSection(null)}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

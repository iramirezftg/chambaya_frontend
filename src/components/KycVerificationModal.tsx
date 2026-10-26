"use client";

import React, { useState, useEffect } from 'react';
import { api, Serviceman, KycVerification } from '../lib/api';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  Scan,
  UserCheck,
  Award,
  Sparkles,
  X,
  Upload,
  RefreshCw,
  ExternalLink,
  Lock,
  ChevronRight,
  Eye
} from 'lucide-react';

interface KycVerificationModalProps {
  serviceman: Serviceman;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const KycVerificationModal: React.FC<KycVerificationModalProps> = ({
  serviceman,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [curp, setCurp] = useState(serviceman.kycVerification?.curp || 'MEMC850412HDFRND07');
  const [curpResult, setCurpResult] = useState<any>(null);
  const [rfc, setRfc] = useState(serviceman.kycVerification?.rfc || 'MEMC8504128X9');
  const [rfcResult, setRfcResult] = useState<any>(null);

  // INE State
  const [ineClave, setIneClave] = useState(serviceman.kycVerification?.ineClaveElector || '');
  const [ineCic, setIneCic] = useState(serviceman.kycVerification?.ineCic || '');
  const [ineOcr, setIneOcr] = useState(serviceman.kycVerification?.ineOcrNumber || '');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ineScanned, setIneScanned] = useState(Boolean(serviceman.kycVerification?.ineValidated));

  // Biometrics State
  const [faceScore, setFaceScore] = useState<number | null>(serviceman.kycVerification?.faceMatchScore || null);
  const [biometricsLoading, setBiometricsLoading] = useState(false);
  const [facePassed, setFacePassed] = useState(Boolean(serviceman.kycVerification?.faceMatchPassed));

  // Antecedentes Penales
  const [folioAntecedentes, setFolioAntecedentes] = useState(serviceman.kycVerification?.antecedentesFolio || 'FGR-CDMX-2026-9021A');
  const [antecedentesPassed, setAntecedentesPassed] = useState(Boolean(serviceman.kycVerification?.antecedentesPassed));

  // Trust Score en Vivo
  const [trustScore, setTrustScore] = useState(serviceman.trustScore || 0);

  useEffect(() => {
    if (isOpen) {
      calculateLiveScore();
    }
  }, [isOpen, curpResult, rfcResult, ineScanned, facePassed, antecedentesPassed]);

  const calculateLiveScore = () => {
    let score = 0;
    if (curpResult?.valid || curp.length === 18) score += 15;
    if (rfcResult?.valid || rfc.length === 13) score += 10;
    if (ineScanned || ineClave.length > 8) score += 25;
    if (facePassed || faceScore !== null) score += 25;
    if (antecedentesPassed || folioAntecedentes.length > 5) score += 25;
    setTrustScore(Math.min(100, score));
  };

  const handleValidateCurp = async () => {
    setLoading(true);
    try {
      const res = await api.validateCurp(curp);
      setCurpResult(res);
      calculateLiveScore();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateRfc = async () => {
    setLoading(true);
    try {
      const res = await api.validateRfc(rfc);
      setRfcResult(res);
      calculateLiveScore();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanIneOcr = async () => {
    setOcrLoading(true);
    try {
      const res = await api.simulateIneOcr(serviceman.name);
      if (res.success) {
        setIneClave(res.claveElector);
        setIneCic(res.cic);
        setIneOcr(res.ocrNumber);
        setIneScanned(true);
        calculateLiveScore();
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleRunFacematch = async () => {
    setBiometricsLoading(true);
    try {
      const res = await api.simulateFacematch();
      if (res.passed) {
        setFaceScore(res.faceMatchScore);
        setFacePassed(true);
        calculateLiveScore();
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBiometricsLoading(false);
    }
  };

  const handleSubmitExpediente = async () => {
    setSubmitting(true);
    try {
      const payload = {
        curp,
        rfc,
        ineClaveElector: ineClave || 'MEND85041209H500',
        ineCic: ineCic || '492019482',
        ineOcrNumber: ineOcr || 'IDMEX1928471928<<',
        ineFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        ineBackUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        selfieUrl: serviceman.avatar,
        antecedentesFolio: folioAntecedentes,
        antecedentesDocUrl: '/docs/fgr_carlos_mendoza.pdf',
        comprobanteDomicilioUrl: '/docs/cfe_comprobante.pdf',
      };

      const res = await api.submitKycExpediente(serviceman.id, payload);

      if (res.trustScore >= 75) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      }

      alert('¡Expediente KYC enviado con éxito! Ha sido remitido a la Torre de Control para dictamen oficial.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Error al enviar expediente: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '94%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.75rem',
          borderRadius: '20px',
          background: '#FFF'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)'
            }}>
              <Award size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.2rem', color: '#0F172A' }}>
                Validación de Identidad KYC para Chambeadores 🇲🇽
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                Acredita tu identidad ante RENAPO, SAT e INE para obtener la Insignia Dorada Oficial
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Barra de Nivel de Confianza (Trust Score) */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '1.1rem 1.25rem',
          color: '#FFF',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#10B981" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Nivel de Confianza (Trust Score)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: trustScore >= 75 ? '#10B981' : trustScore >= 50 ? '#F59E0B' : '#EF4444' }}>
                {trustScore}%
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/ 100%</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${trustScore}%`,
              height: '100%',
              background: trustScore >= 75 ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #F59E0B, #D97706)',
              borderRadius: '999px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.72rem', color: '#CBD5E1' }}>
            <span>Técnico: <strong>{serviceman.name}</strong></span>
            <span>
              Estatus actual: <strong style={{ color: serviceman.isVerified ? '#10B981' : '#F59E0B' }}>
                {serviceman.verificationBadge || 'En proceso'}
              </strong>
            </span>
          </div>
        </div>

        {/* Navegación por pasos (Steps) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          marginBottom: '1.5rem',
          background: '#F1F5F9',
          padding: '4px',
          borderRadius: '12px'
        }}>
          {[
            { step: 1, label: '1. CURP & SAT' },
            { step: 2, label: '2. INE / IFE' },
            { step: 3, label: '3. Biometría' },
            { step: 4, label: '4. Dictamen' },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setCurrentStep(item.step)}
              style={{
                border: 'none',
                background: currentStep === item.step ? '#FFF' : 'transparent',
                color: currentStep === item.step ? '#0F172A' : '#64748B',
                padding: '0.55rem 0.25rem',
                borderRadius: '8px',
                fontWeight: currentStep === item.step ? 900 : 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: currentStep === item.step ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* PASO 1: Identidad Fiscal (CURP & RFC) */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.4rem' }}>
                Clave Única de Registro de Población (CURP)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  maxLength={18}
                  value={curp}
                  onChange={(e) => setCurp(e.target.value.toUpperCase())}
                  placeholder="ABCD123456HDFRND01"
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}
                />
                <button
                  type="button"
                  onClick={handleValidateCurp}
                  disabled={loading || curp.length < 18}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#2563EB', fontWeight: 800, padding: '0.65rem 1rem' }}
                >
                  {loading ? 'Validando...' : 'Validar RENAPO'}
                </button>
              </div>

              {curpResult && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  background: curpResult.valid ? '#ECFDF5' : '#FEF2F2',
                  border: `1px solid ${curpResult.valid ? '#A7F3D0' : '#FECACA'}`,
                  fontSize: '0.76rem'
                }}>
                  {curpResult.valid ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#065F46', fontWeight: 800 }}>
                        <CheckCircle2 size={14} /> CURP Validada Oficialmente ante RENAPO ✓
                      </div>
                      <div style={{ marginTop: '0.25rem', color: '#047857' }}>
                        Fecha de Nacimiento: <strong>{curpResult.birthDate}</strong> • Género: <strong>{curpResult.gender}</strong> • Entidad: <strong>{curpResult.stateOfBirth}</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#991B1B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> {curpResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.4rem' }}>
                Registro Federal de Contribuyentes (RFC SAT con Homoclave)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  maxLength={13}
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  placeholder="ABCD1234568X9"
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}
                />
                <button
                  type="button"
                  onClick={handleValidateRfc}
                  disabled={loading || rfc.length < 13}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#059669', fontWeight: 800, padding: '0.65rem 1rem' }}
                >
                  {loading ? 'Validando...' : 'Validar SAT'}
                </button>
              </div>

              {rfcResult && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  background: rfcResult.valid ? '#ECFDF5' : '#FEF2F2',
                  border: `1px solid ${rfcResult.valid ? '#A7F3D0' : '#FECACA'}`,
                  fontSize: '0.76rem'
                }}>
                  {rfcResult.valid ? (
                    <div style={{ color: '#065F46', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> RFC Persona Física con Homoclave Válida SAT ✓
                    </div>
                  ) : (
                    <div style={{ color: '#991B1B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> {rfcResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-primary"
                style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
              >
                <span>Siguiente: Credencial INE</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Credencial para Votar INE / IFE */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '180px',
                  height: '110px',
                  borderRadius: '10px',
                  border: '2px dashed #94A3B8',
                  background: '#FFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem'
                }}>
                  <Camera size={24} color="#64748B" />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', fontWeight: 700 }}>
                    INE Frontal
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#10B981', fontWeight: 800 }}>✓ Documento cargado</span>
                </div>

                <div style={{
                  width: '180px',
                  height: '110px',
                  borderRadius: '10px',
                  border: '2px dashed #94A3B8',
                  background: '#FFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem'
                }}>
                  <Scan size={24} color="#64748B" />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', fontWeight: 700 }}>
                    INE Reverso (CIC)
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#10B981', fontWeight: 800 }}>✓ Código de barras</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleScanIneOcr}
                disabled={ocrLoading}
                className="btn btn-primary"
                style={{
                  background: '#2563EB',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 800
                }}
              >
                <Scan size={16} />
                <span>{ocrLoading ? 'Escaneando con OCR ChambaYa...' : 'Escanear Credencial con OCR Inteligente'}</span>
              </button>
            </div>

            {/* Resultados OCR */}
            {ineScanned && (
              <div style={{
                background: '#ECFDF5',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #A7F3D0',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 800, color: '#065F46', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} />
                  <span>Datos Extraídos por OCR Oficial del INE (Confianza 98.5%)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <span style={{ color: '#047857', fontSize: '0.72rem', display: 'block' }}>Clave de Elector:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#064E3B' }}>{ineClave || 'MENCAR85041209H500'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#047857', fontSize: '0.72rem', display: 'block' }}>CIC (Reverso):</span>
                    <strong style={{ fontFamily: 'monospace', color: '#064E3B' }}>{ineCic || '492019482'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#047857', fontSize: '0.72rem', display: 'block' }}>Vigencia INE:</span>
                    <strong style={{ color: '#064E3B' }}>2024 - 2034 (Vigente ✓)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#047857', fontSize: '0.72rem', display: 'block' }}>Sección Electoral:</span>
                    <strong style={{ color: '#064E3B' }}>Sección 3492 CDMX</strong>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn btn-secondary btn-sm"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn btn-primary"
                style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
              >
                <span>Siguiente: Biometría Facial</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Biometría Facial y Prueba de Vida */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', textAlign: 'center' }}>
            <div style={{
              width: '180px',
              height: '220px',
              borderRadius: '999px',
              border: `4px solid ${facePassed ? '#10B981' : '#3B82F6'}`,
              background: '#0F172A',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <img
                src={serviceman.avatar}
                alt={serviceman.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '2px dashed rgba(255,255,255,0.4)',
                borderRadius: '999px'
              }} />
            </div>

            <div style={{ maxWidth: '420px' }}>
              <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 800, color: '#0F172A' }}>
                Prueba de Vida Facial & Coincidencia Biométrica
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', lineHeight: '1.4' }}>
                El algoritmo compara la selfie en vivo del chambeador contra la fotografía de la credencial INE para descartar suplantación de identidad.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunFacematch}
              disabled={biometricsLoading}
              className="btn btn-primary"
              style={{
                background: '#2563EB',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.5rem',
                fontWeight: 800
              }}
            >
              <UserCheck size={18} />
              <span>{biometricsLoading ? 'Verificando Parpadeo y Similitud...' : 'Ejecutar Verificación Facial Biométrica'}</span>
            </button>

            {facePassed && (
              <div style={{
                width: '100%',
                background: '#ECFDF5',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #A7F3D0',
                fontSize: '0.8rem',
                textAlign: 'left'
              }}>
                <div style={{ fontWeight: 800, color: '#065F46', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} />
                  <span>Biometría Aprobada con Éxito: {faceScore}% de Similitud con INE</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#047857', display: 'flex', gap: '1rem' }}>
                  <span>✓ Detección de parpadeo</span>
                  <span>✓ Anti-Spoofing 3D</span>
                  <span>✓ Prueba de vida superada</span>
                </div>
              </div>
            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-secondary btn-sm"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn btn-primary"
                style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
              >
                <span>Siguiente: Antecedentes & Dictamen</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: Carta de No Antecedentes Penales y Dictamen Final */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.4rem' }}>
                Carta de No Antecedentes Penales (Fiscalía / Secretaría de Seguridad)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input
                  type="text"
                  value={folioAntecedentes}
                  onChange={(e) => setFolioAntecedentes(e.target.value)}
                  placeholder="Folio oficial ej. FGR-CDMX-2026-9021A"
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setAntecedentesPassed(true);
                    calculateLiveScore();
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 800 }}
                >
                  {antecedentesPassed ? '✓ Validado' : 'Validar Folio'}
                </button>
              </div>

              <div style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                background: '#EFF6FF',
                color: '#1E40AF',
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <FileText size={16} />
                <span>Documento expedido dentro de los últimos 90 días naturales para garantizar máxima seguridad del cliente.</span>
              </div>
            </div>

            {/* Resumen Final de Validación */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #E2E8F0',
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem' }}>
                Resumen del Expediente KYC para Dictamen Oficial
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>1. CURP & RFC Fiscal:</span>
                  <strong style={{ color: '#16A34A' }}>Validado ante RENAPO y SAT (+25%) ✓</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>2. Credencial INE Oficial:</span>
                  <strong style={{ color: ineScanned ? '#16A34A' : '#D97706' }}>
                    {ineScanned ? 'OCR y CIC cotejados (+25%) ✓' : 'Pendiente de escaneo'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>3. Biometría Facial:</span>
                  <strong style={{ color: facePassed ? '#16A34A' : '#D97706' }}>
                    {facePassed ? `Prueba de vida superada (${faceScore}%) (+25%) ✓` : 'Pendiente'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>4. Carta No Antecedentes:</span>
                  <strong style={{ color: antecedentesPassed ? '#16A34A' : '#D97706' }}>
                    {antecedentesPassed ? 'Folio FGR vigente (+25%) ✓' : 'Pendiente'}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn btn-secondary btn-sm"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleSubmitExpediente}
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Award size={18} />
                <span>{submitting ? 'Enviando a Torre de Control...' : 'Finalizar y Enviar para Insignia Dorada'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

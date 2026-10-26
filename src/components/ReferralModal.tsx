"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { api, ReferralInfo } from '../lib/api';
import confetti from 'canvas-confetti';
import {
  X,
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  Tag
} from 'lucide-react';

export const ReferralModal = () => {
  const {
    showReferralModal,
    setShowReferralModal,
    currentUser,
    customerUser,
    addCustomerWallet
  } = usePlatform();

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referral, setReferral] = useState<ReferralInfo | null>(null);

  useEffect(() => {
    if (!showReferralModal) return;

    const fetchReferral = async () => {
      setLoading(true);
      try {
        const userId = currentUser?.id || 'usr-cust-1';
        const userName = currentUser?.name || customerUser.name;
        const data = await api.getUserReferral(userId, userName);
        setReferral(data);
      } catch (err) {
        console.warn('Error fetching referral, using fallback:', err);
        setReferral({
          code: 'FERNANDA100',
          userId: 'usr-cust-1',
          rewardAmount: 100,
          referredDiscount: 100,
          referredCount: 3,
          totalEarnedMXN: 300,
          pendingRewardMXN: 100,
          referrerReward: 100,
          refereeDiscount: 100,
          totalReferred: 3,
          totalEarned: 300,
          shareUrl: 'http://localhost:3000/marketplace',
          whatsappUrl: '',
          whatsappMessage: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReferral();
  }, [showReferralModal, currentUser, customerUser]);

  if (!showReferralModal) return null;

  const referralCode = referral?.code || 'FERNANDA100';
  const shareMessage = `¡Te regalo $100 MXN en tu primer servicio del hogar con ChambaYa México! 🇲🇽🛠️\n\nUsa mi código de amigo *${referralCode}* al pedir tu plomero, electricista o servicio de limpieza en:\nhttp://localhost:3000/marketplace\n\n¡Garantía Escrow y técnicos certificados! 🛡️`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateFriendBooking = () => {
    // Simular que un amigo usó el código y se ganaron $100
    addCustomerWallet(100);
    if (referral) {
      setReferral({
        ...referral,
        totalReferred: (referral.totalReferred ?? referral.referredCount ?? 0) + 1,
        referredCount: (referral.referredCount ?? referral.totalReferred ?? 0) + 1,
        totalEarned: (referral.totalEarned ?? referral.totalEarnedMXN ?? 0) + 100,
        totalEarnedMXN: (referral.totalEarnedMXN ?? referral.totalEarned ?? 0) + 100
      });
    }
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });
    alert('🎉 ¡Simulación Exitosa! Tu compa liquidó su primera chamba. Se acreditaron $100 MXN a tu Monedero ChambaYa.');
  };

  return (
    <div className="modal-overlay" onClick={() => setShowReferralModal(false)}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Banner Superior Premium */}
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
          padding: '1.5rem',
          color: '#FFF',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', right: '40px', bottom: '-40px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.15)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)'
              }}>
                <Gift size={24} color="#FDE047" />
              </div>
              <div>
                <span style={{
                  background: '#FDE047',
                  color: '#78350F',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  letterSpacing: '0.5px'
                }}>
                  PROGRAMA INVITA A UN COMPA 🇲🇽
                </span>
                <h2 style={{ fontSize: '1.35rem', margin: '0.2rem 0 0 0', fontWeight: 900, color: '#FFF' }}>
                  Regala $100 MXN y Gana $100 MXN
                </h2>
              </div>
            </div>

            <button
              onClick={() => setShowReferralModal(false)}
              style={{
                background: 'rgba(255,255,255,0.15)',
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

          <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.85rem', color: '#D1FAE5', lineHeight: '1.4', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
            Comparte tu código personalizado con amigos, familia o vecinos. Cuando reserven su primer servicio, ellos ahorran <strong>$100 MXN</strong> y tú recibes <strong>$100 MXN</strong> en tu monedero.
          </p>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.5rem' }}>
          {/* Tarjeta de Código de Referido */}
          <div style={{
            background: '#F8FAFC',
            border: '2px dashed #10B981',
            borderRadius: '14px',
            padding: '1.25rem',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
              Tu Código de Invitación Personal
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#FFF',
              border: '2px solid #CBD5E1',
              borderRadius: '10px',
              padding: '0.6rem 1.25rem',
              marginBottom: '0.75rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '3px', color: '#0F172A' }}>
                {referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  background: copied ? '#10B981' : '#F1F5F9',
                  color: copied ? '#FFF' : '#0F172A',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* Acciones de compartir */}
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#25D366',
                  color: '#FFF',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)'
                }}
              >
                <MessageCircle size={16} />
                <span>Compartir por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleSimulateFriendBooking}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
                title="Simula en vivo la redención para verificar el monedero"
              >
                <Sparkles size={14} />
                <span>Simular Amigo que Canjea (+ $100 MXN)</span>
              </button>
            </div>
          </div>

          {/* Estadísticas de Referidos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem', color: '#3B82F6' }}>
                <Users size={18} />
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A' }}>
                {referral?.totalReferred ?? referral?.referredCount ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Compas Invitados</div>
            </div>

            <div style={{ background: '#ECFDF5', padding: '0.85rem', borderRadius: '10px', border: '1px solid #A7F3D0', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem', color: '#059669' }}>
                <Coins size={18} />
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669' }}>
                ${referral?.totalEarned ?? referral?.totalEarnedMXN ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>Ganado en Recompensas</div>
            </div>

            <div style={{ background: '#FEF3C7', padding: '0.85rem', borderRadius: '10px', border: '1px solid #FDE68A', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem', color: '#D97706' }}>
                <Gift size={18} />
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#92400E' }}>
                ${customerUser.walletBalance.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 600 }}>Saldo en Monedero</div>
            </div>
          </div>

          {/* Cómo Funciona (Timeline de 3 Pasos) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
              ¿Cómo funciona el programa de referidos?
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A' }}>Comparte tu código con un compa</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Pásaselo por WhatsApp o redes sociales para que lo ingrese en su cuenta o en el checkout.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A' }}>Tu amigo recibe $100 MXN de descuento</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Al reservar plomería, electricidad, cerrajería o cualquier servicio mayor a $300 MXN.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A' }}>Recibes $100 MXN en tu monedero</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>En cuanto el chambeador culmine el servicio con OTP, tus $100 se liberan para tus futuros pedidos.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cupones activos de la plataforma */}
          <div style={{ background: '#F1F5F9', padding: '1rem', borderRadius: '10px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
              <Tag size={14} color="#64748B" />
              <span>Otros Cupones Oficiales Disponibles:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ background: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', color: '#0F172A', fontWeight: 700 }}>
                <code>BUENFIN2026</code> (-20%)
              </span>
              <span style={{ background: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', color: '#0F172A', fontWeight: 700 }}>
                <code>PRIMERACHAMBA</code> (-$150 MXN)
              </span>
              <span style={{ background: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', color: '#0F172A', fontWeight: 700 }}>
                <code>CHAMBA100</code> (-$100 MXN)
              </span>
              <span style={{ background: '#FFF', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', color: '#0F172A', fontWeight: 700 }}>
                <code>SOSURGENTE</code> (-$50 MXN)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

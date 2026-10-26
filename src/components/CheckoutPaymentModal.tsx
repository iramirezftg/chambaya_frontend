"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { api, Booking, CouponValidationResult, SOCKET_URL } from '../lib/api';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  Building2,
  Store,
  DollarSign,
  CheckCircle2,
  Copy,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Code2,
  Printer,
  FileText,
  Tag,
  Percent,
  Gift,
  Sparkles,
  Check
} from 'lucide-react';

export const CheckoutPaymentModal = () => {
  const {
    checkoutBookingId,
    setCheckoutBookingId,
    setInvoicingBookingId,
    bookings,
    refreshData
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'card' | 'oxxo' | 'spei' | 'cash'>('card');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [webhookPayload, setWebhookPayload] = useState<any>(null);
  const [showWebhookInspector, setShowWebhookInspector] = useState(false);

  // Cupones y Descuentos
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Form states for card
  const [cardNumber, setCardNumber] = useState('4152 3140 8921 5590');
  const [cardHolder, setCardHolder] = useState('FERNANDA GOMEZ');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('782');

  const booking = bookings.find(b => b.id === checkoutBookingId);

  // Cargar intención de pago inicial cuando se abre el modal
  useEffect(() => {
    if (!checkoutBookingId) {
      setPaymentData(null);
      setPaymentSuccess(false);
      setWebhookPayload(null);
      return;
    }

    const currentBooking = bookings.find(b => b.id === checkoutBookingId);
    if (currentBooking?.paymentStatus === 'paid') {
      setPaymentSuccess(true);
    }

    // Inicializar intención de pago según el tab
    initPaymentIntent(activeTab);

    // Conectar a WebSockets para escuchar la confirmación de pago en tiempo real
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      socket.emit('join_booking', {
        bookingId: checkoutBookingId,
        userName: currentBooking?.customerName || 'Cliente',
        userRole: 'CLIENTE'
      });
    });

    socket.on('payment_confirmed', (data: any) => {
      if (data.bookingId === checkoutBookingId) {
        setPaymentSuccess(true);
        setWebhookPayload(data);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        refreshData();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [checkoutBookingId, activeTab]);

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalAmount = Math.max(0, (booking?.amount || 0) - discountAmount);

  const handleApplyCoupon = async (codeToUse?: string) => {
    const code = (codeToUse || couponCodeInput).trim().toUpperCase();
    if (!code || !booking) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await api.validateCoupon(code, booking.amount, (booking as any)?.userId || 'usr-cust-1');
      if (res.isValid || res.valid) {
        setAppliedCoupon(res);
        setCouponCodeInput(code);
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.55 }
        });
      } else {
        setCouponError(res.message || 'El cupón no es válido para este pedido.');
      }
    } catch (err: any) {
      setCouponError('No se pudo verificar el cupón. Intenta nuevamente.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponCodeInput('');
  };

  const initPaymentIntent = async (method: 'card' | 'oxxo' | 'spei' | 'cash') => {
    if (!checkoutBookingId) return;
    setLoading(true);
    try {
      const gatewayMap: Record<string, string> = {
        card: 'stripe',
        oxxo: 'oxxo',
        spei: 'spei',
        cash: 'efectivo'
      };
      const data = await api.createPaymentIntent(checkoutBookingId, gatewayMap[method], finalAmount);
      setPaymentData(data);
    } catch (err) {
      console.error('Error init payment intent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleSimulateWebhook = async (gateway: 'stripe' | 'mercadopago' | 'oxxo' | 'spei') => {
    if (!checkoutBookingId || !booking) return;
    setLoading(true);
    try {
      // Registrar redención de cupón si aplica
      if (appliedCoupon && (appliedCoupon.code || appliedCoupon.coupon)) {
        try {
          await api.recordRedemption({
            code: appliedCoupon.code || (appliedCoupon.coupon as any)?.code,
            bookingId: checkoutBookingId,
            userId: (booking as any)?.userId || 'usr-cust-1',
            userPhone: booking.customerPhone,
            originalAmount: booking.amount,
            discountAmount: discountAmount,
            finalAmount: finalAmount
          });
        } catch (e) {
          console.warn('Error al registrar redención de cupón:', e);
        }
      }

      const result = await api.simulatePaymentWebhook(checkoutBookingId, gateway);
      setWebhookPayload(result);
      setPaymentSuccess(true);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 }
      });
      await refreshData();
    } catch (err) {
      alert('Error al simular webhook');
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutBookingId || !booking) return null;

  return (
    <div className="modal-overlay" onClick={() => setCheckoutBookingId(null)}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
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
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}>
                CHECKOUT SEGURO
              </span>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>• Folio: {booking.id}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, color: '#FFF' }}>
              Pasarela de Pago ChambaYa México
            </h2>
          </div>
          <button
            onClick={() => setCheckoutBookingId(null)}
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

        {/* Resumen del servicio */}
        <div style={{
          background: '#F8FAFC',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Servicio a Liquidar:</div>
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{booking.serviceTitle}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              {appliedCoupon ? 'Total Final con Descuento:' : 'Total a Pagar (MXN):'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', justifyContent: 'flex-end' }}>
              {appliedCoupon && (
                <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: '#94A3B8', fontWeight: 700 }}>
                  ${booking.amount.toFixed(2)}
                </span>
              )}
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>
                ${finalAmount.toFixed(2)} MXN
              </span>
            </div>
          </div>
        </div>

        {/* Pantalla de Éxito cuando el Webhook confirma el pago */}
        {paymentSuccess ? (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem auto',
              boxShadow: '0 0 0 10px rgba(34, 197, 94, 0.15)'
            }}>
              <CheckCircle2 size={44} />
            </div>

            <span style={{
              background: '#DCFCE7',
              color: '#15803D',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              display: 'inline-block',
              marginBottom: '0.5rem'
            }}>
              CONFIRMADO POR WEBHOOK EN TIEMPO REAL
            </span>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
              ¡Tu Pago fue Acreditado con Éxito!
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
              Hemos notificado al chambeador y despachado tu orden. Puedes seguir en vivo el radar satelital del técnico.
            </p>

            {/* Recibo digital */}
            <div style={{
              background: '#F8FAFC',
              border: '1px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '1.25rem',
              maxWidth: '460px',
              margin: '0 auto 1.5rem auto',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Folio de Chamba:</span>
                <strong style={{ color: '#0F172A' }}>{booking.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Identificador Transacción:</span>
                <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>
                  {booking.transactionId || 'TXN-MX-98234'}
                </strong>
              </div>
              {appliedCoupon && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#64748B' }}>Subtotal Original:</span>
                    <span style={{ color: '#64748B' }}>${booking.amount.toFixed(2)} MXN</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#059669', fontWeight: 700 }}>
                      Cupón Aplicado ({appliedCoupon.code || (appliedCoupon.coupon as any)?.code || 'PROMO'}):
                    </span>
                    <strong style={{ color: '#059669' }}>-${discountAmount.toFixed(2)} MXN</strong>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Monto Acreditado (Escrow):</span>
                <strong style={{ color: '#16A34A', fontSize: '1.1rem' }}>${finalAmount.toFixed(2)} MXN</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Código de Seguridad (OTP):</span>
                <strong style={{ color: '#2563EB', fontSize: '1.1rem', letterSpacing: '2px' }}>
                  {booking.otp}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Estatus de Chamba:</span>
                <span style={{ color: '#16A34A', fontWeight: 800 }}>En Camino / Asignado</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCheckoutBookingId(null)}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', fontWeight: 700 }}
              >
                Volver al Tablero
              </button>
              <button
                type="button"
                onClick={() => {
                  setCheckoutBookingId(null);
                  setInvoicingBookingId(booking.id);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontWeight: 700 }}
              >
                <FileText size={15} />
                <span>Solicitar Factura CFDI 4.0</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={15} />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1.25rem' }}>
            {/* Sección de Cupones y Promociones */}
            <div style={{
              background: appliedCoupon ? '#ECFDF5' : '#F8FAFC',
              border: appliedCoupon ? '2px solid #10B981' : '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '0.9rem 1rem',
              marginBottom: '1.25rem',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={16} color={appliedCoupon ? '#059669' : '#64748B'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: appliedCoupon ? '#065F46' : '#1E293B' }}>
                    ¿Tienes un Cupón de Descuento o Código de Amigo?
                  </span>
                </div>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Quitar Cupón
                  </button>
                )}
              </div>

              {!appliedCoupon ? (
                <>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Ej. BUENFIN2026, PRIMERACHAMBA, FERNANDA100"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: couponError ? '1px solid #EF4444' : '1px solid #CBD5E1',
                        fontSize: '0.82rem',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.5px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={validatingCoupon || !couponCodeInput.trim()}
                      className="btn btn-primary"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        background: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: couponCodeInput.trim() ? 'pointer' : 'not-allowed',
                        opacity: couponCodeInput.trim() ? 1 : 0.6
                      }}
                    >
                      {validatingCoupon ? 'Validando...' : 'Aplicar'}
                    </button>
                  </div>

                  {couponError && (
                    <div style={{ color: '#DC2626', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      ⚠️ {couponError}
                    </div>
                  )}

                  {/* Chips de sugerencias rápidas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Sugerencias:</span>
                    {[
                      { code: 'BUENFIN2026', label: 'BUENFIN2026 (-20%)', color: '#7C3AED', bg: '#F5F3FF' },
                      { code: 'PRIMERACHAMBA', label: 'PRIMERACHAMBA (-$150)', color: '#059669', bg: '#ECFDF5' },
                      { code: 'CHAMBA100', label: 'CHAMBA100 (-$100)', color: '#2563EB', bg: '#EFF6FF' },
                      { code: 'FERNANDA100', label: '🎁 Amigo (-$100)', color: '#D97706', bg: '#FEF3C7' }
                    ].map(chip => (
                      <button
                        key={chip.code}
                        type="button"
                        onClick={() => handleApplyCoupon(chip.code)}
                        style={{
                          background: chip.bg,
                          color: chip.color,
                          border: `1px solid ${chip.color}33`,
                          borderRadius: '6px',
                          padding: '0.2rem 0.45rem',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Sparkles size={11} />
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #A7F3D0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      background: '#10B981',
                      color: '#FFF',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#065F46', fontSize: '0.85rem' }}>
                        ¡Cupón {appliedCoupon.code || (appliedCoupon.coupon as any)?.code} aplicado!
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                        {appliedCoupon.description || (appliedCoupon.coupon as any)?.description || appliedCoupon.title || 'Descuento oficial ChambaYa'} • Ahorraste ${discountAmount.toFixed(2)} MXN
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Ahorras:</div>
                    <div style={{ fontWeight: 900, color: '#059669', fontSize: '1rem' }}>
                      -${discountAmount.toFixed(2)} MXN
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs de selección de método */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
              marginBottom: '1.25rem'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                style={{
                  padding: '0.65rem 0.4rem',
                  borderRadius: '10px',
                  border: activeTab === 'card' ? '2px solid #10B981' : '1px solid #E2E8F0',
                  background: activeTab === 'card' ? '#ECFDF5' : '#FFF',
                  color: activeTab === 'card' ? '#065F46' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                <CreditCard size={18} color={activeTab === 'card' ? '#10B981' : '#64748B'} />
                <span>Tarjeta (Stripe)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('oxxo')}
                style={{
                  padding: '0.65rem 0.4rem',
                  borderRadius: '10px',
                  border: activeTab === 'oxxo' ? '2px solid #DC2626' : '1px solid #E2E8F0',
                  background: activeTab === 'oxxo' ? '#FEF2F2' : '#FFF',
                  color: activeTab === 'oxxo' ? '#991B1B' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                <Store size={18} color={activeTab === 'oxxo' ? '#DC2626' : '#64748B'} />
                <span>OXXO Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('spei')}
                style={{
                  padding: '0.65rem 0.4rem',
                  borderRadius: '10px',
                  border: activeTab === 'spei' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  background: activeTab === 'spei' ? '#EFF6FF' : '#FFF',
                  color: activeTab === 'spei' ? '#1E40AF' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                <Building2 size={18} color={activeTab === 'spei' ? '#2563EB' : '#64748B'} />
                <span>SPEI STP</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cash')}
                style={{
                  padding: '0.65rem 0.4rem',
                  borderRadius: '10px',
                  border: activeTab === 'cash' ? '2px solid #D97706' : '1px solid #E2E8F0',
                  background: activeTab === 'cash' ? '#FFFBEB' : '#FFF',
                  color: activeTab === 'cash' ? '#92400E' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                <DollarSign size={18} color={activeTab === 'cash' ? '#D97706' : '#64748B'} />
                <span>Efectivo (OTP)</span>
              </button>
            </div>

            {/* TAB 1: TARJETA CRÉDITO / DÉBITO (STRIPE) */}
            {activeTab === 'card' && (
              <div>
                {/* Visual Mexican Bank Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  color: '#FFF',
                  marginBottom: '1.25rem',
                  boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px', color: '#A5B4FC' }}>
                      BBVA MÉXICO • DÉBITO PLATINUM
                    </span>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', fontStyle: 'italic' }}>VISA</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '36px', height: '26px', borderRadius: '4px', background: 'linear-gradient(135deg, #FDE047, #CA8A04)' }} />
                    <span style={{ fontSize: '0.7rem', color: '#C7D2FE' }}>CONTACTLESS</span>
                  </div>

                  <div style={{ fontSize: '1.15rem', fontFamily: 'monospace', letterSpacing: '3px', marginBottom: '1rem', fontWeight: 700 }}>
                    {cardNumber}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem' }}>
                    <div>
                      <div style={{ color: '#A5B4FC', fontSize: '0.65rem' }}>TITULAR</div>
                      <div style={{ fontWeight: 700, letterSpacing: '1px' }}>{cardHolder}</div>
                    </div>
                    <div>
                      <div style={{ color: '#A5B4FC', fontSize: '0.65rem' }}>VENCE</div>
                      <div style={{ fontWeight: 700 }}>{cardExpiry}</div>
                    </div>
                  </div>
                </div>

                {/* Formulario de Pago */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Fecha de Expiración
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      placeholder="MM/AA"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Código de Seguridad (CVV)
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      maxLength={4}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.75rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={16} color="#10B981" />
                  <span>Procesado de forma segura con cifrado de 256 bits y 3D Secure 2.0 por Stripe México.</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateWebhook('stripe')}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    background: '#6366F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Zap size={18} />
                  <span>{loading ? 'Procesando con Stripe...' : `Pagar $${finalAmount.toFixed(2)} MXN con Tarjeta`}</span>
                </button>
              </div>
            )}

            {/* TAB 2: OXXO PAY */}
            {activeTab === 'oxxo' && (
              <div>
                <div style={{
                  background: '#FFF',
                  border: '2px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  marginBottom: '1rem'
                }}>
                  {/* Ficha oficial OXXO */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #DC2626', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#DC2626', color: '#FEF08A', fontWeight: 900, fontSize: '1.1rem', padding: '0.2rem 0.6rem', borderRadius: '4px', letterSpacing: '1px' }}>
                        OXXO
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>PAY</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748B' }}>
                      <div>Fecha de Vencimiento:</div>
                      <strong style={{ color: '#DC2626' }}>25 de Octubre, 2026</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, marginBottom: '0.3rem' }}>
                      NÚMERO DE REFERENCIA OXXO PAY (14 DÍGITOS)
                    </div>
                    <div style={{
                      fontSize: '1.6rem',
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      color: '#0F172A',
                      letterSpacing: '3px',
                      background: '#F1F5F9',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <span>{paymentData?.transaction?.oxxoReference || '9382 7353 4549 03'}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentData?.transaction?.oxxoReference || '93827353454903', 'oxxo')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB' }}
                        title="Copiar Referencia"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    {copied === 'oxxo' && (
                      <div style={{ color: '#16A34A', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                        ✓ ¡Referencia copiada al portapapeles!
                      </div>
                    )}
                  </div>

                  {/* Código de barras simulado SVG */}
                  <div style={{
                    background: '#FFF',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    textAlign: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '2rem',
                      letterSpacing: '-2px',
                      color: '#000',
                      lineHeight: '1'
                    }}>
                      ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', letterSpacing: '4px', marginTop: '0.25rem' }}>
                      {paymentData?.transaction?.oxxoBarcode || '9382735345490300000000'}
                    </div>
                  </div>

                  {/* Instrucciones OXXO */}
                  <div style={{ background: '#FEF2F2', padding: '0.85rem', borderRadius: '8px', borderLeft: '4px solid #DC2626', fontSize: '0.78rem', color: '#7F1D1D' }}>
                    <div style={{ fontWeight: 800, marginBottom: '0.3rem' }}>Instrucciones de Pago en Caja:</div>
                    <ol style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.4' }}>
                      <li>Acude a cualquier tienda OXXO del país.</li>
                      <li>Indica al cajero que realizarás un pago de servicio <strong>OXXO Pay</strong>.</li>
                      <li>Paga el monto exacto de <strong>${finalAmount.toFixed(2)} MXN</strong> en efectivo (+ comisión de caja de $15 MXN).</li>
                      <li>El sistema confirmará automáticamente tu pago en menos de 5 minutos mediante Webhook.</li>
                    </ol>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateWebhook('oxxo')}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    background: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Store size={18} />
                  <span>{loading ? 'Disparando Webhook OXXO...' : `🏪 Simular Pago en Caja OXXO ($${finalAmount.toFixed(2)} MXN)`}</span>
                </button>
              </div>
            )}

            {/* TAB 3: SPEI STP BANXICO */}
            {activeTab === 'spei' && (
              <div>
                <div style={{
                  background: '#FFF',
                  border: '2px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2563EB', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#2563EB', color: '#FFF', fontWeight: 900, fontSize: '0.95rem', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        SPEI
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>BANXICO / STP</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 800, background: '#DCFCE7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      SIN COMISIÓN BANCARIA
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
                    <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>CLABE INTERBANCARIA (18 DÍGITOS)</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 900, color: '#1E40AF' }}>
                          {paymentData?.transaction?.speiClabe || '646180597517984663'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(paymentData?.transaction?.speiClabe || '646180597517984663', 'spei')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Copy size={13} />
                          <span>Copiar</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Banco Receptor:</div>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>STP (Sistema de Transferencias)</div>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Beneficiario:</div>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>ChambaYa México SAPI</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Concepto Obligatorio:</div>
                        <div style={{ fontWeight: 900, color: '#2563EB', fontSize: '0.95rem' }}>{booking.id}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Monto Exacto:</div>
                        <div style={{ fontWeight: 900, color: '#059669', fontSize: '1rem' }}>${finalAmount.toFixed(2)} MXN</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateWebhook('spei')}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    background: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Building2 size={18} />
                  <span>{loading ? 'Disparando Webhook SPEI...' : `🏦 Simular Transferencia SPEI ($${finalAmount.toFixed(2)} MXN)`}</span>
                </button>
              </div>
            )}

            {/* TAB 4: EFECTIVO AL FINALIZAR */}
            {activeTab === 'cash' && (
              <div>
                <div style={{
                  background: '#FFFBEB',
                  border: '2px solid #FCD34D',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  <DollarSign size={40} color="#D97706" style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400E', margin: '0 0 0.4rem 0' }}>
                    Pago en Efectivo Contraentrega
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#B45309', margin: '0 0 1rem 0' }}>
                    Paga directamente al chambeador una vez que haya terminado tu servicio a entera satisfacción.
                  </p>

                  <div style={{
                    background: '#FFF',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px dashed #F59E0B',
                    display: 'inline-block'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: 700 }}>PIN DE LIBERACIÓN DE SERVICIO</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '4px', color: '#D97706' }}>
                      {booking.otp}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckoutBookingId(null)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    background: '#D97706'
                  }}
                >
                  Confirmar Pago en Efectivo de ${finalAmount.toFixed(2)} MXN al Chambeador
                </button>
              </div>
            )}

            {/* Botón para abrir el Inspector de Webhooks */}
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowWebhookInspector(!showWebhookInspector)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Code2 size={14} />
                <span>{showWebhookInspector ? 'Ocultar' : 'Inspeccionar'} Payload Técnico de Webhooks</span>
              </button>

              {showWebhookInspector && (
                <div style={{
                  marginTop: '0.75rem',
                  background: '#0F172A',
                  color: '#38BDF8',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  textAlign: 'left',
                  maxHeight: '160px',
                  overflowY: 'auto'
                }}>
                  <div style={{ color: '#94A3B8', marginBottom: '0.3rem' }}>// Evento WebSocket / Webhook recibido:</div>
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(webhookPayload || paymentData || { status: 'waiting_for_webhook_event' }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

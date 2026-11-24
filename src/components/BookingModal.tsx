"use client";

import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Tag,
  CreditCard,
  Wallet,
  DollarSign,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const BookingModalContent = ({ service }: { service: any }) => {
  const {
    setBookingModalService,
    providers,
    customerUser,
    createNewBooking,
    saveGatehouseAccess,
    setTrackingBookingId,
    setCheckoutBookingId,
    setLegalModalSection
  } = usePlatform();

  const provider = providers.find(p => p.id === service.providerId);

  const [selectedVariant, setSelectedVariant] = useState(service.variants ? service.variants[0] : null);
  const [scheduledDate, setScheduledDate] = useState('2026-10-23');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 11:30 AM');
  const [address, setAddress] = useState(customerUser.address);
  const [colony, setColony] = useState('Roma Norte');
  const [postalCode, setPostalCode] = useState('06700');
  const [crossStreets, setCrossStreets] = useState('Entre Orizaba y Córdoba');
  const [requiresGuardPass, setRequiresGuardPass] = useState(true);
  const [guardNotes, setGuardNotes] = useState('Registrarse en caseta con INE y Pase Digital ChambaYa.');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePrice = service.discountPrice || service.price;
  const variantPrice = selectedVariant?.priceAdd || 0;
  const subtotal = basePrice + variantPrice;
  const platformFee = 25.00; // Tarifa de servicio MXN
  const total = Math.max(0, subtotal - discountAmount + platformFee);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'PRIMERACHAMBA' || code === 'FIRST50') {
      setDiscountAmount(subtotal * 0.20);
      alert('¡Cupón PRIMERACHAMBA aplicado! 20% de descuento.');
    } else if (code === 'VERANO20' || code === 'SUMMERCOOL') {
      setDiscountAmount(subtotal * 0.15);
      alert('¡Cupón VERANO20 aplicado! 15% de descuento.');
    } else {
      alert('Cupón no válido. Usa PRIMERACHAMBA para 20% de descuento.');
    }
  };

  const handleConfirm = async () => {
    if (!termsAccepted) return;
    setIsSubmitting(true);
    try {
      const fullAddress = [address, colony ? `Col. ${colony}` : '', postalCode ? `CP ${postalCode}` : '']
        .filter(Boolean)
        .join(', ');
      const created = await createNewBooking({
        serviceId: service.id,
        amount: total,
        paymentMethod,
        address: fullAddress,
        scheduledDate,
        scheduledTimeSlot: selectedTimeSlot,
        variant: selectedVariant
      });
      saveGatehouseAccess(created.id, {
        requiresGuardPass,
        colony,
        postalCode,
        crossStreets,
        guardNotes
      });
      setIsSubmitting(false);
      setBookingModalService(null);
      if (paymentMethod === 'cod') {
        setTrackingBookingId(created.id);
      } else {
        setCheckoutBookingId(created.id);
      }
    } catch {
      setIsSubmitting(false);
      alert('Hubo un error al agendar la chamba. Intenta nuevamente.');
    }
  };

  const paymentOptions = [
    { id: 'card', label: '💳 Tarjeta Débito / Crédito' },
    { id: 'spei', label: '🏦 SPEI (Transferencia)' },
    { id: 'oxxo', label: '🏪 OXXO Pay (Efectivo)' },
    { id: 'wallet', label: '👛 Monedero ChambaYa' },
    { id: 'cod', label: '💵 Efectivo al Chambeador' }
  ];

  return (
    <div className="modal-overlay" onClick={() => setBookingModalService(null)}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative', height: '160px' }}>
          <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9), transparent)' }} />
          <button
            onClick={() => setBookingModalService(null)}
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#FFF', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
          <div style={{ position: 'absolute', bottom: '12px', left: '16px', color: '#FFF' }}>
            <span style={{ fontSize: '0.7rem', background: '#10B981', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
              {provider?.name || 'Proveedor Verificado'}
            </span>
            <h3 style={{ fontSize: '1.15rem', color: '#FFF', margin: '0.25rem 0 0 0' }}>{service.title}</h3>
          </div>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Variants */}
          {service.variants && service.variants.length > 0 && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Paquete o Modalidad</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
                {service.variants.map((v: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: selectedVariant?.name === v.name ? '2px solid #10B981' : '1px solid #E2E8F0',
                      background: selectedVariant?.name === v.name ? '#ECFDF5' : '#FFF',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div>{v.name}</div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{v.priceAdd > 0 ? `+$${v.priceAdd.toFixed(2)} MXN` : 'Incluido'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                <Calendar size={13} color="#10B981" />
                <span>Fecha</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                <Clock size={13} color="#10B981" />
                <span>Horario Estimado</span>
              </label>
              <select
                value={selectedTimeSlot}
                onChange={e => setSelectedTimeSlot(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', background: '#FFF' }}
              >
                <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
                <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM</option>
                <option value="02:00 PM - 03:30 PM">02:00 PM - 03:30 PM</option>
                <option value="04:30 PM - 06:00 PM">04:30 PM - 06:00 PM</option>
              </select>
            </div>
          </div>

          {/* Address & Gatehouse / Condominium Access */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={13} color="#10B981" />
                <span>Dirección y Acceso en Caseta</span>
              </label>
              <span style={{ fontSize: '0.67rem', color: '#059669', fontWeight: 700 }}>🔒 Protegida por LFPDPPP</span>
            </div>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Calle, número exterior e interior / Depto"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', background: '#FFF' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.65fr 1.1fr', gap: '0.4rem' }}>
              <input
                type="text"
                value={colony}
                onChange={e => setColony(e.target.value)}
                placeholder="Colonia"
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem', background: '#FFF' }}
              />
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                placeholder="C.P."
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem', background: '#FFF' }}
              />
              <input
                type="text"
                value={crossStreets}
                onChange={e => setCrossStreets(e.target.value)}
                placeholder="Entre calles"
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem', background: '#FFF' }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 700, color: '#065F46', cursor: 'pointer' }}>
              <input type="checkbox" checked={requiresGuardPass} onChange={e => setRequiresGuardPass(e.target.checked)} />
              <span>🏢 Generar Pase QR para Caseta / Vigilancia de Condominio</span>
            </label>
            {requiresGuardPass && (
              <input
                type="text"
                value={guardNotes}
                onChange={e => setGuardNotes(e.target.value)}
                placeholder="Instrucciones para el guardia / recepción"
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #A7F3D0', fontSize: '0.75rem', background: '#ECFDF5' }}
              />
            )}
          </div>

          {/* Promo */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
              <Tag size={13} color="#10B981" />
              <span>Cupón de Descuento</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Ej. PRIMERACHAMBA"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', textTransform: 'uppercase' }}
              />
              <button type="button" onClick={handleApplyCoupon} className="btn btn-secondary btn-sm">Aplicar</button>
            </div>
          </div>

          {/* Payment Gateways */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Método de Pago</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.4rem' }}>
              {paymentOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  style={{
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    border: paymentMethod === opt.id ? '2px solid #10B981' : '1px solid #E2E8F0',
                    background: paymentMethod === opt.id ? '#ECFDF5' : '#FFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.75rem', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span>Subtotal del Servicio:</span>
              <strong>${subtotal.toFixed(2)} MXN</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', color: '#64748B' }}>
              <span>Cuota de Protección ChambaYa:</span>
              <span>+${platformFee.toFixed(2)} MXN</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', marginBottom: '0.2rem', fontWeight: 700 }}>
                <span>Descuento aplicado:</span>
                <span>-${discountAmount.toFixed(2)} MXN</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.4rem', fontWeight: 900, fontSize: '1rem' }}>
              <span>Total a Pagar:</span>
              <span style={{ color: '#059669' }}>${total.toFixed(2)} MXN</span>
            </div>
          </div>

          {/* Legal & Security Consent */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.72rem', color: '#475569', background: '#F1F5F9', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ marginTop: '0.15rem' }} />
            <span>
              Acepto los{' '}
              <button type="button" onClick={() => setLegalModalSection('terms')} style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, textDecoration: 'underline', padding: 0, cursor: 'pointer', fontSize: '0.72rem' }}>
                Términos y Escrow
              </button>
              , el{' '}
              <button type="button" onClick={() => setLegalModalSection('security_protocol')} style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, textDecoration: 'underline', padding: 0, cursor: 'pointer', fontSize: '0.72rem' }}>
                Protocolo Doble Llave
              </button>{' '}
              y el{' '}
              <button type="button" onClick={() => setLegalModalSection('privacy')} style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, textDecoration: 'underline', padding: 0, cursor: 'pointer', fontSize: '0.72rem' }}>
                Aviso de Privacidad LFPDPPP
              </button>.
            </span>
          </label>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isSubmitting || !termsAccepted}
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem', background: '#10B981', opacity: termsAccepted ? 1 : 0.5 }}
          >
            {isSubmitting ? 'Confirmando con NestJS...' : `Confirmar y Pedir Chamba ($${total.toFixed(2)} MXN)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export const BookingModal = () => {
  const { bookingModalService } = usePlatform();

  if (!bookingModalService) return null;

  return <BookingModalContent service={bookingModalService} />;
};

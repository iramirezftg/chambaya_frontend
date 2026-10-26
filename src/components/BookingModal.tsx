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
    gateways,
    customerUser,
    createNewBooking,
    setTrackingBookingId,
    setCheckoutBookingId
  } = usePlatform();

  const provider = providers.find(p => p.id === service.providerId);

  const [selectedVariant, setSelectedVariant] = useState(service.variants ? service.variants[0] : null);
  const [scheduledDate, setScheduledDate] = useState('2026-10-23');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 11:30 AM');
  const [address, setAddress] = useState(customerUser.address);
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
    setIsSubmitting(true);
    try {
      const created = await createNewBooking({
        serviceId: service.id,
        amount: total,
        paymentMethod,
        address,
        scheduledDate,
        scheduledTimeSlot: selectedTimeSlot,
        variant: selectedVariant
      });
      setIsSubmitting(false);
      setBookingModalService(null);
      if (paymentMethod === 'cod') {
        setTrackingBookingId(created.id);
      } else {
        setCheckoutBookingId(created.id);
      }
    } catch (err) {
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

          {/* Address */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
              <MapPin size={13} color="#10B981" />
              <span>Dirección del Servicio</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Calle, número, colonia, código postal"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
            />
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

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem', background: '#10B981' }}
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

"use client";

import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  MapPin,
  Search,
  Star,
  Home,
  Calendar,
  Wallet,
  User,
  Navigation,
  Sparkles
} from 'lucide-react';

export default function MobileAppPage() {
  const { categories, services, bookings, customerUser, addCustomerWallet, setBookingModalService, setTrackingBookingId } = usePlatform();
  const [tab, setTab] = useState<'home' | 'bookings' | 'wallet' | 'profile'>('home');
  const [activeCat, setActiveCat] = useState('cat-ac');

  const userBookings = bookings.filter(b => b.customerPhone === customerUser.phone || b.customerEmail === customerUser.email);
  const activeOrder = userBookings.find(b => b.status !== 'completed' && b.status !== 'cancelled');

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'assigned': return 'Asignada';
      case 'on_the_way': return 'En Camino 🛵';
      case 'in_progress': return 'En Progreso 🛠️';
      case 'completed': return 'Completada ✅';
      default: return status;
    }
  };

  return (
    <div style={{ background: '#0F172A', minHeight: 'calc(100vh - 70px)', padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
      {/* Mobile Frame Container */}
      <div style={{
        width: '390px',
        maxWidth: '100%',
        minHeight: '740px',
        background: '#F8FAFC',
        borderRadius: '36px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.2)',
        border: '6px solid #1E293B',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Mobile Header Bar */}
        <div style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <MapPin size={11} color="#10B981" />
              <span>Ubicación</span>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>Roma Norte, CDMX</div>
          </div>
          <span style={{ fontSize: '0.65rem', background: '#ECFDF5', color: '#059669', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>
            App PWA Móvil
          </span>
        </div>

        {/* Dynamic Content */}
        {tab === 'home' && (
          <div style={{ flex: 1, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '0.55rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #E2E8F0' }}>
              <Search size={15} color="#94A3B8" />
              <input type="text" placeholder="Buscar chamba o servicio..." style={{ border: 'none', outline: 'none', fontSize: '0.8rem', width: '100%' }} />
            </div>

            {activeOrder && (
              <div
                onClick={() => setTrackingBookingId(activeOrder.id)}
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '14px', padding: '0.75rem', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>Chamba Activa • PIN: {activeOrder.otp}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{activeOrder.serviceTitle.slice(0, 24)}...</div>
                </div>
                <span style={{ fontSize: '0.68rem', background: '#FFF', color: '#065F46', padding: '0.2rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>GPS En Vivo</span>
              </div>
            )}

            {/* Promo Card */}
            <div style={{ background: 'linear-gradient(135deg, #065F46, #047857)', borderRadius: '16px', padding: '1rem', color: '#FFF' }}>
              <span style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 700 }}>ChambaYa México</span>
              <h4 style={{ margin: '0.3rem 0 0.2rem 0', fontSize: '0.95rem', fontWeight: 800 }}>20% OFF en tu Primer Chamba</h4>
              <p style={{ fontSize: '0.7rem', color: '#A7F3D0', margin: '0 0 0.5rem 0' }}>Cupón PRIMERACHAMBA listo al agendar.</p>
              <button onClick={() => setBookingModalService(services[0])} style={{ background: '#FFF', color: '#065F46', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                Pedir Ahora
              </button>
            </div>

            {/* Category Circles */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.5rem' }}>Categorías</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                {categories.map(c => (
                  <div key={c.id} onClick={() => setActiveCat(c.id)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', border: activeCat === c.id ? '2px solid #10B981' : '1px solid #E2E8F0' }}>
                      <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: activeCat === c.id ? '#10B981' : '#475569' }}>
                      {c.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Services List */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.5rem' }}>Servicios Recomendados</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {services.filter(s => s.categoryId === activeCat).map(srv => (
                  <div key={srv.id} style={{ background: '#FFF', borderRadius: '12px', padding: '0.65rem', display: 'flex', gap: '0.65rem', border: '1px solid #E2E8F0' }}>
                    <img src={srv.image} alt={srv.title} style={{ width: '75px', height: '75px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', color: '#64748B' }}>
                          <Star size={10} fill="#F59E0B" color="#F59E0B" />
                          <strong style={{ color: '#0F172A' }}>{srv.rating}</strong>
                          <span>• {srv.duration}</span>
                        </div>
                        <h5 style={{ margin: '0.15rem 0', fontSize: '0.82rem', lineHeight: 1.25, fontWeight: 700 }}>{srv.title}</h5>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.92rem', color: '#059669' }}>${(srv.discountPrice || srv.price).toFixed(2)} MXN</strong>
                        <button onClick={() => setBookingModalService(srv)} style={{ background: '#10B981', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                          Pedir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'bookings' && (
          <div style={{ flex: 1, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 800 }}>Mis Chambas ({userBookings.length})</h4>
            {userBookings.map(b => (
              <div key={b.id} style={{ background: '#FFF', borderRadius: '12px', padding: '0.75rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span className={`status-pill ${b.status}`}>{getStatusLabel(b.status)}</span>
                  <strong style={{ fontSize: '0.75rem' }}>${b.amount.toFixed(2)} MXN</strong>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{b.serviceTitle}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', margin: '0.2rem 0 0.4rem 0' }}>{b.scheduledDate} • {b.scheduledTimeSlot}</div>
                <button onClick={() => setTrackingBookingId(b.id)} style={{ width: '100%', background: '#ECFDF5', color: '#059669', border: 'none', padding: '0.4rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                  Ver GPS y PIN ({b.otp})
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'wallet' && (
          <div style={{ flex: 1, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '16px', padding: '1.25rem', color: '#FFF' }}>
              <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>Monedero Digital ChambaYa</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0.2rem 0' }}>${customerUser.walletBalance.toFixed(2)} MXN</div>
              <p style={{ fontSize: '0.72rem', opacity: 0.9, marginBottom: '0.75rem' }}>Recarga inmediata con tarjeta de débito o transferencia SPEI.</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => addCustomerWallet(200)} style={{ background: '#FFF', color: '#065F46', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>+ $200 MXN</button>
                <button onClick={() => addCustomerWallet(500)} style={{ background: 'rgba(255,255,255,0.25)', color: '#FFF', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>+ $500 MXN</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ flex: 1, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto' }}>
            <div style={{ background: '#FFF', borderRadius: '14px', padding: '0.85rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>FG</div>
              <div>
                <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>{customerUser.name}</h5>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{customerUser.phone}</div>
                <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>Cliente Verificado ChambaYa</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom PWA Navigation Bar */}
        <div style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0.25rem' }}>
          <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: tab === 'home' ? '#10B981' : '#64748B', cursor: 'pointer' }}>
            <Home size={17} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Inicio</span>
          </button>
          <button onClick={() => setTab('bookings')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: tab === 'bookings' ? '#10B981' : '#64748B', cursor: 'pointer' }}>
            <Calendar size={17} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Mis Chambas</span>
          </button>
          <button onClick={() => setTab('wallet')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: tab === 'wallet' ? '#10B981' : '#64748B', cursor: 'pointer' }}>
            <Wallet size={17} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Monedero</span>
          </button>
          <button onClick={() => setTab('profile')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: tab === 'profile' ? '#10B981' : '#64748B', cursor: 'pointer' }}>
            <User size={17} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

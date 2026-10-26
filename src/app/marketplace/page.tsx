"use client";

import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Search,
  Star,
  Clock,
  Wallet,
  MapPin,
  Navigation,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function MarketplacePage() {
  const {
    categories,
    services,
    providers,
    bookings,
    customerUser,
    addCustomerWallet,
    setBookingModalService,
    setTrackingBookingId,
    setDisputeBookingId,
    setShowAiDiagnosticModal
  } = usePlatform();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'marketplace' | 'bookings'>('marketplace');

  const userBookings = bookings.filter(b => b.customerPhone === customerUser.phone || b.customerEmail === customerUser.email);
  const activeOrders = userBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');

  const filtered = services.filter(s => {
    const matchCat = activeCategory === 'all' || s.categoryId === activeCategory;
    const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'assigned': return 'Asignada';
      case 'on_the_way': return 'En Camino 🛵';
      case 'in_progress': return 'En Progreso 🛠️';
      case 'completed': return 'Completada ✅';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 70px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
          borderRadius: '24px',
          padding: '2rem',
          color: '#FFFFFF',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.4)', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 800, color: '#34D399' }}>
              Mercado de Servicios ChambaYa
            </span>
            <h1 style={{ fontSize: '1.8rem', color: '#FFF', margin: '0.4rem 0 0.2rem 0', fontWeight: 900 }}>¡Hola, {customerUser.name}!</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#CBD5E1', fontSize: '0.82rem' }}>
              <MapPin size={14} color="#34D399" />
              <span>{customerUser.address}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.75rem 1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={18} color="#FFF" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>Monedero ChambaYa</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>${customerUser.walletBalance.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>MXN</span></div>
              </div>
              <button
                onClick={() => addCustomerWallet(200)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.4rem' }}
                title="Recargar $200 MXN con SPEI o Tarjeta"
              >
                <Plus size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '12px' }}>
              <button
                onClick={() => setActiveTab('marketplace')}
                style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', background: activeTab === 'marketplace' ? '#FFF' : 'transparent', color: activeTab === 'marketplace' ? '#0F172A' : '#94A3B8' }}
              >
                Catálogo de Chambas
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', background: activeTab === 'bookings' ? '#FFF' : 'transparent', color: activeTab === 'bookings' ? '#0F172A' : '#94A3B8' }}
              >
                Mis Pedidos ({userBookings.length})
              </button>
            </div>
          </div>
        </div>

        {/* Live Active Order Alert */}
        {activeOrders.length > 0 && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                <Navigation size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase' }}>Chamba Activa en Tiempo Real</span>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#064E3B', fontWeight: 800 }}>{activeOrders[0].serviceTitle}</h4>
                <div style={{ fontSize: '0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  {activeOrders[0].servicemanName ? (
                    <>
                      <span>Chambeador Asignado: <strong>{activeOrders[0].servicemanName}</strong></span>
                      <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>
                        ★ Verificado INE/SAT
                      </span>
                    </>
                  ) : 'Buscando al técnico más cercano...'}
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setTrackingBookingId(activeOrders[0].id)}
              style={{ background: '#059669' }}
            >
              Rastrear GPS y Ver PIN
            </button>
          </div>
        )}

        {/* KYC Trust Guarantee Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '0.85rem 1.25rem',
          marginBottom: '2rem',
          color: '#FFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F59E0B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
              ★
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>Garantía ChambaYa de Confianza & Seguridad 🇲🇽</div>
              <div style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>
                Todos los chambeadores asignados cuentan con cotejo de Credencial INE, RFC SAT y Carta de No Antecedentes Penales.
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '0.25rem 0.65rem', borderRadius: '999px', fontWeight: 800 }}>
            Filtro KYC Oficial 100%
          </span>
        </div>

        {/* ChambaIA Diagnostic Callout Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1.5px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(139, 92, 246, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 900, background: '#8B5CF6', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                  Inteligencia Artificial ChambaIA
                </span>
                <span style={{ fontSize: '0.72rem', color: '#8B5CF6', fontWeight: 700 }}>
                  Diagnóstico en 5 Segundos
                </span>
              </div>
              <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.05rem', fontWeight: 900, color: '#1E293B' }}>
                ¿No sabes qué pieza se rompió o cuánto debería costar?
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Sube una foto de tu avería (fuga, pastilla, minisplit) y ChambaIA calculará refacciones justas y mano de obra garantizada.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAiDiagnosticModal(true)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              color: '#FFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)'
            }}
          >
            <Sparkles size={16} />
            <span>Diagnosticar con ChambaIA</span>
          </button>
        </div>

        {activeTab === 'marketplace' ? (
          <div>
            {/* Search & Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', maxWidth: '500px' }}>
                <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Buscar plomería, minisplits, fugas, electricista..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.2rem', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                <button
                  onClick={() => setActiveCategory('all')}
                  style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: activeCategory === 'all' ? '1px solid #10B981' : '1px solid #E2E8F0', background: activeCategory === 'all' ? '#10B981' : '#FFF', color: activeCategory === 'all' ? '#FFF' : '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Todas las Categorías ({services.length})
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: activeCategory === c.id ? '1px solid #10B981' : '1px solid #E2E8F0', background: activeCategory === c.id ? '#10B981' : '#FFF', color: activeCategory === c.id ? '#FFF' : '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(srv => {
                const prov = providers.find(p => p.id === srv.providerId);
                return (
                  <div key={srv.id} style={{ background: '#FFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
                    <div style={{ position: 'relative', height: '170px' }}>
                      <img src={srv.image} alt={srv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#10B981', color: '#FFF', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{srv.badge}</span>
                      <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15,23,42,0.85)', color: '#FFF', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Star size={11} fill="#F59E0B" color="#F59E0B" />
                        <span>{srv.rating} ({srv.reviewsCount} reseñas)</span>
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '0.25rem' }}>
                        Proveedor: <strong style={{ color: '#0F172A' }}>{prov?.name || 'Taller Certificado'}</strong>
                      </div>
                      <h4 style={{ fontSize: '1rem', lineHeight: 1.3, marginBottom: '0.4rem', fontWeight: 800 }}>{srv.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>{srv.description}</p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                          ${(srv.discountPrice || srv.price).toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>MXN</span>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setBookingModalService(srv)}
                          style={{ background: '#10B981' }}
                        >
                          Pedir Chamba
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 800 }}>Historial de Chambas Solicitadas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {userBookings.map(b => (
                <div key={b.id} style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span className={`status-pill ${b.status}`}>{getStatusLabel(b.status)}</span>
                      <strong style={{ fontSize: '0.8rem' }}>#{b.id}</strong>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{b.serviceTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      📅 {b.scheduledDate} • {b.scheduledTimeSlot} • Chambeador: {b.servicemanName || 'Por asignar'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>${b.amount.toFixed(2)} MXN</div>
                    
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setTrackingBookingId(b.id)}
                    >
                      Rastrear / PIN ({b.otp})
                    </button>

                    <button
                      type="button"
                      onClick={() => setDisputeBookingId(b.id)}
                      style={{
                        background: '#F0FDF4',
                        color: '#166534',
                        border: '1px solid #86EFAC',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <ShieldCheck size={14} color="#16A34A" />
                      <span>Garantía & Bóveda Escrow</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

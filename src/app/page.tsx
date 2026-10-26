"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatform } from '../context/PlatformContext';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  ChevronRight,
  Zap,
  CreditCard
} from 'lucide-react';

export default function LandingPage() {
  const { categories, services, providers, setBookingModalService } = usePlatform();
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('CDMX - Roma / Condesa');

  const filtered = services.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#FFFFFF' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'radial-gradient(circle at 80% 20%, #064E3B 0%, #0F172A 75%)',
        color: '#FFFFFF',
        padding: '5rem 1.5rem 6.5rem 1.5rem',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '0.78rem',
              fontWeight: 800,
              marginBottom: '1.25rem'
            }}>
              <Sparkles size={14} />
              <span>🇲🇽 La plataforma líder de servicios para el hogar en México</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', lineHeight: 1.15, fontWeight: 900, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Tu hogar en las mejores manos. <br />
              <span style={{ background: 'linear-gradient(135deg, #34D399, #6EE7B7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Resuelve cualquier chamba ya.
              </span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#CBD5E1', maxWidth: '540px', lineHeight: 1.6, marginBottom: '2rem' }}>
              Conecta con chambeadores y técnicos certificados en tu colonia. Plomería, climatización, electricidad y limpieza profunda con monitoreo GPS en vivo y pagos protegidos vía SPEI, OXXO Pay o tarjeta.
            </p>

            {/* Instant Search Bar */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '0.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              alignItems: 'center',
              boxShadow: '0 20px 30px rgba(0,0,0,0.3)',
              maxWidth: '580px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', flex: 1, minWidth: '180px' }}>
                <Search size={18} color="#64748B" />
                <input
                  type="text"
                  placeholder="¿Qué chamba necesitas? Ej. Minisplit, fuga..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.88rem', color: '#0F172A' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderLeft: '1px solid #E2E8F0', padding: '0.5rem 0.75rem' }}>
                <MapPin size={15} color="#10B981" />
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}
                >
                  <option value="CDMX - Roma / Condesa">CDMX - Roma / Condesa</option>
                  <option value="CDMX - Coyoacán / Del Valle">CDMX - Coyoacán / Del Valle</option>
                  <option value="Guadalajara - Providencia / Zapopan">GDL - Providencia / Zapopan</option>
                  <option value="Monterrey - San Pedro Garza">MTY - San Pedro Garza García</option>
                </select>
              </div>

              <Link href="/marketplace" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: '14px', background: '#10B981', color: '#FFF', fontWeight: 800 }}>
                Pedir Chamba
              </Link>
            </div>

            {/* Guarantees */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '2.5rem', color: '#94A3B8', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="#34D399" />
                <span>Técnicos con Verificación KYC & Antecedentes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#60A5FA" />
                <span>Llegada en &lt; 30 minutos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={16} color="#F59E0B" />
                <span>OXXO Pay, SPEI & Tarjetas</span>
              </div>
            </div>
          </div>

          {/* Hero Photography Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 35px rgba(16, 185, 129, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.15)'
            }}>
              <img
                src="/images/hero.jpg"
                alt="ChambaYa Servicios Profesionales para el Hogar"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>

            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-15px',
              background: 'rgba(255, 255, 255, 0.98)',
              color: '#0F172A',
              padding: '0.85rem 1.25rem',
              borderRadius: '18px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                <Star size={20} fill="#10B981" />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>4.95 / 5.0 Calificación Promedio</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Más de 65,000 servicios completados en México</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10B981' }}>50,000+</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>Chambas Realizadas</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0F172A' }}>1,200+</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>Negocios y Contratistas</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#3B82F6' }}>85.0%</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>Pago Neto al Chambeador</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#8B5CF6' }}>&lt; 30 Mins</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>Despacho Promedio de Técnico</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categorías Populares</span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.25rem', fontWeight: 900 }}>¿En qué te podemos ayudar hoy?</h2>
          </div>
          <Link href="/marketplace" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Ver Catálogo Completo</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href="/marketplace"
              style={{
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{ position: 'relative', height: '170px' }}>
                <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15,23,42,0.85)', color: '#FFF', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '9999px' }}>
                  {cat.badge}
                </span>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', fontWeight: 800 }}>{cat.name}</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, marginBottom: '0.85rem' }}>{cat.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#10B981' }}>
                  <span>{cat.servicesCount} Servicios Disponibles</span>
                  <ChevronRight size={15} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section style={{ background: '#F8FAFC', padding: '5rem 1.5rem', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chambas Más Solicitadas</span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.25rem', fontWeight: 900 }}>Servicios Destacados con Garantía</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.75rem' }}>
            {filtered.slice(0, 3).map((srv) => {
              const prov = providers.find(p => p.id === srv.providerId);
              return (
                <div
                  key={srv.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '22px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', height: '180px' }}>
                    <img src={srv.image} alt={srv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#10B981', color: '#FFF', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                      {srv.badge}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Proveedor: <strong style={{ color: '#0F172A' }}>{prov?.name || 'Taller Certificado'}</strong>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', lineHeight: 1.35, marginBottom: '0.4rem', fontWeight: 800 }}>{srv.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>{srv.description}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                          ${(srv.discountPrice || srv.price).toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>MXN</span>
                        </div>
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
      </section>

      {/* Multi-Vendor Growth Banner */}
      <section style={{ padding: '5rem 1.5rem', background: '#0F172A', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 800, textTransform: 'uppercase' }}>Para Negocios y Técnicos</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#FFFFFF', marginTop: '0.5rem', lineHeight: 1.2, fontWeight: 900 }}>
              Súmate a los más de 1,200 proveedores en ChambaYa México
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem', marginTop: '1rem', lineHeight: 1.6 }}>
              Administra cuadrillas de chambeadores, despacha solicitudes con geolocalización satelital y recibe retiros directos a tu CLABE interbancaria vía SPEI sin comisiones ocultas.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <Link href="/provider" className="btn btn-primary" style={{ background: '#10B981' }}>
                Entrar al Panel de Proveedor
              </Link>
              <Link href="/admin" className="btn btn-secondary" style={{ background: 'transparent', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}>
                Torre de Control Super Admin
              </Link>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 800 }}>Ventajas ChambaYa México</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#34D399" />
                <span>Cobro seguro: retención en garantía hasta completar el trabajo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#34D399" />
                <span>PIN de seguridad de 4 dígitos entre cliente y chambeador</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#34D399" />
                <span>Dispersión automática vía SPEI directo a cuentas bancarias mexicanas</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#34D399" />
                <span>Aplicación Web Progresiva (PWA) lista para Android y iPhone</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#090D16', color: '#94A3B8', padding: '3.5rem 1.5rem 2rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem' }}>
          <div>© 2026 ChambaYa México. Todos los derechos reservados. Desarrollado con Next.js 15 y NestJS API.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/marketplace" style={{ color: 'inherit', textDecoration: 'none' }}>Catálogo de Chambas</Link>
            <Link href="/provider" style={{ color: 'inherit', textDecoration: 'none' }}>Portal Proveedores</Link>
            <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>Torre de Control</Link>
            <a href="http://localhost:4000/api/docs" target="_blank" rel="noreferrer" style={{ color: '#34D399', textDecoration: 'none' }}>API Swagger NestJS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

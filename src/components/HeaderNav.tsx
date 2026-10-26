"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlatform } from '../context/PlatformContext';
import { AuthModal } from './AuthModal';
import {
  Globe,
  LayoutGrid,
  Smartphone,
  Briefcase,
  Wrench,
  ShieldCheck,
  Bell,
  MessageSquare,
  Sparkles,
  ExternalLink,
  User,
  KeyRound,
  LogOut,
  Gift
} from 'lucide-react';

export const HeaderNav = () => {
  const pathname = usePathname();
  const {
    activeProviderId,
    setActiveProviderId,
    activeServicemanId,
    setActiveServicemanId,
    providers,
    servicemen,
    notifications,
    smsLogs,
    currentUser,
    logout,
    setShowEmergencyModal,
    setShowAiDiagnosticModal,
    setShowReferralModal
  } = usePlatform();

  const [showNotif, setShowNotif] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const links = [
    { href: '/', label: 'Inicio', icon: Globe },
    { href: '/marketplace', label: 'Pedir Chamba', icon: LayoutGrid },
    { href: '/mobile', label: 'App Móvil', icon: Smartphone },
    { href: '/provider', label: 'Negocio / Proveedor', icon: Briefcase },
    { href: '/serviceman', label: 'App Chambeador', icon: Wrench },
    { href: '/admin', label: 'Torre de Control', icon: ShieldCheck }
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN': return { label: 'ADMIN', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'PROVIDER': return { label: 'NEGOCIO', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'SERVICEMAN': return { label: 'CHAMBEADOR', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      default: return { label: 'CLIENTE', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="master-header">
      <div className="master-header-inner">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)' }}>
              <Sparkles size={18} color="#FFF" />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#FFF', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Chamba<span style={{ color: '#34D399' }}>Ya</span>
              </div>
              <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Servicios On-Demand • México 🇲🇽</div>
            </div>
            <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', padding: '0.15rem 0.45rem', borderRadius: '9999px', color: '#34D399', fontWeight: 700 }}>
              Next.js 16
            </span>
          </Link>
          <a
            href="http://localhost:4000/api/docs"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.18rem 0.5rem',
              borderRadius: '9999px',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#60A5FA',
              textDecoration: 'none'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }}></span>
            <span>API NestJS</span>
            <ExternalLink size={10} />
          </a>
        </div>

        {/* Navigation Tabs (Next.js App Router Links) */}
        <nav className="role-switcher">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`role-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {pathname === '/provider' && (
            <select
              value={activeProviderId}
              onChange={(e) => setActiveProviderId(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', outline: 'none' }}
            >
              {providers.map(p => (
                <option key={p.id} value={p.id} style={{ background: '#0F172A', color: '#FFF' }}>{p.name}</option>
              ))}
            </select>
          )}

          {pathname === '/serviceman' && (
            <select
              value={activeServicemanId}
              onChange={(e) => setActiveServicemanId(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', outline: 'none' }}
            >
              {servicemen.map(s => (
                <option key={s.id} value={s.id} style={{ background: '#0F172A', color: '#FFF' }}>{s.name} ({s.status === 'available' ? 'Disponible' : 'En Chamba'})</option>
              ))}
            </select>
          )}

          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={() => setShowEmergencyModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              border: '1px solid #F87171',
              color: '#FFF',
              padding: '0.32rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.45)',
              letterSpacing: '0.02em'
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFF' }} />
            <span>🚨 SOS 24/7</span>
          </button>

          {/* ChambaIA AI Diagnostic Button */}
          <button
            type="button"
            onClick={() => setShowAiDiagnosticModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              border: '1px solid #A78BFA',
              color: '#FFF',
              padding: '0.32rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(139, 92, 246, 0.45)',
              letterSpacing: '0.02em'
            }}
          >
            <Sparkles size={13} color="#FFF" />
            <span>✨ ChambaIA</span>
          </button>

          {/* Invita y Gana $100 Referral Button */}
          <button
            type="button"
            onClick={() => setShowReferralModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: '1px solid #34D399',
              color: '#FFF',
              padding: '0.32rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)',
              letterSpacing: '0.02em'
            }}
            title="Invita a un compa y gana $100 MXN en tu monedero"
          >
            <Gift size={13} color="#FFF" />
            <span>🎁 Gana $100</span>
          </button>

          {/* User Auth Session Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFF',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Cambiar sesión o acceder con SMS OTP / JWT"
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: roleInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '0.62rem' }}>
              <User size={12} />
            </div>
            <span>{currentUser ? currentUser.name.split(' ')[0] : 'Ingresar'}</span>
            <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: roleInfo.bg, color: roleInfo.color, fontWeight: 800 }}>
              {roleInfo.label}
            </span>
          </button>

          <button
            onClick={() => setShowSms(!showSms)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={13} />
            <span>SMS ({smsLogs.length})</span>
          </button>

          <button
            onClick={() => setShowNotif(!showNotif)}
            style={{ position: 'relative', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444', color: '#FFF', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div style={{ position: 'absolute', top: '50px', right: '1.25rem', width: '320px', background: '#FFFFFF', color: '#0F172A', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', padding: '1rem', zIndex: 3000 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <span>Eventos en Vivo</span>
                <span style={{ color: '#10B981', fontSize: '0.72rem' }}>NestJS Sync</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ background: '#F8FAFC', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', borderLeft: '3px solid #10B981' }}>
                    <div style={{ fontWeight: 700 }}>{n.title}</div>
                    <div style={{ color: '#64748B' }}>{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SMS Modal */}
      {showSms && (
        <div className="modal-overlay" onClick={() => setShowSms(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={18} color="#10B981" />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Feed Gateway SMS (Twilio México)</h3>
              </div>
              <button onClick={() => setShowSms(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '300px', overflowY: 'auto' }}>
              {smsLogs.map(sms => (
                <div key={sms.id} style={{ background: '#F8FAFC', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
                    <span>Destino: {sms.to}</span>
                    <span style={{ color: '#94A3B8' }}>{sms.time}</span>
                  </div>
                  <div style={{ background: '#FFF', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px dashed #CBD5E1', color: '#334155' }}>{sms.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal (JWT & SMS OTP) */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};

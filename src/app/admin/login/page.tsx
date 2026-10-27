"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlatform } from '../../../context/PlatformContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Server,
  Terminal,
  ArrowLeft
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithRole, currentUser } = usePlatform();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect si ya está logueado como ADMIN
  React.useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await loginWithRole(email.trim(), password, 'ADMIN');
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación. Verifica tus credenciales de Administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@chambaya.mx');
    setPassword('admin123');
    setErrorMsg(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1E1B4B 0%, #0B0F19 70%, #030712 100%)',
      color: '#FFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      fontFamily: 'inherit'
    }}>
      {/* Background Cyber Grid Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
        opacity: 0.5
      }} />

      {/* Top back link */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#94A3B8',
            fontSize: '0.85rem',
            textDecoration: 'none',
            padding: '0.4rem 0.8rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={16} /> Volver a ChambaYa
        </Link>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(127, 29, 29, 0.4))',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.3)',
            marginBottom: '1rem'
          }}>
            <ShieldAlert size={36} color="#EF4444" />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#F87171',
            padding: '0.2rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '0.75rem',
            textTransform: 'uppercase'
          }}>
            <Terminal size={12} /> Torre de Control • Nivel 4
          </div>

          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
            color: '#F8FAFC'
          }}>
            Super Admin Login
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', maxWidth: '340px', margin: '0 auto' }}>
            Acceso exclusivo para auditores y directores generales de la plataforma ChambaYa.
          </p>
        </div>

        {/* Login Box */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '0.85rem',
              borderRadius: '12px',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}>
              <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#CBD5E1',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Correo Institucional
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="#64748B"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@chambaya.mx"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#CBD5E1',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Clave de Seguridad
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={18}
                  color="#64748B"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.2s',
                marginTop: '0.5rem'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Autenticando Sesión...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Ingresar a Torre de Control</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick demo filler */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.65rem' }}>
              ¿Modo de demostración / evaluación técnica?
            </p>
            <button
              type="button"
              onClick={fillDemoAdmin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px dashed rgba(255, 255, 255, 0.25)',
                color: '#E2E8F0',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={14} color="#EF4444" />
              <span>Cargar Credenciales de Super Admin</span>
            </button>
          </div>
        </div>

        {/* Security watermark footer */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem'
        }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>Firma Criptográfica HMAC-SHA256 • Sesión Auditada</span>
        </div>
      </div>
    </div>
  );
}

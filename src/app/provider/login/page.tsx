"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlatform } from '../../../context/PlatformContext';
import {
  Briefcase,
  Building2,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export default function ProviderLoginPage() {
  const router = useRouter();
  const { loginWithRole, currentUser } = usePlatform();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect si ya está logueado como PROVIDER o ADMIN
  React.useEffect(() => {
    if (currentUser?.role === 'PROVIDER' || currentUser?.role === 'ADMIN') {
      router.replace('/provider');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await loginWithRole(email.trim(), password, 'PROVIDER');
      router.push('/provider');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación. Verifica tus credenciales de Proveedor.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoProvider = () => {
    setEmail('contacto@tecnicosdelvalle.mx');
    setPassword('chambaya123');
    setErrorMsg(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0F172A 0%, #020617 75%, #000000 100%)',
      color: '#FFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      fontFamily: 'inherit'
    }}>
      {/* Background Accent Lines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
        opacity: 0.6
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
        maxWidth: '450px',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(30, 58, 138, 0.5))',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(59, 130, 246, 0.3)',
            marginBottom: '1rem'
          }}>
            <Briefcase size={36} color="#60A5FA" />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            color: '#93C5FD',
            padding: '0.2rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '0.75rem',
            textTransform: 'uppercase'
          }}>
            <Building2 size={12} /> Portal B2B de Negocios y Talleres
          </div>

          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
            color: '#F8FAFC'
          }}>
            Acceso Proveedores
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', maxWidth: '360px', margin: '0 auto' }}>
            Gestiona tus cuadrillas de chambeadores, servicios facturados y liquidaciones bancarias.
          </p>
        </div>

        {/* Login Box */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
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
                Correo del Negocio o Taller
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
                  placeholder="contacto@empresa.mx"
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
                Contraseña de Empresa
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
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s',
                marginTop: '0.5rem'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Autenticando Proveedor...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Ingresar al Panel de Proveedores</span>
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
              ¿Quieres probar como Taller Registrado?
            </p>
            <button
              type="button"
              onClick={fillDemoProvider}
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
              <Sparkles size={14} color="#60A5FA" />
              <span>Cargar Demo: Técnicos del Valle</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div style={{
          marginTop: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F1F5F9' }}>Cuadrillas</div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Asignación GPS</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F1F5F9' }}>Retenciones SAT</div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>IVA 8% e ISR 1%</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F1F5F9' }}>SPEI Rápido</div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Liquidación CLABE</div>
          </div>
        </div>
      </div>
    </div>
  );
}

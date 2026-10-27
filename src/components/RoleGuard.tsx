"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlatform } from '../context/PlatformContext';
import { ShieldAlert, Lock, ArrowRight, LogOut, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'PROVIDER' | 'SERVICEMAN' | 'CUSTOMER')[];
  redirectLoginUrl: string;
  portalName: string;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  redirectLoginUrl,
  portalName
}: RoleGuardProps) => {
  const { currentUser, isLoadingAuth, logout } = usePlatform();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth) {
      setHasChecked(true);
      if (!currentUser) {
        // Redirigir al login del portal correspondiente
        router.replace(redirectLoginUrl);
      }
    }
  }, [currentUser, isLoadingAuth, redirectLoginUrl, router]);

  // 1. Pantalla de carga mientras se verifica token local
  if (isLoadingAuth || !hasChecked) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#0B0F19',
        color: '#FFF'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <Loader2 className="animate-spin" size={28} color="#10B981" />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Verificando credenciales de acceso...
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          Validando permisos para {portalName}
        </p>
      </div>
    );
  }

  // 2. Si no hay usuario, muestra mensaje de redirección al login
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#0B0F19',
        color: '#FFF',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <Lock size={32} color="#3B82F6" />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Inicio de Sesión Requerido
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', maxWidth: '420px', marginBottom: '1.75rem' }}>
          Debes identificarte con tu cuenta autorizada para acceder a <strong>{portalName}</strong>.
        </p>
        <Link
          href={redirectLoginUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            borderRadius: '10px',
            color: '#FFF',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}
        >
          Ir al Login de {portalName} <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // 3. Si el usuario está autenticado pero con rol no autorizado
  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <div style={{
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#0B0F19',
        color: '#FFF',
        textAlign: 'center'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)'
        }}>
          <ShieldAlert size={36} color="#EF4444" />
        </div>

        <span style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#F87171',
          padding: '0.2rem 0.65rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          marginBottom: '0.75rem'
        }}>
          ACCESO DENEGADO (403)
        </span>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
          Rol Insuficiente para {portalName}
        </h2>

        <p style={{ fontSize: '0.92rem', color: '#94A3B8', maxWidth: '480px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Tu cuenta actual está registrada como <span style={{ color: '#FCD34D', fontWeight: 700 }}>{currentUser.role}</span> ({currentUser.name}).
          Este portal requiere permisos de: <span style={{ color: '#34D399', fontWeight: 700 }}>{allowedRoles.join(' o ')}</span>.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center' }}>
          <button
            onClick={() => {
              logout();
              router.push(redirectLoginUrl);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              background: '#EF4444',
              border: 'none',
              borderRadius: '10px',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
            }}
          >
            <LogOut size={16} /> Cambiar de Cuenta y Entrar
          </button>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: '#CBD5E1',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // 4. Usuario autorizado: renderizar portal completo
  return <>{children}</>;
};

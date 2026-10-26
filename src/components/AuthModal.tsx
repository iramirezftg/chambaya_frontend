"use client";

import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import {
  X,
  Smartphone,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { loginWithEmail, sendOtp, verifyOtp, registerUser, quickSwitchRole, currentUser } = usePlatform();

  const [authMode, setAuthMode] = useState<'otp' | 'login' | 'register' | 'quick'>('otp');
  const [phone, setPhone] = useState('+52 55 7281 1933');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+52 ');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'CUSTOMER' | 'PROVIDER' | 'SERVICEMAN'>('CUSTOMER');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await sendOtp(phone);
      setOtpSent(true);
      if (res.otpPreview) setOtpPreview(res.otpPreview);
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg(e.message || 'Error al enviar código SMS');
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await verifyOtp(phone, otpCode);
      setIsLoading(false);
      onClose();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg(e.message || 'Código incorrecto o expirado');
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
      setIsLoading(false);
      onClose();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg(e.message || 'Credenciales inválidas');
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await registerUser({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole
      });
      setIsLoading(false);
      onClose();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg(e.message || 'Error al crear cuenta');
    }
  };

  const handleQuickLogin = async (role: 'CUSTOMER' | 'PROVIDER' | 'SERVICEMAN' | 'ADMIN') => {
    setIsLoading(true);
    try {
      await quickSwitchRole(role);
      setIsLoading(false);
      onClose();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg('Error al cambiar de sesión');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Acceso a ChambaYa</h3>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Autenticación segura con JWT & SMS OTP</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.72rem', fontWeight: 700 }}>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setErrorMsg(''); }}
            style={{ padding: '0.4rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: authMode === 'otp' ? '#FFF' : 'transparent', color: authMode === 'otp' ? '#10B981' : '#64748B', boxShadow: authMode === 'otp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Celular OTP
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
            style={{ padding: '0.4rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: authMode === 'login' ? '#FFF' : 'transparent', color: authMode === 'login' ? '#10B981' : '#64748B', boxShadow: authMode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Correo
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
            style={{ padding: '0.4rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: authMode === 'register' ? '#FFF' : 'transparent', color: authMode === 'register' ? '#10B981' : '#64748B', boxShadow: authMode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Registro
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('quick'); setErrorMsg(''); }}
            style={{ padding: '0.4rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: authMode === 'quick' ? '#FFF' : 'transparent', color: authMode === 'quick' ? '#10B981' : '#64748B', boxShadow: authMode === 'quick' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Roles Demo
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Celular SMS OTP */}
        {authMode === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                <Smartphone size={14} color="#10B981" />
                <span>Número de Celular Mexicano (+52)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendOtp}
                disabled={isLoading || !phone}
                style={{ width: '100%', padding: '0.7rem', background: '#10B981' }}
              >
                {isLoading ? 'Enviando SMS...' : 'Enviar Código por SMS'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#ECFDF5', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', color: '#065F46' }}>
                  ✓ Código enviado al <strong>{phone}</strong>.
                  {otpPreview && <span> (Código de prueba: <strong>{otpPreview}</strong>)</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                    Ingresa el código de 6 dígitos:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="Ej. 123456"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1.1rem', letterSpacing: '0.25em', textAlign: 'center', fontWeight: 800 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    style={{ background: '#F1F5F9', border: 'none', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#64748B' }}
                  >
                    Reenviar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otpCode.length < 6}
                    style={{ flex: 1, padding: '0.55rem', background: '#10B981' }}
                  >
                    {isLoading ? 'Validando...' : 'Verificar y Acceder'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Correo y Contraseña */}
        {authMode === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                <Mail size={14} color="#10B981" />
                <span>Correo Electrónico</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@chambaya.mx"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                <Lock size={14} color="#10B981" />
                <span>Contraseña</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleLogin}
              disabled={isLoading || !email || !password}
              style={{ width: '100%', padding: '0.7rem', background: '#10B981' }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Entrar con JWT'}
            </button>
          </div>
        )}

        {/* Tab 3: Registro de Nueva Cuenta */}
        {authMode === 'register' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Nombre Completo</label>
              <input
                type="text"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="Ej. Roberto Gómez"
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Correo</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="roberto@gmail.com"
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Celular</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+52 55..."
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Contraseña</label>
              <input
                type="password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Tipo de Perfil</label>
              <select
                value={regRole}
                onChange={e => setRegRole(e.target.value as any)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', background: '#FFF' }}
              >
                <option value="CUSTOMER">Cliente (Quiero contratar servicios)</option>
                <option value="PROVIDER">Proveedor / Taller (Quiero ofrecer mis servicios)</option>
                <option value="SERVICEMAN">Chambeador (Técnico de campo)</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRegister}
              disabled={isLoading || !regName || !regEmail || !regPassword}
              style={{ width: '100%', padding: '0.65rem', background: '#10B981', marginTop: '0.3rem' }}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta y Recibir $200 MXN de Bienvenida'}
            </button>
          </div>
        )}

        {/* Tab 4: Acceso Rápido por Roles Demo */}
        {authMode === 'quick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.4rem 0' }}>
              Inicia sesión con credenciales precargadas y token JWT real emitido por NestJS:
            </p>

            <button
              type="button"
              onClick={() => handleQuickLogin('CUSTOMER')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', textAlign: 'left' }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>👩‍💼 Fernanda Gómez</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Rol: CLIENTE • Monedero $1,850 MXN</span>
              </div>
              <span style={{ fontSize: '0.68rem', background: '#ECFDF5', color: '#065F46', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>JWT ACTIVO</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('PROVIDER')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', textAlign: 'left' }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>🏢 Alejandro Morales</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Rol: PROVEEDOR • Técnicos del Valle CDMX</span>
              </div>
              <span style={{ fontSize: '0.68rem', background: '#EEF2FF', color: '#4F46E5', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>PROVEEDOR</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('SERVICEMAN')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', textAlign: 'left' }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>🛵 Carlos Mendoza</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Rol: CHAMBEADOR • Especialista Minisplit</span>
              </div>
              <span style={{ fontSize: '0.68rem', background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>TÉCNICO</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', textAlign: 'left' }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>🛡️ Torre de Control Central</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Rol: SUPER ADMIN • Gobernanza y KYC</span>
              </div>
              <span style={{ fontSize: '0.68rem', background: '#FEE2E2', color: '#991B1B', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>SUPER ADMIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

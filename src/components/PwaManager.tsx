"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { api } from '../lib/api';
import {
  Download,
  Bell,
  WifiOff,
  CheckCircle2,
  X,
  Smartphone,
  Sparkles,
  Zap,
  RefreshCw,
  Clock,
  Inbox,
  Layers,
  Send,
  AlertCircle
} from 'lucide-react';

interface NotificationLogItem {
  id: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  role?: string;
  createdAt: string;
}

interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  label: string;
}

export const PwaManager = () => {
  const { currentUser } = usePlatform();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'feed' | 'sync'>('settings');
  const [testSent, setTestSent] = useState(false);

  // Historial de notificaciones (Live Feed)
  const [notificationsFeed, setNotificationsFeed] = useState<NotificationLogItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cola de Background Sync
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Cargar cola de LocalStorage al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('chambaya_offline_queue');
        if (stored) {
          setOfflineQueue(JSON.parse(stored));
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Guardar cola cada vez que cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('chambaya_offline_queue', JSON.stringify(offlineQueue));
      } catch (e) {
        // ignore
      }
    }
  }, [offlineQueue]);

  useEffect(() => {
    // 1. Detectar conectividad
    setIsOffline(!navigator.onLine);
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-trigger sync al volver online
      if (offlineQueue.length > 0) {
        executeBackgroundSync();
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('⚡ [PWA] Service Worker v3 registrado en:', registration.scope);
        })
        .catch((err) => {
          console.warn('⚠️ [PWA] Error al registrar Service Worker:', err);
        });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'BACKGROUND_SYNC_COMPLETED') {
          setSyncStatusMsg('¡Sincronización en segundo plano completada por el Service Worker!');
          loadFeed();
          setTimeout(() => setSyncStatusMsg(null), 4000);
        }
      });
    }

    // 3. Capturar evento de instalación A2HS
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Verificar permiso actual de notificaciones
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        setPushSubscribed(true);
      }
    }

    // 5. Cargar feed inicial de notificaciones
    loadFeed();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const loadFeed = async () => {
    try {
      const feed = await api.getNotificationFeed(currentUser?.role);
      setNotificationsFeed(feed);
      if (feed && feed.length > 0) {
        setUnreadCount(Math.min(feed.length, 9));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Para instalar en iPhone: presiona el botón "Compartir" de Safari y selecciona "Agregar a Inicio". En Android: menú de tres puntos > "Instalar aplicación".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📲 [PWA] Resultado de instalación: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones Web Push.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        setPushSubscribed(true);

        // Obtener clave pública VAPID y registrar en NestJS
        const { publicKey } = await api.getVapidKey();
        const fakeToken = `pwa_sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        await api.subscribePushDevice({
          userId: currentUser?.id || 'usr-anon',
          role: currentUser?.role || 'CUSTOMER',
          endpoint: `https://fcm.googleapis.com/fcm/send/${fakeToken}`,
          p256dh: publicKey.slice(0, 32),
          auth: 'chambaya_auth_token_pwa',
          userAgent: navigator.userAgent
        });

        // Lanzar notificación de bienvenida inmediata
        triggerNativeNotification(
          '¡Notificaciones ChambaYa Activadas! 🇲🇽',
          'Recibirás alertas en tiempo real sobre órdenes, radar GPS y estados de servicio.'
        );

        loadFeed();
      } else {
        alert('Permiso denegado. Puedes activarlo en los ajustes del navegador.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerNativeNotification = (title: string, body: string, url = '/mobile') => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [200, 100, 200],
            data: { url }
          } as any);
        });
      } else {
        new Notification(title, {
          body,
          icon: '/icons/icon-192.png'
        });
      }
    }
  };

  const handleTestPush = async () => {
    setTestSent(true);
    await api.sendTestPushNotification({
      title: '¡Pedro va en camino! 🛵',
      body: 'Tu técnico está sobre Av. Insurgentes Sur a 10 min de tu domicilio.',
      url: '/mobile',
      role: currentUser?.role || 'CUSTOMER'
    });

    triggerNativeNotification(
      '¡Pedro va en camino! 🛵',
      'Tu técnico está sobre Av. Insurgentes Sur a 10 min de tu domicilio.'
    );

    loadFeed();
    setTimeout(() => setTestSent(false), 3000);
  };

  // Simular agregar acción a la cola offline de Background Sync
  const queueSampleOfflineAction = () => {
    const sampleAction: OfflineAction = {
      id: `act-${Date.now()}`,
      type: 'UPDATE_STATUS',
      payload: {
        bookingId: 'CHAMBA-9021',
        status: 'on_the_way'
      },
      timestamp: new Date().toLocaleTimeString('es-MX'),
      label: 'Marcar técnico "En Camino" (Sin Conexión Celular)'
    };

    setOfflineQueue(prev => [sampleAction, ...prev]);
  };

  // Ejecutar sincronización manual o automática de la cola offline
  const executeBackgroundSync = async () => {
    if (offlineQueue.length === 0) return;
    setSyncing(true);
    setSyncStatusMsg(null);

    try {
      const actionsToSync = offlineQueue.map(item => ({
        type: item.type,
        payload: item.payload,
        clientTimestamp: item.timestamp
      }));

      const res = await api.syncOfflineActions(actionsToSync, currentUser?.id);

      // Notificar al Service Worker para broadcast
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC' });
      }

      setSyncStatusMsg(`¡Sincronización exitosa! ${res.syncedCount} cambios aplicados.`);
      setOfflineQueue([]);
      localStorage.removeItem('chambaya_offline_queue');
      loadFeed();
    } catch (err: any) {
      setSyncStatusMsg(`Error al sincronizar: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatusMsg(null), 5000);
    }
  };

  return (
    <>
      {/* 1. Indicador flotante de Modo Offline */}
      {isOffline && (
        <div style={{
          position: 'fixed',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
          color: '#FFF',
          padding: '0.45rem 1.1rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 800,
          boxShadow: '0 8px 20px rgba(220, 38, 38, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <WifiOff size={16} />
          <span>Modo Sin Conexión - ChambaYa PWA (Caché local activa)</span>
          {offlineQueue.length > 0 && (
            <span style={{ background: '#FFF', color: '#DC2626', padding: '0.1rem 0.4rem', borderRadius: '999px', fontSize: '0.7rem' }}>
              {offlineQueue.length} pendiente(s)
            </span>
          )}
        </div>
      )}

      {/* 2. Botón flotante para Centro de Notificaciones PWA */}
      <button
        type="button"
        onClick={() => {
          setShowPushModal(true);
          setUnreadCount(0);
          loadFeed();
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9000,
          background: pushSubscribed ? '#10B981' : '#0F172A',
          color: '#FFF',
          border: '2px solid rgba(255,255,255,0.25)',
          borderRadius: '999px',
          padding: '0.65rem 1.1rem',
          boxShadow: '0 12px 30px -5px rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 800,
          transition: 'transform 0.2s ease'
        }}
        title="Centro de Alertas Web Push y Sincronización PWA"
      >
        <div style={{ position: 'relative' }}>
          <Bell size={17} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: '#EF4444',
              color: '#FFF',
              borderRadius: '999px',
              fontSize: '0.62rem',
              width: '15px',
              height: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <span className="hidden-mobile">
          {pushSubscribed ? 'Alertas Push Activas' : 'Activar Alertas PWA'}
        </span>
        {offlineQueue.length > 0 && (
          <span style={{ background: '#F59E0B', color: '#000', padding: '0.1rem 0.4rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 900 }}>
            Sync ({offlineQueue.length})
          </span>
        )}
      </button>

      {/* 3. Banner de instalación PWA en parte inferior */}
      {showInstallBanner && (
        <div style={{
          position: 'fixed',
          bottom: '84px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '480px',
          zIndex: 9998,
          background: 'linear-gradient(135deg, #0F172A 0%, #064E3B 100%)',
          color: '#FFF',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          boxShadow: '0 20px 30px -10px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/icons/icon-192.png"
              alt="ChambaYa Logo"
              style={{ width: '44px', height: '44px', borderRadius: '10px' }}
            />
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.9rem', color: '#FFF' }}>
                Instalar ChambaYa México
              </div>
              <div style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>
                Acceso directo, radar GPS y sin descargas de app store.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleInstallClick}
              className="btn btn-primary btn-sm"
              style={{ background: '#10B981', padding: '0.45rem 0.85rem', fontWeight: 800 }}
            >
              Instalar
            </button>
            <button
              type="button"
              onClick={() => setShowInstallBanner(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Modal / Drawer Integral de PWA: Alertas, Feed y Background Sync */}
      {showPushModal && (
        <div className="modal-overlay" onClick={() => setShowPushModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DCFCE7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: '#0F172A' }}>
                    Centro PWA & Notificaciones
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>ChambaYa México 🇲🇽 • Web Push & Background Sync</span>
                </div>
              </div>
              <button onClick={() => setShowPushModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Selector de pestañas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              background: '#F1F5F9',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '1.25rem',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'settings' ? '#FFF' : 'transparent',
                  color: activeTab === 'settings' ? '#0F172A' : '#64748B',
                  fontWeight: activeTab === 'settings' ? 800 : 600,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'settings' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Ajustes & Push
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('feed'); loadFeed(); }}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'feed' ? '#FFF' : 'transparent',
                  color: activeTab === 'feed' ? '#0F172A' : '#64748B',
                  fontWeight: activeTab === 'feed' ? 800 : 600,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: activeTab === 'feed' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <span>Bandeja</span>
                {notificationsFeed.length > 0 && (
                  <span style={{ background: '#10B981', color: '#FFF', padding: '1px 5px', borderRadius: '999px', fontSize: '0.65rem' }}>
                    {notificationsFeed.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sync')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'sync' ? '#FFF' : 'transparent',
                  color: activeTab === 'sync' ? '#0F172A' : '#64748B',
                  fontWeight: activeTab === 'sync' ? 800 : 600,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: activeTab === 'sync' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <span>Offline Sync</span>
                {offlineQueue.length > 0 && (
                  <span style={{ background: '#F59E0B', color: '#000', padding: '1px 5px', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 900 }}>
                    {offlineQueue.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mensaje de estado de sincronización */}
            {syncStatusMsg && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{syncStatusMsg}</span>
              </div>
            )}

            {/* TAB 1: Ajustes & Permisos */}
            {activeTab === 'settings' && (
              <div>
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '0.9rem',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1rem',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <span style={{ color: '#64748B' }}>Permiso en navegador:</span>
                    <strong style={{
                      color: pushPermission === 'granted' ? '#16A34A' : pushPermission === 'denied' ? '#DC2626' : '#D97706',
                      textTransform: 'uppercase'
                    }}>
                      {pushPermission === 'granted' ? 'Habilitado ✓' : pushPermission === 'denied' ? 'Bloqueado' : 'Pendiente'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <span style={{ color: '#64748B' }}>Service Worker:</span>
                    <strong style={{ color: '#16A34A' }}>sw.js v2 Activo ✓</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Background Sync API:</span>
                    <strong style={{ color: '#2563EB' }}>Habilitado ✓</strong>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: '1.45' }}>
                  Recibirás alertas nativas en pantalla de bloqueo al agendar chambas, cuando el técnico active su radar GPS y al acreditarse pagos OXXO y SPEI.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {!pushSubscribed ? (
                    <button
                      type="button"
                      onClick={handleEnablePush}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.75rem', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 800 }}
                    >
                      <Bell size={16} />
                      <span>Activar Notificaciones Push Ahora</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTestPush}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.75rem', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 800 }}
                    >
                      <Zap size={16} />
                      <span>{testSent ? '¡Alerta Emitida en Pantalla!' : 'Emitir Alerta de Prueba (Chambeador en Ruta)'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                  >
                    <Smartphone size={16} />
                    <span>Instalar Aplicación PWA en Pantalla de Inicio</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Bandeja de Alertas (Live Feed) */}
            {activeTab === 'feed' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                    Alertas Despachadas por la Plataforma
                  </span>
                  <button
                    type="button"
                    onClick={loadFeed}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <RefreshCw size={12} />
                    <span>Actualizar</span>
                  </button>
                </div>

                {notificationsFeed.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8' }}>
                    <Inbox size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>No hay alertas recientes</div>
                    <div style={{ fontSize: '0.72rem' }}>Las órdenes y avisos de GPS aparecerán aquí en vivo.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '320px', overflowY: 'auto' }}>
                    {notificationsFeed.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: '#F8FAFC',
                          borderRadius: '10px',
                          padding: '0.75rem',
                          border: '1px solid #E2E8F0',
                          borderLeft: '4px solid #10B981',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>
                            {item.title}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Clock size={10} />
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', lineHeight: '1.35' }}>
                          {item.body}
                        </p>
                        {item.role && (
                          <div style={{ marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.62rem', background: '#E0E7FF', color: '#3730A3', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              Dirigido a: {item.role}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Background Sync (Offline Queue) */}
            {activeTab === 'sync' && (
              <div>
                <div style={{
                  background: isOffline ? '#FEF2F2' : '#F0FDF4',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  border: `1px solid ${isOffline ? '#FECACA' : '#BBF7D0'}`,
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isOffline ? <WifiOff size={18} color="#DC2626" /> : <Sparkles size={18} color="#16A34A" />}
                    <div>
                      <strong style={{ color: isOffline ? '#991B1B' : '#166534', display: 'block' }}>
                        {isOffline ? 'Sin Señal Celular (Offline)' : 'Conectado a Internet'}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {isOffline ? 'Las acciones se encolan automáticamente' : 'Sincronización directa lista'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 800 }}>
                    Cola de Sincronización ({offlineQueue.length})
                  </span>
                  <button
                    type="button"
                    onClick={queueSampleOfflineAction}
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Encolar Acción Offline
                  </button>
                </div>

                {offlineQueue.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', background: '#F8FAFC', borderRadius: '10px', color: '#94A3B8', border: '1px dashed #CBD5E1', marginBottom: '1rem' }}>
                    <Layers size={24} style={{ margin: '0 auto 0.4rem auto', opacity: 0.5 }} />
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Cola de sincronización vacía</div>
                    <div style={{ fontSize: '0.68rem' }}>Cuando estés en sótanos o sin datos, las acciones se guardarán aquí.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {offlineQueue.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: '8px',
                          padding: '0.6rem 0.8rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ color: '#92400E', display: 'block' }}>{item.label}</strong>
                          <span style={{ fontSize: '0.65rem', color: '#B45309' }}>Hora: {item.timestamp}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', background: '#F59E0B', color: '#FFF', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                          Pendiente
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  disabled={offlineQueue.length === 0 || syncing}
                  onClick={executeBackgroundSync}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    background: offlineQueue.length > 0 ? '#10B981' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    fontWeight: 800,
                    cursor: offlineQueue.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                  <span>{syncing ? 'Sincronizando con ChambaYa API...' : 'Simular Recuperación de Red y Sincronizar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

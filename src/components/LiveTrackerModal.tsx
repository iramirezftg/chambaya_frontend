"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { io, Socket } from 'socket.io-client';
import { api, SOCKET_URL } from '../lib/api';
import {
  X,
  MapPin,
  Phone,
  Star,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Radio,
  Send,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';

export const LiveTrackerModal = () => {
  const {
    trackingBookingId,
    setTrackingBookingId,
    setCheckoutBookingId,
    setInvoicingBookingId,
    setDisputeBookingId,
    setFieldOpsBookingId,
    bookings,
    submitReview,
    currentUser
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'radar' | 'chat'>('radar');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewed, setReviewed] = useState(false);

  // Live Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Live GPS Telemetry state
  const [techPos, setTechPos] = useState({ x: 120, y: 80, etaMinutes: 14, speedKmh: 35 });
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);

  // Socket instance
  const socketRef = useRef<Socket | null>(null);

  const booking = bookings.find(b => b.id === trackingBookingId);

  useEffect(() => {
    if (!booking) return;

    // Cargar historial de chat inicial desde la API REST
    api.getChatMessages(booking.id).then(msgs => {
      if (msgs && msgs.length > 0) {
        setMessages(msgs);
      }
    }).catch(() => {});

    // Conectar WebSocket a NestJS Socket.io
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_booking', {
        bookingId: booking.id,
        userRole: currentUser?.role || 'CUSTOMER',
        userName: currentUser?.name || 'Cliente ChambaYa'
      });
    });

    socket.on('new_chat_message', (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('gps_telemetry_updated', (data: any) => {
      if (data.etaMinutes !== undefined) {
        setTechPos(prev => ({
          ...prev,
          x: Math.min(360, Math.max(120, (data.progress || 0.5) * 360)),
          etaMinutes: data.etaMinutes,
          speedKmh: data.speedKmh || 32
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [booking?.id, currentUser?.name, currentUser?.role]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!trackingBookingId || !booking) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || newMessageText).trim();
    if (!text) return;

    const senderRole = currentUser?.role || 'CUSTOMER';
    const senderName = currentUser?.name || 'Fernanda Gómez';
    const senderId = currentUser?.id || 'usr-customer-1';

    // Emitir mensaje por WebSocket para entrega instantánea
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_chat_message', {
        bookingId: booking.id,
        senderId,
        senderName,
        senderRole,
        text
      });
    } else {
      // Fallback REST
      const saved = await api.sendChatMessage(booking.id, {
        senderId,
        senderName,
        senderRole,
        text
      });
      setMessages(prev => [...prev, saved]);
    }

    setNewMessageText('');
  };

  const handleSimulateGps = () => {
    if (isSimulatingGps) return;
    setIsSimulatingGps(true);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = 0.3 + (step * 0.14);
      const remainingEta = Math.max(1, 15 - (step * 3));
      const simulatedX = Math.min(350, 120 + (step * 45));

      setTechPos({
        x: simulatedX,
        y: 80 + (step % 2 === 0 ? 8 : -8),
        etaMinutes: remainingEta,
        speedKmh: Math.floor(28 + Math.random() * 15)
      });

      if (socketRef.current) {
        socketRef.current.emit('send_gps_telemetry', {
          bookingId: booking.id,
          servicemanId: booking.servicemanId || 'sm-1',
          servicemanName: booking.servicemanName || 'Carlos Mendoza',
          lat: 19.4194 + (step * 0.002),
          lng: -99.1634 + (step * 0.002),
          progress,
          etaMinutes: remainingEta,
          speedKmh: 35
        });
      }

      if (step >= 5) {
        clearInterval(interval);
        setIsSimulatingGps(false);
      }
    }, 1200);
  };

  const handleReview = async () => {
    await submitReview(booking.id, rating, reviewText || '¡Excelente chamba, muy profesional y puntual!');
    setReviewed(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente de Aceptación';
      case 'accepted': return 'Aceptada por Proveedor';
      case 'assigned': return 'Chambeador Asignado';
      case 'on_the_way': return 'Chambeador en Camino 🛵';
      case 'in_progress': return 'Chamba en Progreso 🛠️';
      case 'completed': return 'Chamba Completada ✅';
      default: return status;
    }
  };

  const quickPhrases = [
    '📍 Ya estoy en el domicilio esperándolo',
    '🚪 ¿Qué número de departamento es?',
    '💧 Hay acceso directo a toma de agua y luz',
    '🛵 Hay tráfico ligero, llego en minutos',
    '🪪 Llevo playera oficial ChambaYa y gafete'
  ];

  return (
    <div className="modal-overlay" onClick={() => setTrackingBookingId(null)}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span className={`status-pill ${booking.status}`}>{getStatusLabel(booking.status)}</span>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>#{booking.id}</span>
              <button
                type="button"
                onClick={() => setCheckoutBookingId(booking.id)}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  border: '1px solid #10B981',
                  background: booking.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF2F2',
                  color: booking.paymentStatus === 'paid' ? '#16A34A' : '#DC2626',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>💳 {booking.paymentStatus === 'paid' ? 'Pagado' : 'Pagar'}</span>
              </button>
              <button
                type="button"
                onClick={() => setInvoicingBookingId(booking.id)}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  border: '1px solid #059669',
                  background: '#F0FDF4',
                  color: '#059669',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>📄 Factura SAT</span>
              </button>
              <button
                type="button"
                onClick={() => setDisputeBookingId(booking.id)}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  border: '1px solid #2563EB',
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>🛡️ Bóveda Escrow</span>
              </button>
              <button
                type="button"
                onClick={() => setFieldOpsBookingId(booking.id)}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  border: '1px solid #D97706',
                  background: '#FFFBEB',
                  color: '#B45309',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>📸 Fotos & Ferretería</span>
              </button>
            </div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{booking.serviceTitle}</h4>
          </div>
          <button onClick={() => setTrackingBookingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            style={{
              flex: 1,
              padding: '0.65rem',
              border: 'none',
              background: activeTab === 'radar' ? '#FFF' : 'transparent',
              borderBottom: activeTab === 'radar' ? '3px solid #10B981' : 'none',
              color: activeTab === 'radar' ? '#10B981' : '#64748B',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
          >
            <Radio size={14} />
            <span>Radar Satelital GPS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            style={{
              flex: 1,
              padding: '0.65rem',
              border: 'none',
              background: activeTab === 'chat' ? '#FFF' : 'transparent',
              borderBottom: activeTab === 'chat' ? '3px solid #10B981' : 'none',
              color: activeTab === 'chat' ? '#10B981' : '#64748B',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={14} />
            <span>Chat en Vivo ({messages.length})</span>
          </button>
        </div>

        {/* Tab 1: Radar Satelital GPS con Socket.io */}
        {activeTab === 'radar' && (
          <div>
            <div style={{ position: 'relative', height: '190px', background: '#0F172A', overflow: 'hidden' }}>
              <svg width="100%" height="100%" style={{ opacity: 0.25 }}>
                <pattern id="radarGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#10B981" strokeWidth="0.8" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#radarGrid)" />
                <path d="M 30 140 Q 140 40 240 110 T 420 70" fill="none" stroke="#34D399" strokeWidth="3" strokeDasharray="5,5" />
              </svg>

              {/* Domicilio del Cliente */}
              <div style={{ position: 'absolute', right: '40px', top: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 0 15px rgba(239,68,68,0.6)' }}>
                  <MapPin size={18} />
                </div>
                <span style={{ fontSize: '0.62rem', background: '#0F172A', color: '#FFF', padding: '0.1rem 0.35rem', borderRadius: '4px', marginTop: '0.2rem' }}>Tu Domicilio</span>
              </div>

              {/* Posición del Chambeador con Socket.io */}
              <div
                style={{
                  position: 'absolute',
                  left: `${booking.status === 'completed' ? 360 : techPos.x}px`,
                  top: `${booking.status === 'completed' ? 70 : techPos.y}px`,
                  transition: 'all 0.8s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 0 20px rgba(16,185,129,0.8)' }}>
                  <Navigation size={18} />
                </div>
                <span style={{ fontSize: '0.62rem', background: '#10B981', color: '#FFF', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 800, marginTop: '0.2rem' }}>
                  {booking.servicemanName ? `${booking.servicemanName}` : 'Chambeador'}
                </span>
              </div>

              {/* Indicador de Telemetría en Vivo */}
              <div style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', padding: '0.4rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#34D399', fontWeight: 800 }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', animation: 'pulse 1.5s infinite' }}></span>
                  <span>GPS Telemetría Live</span>
                </div>
                <div style={{ color: '#94A3B8' }}>ETA: <strong style={{ color: '#FFF' }}>{techPos.etaMinutes} mins</strong></div>
                <div style={{ color: '#94A3B8' }}>Velocidad: <strong style={{ color: '#FFF' }}>{techPos.speedKmh} km/h</strong></div>
              </div>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Botón para simular movimiento GPS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.6rem 0.85rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                  <strong>Prueba de Telemetría Socket.io:</strong> Simula el avance del técnico en ruta.
                </div>
                <button
                  type="button"
                  onClick={handleSimulateGps}
                  disabled={isSimulatingGps}
                  style={{
                    background: '#10B981',
                    color: '#FFF',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isSimulatingGps ? 'Transmitiendo GPS...' : '▶ Probar Movimiento'}
                </button>
              </div>

              {/* Security PIN */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', border: '1px dashed #CBD5E1', padding: '0.75rem', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>PIN de Seguridad (Iniciar Chamba)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669', letterSpacing: '0.15em' }}>{booking.otp}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', maxWidth: '200px', textAlign: 'right' }}>
                  Muestra este PIN al chambeador únicamente cuando llegue a tu domicilio para validar el arranque.
                </div>
              </div>

              {/* FieldOps Bitácora & Materiales Callout */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E293B' }}>
                      Inspección Visual & Tickets Ferretería
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                      Fotos Antes/Después + Autorización de refacciones
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFieldOpsBookingId(booking.id)}
                  style={{
                    background: '#D97706',
                    color: '#FFF',
                    border: 'none',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Abrir Bitácora
                </button>
              </div>

              {/* Assigned Tech */}
              {booking.servicemanName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', border: '1px solid #E2E8F0', padding: '0.65rem 0.85rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img src={booking.servicemanAvatar || ''} alt={booking.servicemanName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800 }}>{booking.servicemanName}</h5>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <ShieldCheck size={12} color="#10B981" />
                        <span>Chambeador Certificado y Confiable</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('chat')}
                      style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#F1F5F9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', cursor: 'pointer' }}
                      title="Abrir Chat"
                    >
                      <MessageSquare size={15} />
                    </button>
                    <a href={`tel:${booking.servicemanPhone}`} style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', textDecoration: 'none' }} title="Llamar">
                      <Phone size={15} />
                    </a>
                  </div>
                </div>
              )}

              {/* Calificación si ya terminó */}
              {booking.status === 'completed' && !booking.rating && !reviewed && (
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>Califica la Experiencia del Servicio</div>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.4rem' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button" onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Star size={20} fill={s <= rating ? '#F59E0B' : 'none'} color={s <= rating ? '#F59E0B' : '#CBD5E1'} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="¿Cómo te fue con la chamba realizada? Deja un comentario..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', minHeight: '55px' }}
                  />
                  <button onClick={handleReview} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem', background: '#10B981' }}>
                    Enviar Calificación
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Chat en Vivo Socket.io */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '420px', background: '#F8FAFC' }}>
            {/* Thread de mensajes */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.78rem', margin: 'auto 0' }}>
                  <MessageSquare size={28} color="#CBD5E1" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>Inicia una conversación directa con tu chambeador asignado.</div>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>Comunicación cifrada en tiempo real mediante WebSockets.</div>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.senderRole === (currentUser?.role || 'CUSTOMER') || m.senderName === currentUser?.name;
                  return (
                    <div
                      key={m.id || idx}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', color: '#64748B', marginBottom: '0.15rem' }}>
                        {m.senderName} ({m.senderRole})
                      </div>
                      <div
                        style={{
                          background: isMe ? '#10B981' : '#FFFFFF',
                          color: isMe ? '#FFFFFF' : '#0F172A',
                          padding: '0.6rem 0.85rem',
                          borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          border: isMe ? 'none' : '1px solid #E2E8F0',
                          fontSize: '0.82rem',
                          lineHeight: 1.35,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        {m.text}
                      </div>
                      <span style={{ fontSize: '0.6rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick response chips */}
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', padding: '0.4rem 0.75rem', background: '#FFF', borderTop: '1px solid #E2E8F0' }}>
              {quickPhrases.map((phrase, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(phrase)}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    color: '#334155',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {phrase}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
              style={{ padding: '0.65rem 0.75rem', background: '#FFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="text"
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                placeholder="Escribe un mensaje al chambeador..."
                style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none' }}
              />
              <button
                type="submit"
                disabled={!newMessageText.trim()}
                style={{
                  background: '#10B981',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

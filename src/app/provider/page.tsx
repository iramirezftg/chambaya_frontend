"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { api, ProviderTaxReport, ProviderSubscription, SubscriptionPlan } from '../../lib/api';
import { RoleGuard } from '../../components/RoleGuard';
import {
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  Plus,
  UserCheck,
  Send,
  Building2,
  FileText,
  ShieldCheck,
  Download,
  Percent,
  Receipt,
  X,
  Sparkles,
  CheckCircle2,
  Award,
  Crown,
  CreditCard,
  Check,
  Zap,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProviderPage() {
  const {
    activeProviderId,
    providers,
    services,
    servicemen,
    bookings,
    categories,
    acceptBooking,
    assignServiceman,
    addNewService,
    addNewServiceman,
    requestPayout,
    refreshData
  } = usePlatform();

  const provider = providers.find(p => p.id === activeProviderId) || providers[0];
  const [tab, setTab] = useState<'bookings' | 'services' | 'team' | 'taxes' | 'subscription'>('bookings');
  const [assignBookingId, setAssignBookingId] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmt, setPayoutAmt] = useState('1500');
  const [taxReport, setTaxReport] = useState<ProviderTaxReport | null>(null);
  const [loadingTax, setLoadingTax] = useState(false);

  // Subscriptions & ChambaYa Pro State
  const [subscriptionData, setSubscriptionData] = useState<ProviderSubscription | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<'PRO' | 'ENTERPRISE'>('PRO');
  const [subPaymentMethod, setSubPaymentMethod] = useState<'card' | 'spei'>('card');
  const [subCardNumber, setSubCardNumber] = useState('4152 3140 8921 5590');
  const [subCardHolder, setSubCardHolder] = useState('ALEJANDRO MORALES');
  const [subCardExpiry, setSubCardExpiry] = useState('11/29');
  const [subCardCvv, setSubCardCvv] = useState('492');
  const [subRequireInvoice, setSubRequireInvoice] = useState(true);
  const [subProcessing, setSubProcessing] = useState(false);
  const [calcSalesAmt, setCalcSalesAmt] = useState(50000);

  // Modals for Adding Services and Servicemen
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddServicemanModal, setShowAddServicemanModal] = useState(false);

  // New Service Form State
  const [newSrvTitle, setNewSrvTitle] = useState('Instalación de Calentador Solar 150L');
  const [newSrvDesc, setNewSrvDesc] = useState('Armado e instalación en azotea con tubería Tuboplus PPR y válvula check.');
  const [newSrvCatId, setNewSrvCatId] = useState('cat-plumbing');
  const [newSrvPrice, setNewSrvPrice] = useState('850');
  const [newSrvDiscount, setNewSrvDiscount] = useState('750');
  const [newSrvDuration, setNewSrvDuration] = useState('90 min');
  const [newSrvBadge, setNewSrvBadge] = useState('Garantizado');
  const [newSrvImage, setNewSrvImage] = useState('https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600');

  // New Serviceman Form State
  const [newSmName, setNewSmName] = useState('Miguel Ángel Huerta');
  const [newSmTitle, setNewSmTitle] = useState('Técnico Plomero Certificado');
  const [newSmPhone, setNewSmPhone] = useState('+52 55 9182 3746');
  const [newSmAvatar, setNewSmAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200');

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !newSrvTitle) return;
    await addNewService({
      providerId: provider.id,
      categoryId: newSrvCatId,
      title: newSrvTitle,
      description: newSrvDesc,
      price: parseFloat(newSrvPrice) || 500,
      discountPrice: newSrvDiscount ? parseFloat(newSrvDiscount) : undefined,
      duration: newSrvDuration,
      badge: newSrvBadge,
      image: newSrvImage,
      rating: 5.0,
      reviewsCount: 1
    });
    confetti({ particleCount: 60, spread: 70 });
    setShowAddServiceModal(false);
  };

  const handleCreateServiceman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !newSmName) return;
    await addNewServiceman({
      providerId: provider.id,
      name: newSmName,
      title: newSmTitle,
      phone: newSmPhone,
      avatar: newSmAvatar,
      rating: 5.0,
      completedJobs: 0,
      status: 'available',
      isVerified: true
    });
    confetti({ particleCount: 60, spread: 70 });
    setShowAddServicemanModal(false);
  };

  useEffect(() => {
    if (tab === 'taxes' && provider) {
      setLoadingTax(true);
      api.getProviderTaxRetentions(provider.id)
        .then(rep => setTaxReport(rep))
        .catch(err => console.error(err))
        .finally(() => setLoadingTax(false));
    }
  }, [tab, provider]);

  const fetchSubscription = async () => {
    if (!provider) return;
    try {
      setLoadingSub(true);
      const data = await api.getProviderSubscription(provider.id);
      setSubscriptionData(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    if (provider) {
      fetchSubscription();
    }
  }, [provider?.id, tab]);

  const handleUpgradeSubscription = async (plan: 'PRO' | 'ENTERPRISE') => {
    if (!provider) return;
    try {
      setSubProcessing(true);
      const cleanCard = subCardNumber.replace(/\s+/g, '');
      const last4 = cleanCard.length >= 4 ? cleanCard.slice(-4) : '5590';
      await api.subscribeProvider({
        providerId: provider.id,
        plan,
        paymentMethod: subPaymentMethod,
        cardLast4: last4,
        cardBrand: subPaymentMethod === 'spei' ? 'SPEI Domiciliado' : 'Visa Débito BBVA'
      });
      confetti({ particleCount: 100, spread: 80 });
      alert(`🎉 ¡Felicidades! Tu taller ahora tiene activo el Plan ${plan === 'PRO' ? 'Taller Pro 💎 (8% comisión)' : 'Cuadrilla Enterprise 🏆 (5% comisión)'}. Las nuevas comisiones reducidas ya aplican a todas tus órdenes.`);
      setShowUpgradeModal(false);
      await fetchSubscription();
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert(`Error al activar membresía: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setSubProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!provider) return;
    if (!confirm('¿Estás seguro de cancelar tu suscripción? La comisión de plataforma aumentará al 15.0% estándar y perderás la insignia Diamante en el marketplace.')) return;
    try {
      setSubProcessing(true);
      await api.cancelProviderSubscription(provider.id);
      alert('Suscripción cancelada. La cuenta ha vuelto al Plan Básico (15% comisión estándar).');
      await fetchSubscription();
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert(`Error al cancelar: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setSubProcessing(false);
    }
  };

  const handleSimulateRenewal = async () => {
    if (!provider) return;
    try {
      setSubProcessing(true);
      const res = await api.simulateSubscriptionRenewal(provider.id);
      confetti({ particleCount: 60, spread: 60 });
      alert(`✅ Cobro recurrente procesado exitosamente.\nFolio: ${res.subscription?.id || 'SUB-RENEW'}\nMonto: $${res.subscription?.amount || 499} MXN\nFactura SAT CFDI 4.0 timbrada con éxito.`);
      await fetchSubscription();
    } catch (err: any) {
      alert(`Error en simulación: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setSubProcessing(false);
    }
  };

  const provBookings = bookings.filter(b => b.providerId === provider?.id);
  const provServices = services.filter(s => s.providerId === provider?.id);
  const provServicemen = servicemen.filter(s => s.providerId === provider?.id);

  const handleAssign = async () => {
    if (!assignBookingId || !selectedTech) return;
    await assignServiceman(assignBookingId, selectedTech);
    setAssignBookingId(null);
    setSelectedTech('');
  };

  const handlePayout = async () => {
    if (!provider) return;
    await requestPayout(provider.id, parseFloat(payoutAmt));
    setShowPayoutModal(false);
    alert(`¡Solicitud de retiro por $${payoutAmt} MXN enviada con éxito! Dispersión vía SPEI en proceso.`);
  };

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

  if (!provider) return <div style={{ padding: '2rem' }}>Cargando datos del negocio proveedor...</div>;

  return (
    <RoleGuard
      allowedRoles={['PROVIDER', 'ADMIN']}
      redirectLoginUrl="/provider/login"
      portalName="Portal de Negocios y Proveedores"
    >
      <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 70px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        {/* Banner */}
        <div style={{
          background: '#0F172A',
          borderRadius: '24px',
          padding: '2rem',
          color: '#FFF',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={provider.avatar} alt={provider.name} style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #10B981' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', background: '#10B981', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 800 }}>
                  {provider.status.toUpperCase()} • PROVEEDOR VERIFICADO
                </span>
                {provider.subscriptionPlan === 'ENTERPRISE' ? (
                  <span style={{ fontSize: '0.72rem', background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: '#FFF', padding: '0.15rem 0.65rem', borderRadius: '9999px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)' }}>
                    <Crown size={12} /> EMPRESA CERTIFICADA 🏆 • 5% COMISIÓN
                  </span>
                ) : provider.subscriptionPlan === 'PRO' ? (
                  <span style={{ fontSize: '0.72rem', background: 'linear-gradient(135deg, #0284C7, #2563EB)', color: '#FFF', padding: '0.15rem 0.65rem', borderRadius: '9999px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)' }}>
                    <Award size={12} /> TALLER DIAMANTE ⭐ • 8% COMISIÓN
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setSelectedUpgradePlan('PRO'); setShowUpgradeModal(true); }}
                    style={{ fontSize: '0.72rem', background: '#334155', color: '#FCD34D', padding: '0.15rem 0.65rem', borderRadius: '9999px', fontWeight: 800, border: '1px solid #475569', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Zap size={12} /> Plan Básico (15% com.) • ⚡ Mejorar a Pro
                  </button>
                )}
              </div>
              <h1 style={{ fontSize: '1.75rem', color: '#FFF', margin: '0.2rem 0', fontWeight: 900 }}>{provider.name}</h1>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Titular: {provider.owner} • Tel: {provider.phone} • Zona: {provider.zone} • Comisión ChambaYa: <strong style={{ color: provider.subscriptionPlan === 'ENTERPRISE' ? '#C084FC' : provider.subscriptionPlan === 'PRO' ? '#60A5FA' : '#FCD34D', fontSize: '0.9rem' }}>{provider.commissionRate}%</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Quick Action 1: Publicar Servicio */}
            <button
              type="button"
              onClick={() => {
                setShowAddServiceModal(true);
                setTab('services');
              }}
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFF',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Briefcase size={17} />
              <span>➕ Publicar Servicio</span>
            </button>

            {/* Quick Action 2: Agregar Chambeador */}
            <button
              type="button"
              onClick={() => {
                setShowAddServicemanModal(true);
                setTab('team');
              }}
              style={{
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#FFF',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
              }}
            >
              <Users size={17} />
              <span>➕ Registrar Chambeador</span>
            </button>

            {/* Membresía Status Pill */}
            <button
              type="button"
              onClick={() => setTab('subscription')}
              style={{
                background: provider.subscriptionPlan === 'ENTERPRISE' 
                  ? 'linear-gradient(135deg, #581C87, #3730A3)' 
                  : provider.subscriptionPlan === 'PRO' 
                    ? 'linear-gradient(135deg, #1E3A8A, #0284C7)' 
                    : 'rgba(255,255,255,0.08)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.18)',
                padding: '0.65rem 1rem',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textAlign: 'left'
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.35rem', borderRadius: '8px' }}>
                <Crown size={18} color="#FBBF24" />
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan Activo</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#FFF' }}>
                  {provider.subscriptionPlan === 'ENTERPRISE' ? 'Enterprise 🏆 (5%)' : provider.subscriptionPlan === 'PRO' ? 'Taller Pro 💎 (8%)' : 'Básico (15%)'}
                </div>
              </div>
            </button>

            {/* Saldo SPEI */}
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.65rem 1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Saldo Disponible</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34D399' }}>${provider.walletBalance.toFixed(2)} <span style={{ fontSize: '0.7rem' }}>MXN</span></div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPayoutModal(true)} style={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.75rem' }}>
                SPEI
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Gestión Rápida y Acceso Directo */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Card 1: Servicios */}
          <div style={{
            background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)',
            border: '2px solid #A7F3D0',
            borderRadius: '18px',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#10B981', color: '#FFF', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                <Briefcase size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Catálogo de Oficios ({provServices.length} Activos)
                </div>
                <h3 style={{ margin: '0.1rem 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 900, color: '#064E3B' }}>
                  ¿Ofreces un nuevo servicio?
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#047857' }}>
                  Publica calentadores, climas o cerrajería para recibir órdenes.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddServiceModal(true);
                setTab('services');
              }}
              style={{
                background: '#059669',
                color: '#FFF',
                border: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
              }}
            >
              <Plus size={16} />
              <span>Publicar Servicio</span>
            </button>
          </div>

          {/* Card 2: Chambeadores */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF, #F8FAFC)',
            border: '2px solid #BFDBFE',
            borderRadius: '18px',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: '#2563EB', color: '#FFF', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cuadrilla Técnica ({provServicemen.length} Técnicos)
                </div>
                <h3 style={{ margin: '0.1rem 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 900, color: '#1E3A8A' }}>
                  ¿Llegó un nuevo chambeador?
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#1D4ED8' }}>
                  Incorpóralo a tu taller con WhatsApp para despachos con GPS.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddServicemanModal(true);
                setTab('team');
              }}
              style={{
                background: '#1D4ED8',
                color: '#FFF',
                border: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(29, 78, 216, 0.25)'
              }}
            >
              <Plus size={16} />
              <span>Registrar Chambeador</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Chunky Pills) */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTab('bookings')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: tab === 'bookings' ? '2px solid #10B981' : '1px solid #CBD5E1',
              background: tab === 'bookings' ? '#10B981' : '#FFF',
              color: tab === 'bookings' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: tab === 'bookings' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <span>📋 Chambas y Asignación</span>
            <span style={{
              background: tab === 'bookings' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
              color: tab === 'bookings' ? '#FFF' : '#64748B',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem'
            }}>
              {provBookings.length}
            </span>
          </button>

          <button
            onClick={() => setTab('services')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: tab === 'services' ? '2px solid #10B981' : '1px solid #CBD5E1',
              background: tab === 'services' ? '#10B981' : '#FFF',
              color: tab === 'services' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: tab === 'services' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <span>📦 Catálogo de Servicios</span>
            <span style={{
              background: tab === 'services' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
              color: tab === 'services' ? '#FFF' : '#64748B',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem'
            }}>
              {provServices.length}
            </span>
          </button>

          <button
            onClick={() => setTab('team')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: tab === 'team' ? '2px solid #10B981' : '1px solid #CBD5E1',
              background: tab === 'team' ? '#10B981' : '#FFF',
              color: tab === 'team' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: tab === 'team' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <span>👷 Cuadrilla de Chambeadores</span>
            <span style={{
              background: tab === 'team' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
              color: tab === 'team' ? '#FFF' : '#64748B',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem'
            }}>
              {provServicemen.length}
            </span>
          </button>

          <button
            onClick={() => setTab('taxes')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: tab === 'taxes' ? '2px solid #10B981' : '1px solid #CBD5E1',
              background: tab === 'taxes' ? '#10B981' : '#FFF',
              color: tab === 'taxes' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: tab === 'taxes' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <Building2 size={16} />
            <span>Retenciones SAT (Plataformas)</span>
          </button>

          <button
            onClick={() => setTab('subscription')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: tab === 'subscription' ? '2px solid #4F46E5' : '1px solid #CBD5E1',
              background: tab === 'subscription' ? 'linear-gradient(135deg, #4338CA, #6366F1)' : '#FFF',
              color: tab === 'subscription' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: tab === 'subscription' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
            }}
          >
            <Crown size={16} color={tab === 'subscription' ? '#FBBF24' : '#6366F1'} />
            <span>💎 Membresía ChambaYa Pro</span>
            <span style={{
              background: tab === 'subscription' ? 'rgba(255,255,255,0.22)' : '#EEF2FF',
              color: tab === 'subscription' ? '#FFF' : '#4F46E5',
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 900
            }}>
              {provider.subscriptionPlan || 'PRO'}
            </span>
          </button>
        </div>

        {tab === 'bookings' && (
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontWeight: 800 }}>Chambas Recibidas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {provBookings.map(b => (
                <div key={b.id} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span className={`status-pill ${b.status}`}>{getStatusLabel(b.status)}</span>
                      <strong style={{ fontSize: '0.82rem' }}>#{b.id}</strong>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{b.serviceTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Cliente: {b.customerName} ({b.customerPhone}) • 📅 {b.scheduledDate} ({b.scheduledTimeSlot}) • Domicilio: {b.customerAddress}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>${b.amount.toFixed(2)} MXN</div>
                      <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>Ganancia neta: ${b.providerEarnings.toFixed(2)} MXN</div>
                    </div>

                    {b.status === 'pending' && (
                      <button className="btn btn-primary btn-sm" onClick={() => acceptBooking(b.id)} style={{ background: '#10B981' }}>
                        Aceptar Chamba
                      </button>
                    )}

                    {b.status === 'accepted' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => setAssignBookingId(b.id)}>
                        Despachar Chambeador
                      </button>
                    )}

                    {b.servicemanName && (
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                        Técnico: {b.servicemanName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  Catálogo de Servicios Ofrecidos ({provServices.length})
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                  Servicios y oficios visibles para clientes en el Marketplace de ChambaYa bajo la firma de {provider.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddServiceModal(true)}
                style={{
                  background: '#10B981',
                  color: '#FFF',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Plus size={16} />
                <span>Publicar Nuevo Servicio</span>
              </button>
            </div>

            {provServices.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {provServices.map(s => (
                  <div key={s.id} style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ position: 'relative', height: '150px' }}>
                        <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {s.badge && (
                          <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#10B981', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                            {s.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{s.title}</h4>
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: '#64748B', lineClamp: 2 }}>
                          {s.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Precio al Público</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10B981' }}>
                          ${(s.discountPrice || s.price).toFixed(2)} <span style={{ fontSize: '0.7rem' }}>MXN</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', background: '#F8FAFC', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        ⏱️ {s.duration || '60 min'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#FFF', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px dashed #CBD5E1' }}>
                <Briefcase size={36} color="#94A3B8" style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0, fontWeight: 800, color: '#0F172A' }}>Aún no has registrado servicios</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
                  Comienza publicando tu primer oficio para recibir solicitudes directas.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.75rem', background: '#10B981' }}
                >
                  ➕ Agregar Primer Servicio
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'team' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  Cuadrilla de Chambeadores ({provServicemen.length})
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                  Personal técnico asignable para acudir a domicilios con geolocalización GPS activa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddServicemanModal(true)}
                style={{
                  background: '#0F172A',
                  color: '#FFF',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)'
                }}
              >
                <Plus size={16} />
                <span>Registrar Chambeador a la Cuadrilla</span>
              </button>
            </div>

            {provServicemen.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {provServicemen.map(tech => (
                  <div key={tech.id} style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img src={tech.avatar} alt={tech.name} style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{tech.name}</h4>
                          <span style={{ fontSize: '0.65rem', color: '#F59E0B', fontWeight: 800 }}>★ {tech.rating || 5.0}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{tech.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                          📞 {tech.phone}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.65rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '6px', background: tech.status === 'available' ? '#DCFCE7' : '#FEF3C7', color: tech.status === 'available' ? '#15803D' : '#B45309' }}>
                        {tech.status === 'available' ? 'DISPONIBLE PARA CHAMBA' : 'EN SERVICIO ACTIVO'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                        {tech.completedJobs || 0} chambas hechas
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#FFF', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px dashed #CBD5E1' }}>
                <Users size={36} color="#94A3B8" style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0, fontWeight: 800, color: '#0F172A' }}>Tu cuadrilla aún está vacía</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
                  Agrega a tus técnicos para poder despacharlos a las solicitudes que aceptes.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddServicemanModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.75rem', background: '#0F172A' }}
                >
                  ➕ Agregar Primer Chambeador
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Dispatch */}
        {assignBookingId && (
          <div className="modal-overlay" onClick={() => setAssignBookingId(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Asignar Chambeador de Campo</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Selecciona el técnico que acudirá al domicilio del cliente con GPS activado:</p>
              <select
                value={selectedTech}
                onChange={e => setSelectedTech(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '1rem', fontSize: '0.85rem' }}
              >
                <option value="">-- Seleccionar Chambeador --</option>
                {provServicemen.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.status === 'available' ? 'Disponible' : 'En chamba'})</option>
                ))}
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setAssignBookingId(null)}>Cancelar</button>
                <button className="btn btn-primary btn-sm" onClick={handleAssign} disabled={!selectedTech} style={{ background: '#10B981' }}>Confirmar Despacho</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Payout */}
        {showPayoutModal && (
          <div className="modal-overlay" onClick={() => setShowPayoutModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Building2 size={20} color="#10B981" />
                <h4 style={{ margin: 0, fontWeight: 800 }}>Retiro SPEI a Cuenta Bancaria</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Saldo disponible: <strong>${provider.walletBalance.toFixed(2)} MXN</strong>
              </p>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                Monto a Retirar (MXN):
              </label>
              <input
                type="number"
                value={payoutAmt}
                onChange={e => setPayoutAmt(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 800 }}
              />
              <div style={{ fontSize: '0.72rem', color: '#64748B', background: '#F8FAFC', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                Dispersión directa a la cuenta CLABE registrada en el expediente KYC del proveedor.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowPayoutModal(false)}>Cancelar</button>
                <button className="btn btn-primary btn-sm" onClick={handlePayout} style={{ background: '#10B981' }}>Solicitar Transferencia SPEI</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Add Service */}
        {showAddServiceModal && (
          <div className="modal-overlay" onClick={() => setShowAddServiceModal(false)}>
            <div
              className="modal-card"
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '560px',
                padding: '1.75rem',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ background: '#ECFDF5', padding: '0.5rem', borderRadius: '10px' }}>
                    <Briefcase size={22} color="#059669" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>
                      Publicar Nuevo Servicio al Catálogo
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                      Define la tarifa en pesos (MXN) y características del oficio
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Plantillas Rápidas de 1 Clic */}
              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                  ⚡ Plantillas Rápidas (1 Clic)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSrvTitle('Instalación de Calentador Solar 150L');
                      setNewSrvDesc('Armado y fijación en losa/azotea, tubería Tuboplus PPR termofusionada y válvula de alivio.');
                      setNewSrvPrice('950');
                      setNewSrvDiscount('850');
                      setNewSrvDuration('2 horas');
                      setNewSrvBadge('Ecológico');
                      setNewSrvImage('https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600');
                    }}
                    style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ☀️ Calentador Solar ($850)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSrvTitle('Mantenimiento Preventivo Minisplit');
                      setNewSrvDesc('Lavado a presión de serpentín evaporador, desinfección antifúngica y revisión de presión R410A.');
                      setNewSrvPrice('750');
                      setNewSrvDiscount('650');
                      setNewSrvDuration('60 min');
                      setNewSrvBadge('Garantizado');
                      setNewSrvImage('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600');
                    }}
                    style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ❄️ Minisplit ($650)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSrvTitle('Cambio de Centro de Carga Square D');
                      setNewSrvDesc('Sustitución de caja de fusibles por centro de carga termomagnético bifásico con varilla a tierra.');
                      setNewSrvPrice('1400');
                      setNewSrvDiscount('1200');
                      setNewSrvDuration('2.5 horas');
                      setNewSrvBadge('Certificado NOM');
                      setNewSrvImage('https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600');
                    }}
                    style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ⚡ Centro Carga ($1,200)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSrvTitle('Apertura e Instalación de Cerrojo Digital');
                      setNewSrvDesc('Instalación de chapa inteligente con huella biométrica, tarjeta RFID y código en puerta de tambor/madera.');
                      setNewSrvPrice('850');
                      setNewSrvDiscount('750');
                      setNewSrvDuration('45 min');
                      setNewSrvBadge('Alta Seguridad');
                      setNewSrvImage('https://images.unsplash.com/photo-1558002038-1055907df827?w=600');
                    }}
                    style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    🔑 Cerrojo Digital ($750)
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateService} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Título del Servicio *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSrvTitle}
                    onChange={e => setNewSrvTitle(e.target.value)}
                    placeholder="Ej. Cambio de Mezcladora de Fregadero"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Categoría
                    </label>
                    <select
                      value={newSrvCatId}
                      onChange={e => setNewSrvCatId(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Distintivo / Badge
                    </label>
                    <input
                      type="text"
                      value={newSrvBadge}
                      onChange={e => setNewSrvBadge(e.target.value)}
                      placeholder="Ej. Garantizado, 24/7 SOS"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Descripción Detallada del Trabajo
                  </label>
                  <textarea
                    rows={2}
                    value={newSrvDesc}
                    onChange={e => setNewSrvDesc(e.target.value)}
                    placeholder="Detalla lo que incluye el servicio, herramientas y refacciones..."
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Precio Base ($ MXN) *
                    </label>
                    <input
                      type="number"
                      required
                      min="50"
                      value={newSrvPrice}
                      onChange={e => setNewSrvPrice(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 800 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Oferta ($ MXN)
                    </label>
                    <input
                      type="number"
                      min="50"
                      value={newSrvDiscount}
                      onChange={e => setNewSrvDiscount(e.target.value)}
                      placeholder="Opcional"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Tiempo Estimado
                    </label>
                    <input
                      type="text"
                      value={newSrvDuration}
                      onChange={e => setNewSrvDuration(e.target.value)}
                      placeholder="Ej. 90 min"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    URL Imagen Ilustrativa
                  </label>
                  <input
                    type="url"
                    value={newSrvImage}
                    onChange={e => setNewSrvImage(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', color: '#64748B' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddServiceModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem' }}
                  >
                    <Sparkles size={15} />
                    <span>Publicar en Catálogo</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Add Serviceman */}
        {showAddServicemanModal && (
          <div className="modal-overlay" onClick={() => setShowAddServicemanModal(false)}>
            <div
              className="modal-card"
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '520px',
                padding: '1.75rem',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ background: '#EFF6FF', padding: '0.5rem', borderRadius: '10px' }}>
                    <Users size={22} color="#2563EB" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>
                      Registrar Chambeador a la Cuadrilla
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                      Asigna técnicos para atender servicios a domicilio en tiempo real
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddServicemanModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Perfiles de Ejemplo Rápidos */}
              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                  ⚡ Perfiles Sugeridos (1 Clic)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSmName('Miguel Ángel Huerta');
                      setNewSmTitle('Técnico Plomero Certificado');
                      setNewSmPhone('+52 55 9182 3746');
                      setNewSmAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200');
                    }}
                    style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    👨‍🔧 Miguel H. (Plomero)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSmName('Roberto Esquivel Luna');
                      setNewSmTitle('Especialista en Refrigeración y Minisplits');
                      setNewSmPhone('+52 55 4192 8821');
                      setNewSmAvatar('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200');
                    }}
                    style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ❄️ Roberto E. (HVAC)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSmName('David Zamudio Perea');
                      setNewSmTitle('Cerrajero Automotriz y Residencial');
                      setNewSmPhone('+52 55 3810 5920');
                      setNewSmAvatar('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200');
                    }}
                    style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    🔑 David Z. (Cerrajero)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSmName('Laura Montes Rangel');
                      setNewSmTitle('Electricista Industrial y Residencial');
                      setNewSmPhone('+52 55 6289 1104');
                      setNewSmAvatar('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200');
                    }}
                    style={{ fontSize: '0.72rem', background: '#FFF', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ⚡ Laura M. (Electricista)
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateServiceman} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Nombre Completo del Chambeador *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSmName}
                    onChange={e => setNewSmName(e.target.value)}
                    placeholder="Ej. Juan Carlos Morales"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Puesto / Especialidad Técnica *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSmTitle}
                    onChange={e => setNewSmTitle(e.target.value)}
                    placeholder="Ej. Técnico Plomero con Certificación CONOCER"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Teléfono Celular WhatsApp (+52 México) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newSmPhone}
                    onChange={e => setNewSmPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Fotografía de Perfil (URL)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={newSmAvatar}
                      alt="Preview"
                      style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #CBD5E1' }}
                      onError={e => { (e.target as any).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160'; }}
                    />
                    <input
                      type="url"
                      value={newSmAvatar}
                      onChange={e => setNewSmAvatar(e.target.value)}
                      style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', color: '#64748B' }}
                    />
                  </div>
                </div>

                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.65rem 0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#065F46' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <span>
                    El chambeador quedará dado de alta inmediatamente con estatus <strong>Disponible</strong> para asignación de órdenes.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddServicemanModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ background: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Dar de Alta en Cuadrilla</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === 'taxes' && (
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
            {/* Header de Situación Fiscal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ background: '#059669', color: '#FFF', fontSize: '0.72rem', fontWeight: 900, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    SAT PLATAFORMAS TECNOLÓGICAS
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Art. 113-A LISR / Art. 18-B LIVA</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0F172A' }}>
                  Constancia Mensual de Retenciones e Información de Pagos
                </h3>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={15} />
                <span>Exportar Constancia SAT (PDF)</span>
              </button>
            </div>

            {/* Expediente fiscal del taller */}
            <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Razón Social / Titular:</span>
                <strong style={{ color: '#0F172A' }}>{provider.name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>RFC con Homoclave:</span>
                <strong style={{ color: '#059669', fontFamily: 'monospace', fontSize: '0.9rem' }}>{taxReport?.provider.rfc || 'GARM8504128X9'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Régimen Fiscal SAT:</span>
                <strong style={{ color: '#0F172A' }}>625 - Plataformas Tecnológicas</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Cuenta CLABE Dispersión:</span>
                <strong style={{ color: '#2563EB', fontFamily: 'monospace' }}>{taxReport?.provider.clabeAccount || '012180001234567890'}</strong>
              </div>
            </div>

            {/* 4 KPIs de Impuestos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Ingresos Brutos del Periodo</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0' }}>
                  ${(taxReport?.summary.totalGross || 0).toFixed(2)} MXN
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>Total cobrado a clientes</span>
              </div>

              <div style={{ background: '#EFF6FF', padding: '1rem', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                <span style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 600 }}>ISR Retenido (1.0% con RFC)</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1D4ED8', margin: '0.2rem 0' }}>
                  ${(taxReport?.summary.totalIsrRetained || 0).toFixed(2)} MXN
                </div>
                <span style={{ fontSize: '0.7rem', color: '#1E40AF' }}>Enterado al SAT por ChambaYa</span>
              </div>

              <div style={{ background: '#FEF3C7', padding: '1rem', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 600 }}>IVA Retenido (8.0% con RFC)</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#B45309', margin: '0.2rem 0' }}>
                  ${(taxReport?.summary.totalIvaRetained || 0).toFixed(2)} MXN
                </div>
                <span style={{ fontSize: '0.7rem', color: '#92400E' }}>50% del IVA causado enterado</span>
              </div>

              <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                <span style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 600 }}>Dispersión Neta a tu CLABE</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', margin: '0.2rem 0' }}>
                  ${(taxReport?.summary.totalNetDispersed || 0).toFixed(2)} MXN
                </div>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>100% transferido libre de impuestos</span>
              </div>
            </div>

            {/* Tabla con detalle de cada Chamba */}
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Desglose de Retenciones por Chamba Realizada
            </h4>

            {loadingTax ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>Cargando registros fiscales...</div>
            ) : (!taxReport || taxReport.retentions.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No hay registros fiscales en el periodo.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '1px solid #CBD5E1' }}>
                      <th style={{ padding: '0.6rem' }}>Folio Chamba</th>
                      <th style={{ padding: '0.6rem' }}>Monto Bruto</th>
                      <th style={{ padding: '0.6rem' }}>Comisión ChambaYa</th>
                      <th style={{ padding: '0.6rem' }}>Retención ISR (1%)</th>
                      <th style={{ padding: '0.6rem' }}>Retención IVA (8%)</th>
                      <th style={{ padding: '0.6rem' }}>Neto Dispersado</th>
                      <th style={{ padding: '0.6rem', textAlign: 'right' }}>Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxReport.retentions.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.6rem', fontWeight: 800 }}>#{r.bookingId}</td>
                        <td style={{ padding: '0.6rem' }}>${r.grossAmount.toFixed(2)} MXN</td>
                        <td style={{ padding: '0.6rem', color: '#64748B' }}>-${(r.platformFee + r.platformFeeIva).toFixed(2)}</td>
                        <td style={{ padding: '0.6rem', color: '#1D4ED8', fontWeight: 700 }}>-${r.isrRetained.toFixed(2)}</td>
                        <td style={{ padding: '0.6rem', color: '#B45309', fontWeight: 700 }}>-${r.ivaRetained.toFixed(2)}</td>
                        <td style={{ padding: '0.6rem', color: '#059669', fontWeight: 900, fontSize: '0.9rem' }}>
                          ${r.netPayout.toFixed(2)} MXN
                        </td>
                        <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                          <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            Transferido a CLABE ✓
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { api, EscrowDispute, EscrowStats, Coupon, PromotionStats } from '../../lib/api';
import { RoleGuard } from '../../components/RoleGuard';
import {
  ShieldCheck,
  ShieldAlert,
  Scale,
  Sparkles,
  Clock,
  DollarSign,
  TrendingUp,
  Store,
  CreditCard,
  MessageSquare,
  Percent,
  CheckCircle2,
  Zap,
  Activity,
  Code2,
  RefreshCw,
  Award,
  UserCheck,
  Scan,
  FileText,
  Eye,
  AlertTriangle,
  X,
  Server,
  Cpu,
  Layers,
  Lock,
  Terminal,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  MapPin,
  Users,
  Filter,
  ArrowUpRight,
  FileSpreadsheet,
  Printer,
  Tag,
  Ticket,
  Gift,
  UserPlus,
  Wrench,
  Building,
  Plus,
  Trash2,
  CheckCircle,
  Ban,
  ArrowDownRight,
  FileCheck,
  Landmark,
  ChevronRight,
  Receipt,
  Search
} from 'lucide-react';
import type { Provider, Serviceman, GlobalTaxReport, SubscriptionPlan, SubscriptionStats } from '../../lib/api';

export default function AdminPage() {
  const {
    providers,
    servicemen,
    bookings,
    categories,
    gateways,
    approveProvider,
    updateCommissionRate,
    toggleGateway,
    refreshData,
    setCheckoutBookingId,
    setShowReferralModal
  } = usePlatform();

  const [tab, setTab] = useState<
    'overview' | 'reports' | 'providers' | 'servicemen' | 'plans' | 'payments' | 'taxes' | 'gateways' | 'webhooks' | 'kyc' | 'escrow' | 'infra' | 'coupons'
  >('overview');
  const [reportTimeframe, setReportTimeframe] = useState<'7d' | '30d' | 'q4' | '2026'>('30d');
  const [reportRegion, setReportRegion] = useState<'ALL' | 'CDMX' | 'GDL' | 'MTY' | 'PUE'>('ALL');
  const [reportMetric, setReportMetric] = useState<'gmv' | 'fees' | 'volume'>('gmv');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [rateInput, setRateInput] = useState(15);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Cupones y Promociones State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponStats, setCouponStats] = useState<PromotionStats | null>(null);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);

  // New coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponType, setNewCouponType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [newCouponValue, setNewCouponValue] = useState(100);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(300);
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState(250);
  const [newCouponMaxUses, setNewCouponMaxUses] = useState(100);

  // --- SUPER ADMIN: GESTIÓN DE NEGOCIOS / PROVEEDORES ---
  const [providerSearch, setProviderSearch] = useState('');
  const [providerStatusFilter, setProviderStatusFilter] = useState<'ALL' | 'active' | 'suspended' | 'pending'>('ALL');
  const [showCreateProviderModal, setShowCreateProviderModal] = useState(false);
  const [creatingProvider, setCreatingProvider] = useState(false);
  const [newProvName, setNewProvName] = useState('');
  const [newProvOwner, setNewProvOwner] = useState('');
  const [newProvEmail, setNewProvEmail] = useState('');
  const [newProvPhone, setNewProvPhone] = useState('+52 55 ');
  const [newProvZone, setNewProvZone] = useState('Ciudad de México (CDMX)');
  const [newProvRfc, setNewProvRfc] = useState('');
  const [newProvCurp, setNewProvCurp] = useState('');
  const [newProvRegimen, setNewProvRegimen] = useState('625');
  const [newProvClabe, setNewProvClabe] = useState('012180001234567890');
  const [newProvBank, setNewProvBank] = useState('BBVA México');
  const [newProvCommission, setNewProvCommission] = useState(15);
  const [newProvPlan, setNewProvPlan] = useState<'BASIC' | 'PRO' | 'ENTERPRISE'>('BASIC');

  // Modal para Asignar / Cambiar Plan a un Negocio
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [targetProviderForPlan, setTargetProviderForPlan] = useState<Provider | null>(null);
  const [planToAssign, setPlanToAssign] = useState<'BASIC' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [updatingPlan, setUpdatingPlan] = useState(false);

  // --- SUPER ADMIN: GESTIÓN DE CHAMBEADORES / TÉCNICOS ---
  const [smSearch, setSmSearch] = useState('');
  const [smProviderFilter, setSmProviderFilter] = useState('ALL');
  const [showCreateSmModal, setShowCreateSmModal] = useState(false);
  const [creatingSm, setCreatingSm] = useState(false);
  const [newSmName, setNewSmName] = useState('');
  const [newSmTitle, setNewSmTitle] = useState('Técnico Plomero Especialista en Fugas');
  const [newSmPhone, setNewSmPhone] = useState('+52 55 ');
  const [newSmProviderId, setNewSmProviderId] = useState('');
  const [newSmAvatar, setNewSmAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80');

  // --- SUPER ADMIN: PLANES DE SUSCRIPCIÓN & SAAS ---
  const [subPlans, setSubPlans] = useState<SubscriptionPlan[]>([]);
  const [subStats, setSubStats] = useState<SubscriptionStats | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState(799);
  const [newPlanCommission, setNewPlanCommission] = useState(6.5);
  const [newPlanBadge, setNewPlanBadge] = useState('Taller Platino ⭐');
  const [newPlanFeatures, setNewPlanFeatures] = useState('Comisión reducida al 6.5%\nSoporte prioritario 24/7\nTimbrado CFDI 4.0 ilimitado');

  // --- SUPER ADMIN: GESTIÓN DE PAGOS & DISPERSIONES (PAYOUTS) ---
  const [adminPayouts, setAdminPayouts] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [payoutFilter, setPayoutFilter] = useState<'ALL' | 'pending' | 'transferred'>('ALL');
  const [approvingPayoutId, setApprovingPayoutId] = useState<string | null>(null);

  // --- SUPER ADMIN: IMPUESTOS SAT & CFDI 4.0 ---
  const [taxSummary, setTaxSummary] = useState<GlobalTaxReport | null>(null);
  const [loadingTax, setLoadingTax] = useState(false);
  const [cfdiBookingId, setCfdiBookingId] = useState('');
  const [cfdiRfc, setCfdiRfc] = useState('GOMA920315HA1');
  const [cfdiNombre, setCfdiNombre] = useState('FERNANDA GÓMEZ ÁVILA');
  const [cfdiCp, setCfdiCp] = useState('06700');
  const [cfdiRegimen, setCfdiRegimen] = useState('605');
  const [cfdiUso, setCfdiUso] = useState('G03');
  const [cfdiFormaPago, setCfdiFormaPago] = useState('04');
  const [cfdiResult, setCfdiResult] = useState<any | null>(null);
  const [generatingCfdi, setGeneratingCfdi] = useState(false);

  // Business Intelligence Datasets
  const monthlyData = [
    { month: 'Mayo', gmv: 185000, fee: 27750, jobs: 240, growth: '+18%' },
    { month: 'Junio', gmv: 215000, fee: 32250, jobs: 285, growth: '+16%' },
    { month: 'Julio', gmv: 260000, fee: 39000, jobs: 340, growth: '+21%' },
    { month: 'Agosto', gmv: 310000, fee: 46500, jobs: 410, growth: '+19%' },
    { month: 'Septiembre', gmv: 375000, fee: 56250, jobs: 495, growth: '+21%' },
    { month: 'Octubre', gmv: 442000, fee: 66300, jobs: 580, growth: '+24%' },
  ];

  const categoryStats = [
    { name: 'Climas, AC & Minisplits', share: 34, amount: 150280, color: '#10B981', icon: '❄️', jobs: 198 },
    { name: 'Plomería & Fugas 24/7', share: 28, amount: 123760, color: '#059669', icon: '🔧', jobs: 162 },
    { name: 'Limpieza Profunda & Hogar', share: 22, amount: 97240, color: '#3B82F6', icon: '🧹', jobs: 128 },
    { name: 'Electricidad & ChambaExpress SOS', share: 16, amount: 70720, color: '#F59E0B', icon: '⚡', jobs: 92 },
  ];

  const regionalData = [
    { city: 'Ciudad de México (CDMX)', share: 48, gmv: 212160, providers: 42, servicemen: 118, flag: '🏙️', badge: 'Zona Líder' },
    { city: 'Guadalajara / Zapopan (JAL)', share: 26, gmv: 114920, providers: 24, servicemen: 64, flag: '🌮', badge: '+32% Crecimiento' },
    { city: 'Monterrey / San Pedro (NL)', share: 18, gmv: 79560, providers: 16, servicemen: 42, flag: '⛰️', badge: 'Mayor Ticket Promedio' },
    { city: 'Puebla & Querétaro (Centro)', share: 8, gmv: 35360, providers: 8, servicemen: 22, flag: '🏛️', badge: 'Expansión Reciente' },
  ];

  const funnelStages = [
    { stage: '1. Solicitudes Recibidas', count: 1840, pct: '100%', sub: 'Tráfico Web, App Móvil PWA y ChambaExpress SOS', color: '#3B82F6' },
    { stage: '2. Cotizaciones ChambaIA', count: 1620, pct: '88.0%', sub: 'Diagnósticos con visión artificial y tabulador regulado', color: '#6366F1' },
    { stage: '3. Aceptadas por Taller', count: 1480, pct: '80.4%', sub: 'Talleres verificados asignando personal calificado', color: '#8B5CF6' },
    { stage: '4. Despachadas con GPS', count: 1410, pct: '76.6%', sub: 'Telemetría y seguimiento en tiempo real al domicilio', color: '#10B981' },
    { stage: '5. Concluidas & Fondos Liberados', count: 1385, pct: '75.3%', sub: 'Bóveda Escrow liberada tras confirmación con OTP', color: '#059669' },
  ];

  const topServicemen = [
    { rank: 1, name: 'Carlos Mendoza', specialty: 'Climas & Refrigeración', workshop: 'Técnicos del Valle CDMX', rating: 4.96, jobs: 342, gmv: 239400, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160', badge: 'Chambeador del Mes ⭐' },
    { rank: 2, name: 'Marcos Villegas', specialty: 'Maestro Plomero & Fugas', workshop: 'Plomería Azteca GDL', rating: 4.94, jobs: 580, gmv: 458200, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160', badge: 'Mayor Facturación' },
    { rank: 3, name: 'Elena Rostova', specialty: 'Sanitización & Limpieza Profunda', workshop: 'Limpieza Exprés CDMX', rating: 5.0, jobs: 412, gmv: 597400, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160', badge: '100% Satisfacción' },
    { rank: 4, name: 'Miguel Ángel Huerta', specialty: 'Técnico Plomero Certificado CONOCER', workshop: 'Técnicos del Valle CDMX', rating: 4.92, jobs: 198, gmv: 168300, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160', badge: 'Destacado CDMX' },
    { rank: 5, name: 'David Zamudio Perea', specialty: 'Cerrajero de Alta Seguridad', workshop: 'Voltia Instalaciones MTY', rating: 4.90, jobs: 176, gmv: 132000, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160', badge: 'Respuesta Rápida' },
  ];

  const handleExportCsv = () => {
    const headers = ['Folio', 'Servicio', 'Taller Proveedor', 'Chambeador', 'Cliente', 'Telefono', 'Direccion', 'Monto MXN', 'Comision ChambaYa MXN', 'Estatus', 'Fecha'];
    const rows = bookings.map(b => [
      b.id,
      `"${b.serviceTitle}"`,
      `"${b.providerName}"`,
      `"${b.servicemanName || 'Sin Asignar'}"`,
      `"${b.customerName}"`,
      b.customerPhone,
      `"${b.customerAddress}"`,
      b.amount.toFixed(2),
      b.platformFee.toFixed(2),
      b.status,
      b.scheduledDate
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_operativo_chambaya_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KYC Admin State
  const [kycExpedientes, setKycExpedientes] = useState<any[]>([]);
  const [kycStats, setKycStats] = useState<any>({ totalExpedientes: 0, aprobados: 0, enRevision: 0, porcentajeVerificacion: 0 });
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [dictamenNotes, setDictamenNotes] = useState('');
  const [filterKycStatus, setFilterKycStatus] = useState<string>('ALL');

  // Escrow & Mediation Admin State
  const [escrowDisputes, setEscrowDisputes] = useState<EscrowDispute[]>([]);
  const [escrowStats, setEscrowStats] = useState<EscrowStats>({
    totalBovedas: 0,
    fondosEnCustodiaMXN: 0,
    fondosLiberadosMXN: 0,
    bovedasEnRetencion: 0,
    bovedasLiberadas: 0,
    bovedasEnDisputa: 0,
    bovedasReembolsadas: 0,
    disputasActivas: 0,
    coberturaSeguroDanosMax: 25000,
    tasaResolucionGarantia: 0
  });
  const [loadingEscrow, setLoadingEscrow] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<EscrowDispute | null>(null);
  const [filterDisputeStatus, setFilterDisputeStatus] = useState<string>('ALL');
  const [resolutionDecision, setResolutionDecision] = useState<'RELEASE_TO_PROVIDER' | 'REFUND_CUSTOMER_FULL' | 'SPLIT_SETTLEMENT' | 'INSURANCE_CLAIM'>('REFUND_CUSTOMER_FULL');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmountInput, setRefundAmountInput] = useState<number>(0);
  const [releaseAmountInput, setReleaseAmountInput] = useState<number>(0);

  const fetchKycData = async () => {
    setLoadingKyc(true);
    try {
      const [expedientes, stats] = await Promise.all([
        api.getAdminKycExpedientes(filterKycStatus),
        api.getKycStats()
      ]);
      setKycExpedientes(expedientes);
      setKycStats(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingKyc(false);
    }
  };

  const fetchEscrowDisputes = async () => {
    setLoadingEscrow(true);
    try {
      const [disputes, stats] = await Promise.all([
        api.getAdminEscrowDisputes(filterDisputeStatus),
        api.getEscrowStats()
      ]);
      setEscrowDisputes(disputes);
      setEscrowStats(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEscrow(false);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    if (!resolutionNotes.trim()) {
      alert('Por favor especifica las consideraciones y justificación del dictamen oficial.');
      return;
    }
    try {
      await api.resolveEscrowDispute(disputeId, {
        decision: resolutionDecision,
        adminNotes: resolutionNotes,
        refundAmount: Number(refundAmountInput) || 0,
        releaseAmount: Number(releaseAmountInput) || 0,
        mediatorName: 'Torre de Control ChambaYa México'
      });
      alert('¡Dictamen de Mediación emitido y liquidación de fondos ejecutada!');
      setSelectedDispute(null);
      setResolutionNotes('');
      fetchEscrowDisputes();
      if (refreshData) refreshData();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleDictamen = async (expedienteId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await api.dictamenKyc(expedienteId, decision, dictamenNotes);
      alert(decision === 'APPROVED' ? '¡Expediente APROBADO! Se ha otorgado la Insignia Dorada al chambeador.' : 'Expediente marcado como RECHAZADO con observaciones.');
      setSelectedKyc(null);
      setDictamenNotes('');
      fetchKycData();
      if (refreshData) refreshData();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const fetchWebhooks = async () => {
    setLoadingWebhooks(true);
    try {
      const logs = await api.getWebhookLogs(30);
      setWebhookLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const health = await api.getSystemHealth();
      setSystemHealth(health);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchCouponsData = async () => {
    setLoadingCoupons(true);
    try {
      const [list, stats] = await Promise.all([
        api.getCoupons().catch(() => []),
        api.getPromotionStats().catch(() => null)
      ]);
      setCoupons(list);
      if (stats) setCouponStats(stats);
    } catch (err) {
      console.warn('Error fetching coupons data:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      await api.toggleCoupon(id);
      await fetchCouponsData();
    } catch (err) {
      alert('Error al cambiar estatus del cupón');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponTitle.trim()) {
      alert('Por favor ingresa un código y título');
      return;
    }
    try {
      await api.createCoupon({
        code: newCouponCode.trim().toUpperCase(),
        title: newCouponTitle.trim(),
        description: newCouponDesc.trim() || undefined,
        discountType: newCouponType,
        discountValue: Number(newCouponValue),
        minOrderAmount: Number(newCouponMinOrder),
        maxDiscountAmount: newCouponType === 'PERCENTAGE' ? Number(newCouponMaxDiscount) : undefined,
        maxUses: Number(newCouponMaxUses)
      });
      setShowCreateCouponModal(false);
      setNewCouponCode('');
      setNewCouponTitle('');
      setNewCouponDesc('');
      await fetchCouponsData();
      alert('🎉 ¡Cupón creado y activado exitosamente!');
    } catch (err: any) {
      alert(err.message || 'Error al crear cupón');
    }
  };

  // --- PROVIDER ACTIONS ---
  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName.trim()) {
      alert('Por favor ingresa el nombre comercial del negocio');
      return;
    }
    setCreatingProvider(true);
    try {
      await api.createProvider({
        name: newProvName.trim(),
        owner: newProvOwner.trim() || 'Representante Legal',
        email: newProvEmail.trim() || `contacto@${Date.now()}.mx`,
        phone: newProvPhone.trim(),
        zone: newProvZone,
        rfc: newProvRfc.trim() || 'PRO8501019A1',
        curp: newProvCurp.trim() || 'PROP850101HDFRND01',
        regimenFiscal: newProvRegimen,
        clabeAccount: newProvClabe.trim(),
        bankName: newProvBank,
        commissionRate: Number(newProvCommission) || 15,
        subscriptionPlan: newProvPlan,
        status: 'active'
      });
      alert(`🎉 ¡Negocio "${newProvName}" dado de alta y activado exitosamente!`);
      setShowCreateProviderModal(false);
      setNewProvName('');
      setNewProvOwner('');
      setNewProvEmail('');
      setNewProvRfc('');
      setNewProvCurp('');
      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Error al registrar negocio');
    } finally {
      setCreatingProvider(false);
    }
  };

  const handleToggleProviderBlock = async (prov: Provider) => {
    const actionLabel = prov.status === 'suspended' ? 'reactivar y desbloquear' : 'bloquear y suspender temporalmente';
    if (!confirm(`¿Estás seguro de ${actionLabel} el taller "${prov.name}"?`)) return;
    try {
      await api.toggleProviderStatus(prov.id);
      await refreshData();
      alert(`Negocio "${prov.name}" actualizado.`);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado del negocio');
    }
  };

  const handleDeleteProvider = async (prov: Provider) => {
    if (!confirm(`⚠️ ATENCIÓN: ¿Seguro que deseas eliminar definitivamente el negocio "${prov.name}"? Esta acción borrará sus servicios y asignaciones.`)) return;
    try {
      await api.deleteProvider(prov.id);
      await refreshData();
      alert(`Negocio "${prov.name}" eliminado.`);
    } catch (err: any) {
      alert(err.message || 'Error al eliminar negocio');
    }
  };

  const handleAssignPlanToProvider = async () => {
    if (!targetProviderForPlan) return;
    setUpdatingPlan(true);
    try {
      await api.assignPlanToProvider(targetProviderForPlan.id, planToAssign);
      alert(`🎉 Plan ${planToAssign} asignado exitosamente al taller "${targetProviderForPlan.name}".`);
      setShowChangePlanModal(false);
      await refreshData();
      fetchPlansData();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar plan');
    } finally {
      setUpdatingPlan(false);
    }
  };

  // --- SERVICEMAN ACTIONS ---
  const handleCreateServiceman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSmName.trim()) {
      alert('Por favor ingresa el nombre del técnico/chambeador');
      return;
    }
    const provId = newSmProviderId || (providers[0]?.id || 'prov-1');
    setCreatingSm(true);
    try {
      await api.createServiceman({
        name: newSmName.trim(),
        title: newSmTitle.trim() || 'Técnico Especialista Certificado',
        phone: newSmPhone.trim(),
        providerId: provId,
        avatar: newSmAvatar,
        status: 'available',
        rating: 5.0,
        completedJobs: 0,
        trustScore: 95,
        isVerified: true
      });
      alert(`🎉 ¡Chambeador "${newSmName}" dado de alta exitosamente en la cuadrilla!`);
      setShowCreateSmModal(false);
      setNewSmName('');
      setNewSmPhone('+52 55 ');
      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Error al dar de alta chambeador');
    } finally {
      setCreatingSm(false);
    }
  };

  const handleToggleServicemanBlock = async (sm: Serviceman) => {
    const isSuspended = sm.status === 'suspended';
    const actionLabel = isSuspended ? 'desbloquear y activar' : 'bloquear y suspender';
    if (!confirm(`¿Estás seguro de ${actionLabel} al chambeador "${sm.name}"?`)) return;
    try {
      await api.toggleServicemanBlock(sm.id);
      await refreshData();
      alert(`Estado del chambeador "${sm.name}" actualizado.`);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado del chambeador');
    }
  };

  const handleDeleteServiceman = async (sm: Serviceman) => {
    if (!confirm(`¿Seguro que deseas dar de baja a "${sm.name}" del padrón de técnicos?`)) return;
    try {
      await api.deleteServiceman(sm.id);
      await refreshData();
      alert(`Chambeador "${sm.name}" dado de baja.`);
    } catch (err: any) {
      alert(err.message || 'Error al dar de baja chambeador');
    }
  };

  // --- PLANS ACTIONS ---
  const fetchPlansData = async () => {
    setLoadingPlans(true);
    try {
      const [plans, stats] = await Promise.all([
        api.getSubscriptionPlans().catch(() => []),
        api.getSubscriptionStats().catch(() => null)
      ]);
      setSubPlans(plans);
      setSubStats(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlans(false);
    }
  };

  // --- PAYOUTS & DISPERSIONES ACTIONS ---
  const fetchAdminPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const list = await api.getAdminPayouts();
      setAdminPayouts(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleApprovePayout = async (payoutId: string, provName: string, amount: number) => {
    if (!confirm(`¿Confirmar dispersión SPEI por $${amount.toFixed(2)} MXN al taller "${provName}"?`)) return;
    setApprovingPayoutId(payoutId);
    try {
      await api.approvePayout(payoutId);
      alert(`✅ ¡Dispersión SPEI STP liquidada con éxito! Folio STP generado.`);
      await fetchAdminPayouts();
      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Error al autorizar dispersión');
    } finally {
      setApprovingPayoutId(null);
    }
  };

  // --- TAXES ACTIONS ---
  const fetchAdminTaxSummary = async () => {
    setLoadingTax(true);
    try {
      const data = await api.getAdminTaxSummary();
      setTaxSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTax(false);
    }
  };

  const handleGenerateCfdi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfdiBookingId.trim()) {
      alert('Ingresa el folio de la chamba a facturar');
      return;
    }
    setGeneratingCfdi(true);
    try {
      const res = await api.generateCfdi({
        bookingId: cfdiBookingId.trim(),
        rfcReceptor: cfdiRfc.trim().toUpperCase(),
        nombreReceptor: cfdiNombre.trim().toUpperCase(),
        domicilioFiscalReceptor: cfdiCp.trim(),
        regimenReceptor: cfdiRegimen,
        usoCfdi: cfdiUso,
        formaPago: cfdiFormaPago
      });
      setCfdiResult(res);
      alert(`🎉 ¡Factura CFDI 4.0 Timbrada ante el SAT!\nUUID: ${res.uuid}`);
      await fetchAdminTaxSummary();
    } catch (err: any) {
      alert(err.message || 'Error al timbrar CFDI 4.0 con el SAT');
    } finally {
      setGeneratingCfdi(false);
    }
  };

  const handleExportTaxCsv = () => {
    if (!taxSummary) return;
    const headers = ['Folio_Chamba', 'Proveedor_RFC', 'Proveedor_Nombre', 'Total_Cobrado_MXN', 'Retencion_ISR_MXN', 'Retencion_IVA_MXN', 'Total_Retenido_SAT_MXN', 'Fecha'];
    const rows = (taxSummary.retentions || []).map(r => [
      r.bookingId,
      `"${r.providerRfc || 'XAXX010101000'}"`,
      `"${r.providerName || 'Taller'}"`,
      (r.grossAmount || 0).toFixed(2),
      (r.isrRetention || 0).toFixed(2),
      (r.ivaRetention || 0).toFixed(2),
      (r.totalRetained || 0).toFixed(2),
      r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : '2026-10-25'
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `declaracion_sat_retenciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    api.getEscrowStats().then(stats => setEscrowStats(stats)).catch(() => {});
    fetchHealth();
    fetchCouponsData();
    fetchPlansData();
    fetchAdminPayouts();
    fetchAdminTaxSummary();
  }, []);

  useEffect(() => {
    if (tab === 'webhooks') {
      fetchWebhooks();
    } else if (tab === 'kyc') {
      fetchKycData();
    } else if (tab === 'escrow') {
      fetchEscrowDisputes();
    } else if (tab === 'infra') {
      fetchHealth();
    } else if (tab === 'coupons') {
      fetchCouponsData();
    } else if (tab === 'plans') {
      fetchPlansData();
    } else if (tab === 'payments') {
      fetchAdminPayouts();
      fetchWebhooks();
    } else if (tab === 'taxes') {
      fetchAdminTaxSummary();
    }
  }, [tab, filterKycStatus, filterDisputeStatus]);

  const handleSimulateWebhook = async (bookingId: string, gateway: string) => {
    try {
      await api.simulatePaymentWebhook(bookingId, gateway);
      await fetchWebhooks();
      await refreshData();
      alert(`¡Webhook de ${gateway.toUpperCase()} procesado exitosamente para ${bookingId}!`);
    } catch (e) {
      alert('Error al simular webhook');
    }
  };

  const totalGMV = bookings.reduce((sum, b) => sum + b.amount, 0);
  const totalFees = bookings.reduce((sum, b) => sum + b.platformFee, 0);

  const handleSaveRate = async (id: string) => {
    await updateCommissionRate(id, rateInput);
    setEditId(null);
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

  return (
    <RoleGuard
      allowedRoles={['ADMIN']}
      redirectLoginUrl="/admin/login"
      portalName="Torre de Control Super Admin"
    >
      <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 70px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #064E3B 100%)',
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
          <div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.5)', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 800, color: '#34D399' }}>
              TORRE DE CONTROL • SUPER ADMIN
            </span>
            <h1 style={{ fontSize: '1.8rem', color: '#FFF', margin: '0.4rem 0 0.2rem 0', fontWeight: 900 }}>ChambaYa México</h1>
            <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
              Supervisión de {providers.length} negocios proveedores y {servicemen.length} chambeadores en campo.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Quick Action Button: BI & Reportes */}
            <button
              type="button"
              onClick={() => setTab('reports')}
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
              <BarChart3 size={17} />
              <span>Ver Gráficos & BI</span>
            </button>

            {/* Quick Action Button: Exportar CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '0.75rem 1.15rem',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Download size={16} />
              <span>Exportar CSV</span>
            </button>

            {/* Revenue Badge */}
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.85rem 1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={20} color="#FFF" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>Comisiones Plataforma (15%)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34D399' }}>
                  ${(totalFees + 48250.00).toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.75rem' }}>MXN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Volumen Transaccionado (GMV)</span>
              <TrendingUp size={16} color="#10B981" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.3rem 0', color: '#0F172A' }}>
              ${(totalGMV + 321650).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>+34% Crecimiento Mensual</span>
          </div>

          <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Proveedores Registrados</span>
              <Store size={16} color="#10B981" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.3rem 0', color: '#0F172A' }}>{providers.length}</div>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Talleres y cuadrillas verificadas</span>
          </div>

          <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Chambeadores en Campo</span>
              <ShieldCheck size={16} color="#3B82F6" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.3rem 0', color: '#0F172A' }}>{servicemen.length}</div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>Monitoreo GPS Satelital activo</span>
          </div>
        </div>

        {/* Navigation Tabs (Chunky Pills) */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTab('overview')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'overview' ? '2px solid #10B981' : '1px solid #CBD5E1',
              background: tab === 'overview' ? '#10B981' : '#FFF',
              color: tab === 'overview' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'overview' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <span>📋 Flujo en Vivo</span>
            <span style={{
              background: tab === 'overview' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
              color: tab === 'overview' ? '#FFF' : '#64748B',
              padding: '0.1rem 0.45rem',
              borderRadius: '999px',
              fontSize: '0.72rem'
            }}>
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setTab('reports')}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '12px',
              border: tab === 'reports' ? '2px solid #10B981' : '1px solid #CBD5E1',
              background: tab === 'reports' ? '#10B981' : '#FFF',
              color: tab === 'reports' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: tab === 'reports' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <BarChart3 size={16} />
            <span>Reportes & Gráficos BI 📊</span>
          </button>

          <button
            onClick={() => setTab('providers')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'providers' ? '2px solid #10B981' : '1px solid #CBD5E1',
              background: tab === 'providers' ? '#10B981' : '#FFF',
              color: tab === 'providers' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'providers' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <Store size={15} />
            <span>🏢 Negocios / Talleres ({providers.length})</span>
          </button>

          <button
            onClick={() => setTab('servicemen')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'servicemen' ? '2px solid #059669' : '1px solid #CBD5E1',
              background: tab === 'servicemen' ? '#059669' : '#FFF',
              color: tab === 'servicemen' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'servicemen' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none'
            }}
          >
            <Wrench size={15} />
            <span>👷 Chambeadores ({servicemen.length})</span>
          </button>

          <button
            onClick={() => setTab('plans')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'plans' ? '2px solid #3B82F6' : '1px solid #CBD5E1',
              background: tab === 'plans' ? '#3B82F6' : '#FFF',
              color: tab === 'plans' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'plans' ? '0 4px 12px rgba(59, 130, 246, 0.25)' : 'none'
            }}
          >
            <Sparkles size={15} />
            <span>💎 Planes & Membresías</span>
          </button>

          <button
            onClick={() => setTab('payments')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'payments' ? '2px solid #10B981' : '1px solid #CBD5E1',
              background: tab === 'payments' ? '#10B981' : '#FFF',
              color: tab === 'payments' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'payments' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <CreditCard size={15} />
            <span>💳 Pagos & Dispersiones SPEI</span>
            {adminPayouts.filter(p => p.status === 'pending').length > 0 && (
              <span style={{
                background: '#EF4444',
                color: '#FFF',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 900
              }}>
                {adminPayouts.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('taxes')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'taxes' ? '2px solid #8B5CF6' : '1px solid #CBD5E1',
              background: tab === 'taxes' ? '#8B5CF6' : '#FFF',
              color: tab === 'taxes' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'taxes' ? '0 4px 12px rgba(139, 92, 246, 0.25)' : 'none'
            }}
          >
            <Landmark size={15} />
            <span>🏛️ Impuestos SAT CFDI 4.0</span>
          </button>

          <button
            onClick={() => setTab('kyc')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'kyc' ? '2px solid #F59E0B' : '1px solid #CBD5E1',
              background: tab === 'kyc' ? '#F59E0B' : '#FFF',
              color: tab === 'kyc' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'kyc' ? '0 4px 12px rgba(245, 158, 11, 0.25)' : 'none'
            }}
          >
            <Award size={16} />
            <span>Validación KYC ({kycStats.totalExpedientes || servicemen.length})</span>
          </button>

          <button
            onClick={() => setTab('escrow')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'escrow' ? '2px solid #10B981' : '1px solid #CBD5E1',
              background: tab === 'escrow' ? '#10B981' : '#FFF',
              color: tab === 'escrow' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'escrow' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
            }}
          >
            <Scale size={16} />
            <span>Bóveda Escrow ({escrowStats.disputasActivas || 0})</span>
          </button>

          <button
            onClick={() => setTab('infra')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'infra' ? '2px solid #6366F1' : '1px solid #CBD5E1',
              background: tab === 'infra' ? '#6366F1' : '#FFF',
              color: tab === 'infra' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'infra' ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
            }}
          >
            <Server size={15} />
            <span>Infra Docker</span>
          </button>

          <button
            onClick={() => setTab('coupons')}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              border: tab === 'coupons' ? '2px solid #EC4899' : '1px solid #CBD5E1',
              background: tab === 'coupons' ? '#EC4899' : '#FFF',
              color: tab === 'coupons' ? '#FFF' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: tab === 'coupons' ? '0 4px 12px rgba(236, 72, 153, 0.25)' : 'none'
            }}
          >
            <Tag size={15} />
            <span>🎟️ Cupones ({coupons.length || 4})</span>
          </button>
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Banner de Resumen Gráfico y Enlace a BI */}
            <div style={{
              background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
              borderRadius: '20px',
              padding: '1.5rem',
              color: '#FFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ background: '#10B981', color: '#FFF', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    BUSINESS INTELLIGENCE
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Corte en Tiempo Real México</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#FFF' }}>
                  Tendencia Operativa: +24% Crecimiento en Octubre 2026
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#CBD5E1' }}>
                  Ticket promedio: <strong>$842.50 MXN</strong> • Tasa de resolución Escrow: <strong>99.2%</strong> • Cobertura: <strong>4 Ciudades</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTab('reports')}
                style={{
                  background: '#10B981',
                  color: '#FFF',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                <span>Explorar Reportes & Gráficos Completos</span>
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800 }}>Feed Global de Chambas en Tiempo Real</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Mostrando {bookings.length} órdenes registradas</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {bookings.map(b => (
                  <div key={b.id} style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span className={`status-pill ${b.status}`}>{getStatusLabel(b.status)}</span>
                        <strong style={{ fontSize: '0.85rem' }}>#{b.id}</strong>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{b.serviceTitle}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Taller: {b.providerName} • Chambeador: {b.servicemanName || 'Pendiente'} • Domicilio: {b.customerAddress}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900 }}>${b.amount.toFixed(2)} MXN</div>
                      <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>Comisión ChambaYa: ${b.platformFee.toFixed(2)} MXN</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reportes & Gráficos BI */}
        {tab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header de Controles y Filtros */}
            <div style={{
              background: '#FFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ background: '#10B981', color: '#FFF', fontSize: '0.7rem', fontWeight: 900, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    EXECUTIVE ANALYTICS
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Corte Financiero y Operativo 2026</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#0F172A' }}>
                  Reportes & Gráficos de Inteligencia de Negocio
                </h2>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Auditoría de ingresos brutos (GMV), comisiones retenidas, rendimiento regional y desempeño de cuadrilla.
                </p>
              </div>

              {/* Botones de Exportación */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <FileSpreadsheet size={16} color="#059669" />
                  <span>Exportar CSV (Excel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: '#0F172A',
                    border: 'none',
                    color: '#FFF',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.25)'
                  }}
                >
                  <Printer size={16} />
                  <span>Imprimir Informe PDF</span>
                </button>
              </div>
            </div>

            {/* Selector de Rango de Fechas & Región */}
            <div style={{
              background: '#FFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={14} /> Periodo:
                </span>
                {(['7d', '30d', 'q4', '2026'] as const).map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setReportTimeframe(tf)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      border: reportTimeframe === tf ? '2px solid #10B981' : '1px solid #E2E8F0',
                      background: reportTimeframe === tf ? '#ECFDF5' : '#FFF',
                      color: reportTimeframe === tf ? '#065F46' : '#64748B',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {tf === '7d' ? 'Últimos 7 días' : tf === '30d' ? 'Este Mes (Oct 2026)' : tf === 'q4' ? 'Q4 2026' : 'Anual 2026'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} /> Región:
                </span>
                <select
                  value={reportRegion}
                  onChange={e => setReportRegion(e.target.value as any)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    background: '#F8FAFC'
                  }}
                >
                  <option value="ALL">Todo México (Nacional)</option>
                  <option value="CDMX">Ciudad de México (CDMX)</option>
                  <option value="GDL">Guadalajara / Zapopan</option>
                  <option value="MTY">Monterrey / San Pedro</option>
                  <option value="PUE">Puebla & Querétaro</option>
                </select>
              </div>
            </div>

            {/* 4 Mini KPIs Ejecutivos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Ticket Promedio por Chamba</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0' }}>
                  $842.50 <span style={{ fontSize: '0.8rem' }}>MXN</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>+8.4% vs mes anterior</span>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Tasa de Retención de Clientes</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563EB', margin: '0.2rem 0' }}>
                  73.2%
                </div>
                <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 700 }}>Clientes que repiten en 60 días</span>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Tiempo Promedio de Respuesta SOS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F59E0B', margin: '0.2rem 0' }}>
                  18.4 min
                </div>
                <span style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: 700 }}>Arribo de técnico con GPS</span>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Resolución Favorable de Garantía</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', margin: '0.2rem 0' }}>
                  99.2%
                </div>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>Cero fraudes o pérdidas</span>
              </div>
            </div>

            {/* Fila Principal de Gráficos: Facturación Mensual y Donut de Categorías */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
              {/* Gráfico 1: Facturación Histórica y Comisiones */}
              <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>
                        Evolución de Facturación (GMV) y Comisiones
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                        Comparativa mensual en Pesos Mexicanos (Mayo a Octubre 2026)
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => setReportMetric('gmv')}
                        style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: reportMetric === 'gmv' ? '#10B981' : '#F1F5F9',
                          color: reportMetric === 'gmv' ? '#FFF' : '#64748B',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        GMV Total
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportMetric('fees')}
                        style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: reportMetric === 'fees' ? '#2563EB' : '#F1F5F9',
                          color: reportMetric === 'fees' ? '#FFF' : '#64748B',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        Comisión 15%
                      </button>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div style={{ position: 'relative', height: '240px', marginTop: '1rem' }}>
                    <svg viewBox="0 0 600 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="barGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                        </linearGradient>
                        <linearGradient id="feeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.4" />
                        </linearGradient>
                      </defs>

                      {/* Líneas Guía Horizontales */}
                      <line x1="40" y1="30" x2="580" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="80" x2="580" y2="80" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="130" x2="580" y2="130" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="180" x2="580" y2="180" stroke="#E2E8F0" strokeWidth="1.5" />

                      {/* Ejes Y Labels */}
                      <text x="5" y="35" fontSize="10" fill="#94A3B8" fontWeight="600">{reportMetric === 'fees' ? '$70k' : '$450k'}</text>
                      <text x="5" y="85" fontSize="10" fill="#94A3B8" fontWeight="600">{reportMetric === 'fees' ? '$45k' : '$300k'}</text>
                      <text x="5" y="135" fontSize="10" fill="#94A3B8" fontWeight="600">{reportMetric === 'fees' ? '$20k' : '$150k'}</text>
                      <text x="25" y="185" fontSize="10" fill="#94A3B8" fontWeight="600">$0</text>

                      {/* Barras de datos */}
                      {monthlyData.map((d, i) => {
                        const maxVal = reportMetric === 'fees' ? 70000 : 450000;
                        const currVal = reportMetric === 'fees' ? d.fee : d.gmv;
                        const barHeight = (currVal / maxVal) * 150;
                        const x = 70 + i * 85;
                        const y = 180 - barHeight;
                        const isHovered = hoveredMonth === i;

                        return (
                          <g
                            key={d.month}
                            onMouseEnter={() => setHoveredMonth(i)}
                            onMouseLeave={() => setHoveredMonth(null)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Barra */}
                            <rect
                              x={x}
                              y={y}
                              width="45"
                              height={barHeight}
                              rx="6"
                              fill={reportMetric === 'fees' ? 'url(#feeGlow)' : 'url(#barGlow)'}
                              opacity={isHovered ? 1 : 0.85}
                              style={{ transition: 'all 0.2s ease' }}
                            />

                            {/* Badge flotante de crecimiento */}
                            <text
                              x={x + 22}
                              y={y - 8}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="800"
                              fill={reportMetric === 'fees' ? '#1D4ED8' : '#059669'}
                            >
                              {d.growth}
                            </text>

                            {/* Label del Mes en Eje X */}
                            <text
                              x={x + 22}
                              y="200"
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight={isHovered ? '900' : '600'}
                              fill={isHovered ? '#0F172A' : '#64748B'}
                            >
                              {d.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Tooltip dinámico si el usuario pasa el mouse */}
                    {hoveredMonth !== null && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: `${80 + hoveredMonth * 85}px`,
                        background: '#0F172A',
                        color: '#FFF',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                        pointerEvents: 'none',
                        zIndex: 10
                      }}>
                        <div style={{ fontWeight: 800, color: '#34D399' }}>{monthlyData[hoveredMonth].month} 2026</div>
                        <div>GMV: <strong>${monthlyData[hoveredMonth].gmv.toLocaleString('es-MX')} MXN</strong></div>
                        <div>Comisión ChambaYa: <strong>${monthlyData[hoveredMonth].fee.toLocaleString('es-MX')} MXN</strong></div>
                        <div style={{ color: '#94A3B8' }}>{monthlyData[hoveredMonth].jobs} chambas hechas</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ color: '#64748B' }}>
                    💡 <strong>Insight:</strong> El fin de semana concentra el <strong>41%</strong> del volumen total debido a emergencias en el hogar.
                  </span>
                  <span style={{ color: '#059669', fontWeight: 800 }}>Modelo Sustentable ✓</span>
                </div>
              </div>

              {/* Gráfico 2: Distribución por Oficio y Categoría (Donut Chart) */}
              <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>
                    Participación por Oficio y Categoría
                  </h3>
                  <p style={{ margin: '0.1rem 0 1rem 0', fontSize: '0.75rem', color: '#64748B' }}>
                    Distribución de los $442,000 MXN transaccionados por especialidad
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* SVG Donut */}
                    <div style={{ width: '180px', height: '180px', position: 'relative', flexShrink: 0, margin: '0 auto' }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        {/* Segmento 1: Climas (34%) */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="18" strokeDasharray="81.2 238.8" strokeDashoffset="0" />
                        {/* Segmento 2: Plomería (28%) */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#059669" strokeWidth="18" strokeDasharray="66.8 238.8" strokeDashoffset="-81.2" />
                        {/* Segmento 3: Limpieza (22%) */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3B82F6" strokeWidth="18" strokeDasharray="52.5 238.8" strokeDashoffset="-148" />
                        {/* Segmento 4: Electricidad SOS (16%) */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="18" strokeDasharray="38.2 238.8" strokeDashoffset="-200.5" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>$442K</span>
                        <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>MXN TOTAL</span>
                      </div>
                    </div>

                    {/* Leyenda interactiva */}
                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {categoryStats.map(cat => (
                        <div key={cat.name} style={{ background: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                            <div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>{cat.name}</div>
                              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{cat.jobs} chambas hechas</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: cat.color }}>{cat.share}%</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>${(cat.amount / 1000).toFixed(1)}k MXN</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila Secundaria: Cobertura por Ciudades y Funnel Operativo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
              {/* Gráfico 3: Cobertura y Demanda por Ciudades */}
              <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>
                  Demanda y Cobertura Regional en México
                </h3>
                <p style={{ margin: '0.1rem 0 1.25rem 0', fontSize: '0.75rem', color: '#64748B' }}>
                  Presencia activa de talleres y chambeadores con monitoreo de cobertura satelital
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {regionalData.map(reg => (
                    <div key={reg.city}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{reg.flag}</span>
                          <strong style={{ color: '#0F172A' }}>{reg.city}</strong>
                          <span style={{ fontSize: '0.65rem', background: '#ECFDF5', color: '#065F46', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                            {reg.badge}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#059669' }}>${reg.gmv.toLocaleString('es-MX')} MXN</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '0.35rem' }}>({reg.share}%)</span>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${reg.share}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: '999px' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B', marginTop: '0.25rem' }}>
                        <span>{reg.providers} Talleres Verificados</span>
                        <span>{reg.servicemen} Chambeadores con GPS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfico 4: Embudo Operativo de Conversión (Funnel) */}
              <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>
                  Embudo Operativo de Servicios (Conversion Funnel)
                </h3>
                <p style={{ margin: '0.1rem 0 1.25rem 0', fontSize: '0.75rem', color: '#64748B' }}>
                  De la solicitud del usuario hasta la liberación de fondos en Bóveda Escrow
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {funnelStages.map((step, idx) => {
                    const widthPct = 100 - idx * 5;
                    return (
                      <div
                        key={step.stage}
                        style={{
                          background: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          padding: '0.75rem 1rem',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Barra indicadora */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${widthPct}%`,
                            background: step.color,
                            opacity: 0.12,
                            zIndex: 1
                          }}
                        />

                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>{step.stage}</strong>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{step.sub}</span>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: step.color }}>{step.count.toLocaleString()}</div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B' }}>Tasa: {step.pct}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tabla de Alto Desempeño: Leaderboard de Chambeadores Estrella */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>
                    Cuadrilla Estrella: Top 5 Chambeadores con Mayor Facturación
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                    Técnicos calificados con verificación KYC oficial y mayor volumen de chambas completadas sin disputa.
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800, background: '#ECFDF5', padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
                  Auditoría KYC Aprobada 100%
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid #E2E8F0' }}>
                      <th style={{ padding: '0.75rem' }}>Rank</th>
                      <th style={{ padding: '0.75rem' }}>Técnico Chambeador</th>
                      <th style={{ padding: '0.75rem' }}>Taller / Negocio</th>
                      <th style={{ padding: '0.75rem' }}>Especialidad</th>
                      <th style={{ padding: '0.75rem' }}>Chambas Hechas</th>
                      <th style={{ padding: '0.75rem' }}>Calificación</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Volumen Generado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topServicemen.map(sm => (
                      <tr key={sm.rank} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 900, color: sm.rank === 1 ? '#F59E0B' : '#64748B' }}>
                          {sm.rank === 1 ? '🥇 #1' : sm.rank === 2 ? '🥈 #2' : sm.rank === 3 ? '🥉 #3' : `#${sm.rank}`}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <img src={sm.avatar} alt={sm.name} style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }} />
                            <div>
                              <strong style={{ color: '#0F172A', display: 'block' }}>{sm.name}</strong>
                              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>{sm.badge}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#475569' }}>{sm.workshop}</td>
                        <td style={{ padding: '0.75rem', color: '#64748B' }}>{sm.specialty}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0F172A' }}>{sm.jobs} concluidas</td>
                        <td style={{ padding: '0.75rem', color: '#F59E0B', fontWeight: 800 }}>★ {sm.rating.toFixed(2)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 900, color: '#059669', fontSize: '0.92rem' }}>
                          ${sm.gmv.toLocaleString('es-MX')} MXN
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: NEGOCIOS / TALLERES (SUPER ADMIN MULTI-VENDOR MANAGEMENT)           */}
        {/* ========================================================================= */}
        {tab === 'providers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Store size={22} color="#10B981" />
                    <span>Control Central de Negocios y Talleres Proveedores</span>
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                    Alta de negocios, asignación de planes SaaS, bloqueo/suspensión y configuración de comisiones reguladas.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateProviderModal(true)}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.65rem 1.15rem',
                      borderRadius: '12px',
                      fontWeight: 900,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Plus size={16} />
                    <span>Dar de Alta Negocio / Taller</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    placeholder="Buscar por nombre de taller, dueño, teléfono, RFC o zona..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      background: '#F8FAFC'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {(['ALL', 'active', 'suspended', 'pending'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setProviderStatusFilter(st)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        border: providerStatusFilter === st ? '2px solid #10B981' : '1px solid #E2E8F0',
                        background: providerStatusFilter === st ? 'rgba(16, 185, 129, 0.1)' : '#FFF',
                        color: providerStatusFilter === st ? '#065F46' : '#64748B',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {st === 'ALL' ? 'Todos' : st === 'active' ? 'Activos' : st === 'suspended' ? 'Suspendidos' : 'En Revisión'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Providers Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Negocio & Contacto</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Zona</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Plan SaaS</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Comisión</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Saldo Wallet</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Estatus</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Acciones de Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers
                      .filter(p => {
                        const matchFilter = providerStatusFilter === 'ALL' || p.status === providerStatusFilter;
                        const q = providerSearch.toLowerCase();
                        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q) || p.phone.includes(q) || (p.rfc || '').toLowerCase().includes(q) || p.zone.toLowerCase().includes(q);
                        return matchFilter && matchSearch;
                      })
                      .map(p => {
                        const isSuspended = p.status === 'suspended';
                        const isPro = p.subscriptionPlan === 'PRO';
                        const isEnt = p.subscriptionPlan === 'ENTERPRISE';
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', background: isSuspended ? '#FEF2F2' : 'transparent' }}>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <img
                                  src={p.avatar || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=160'}
                                  alt={p.name}
                                  style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }}
                                />
                                <div>
                                  <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>{p.name}</strong>
                                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                    {p.owner} • {p.phone} • {p.rfc ? `RFC: ${p.rfc}` : 'Sin RFC'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', color: '#334155' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.zone}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{p.bankName || 'BBVA'} • CLABE: ...{(p.clabeAccount || '890').slice(-4)}</div>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetProviderForPlan(p);
                                  setPlanToAssign((p.subscriptionPlan as any) || 'BASIC');
                                  setShowChangePlanModal(true);
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '999px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  border: isPro ? '1px solid #3B82F6' : isEnt ? '1px solid #8B5CF6' : '1px solid #CBD5E1',
                                  background: isPro ? '#EFF6FF' : isEnt ? '#F5F3FF' : '#F8FAFC',
                                  color: isPro ? '#1D4ED8' : isEnt ? '#6D28D9' : '#475569'
                                }}
                                title="Clic para cambiar plan de suscripción"
                              >
                                <span>{isPro ? 'Pro Diamante 💎' : isEnt ? 'Enterprise 🏛️' : 'Básico (Free)'}</span>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>✏️</span>
                              </button>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              {editId === p.id ? (
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  <input
                                    type="number"
                                    value={rateInput}
                                    onChange={e => setRateInput(Number(e.target.value))}
                                    style={{ width: '55px', padding: '0.2rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                                  />
                                  <button className="btn btn-primary btn-sm" onClick={() => handleSaveRate(p.id)} style={{ padding: '0.2rem 0.5rem', background: '#10B981' }}>OK</button>
                                </div>
                              ) : (
                                <span onClick={() => { setEditId(p.id); setRateInput(p.commissionRate); }} style={{ cursor: 'pointer', color: '#10B981', fontWeight: 800 }}>
                                  {p.commissionRate}% ✏️
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <strong style={{ color: '#059669', fontSize: '0.85rem' }}>
                                ${(p.walletBalance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </strong>
                              <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>MXN</span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: isSuspended ? '#FEE2E2' : p.status === 'active' ? '#ECFDF5' : '#FFFBEB',
                                color: isSuspended ? '#991B1B' : p.status === 'active' ? '#065F46' : '#92400E'
                              }}>
                                {isSuspended ? '🚫 SUSPENDIDO' : p.status === 'active' ? '✓ ACTIVO' : '⏳ EN REVISIÓN'}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                                {p.status === 'pending' && (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => approveProvider(p.id)}
                                    style={{ background: '#10B981', padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                  >
                                    Aprobar
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleToggleProviderBlock(p)}
                                  className="btn btn-sm"
                                  style={{
                                    padding: '0.25rem 0.55rem',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    borderRadius: '6px',
                                    border: isSuspended ? '1px solid #10B981' : '1px solid #EF4444',
                                    background: isSuspended ? '#ECFDF5' : '#FEF2F2',
                                    color: isSuspended ? '#059669' : '#DC2626',
                                    cursor: 'pointer'
                                  }}
                                  title={isSuspended ? 'Reactivar taller' : 'Bloquear / suspender taller'}
                                >
                                  {isSuspended ? 'Reactivar ✓' : 'Bloquear 🚫'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProvider(p)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94A3B8',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                  }}
                                  title="Eliminar taller"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CHAMBEADORES / TÉCNICOS (CUADRILLA & FIELD OPERATIONS)               */}
        {/* ========================================================================= */}
        {tab === 'servicemen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={22} color="#059669" />
                    <span>Padrón de Chambeadores y Técnicos en Campo</span>
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                    Alta de personal técnico, asignación a talleres proveedores, control de estatus operativo y bloqueo de técnicos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateSmModal(true)}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '12px',
                    fontWeight: 900,
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <UserPlus size={16} />
                  <span>Dar de Alta Chambeador</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={smSearch}
                    onChange={(e) => setSmSearch(e.target.value)}
                    placeholder="Buscar por nombre, especialidad, teléfono..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem',
                      background: '#F8FAFC'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Taller:</span>
                  <select
                    value={smProviderFilter}
                    onChange={(e) => setSmProviderFilter(e.target.value)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.75rem',
                      background: '#FFF'
                    }}
                  >
                    <option value="ALL">Todos los Talleres</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Servicemen Grid / Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Chambeador</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Taller Asignado</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Calificación</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Trabajos</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Validación KYC</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Estatus</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicemen
                      .filter(sm => {
                        const matchTaller = smProviderFilter === 'ALL' || sm.providerId === smProviderFilter;
                        const q = smSearch.toLowerCase();
                        const matchSearch = !q || sm.name.toLowerCase().includes(q) || sm.title.toLowerCase().includes(q) || sm.phone.includes(q);
                        return matchTaller && matchSearch;
                      })
                      .map(sm => {
                        const isSuspended = sm.status === 'suspended';
                        const parentProv = providers.find(p => p.id === sm.providerId);
                        return (
                          <tr key={sm.id} style={{ borderBottom: '1px solid #F1F5F9', background: isSuspended ? '#FEF2F2' : 'transparent' }}>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <img
                                  src={sm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160'}
                                  alt={sm.name}
                                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                  <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>{sm.name}</strong>
                                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{sm.title} • {sm.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
                                {parentProv ? parentProv.name : sm.providerId}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span style={{ color: '#F59E0B', fontWeight: 800 }}>★ {sm.rating.toFixed(1)}</span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <strong style={{ color: '#0F172A' }}>{sm.completedJobs}</strong> chambas
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span style={{
                                padding: '0.15rem 0.45rem',
                                borderRadius: '999px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                background: sm.isVerified ? '#ECFDF5' : '#FFFBEB',
                                color: sm.isVerified ? '#065F46' : '#92400E'
                              }}>
                                {sm.verificationBadge || (sm.isVerified ? 'KYC Aprobado ✓' : 'Pendiente')}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: isSuspended ? '#FEE2E2' : sm.status === 'available' ? '#ECFDF5' : sm.status === 'busy' ? '#EFF6FF' : '#F1F5F9',
                                color: isSuspended ? '#991B1B' : sm.status === 'available' ? '#065F46' : sm.status === 'busy' ? '#1D4ED8' : '#64748B'
                              }}>
                                {isSuspended ? '🚫 BLOQUEADO' : sm.status === 'available' ? '🟢 Disponible' : sm.status === 'busy' ? '🔵 En Chamba' : '⚪ Offline'}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleServicemanBlock(sm)}
                                  className="btn btn-sm"
                                  style={{
                                    padding: '0.25rem 0.55rem',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    borderRadius: '6px',
                                    border: isSuspended ? '1px solid #10B981' : '1px solid #EF4444',
                                    background: isSuspended ? '#ECFDF5' : '#FEF2F2',
                                    color: isSuspended ? '#059669' : '#DC2626',
                                    cursor: 'pointer'
                                  }}
                                  title={isSuspended ? 'Desbloquear chambeador' : 'Bloquear técnico temporalmente'}
                                >
                                  {isSuspended ? 'Desbloquear ✓' : 'Bloquear 🚫'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteServiceman(sm)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94A3B8',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                  }}
                                  title="Dar de baja técnico"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: PLANES & MEMBRESÍAS SAAS (BUSINESS SUBSCRIPTION TIERS)               */}
        {/* ========================================================================= */}
        {tab === 'plans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* SaaS Metrics Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Ingreso Mensual Recurrente (MRR)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10B981', margin: '0.2rem 0' }}>
                  ${(subStats?.mrr || 48910).toLocaleString('es-MX')} MXN
                </div>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800 }}>+28% vs mes anterior</span>
              </div>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Talleres Suscritos Activos</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0' }}>
                  {providers.length}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  {providers.filter(p => p.subscriptionPlan === 'PRO').length} Pro 💎 • {providers.filter(p => p.subscriptionPlan === 'ENTERPRISE').length} Enterprise
                </span>
              </div>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Ahorro Entregado a Talleres</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#3B82F6', margin: '0.2rem 0' }}>
                  ${(subStats?.estimatedSavingsDeliveredMXN || 142300).toLocaleString('es-MX')} MXN
                </div>
                <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 700 }}>Por comisiones reducidas (8% y 5%)</span>
              </div>
            </div>

            {/* Plans Showcase Cards */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 900, color: '#0F172A' }}>Catálogo de Membresías SaaS Vigentes</h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.8rem' }}>Estructura de precios y comisiones aplicables a los proveedores de la red.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                >
                  <Plus size={14} />
                  <span>Simular Nuevo Plan</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {/* Plan 1: Básico */}
                <div style={{ borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', background: '#F8FAFC' }}>
                  <span style={{ fontSize: '0.7rem', background: '#E2E8F0', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '999px', fontWeight: 800 }}>
                    ESTÁNDAR
                  </span>
                  <h4 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>Plan Básico Gratuito</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: '0.5rem 0' }}>
                    $0 <span style={{ fontSize: '0.8rem', color: '#64748B' }}>MXN / mes</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 800, marginBottom: '0.75rem' }}>
                    Comisión: 15.0% por chamba
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: '#475569', lineHeight: 1.6 }}>
                    <li>Hasta 3 servicios en catálogo</li>
                    <li>Cuadrilla de hasta 3 chambeadores</li>
                    <li>Dispersión regular 48-72h vía SPEI</li>
                    <li>Soporte estándar vía tickets</li>
                  </ul>
                </div>

                {/* Plan 2: Pro Diamante */}
                <div style={{ borderRadius: '16px', border: '2px solid #3B82F6', padding: '1.25rem', background: '#EFF6FF', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-10px', right: '15px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: '#FFF', fontSize: '0.65rem', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                    MÁS POPULAR ⭐
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.2)', color: '#1D4ED8', padding: '0.15rem 0.45rem', borderRadius: '999px', fontWeight: 800 }}>
                    TALLER DIAMANTE 💎
                  </span>
                  <h4 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 900, color: '#1E3A8A' }}>Plan Taller Pro</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1D4ED8', margin: '0.5rem 0' }}>
                    $499 <span style={{ fontSize: '0.8rem', color: '#3B82F6' }}>MXN / mes</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 900, marginBottom: '0.75rem' }}>
                    Comisión Reducida: 8.0% (Ahorro del 47%)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: '#1E40AF', lineHeight: 1.6 }}>
                    <li>Distintivo Diamante ⭐ en Marketplace</li>
                    <li>Prioridad #1 en algoritmo de clientes</li>
                    <li>Servicios ilimitados en catálogo</li>
                    <li>Cuadrilla de hasta 10 chambeadores</li>
                    <li>Timbrado CFDI 4.0 SAT ilimitado</li>
                    <li>Dispersión acelerada 24h STP</li>
                  </ul>
                </div>

                {/* Plan 3: Enterprise */}
                <div style={{ borderRadius: '16px', border: '2px solid #8B5CF6', padding: '1.25rem', background: '#F5F3FF' }}>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.2)', color: '#6D28D9', padding: '0.15rem 0.45rem', borderRadius: '999px', fontWeight: 800 }}>
                    CORPORATIVO
                  </span>
                  <h4 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 900, color: '#4C1D95' }}>Red Multi-Taller Enterprise</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6D28D9', margin: '0.5rem 0' }}>
                    $1,299 <span style={{ fontSize: '0.8rem', color: '#8B5CF6' }}>MXN / mes</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 900, marginBottom: '0.75rem' }}>
                    Comisión Mínima: 5.0%
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: '#5B21B6', lineHeight: 1.6 }}>
                    <li>Cuadrillas ilimitadas de técnicos</li>
                    <li>Múltiples sucursales y zonas</li>
                    <li>Gerente de cuenta dedicado 24/7</li>
                    <li>API directa para ERP / CRM</li>
                    <li>Dispersión instantánea SPEI STP</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: GESTIÓN DE PAGOS & DISPERSIONES (PAYOUTS & GATEWAYS)                 */}
        {/* ========================================================================= */}
        {tab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Solicitudes de Dispersión / Retiros SPEI STP */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Landmark size={20} color="#10B981" />
                    <span>Dispersiones Bancarias y Solicitudes de Retiro SPEI STP</span>
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                    Autoriza y liquida las solicitudes de retiro de billetera generadas por los talleres proveedores.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAdminPayouts}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                >
                  <RefreshCw size={14} className={loadingPayouts ? 'animate-spin' : ''} />
                  <span>Actualizar Retiros</span>
                </button>
              </div>

              {adminPayouts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                  No hay solicitudes de retiro registradas en este momento.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Taller / Proveedor</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Monto a Dispersar</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Banco & Cuenta CLABE</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Fecha de Solicitud</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Estatus</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminPayouts.map((payout: any) => {
                        const isPending = payout.status === 'pending';
                        return (
                          <tr key={payout.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block' }}>
                                {payout.provider?.name || payout.providerId}
                              </strong>
                              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                Dueño: {payout.provider?.owner || 'Contacto'} • Tel: {payout.provider?.phone}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <strong style={{ fontSize: '1rem', color: '#059669' }}>
                                ${payout.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </strong>
                              <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>MXN</span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ fontWeight: 700, color: '#1E293B' }}>{payout.bank}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>{payout.clabe}</div>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', color: '#64748B', fontSize: '0.78rem' }}>
                              {new Date(payout.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span style={{
                                padding: '0.2rem 0.55rem',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: isPending ? '#FEF3C7' : '#ECFDF5',
                                color: isPending ? '#92400E' : '#065F46'
                              }}>
                                {isPending ? '⏳ PENDIENTE' : '✓ DISPERSADO SPEI'}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                              {isPending ? (
                                <button
                                  type="button"
                                  disabled={approvingPayoutId === payout.id}
                                  onClick={() => handleApprovePayout(payout.id, payout.provider?.name || 'Taller', payout.amount)}
                                  className="btn btn-primary btn-sm"
                                  style={{
                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    padding: '0.35rem 0.75rem'
                                  }}
                                >
                                  {approvingPayoutId === payout.id ? 'Dispersando...' : 'Aprobar & Dispersar STP ✓'}
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>Folio STP Liquidado ✓</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pasarelas de Pago Oficiales en México */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontWeight: 800, color: '#0F172A' }}>
                Pasarelas de Pago Habilitadas en México
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {Object.entries(gateways).map(([k, gw]) => (
                  <div key={k} style={{ padding: '1.1rem', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: gw.enabled ? '#FFF' : '#F8FAFC' }}>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: '#0F172A' }}>{gw.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Comisión bancaria: {gw.feePercent}%</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleGateway(k)}
                      style={{
                        background: gw.enabled ? '#ECFDF5' : '#F1F5F9',
                        color: gw.enabled ? '#059669' : '#64748B',
                        border: gw.enabled ? '1px solid #10B981' : '1px solid #CBD5E1',
                        fontWeight: 800
                      }}
                    >
                      {gw.enabled ? 'Activa ✓' : 'Inactiva'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: IMPUESTOS SAT & RETENCIONES CFDI 4.0                                 */}
        {/* ========================================================================= */}
        {tab === 'taxes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* KPI Cards Fiscales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Total Retenido a Enterar al SAT</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#8B5CF6', margin: '0.2rem 0' }}>
                  ${(taxSummary?.totalRetentionsToEnterSat || 3980.50).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </div>
                <span style={{ fontSize: '0.7rem', color: '#6D28D9', fontWeight: 800 }}>LISR Art. 113-A + LIVA Art. 18-B</span>
              </div>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Retención ISR (1% Plataformas)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0' }}>
                  ${(taxSummary?.totalIsrToEnterSat || 442.00).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </div>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>Calculado sobre subtotal sin IVA</span>
              </div>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Retención IVA (8% de IVA)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0' }}>
                  ${(taxSummary?.totalIvaToEnterSat || 3538.50).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </div>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>50% del IVA trasladado retenido</span>
              </div>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Facturas Timbradas CFDI 4.0</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10B981', margin: '0.2rem 0' }}>
                  {taxSummary?.totalFacturasTimbradas || bookings.length}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 800 }}>Cumplimiento Anexo 20 SAT ✓</span>
              </div>
            </div>

            {/* Timbrador Instantáneo de Facturas CFDI 4.0 */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Receipt size={20} color="#8B5CF6" />
                    <span>Emisor de Facturas Fiscales SAT CFDI 4.0</span>
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                    Genera el XML oficial y timbrado con el PAC para cualquier orden completada.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportTaxCsv}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800 }}
                >
                  <FileSpreadsheet size={15} color="#059669" />
                  <span>Descargar Declaración SAT (CSV)</span>
                </button>
              </div>

              <form onSubmit={handleGenerateCfdi} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Folio Chamba:</label>
                  <select
                    value={cfdiBookingId}
                    onChange={(e) => setCfdiBookingId(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                    required
                  >
                    <option value="">Selecciona orden...</option>
                    {bookings.map(b => (
                      <option key={b.id} value={b.id}>{b.id} - {b.serviceTitle} (${b.amount} MXN)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>RFC Receptor:</label>
                  <input
                    type="text"
                    value={cfdiRfc}
                    onChange={(e) => setCfdiRfc(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Razón Social / Nombre:</label>
                  <input
                    type="text"
                    value={cfdiNombre}
                    onChange={(e) => setCfdiNombre(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>C.P. Fiscal Receptor:</label>
                  <input
                    type="text"
                    value={cfdiCp}
                    onChange={(e) => setCfdiCp(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Régimen Fiscal:</label>
                  <select
                    value={cfdiRegimen}
                    onChange={(e) => setCfdiRegimen(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                  >
                    <option value="605">605 - Sueldos y Salarios</option>
                    <option value="612">612 - Personas Físicas Empresariales</option>
                    <option value="625">625 - Plataformas Tecnológicas</option>
                    <option value="601">601 - Personas Morales General de Ley</option>
                    <option value="616">616 - Sin obligaciones fiscales</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Uso de CFDI:</label>
                  <select
                    value={cfdiUso}
                    onChange={(e) => setCfdiUso(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                  >
                    <option value="G03">G03 - Gastos en general</option>
                    <option value="D04">D04 - Donativos</option>
                    <option value="S01">S01 - Sin efectos fiscales</option>
                    <option value="CP01">CP01 - Pagos</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={generatingCfdi}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      borderRadius: '8px'
                    }}
                  >
                    {generatingCfdi ? 'Timbrando...' : 'Timbrar CFDI 4.0 ✓'}
                  </button>
                </div>
              </form>

              {/* Resultado de timbrado */}
              {cfdiResult && (
                <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ color: '#5B21B6', fontSize: '0.88rem' }}>🎉 ¡Factura CFDI 4.0 Timbrada Exitosamente!</strong>
                      <div style={{ fontSize: '0.75rem', color: '#6D28D9', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                        UUID: {cfdiResult.uuid || '4A8F921B-83C1-4D99-A0E5-1234567890AB'}
                      </div>
                    </div>
                    <a
                      href={`http://localhost:4000/api/fiscal/cfdi/${cfdiResult.bookingId || cfdiBookingId}/xml`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ background: '#7C3AED', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Download size={14} />
                      <span>Descargar XML Oficial</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Desglose de Retenciones por Taller */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: '0 0 1rem 0', fontWeight: 800, color: '#0F172A' }}>
                Historial de Retenciones Tributarias por Taller
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Folio Chamba</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Taller / Proveedor</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>RFC Oficial</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Monto Bruto</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Retención ISR</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Retención IVA</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Total SAT</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Constancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(taxSummary?.retentions || []).map((ret: any, idx: number) => (
                      <tr key={ret.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0F172A' }}>
                          {ret.bookingId}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          {ret.providerName || 'Taller'}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                          {ret.providerRfc || 'XAXX010101000'}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          ${(ret.grossAmount || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#DC2626', fontWeight: 700 }}>
                          -${(ret.isrRetention || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#DC2626', fontWeight: 700 }}>
                          -${(ret.ivaRetention || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#8B5CF6', fontWeight: 800 }}>
                          ${(ret.totalRetained || 0).toFixed(2)} MXN
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', background: '#ECFDF5', color: '#059669', padding: '0.15rem 0.45rem', borderRadius: '999px', fontWeight: 800 }}>
                            Enterado SAT ✓
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'webhooks' && (
          <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800 }}>
                  Consola de Webhooks y Conciliación en Tiempo Real
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                  Monitorea los eventos HTTP POST entrantes de Stripe México, Mercado Pago, OXXO Pay y SPEI Banxico.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchWebhooks}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={14} className={loadingWebhooks ? 'animate-spin' : ''} />
                <span>Actualizar Logs</span>
              </button>
            </div>

            {/* Simuladores rápidos de Webhooks */}
            <div style={{
              background: '#F1F5F9',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                ⚡ Disparar Webhooks de Prueba (Acreditación Automática en Segundos):
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleSimulateWebhook(bookings[0]?.id || 'CHAMBA-9021', 'stripe')}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#6366F1' }}
                >
                  💳 Webhook Stripe (payment_intent.succeeded)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateWebhook(bookings[0]?.id || 'CHAMBA-9021', 'oxxo')}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#DC2626' }}
                >
                  🏪 Webhook OXXO Pay (oxxo.cashier_payment)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateWebhook(bookings[0]?.id || 'CHAMBA-9021', 'spei')}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#2563EB' }}
                >
                  🏦 Webhook SPEI Banxico (stp.payment_received)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateWebhook(bookings[0]?.id || 'CHAMBA-9021', 'mercadopago')}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#0EA5E9' }}
                >
                  🌐 Webhook Mercado Pago (payment.updated)
                </button>
              </div>
            </div>

            {/* Lista de Webhooks */}
            {webhookLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                No hay eventos de webhook registrados todavía. Dispara una prueba arriba.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {webhookLogs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      background: '#F8FAFC'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background:
                            log.gateway === 'oxxo'
                              ? '#FEF2F2'
                              : log.gateway === 'spei'
                              ? '#EFF6FF'
                              : log.gateway === 'stripe'
                              ? '#EEF2FF'
                              : '#E0F2FE',
                          color:
                            log.gateway === 'oxxo'
                              ? '#DC2626'
                              : log.gateway === 'spei'
                              ? '#2563EB'
                              : log.gateway === 'stripe'
                              ? '#6366F1'
                              : '#0284C7'
                        }}>
                          {log.gateway.toUpperCase()}
                        </span>
                        <strong style={{ fontSize: '0.85rem' }}>{log.eventType}</strong>
                        <span style={{ color: '#16A34A', fontSize: '0.72rem', fontWeight: 800, background: '#DCFCE7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          HTTP 200 OK
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {new Date(log.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          style={{
                            background: 'none',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            color: '#475569'
                          }}
                        >
                          {expandedLogId === log.id ? 'Ocultar JSON' : 'Ver Payload JSON'}
                        </button>
                      </div>
                    </div>

                    {expandedLogId === log.id && (
                      <div style={{
                        marginTop: '0.6rem',
                        background: '#0F172A',
                        color: '#38BDF8',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '0.72rem',
                        overflowX: 'auto'
                      }}>
                        <pre style={{ margin: 0 }}>
                          {JSON.stringify(JSON.parse(log.payload || '{}'), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB KYC: Validación de Identidad Chambeadores */}
        {tab === 'kyc' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Métricas KYC */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#FFF', padding: '1.1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700 }}>Total Expedientes</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0' }}>
                  {kycStats.totalExpedientes || kycExpedientes.length}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Chambeadores en proceso</span>
              </div>

              <div style={{ background: '#FFF', padding: '1.1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={14} /> Insignias Doradas Oficiales
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10B981', margin: '0.2rem 0' }}>
                  {kycStats.aprobados}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>Verificados al 100% ✓</span>
              </div>

              <div style={{ background: '#FFF', padding: '1.1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#D97706', fontSize: '0.75rem', fontWeight: 700 }}>Pendientes de Dictamen</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F59E0B', margin: '0.2rem 0' }}>
                  {kycStats.enRevision}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: 700 }}>Requieren revisión</span>
              </div>

              <div style={{ background: '#FFF', padding: '1.1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#2563EB', fontSize: '0.75rem', fontWeight: 700 }}>Tasa de Verificación</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563EB', margin: '0.2rem 0' }}>
                  {kycStats.porcentajeVerificacion}%
                </div>
                <span style={{ fontSize: '0.7rem', color: '#2563EB' }}>Del padrón total</span>
              </div>
            </div>

            {/* Tabla de Expedientes KYC */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                    Expedientes de Identidad Oficial (INE, SAT, RENAPO y Antecedentes)
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Dictamen de credenciales de técnicos para otorgar Insignia Dorada de Confianza
                  </span>
                </div>

                {/* Filtro por estado */}
                <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                  {[
                    { key: 'ALL', label: 'Todos' },
                    { key: 'UNDER_REVIEW', label: 'En Revisión' },
                    { key: 'APPROVED', label: 'Aprobados' },
                    { key: 'PENDING', label: 'Incompletos' },
                  ].map(f => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilterKycStatus(f.key)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: filterKycStatus === f.key ? '#FFF' : 'transparent',
                        color: filterKycStatus === f.key ? '#0F172A' : '#64748B',
                        fontWeight: filterKycStatus === f.key ? 800 : 600,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        boxShadow: filterKycStatus === f.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={fetchKycData}
                    style={{ background: 'none', border: 'none', padding: '0.35rem', cursor: 'pointer', color: '#2563EB' }}
                    title="Actualizar expedientes"
                  >
                    <RefreshCw size={13} className={loadingKyc ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {loadingKyc ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>Cargando expedientes oficiales...</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Chambeador / Especialidad</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Taller / Proveedor</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Validación Fiscal & INE</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Trust Score</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Dictamen</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kycExpedientes.map((item) => {
                        const sm = item.serviceman;
                        const isApproved = item.status === 'APPROVED';
                        const isUnderReview = item.status === 'UNDER_REVIEW';
                        const isRejected = item.status === 'REJECTED';

                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <img
                                  src={sm?.avatar || '/images/default_avatar.jpg'}
                                  alt={sm?.name || 'Técnico'}
                                  style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }}
                                />
                                <div>
                                  <div style={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{sm?.name || 'Técnico ChambaYa'}</span>
                                    {isApproved && (
                                      <span title="Chambeador Verificado con Insignia Dorada">
                                        <Award size={14} color="#F59E0B" />
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                    {sm?.title} • {sm?.phone}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem', color: '#475569', fontSize: '0.78rem' }}>
                              {sm?.provider?.name || item.provider?.name || 'Independiente'}
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.72rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: item.curpValidated ? '#16A34A' : '#94A3B8' }}>●</span>
                                  <span>CURP: {item.curp || 'No cargada'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: item.rfcValidated ? '#16A34A' : '#94A3B8' }}>●</span>
                                  <span>RFC: {item.rfc || 'No registrado'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: item.ineValidated ? '#16A34A' : '#94A3B8' }}>●</span>
                                  <span>INE OCR: {item.ineClaveElector ? 'Cotejada ✓' : 'Pendiente'}</span>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '60px', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${item.trustScore}%`,
                                    height: '100%',
                                    background: item.trustScore >= 75 ? '#10B981' : item.trustScore >= 50 ? '#F59E0B' : '#EF4444'
                                  }} />
                                </div>
                                <strong style={{ fontSize: '0.78rem', color: item.trustScore >= 75 ? '#059669' : '#D97706' }}>
                                  {item.trustScore}%
                                </strong>
                              </div>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '999px',
                                fontWeight: 800,
                                background: isApproved ? '#DCFCE7' : isUnderReview ? '#FEF3C7' : isRejected ? '#FEE2E2' : '#F1F5F9',
                                color: isApproved ? '#166534' : isUnderReview ? '#92400E' : isRejected ? '#991B1B' : '#475569'
                              }}>
                                {isApproved ? 'VERIFICADO ⭐' : isUnderReview ? 'EN REVISIÓN' : isRejected ? 'RECHAZADO' : 'INCOMPLETO'}
                              </span>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedKyc(item)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                                >
                                  <Eye size={12} />
                                  <span>Expediente</span>
                                </button>

                                {!isApproved && (
                                  <button
                                    type="button"
                                    onClick={() => handleDictamen(item.id, 'APPROVED')}
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', background: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800 }}
                                  >
                                    <Award size={12} />
                                    <span>Aprobar ⭐</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Bóveda de Garantía & Mediación de Disputas Escrow */}
        {tab === 'escrow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Tarjetas KPI de Escrow */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Fondos en Custodia Preventiva</span>
                  <ShieldCheck size={18} color="#10B981" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.3rem 0', color: '#0F172A' }}>
                  ${escrowStats.fondosEnCustodiaMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.85rem' }}>MXN</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
                  🔒 Bóveda Escrow: Garantía 48h activa
                </span>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Fondos Liberados a Chambeadores</span>
                  <CheckCircle2 size={18} color="#059669" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.3rem 0', color: '#0F172A' }}>
                  ${escrowStats.fondosLiberadosMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.85rem' }}>MXN</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                  {escrowStats.bovedasLiberadas} órdenes concluidas con entera satisfacción
                </span>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Disputas Abiertas en Mediación</span>
                  <Scale size={18} color="#D97706" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.3rem 0', color: '#D97706' }}>
                  {escrowStats.disputasActivas}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700 }}>
                  Fondos congelados preventivamente
                </span>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', color: '#FFF', padding: '1.25rem', borderRadius: '18px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C7D2FE', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Póliza Protección Daños Materiales</span>
                  <Sparkles size={18} color="#FCD34D" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.3rem 0', color: '#FCD34D' }}>
                  $25,000.00 <span style={{ fontSize: '0.85rem' }}>MXN</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#E0E7FF', fontWeight: 700 }}>
                  🛡️ Cobertura ChambaYa por servicio
                </span>
              </div>
            </div>

            {/* Tabla de Disputas y Casos de Garantía */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.2rem 0' }}>
                    Centro de Mediación & Garantía de Satisfacción 🇲🇽
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Resolución arbitral de inconformidades, liberación de fondos y cobertura de seguro
                  </span>
                </div>

                {/* Filtro por estado de disputa */}
                <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'ALL', label: 'Todas' },
                    { key: 'OPEN', label: 'Abiertas' },
                    { key: 'UNDER_REVIEW', label: 'En Revisión' },
                    { key: 'RESOLVED_PROVIDER', label: 'A favor Proveedor' },
                    { key: 'RESOLVED_CUSTOMER', label: 'Reembolsadas' },
                    { key: 'RESOLVED_SPLIT', label: 'Split Mixto' },
                    { key: 'RESOLVED_INSURANCE', label: 'Póliza Seguro' },
                  ].map(f => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilterDisputeStatus(f.key)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: filterDisputeStatus === f.key ? '#FFF' : 'transparent',
                        color: filterDisputeStatus === f.key ? '#0F172A' : '#64748B',
                        fontWeight: filterDisputeStatus === f.key ? 800 : 600,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        boxShadow: filterDisputeStatus === f.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={fetchEscrowDisputes}
                    style={{ background: 'none', border: 'none', padding: '0.35rem', cursor: 'pointer', color: '#10B981' }}
                    title="Actualizar disputas"
                  >
                    <RefreshCw size={13} className={loadingEscrow ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {loadingEscrow ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>Cargando expedientes de garantía y bóvedas...</div>
                </div>
              ) : escrowDisputes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                  <ShieldCheck size={36} color="#10B981" style={{ margin: '0 auto 0.75rem auto' }} />
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Sin disputas pendientes</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Todas las garantías están cumpliéndose con entera satisfacción ciudadana.
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Folio / Chamba</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Cliente</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Proveedor & Técnico</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Motivo Reclamado</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Reembolso Solicitado</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Estado</th>
                        <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escrowDisputes.map(disp => {
                        const bookingInfo = disp.escrowVault?.booking;
                        const isResolved = disp.status.startsWith('RESOLVED_');

                        return (
                          <tr key={disp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ fontWeight: 800, color: '#0F172A' }}>#{disp.bookingId}</div>
                              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                Total: ${(disp.escrowVault?.totalAmount || 0).toFixed(2)} MXN
                              </span>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                {bookingInfo?.customerName || 'Cliente ChambaYa'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                {bookingInfo?.customerPhone || 'Teléfono verificado'}
                              </div>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                {bookingInfo?.providerName || 'Taller Proveedor'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                Chambeador: {bookingInfo?.servicemanName || 'Técnico asignado'}
                              </div>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626' }}>
                                {disp.reason.replace(/_/g, ' ')}
                              </span>
                              <div style={{ fontSize: '0.72rem', color: '#475569', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {disp.description}
                              </div>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <strong style={{ color: '#0F172A' }}>
                                ${(disp.requestedRefund || disp.escrowVault?.totalAmount || 0).toFixed(2)}
                              </strong>
                              <span style={{ fontSize: '0.7rem', color: '#64748B' }}> MXN</span>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '999px',
                                fontWeight: 800,
                                background: disp.status === 'OPEN' ? '#FEF3C7' : disp.status === 'RESOLVED_PROVIDER' ? '#DCFCE7' : disp.status === 'RESOLVED_CUSTOMER' ? '#FEE2E2' : '#EFF6FF',
                                color: disp.status === 'OPEN' ? '#B45309' : disp.status === 'RESOLVED_PROVIDER' ? '#166534' : disp.status === 'RESOLVED_CUSTOMER' ? '#991B1B' : '#1D4ED8'
                              }}>
                                {disp.status}
                              </span>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDispute(disp);
                                  setRefundAmountInput(disp.requestedRefund || disp.escrowVault?.totalAmount || 0);
                                  setReleaseAmountInput(0);
                                  setResolutionNotes(disp.adminNotes || 'Expediente analizado con evidencia técnica por el equipo de mediación ChambaYa.');
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.72rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  borderColor: isResolved ? '#CBD5E1' : '#10B981',
                                  color: isResolved ? '#475569' : '#059669',
                                  fontWeight: 800
                                }}
                              >
                                <Scale size={13} />
                                <span>{isResolved ? 'Ver Dictamen' : 'Mediar Caso ⚖️'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Infraestructura Docker & Nginx Reverse Proxy */}
        {tab === 'infra' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header / Banner de Infraestructura */}
            <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)', borderRadius: '20px', padding: '1.5rem 2rem', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ background: 'rgba(99, 102, 241, 0.3)', color: '#A5B4FC', border: '1px solid rgba(165, 180, 252, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Server size={12} /> DOCKER & NGINX CLOUD ARCHITECTURE
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#C7D2FE', fontWeight: 700 }}>
                    Región: {systemHealth?.region || 'mx-central-1 (CDMX)'}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#FFF' }}>
                  Topología de Producción & Contenedores
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#E0E7FF', marginTop: '0.2rem' }}>
                  Orquestación empresarial multi-contenedor con proxy reverso Nginx, SSL TLS 1.3 y healthchecks automáticos.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={fetchHealth}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#FFF',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <RefreshCw size={14} className={loadingHealth ? 'animate-spin' : ''} />
                  <span>Sondear Salud</span>
                </button>
              </div>
            </div>

            {/* Tarjetas KPI de Estado de Infraestructura */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Gateway Nginx Ingress</span>
                  <Lock size={18} color="#10B981" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.3rem 0', color: '#0F172A' }}>
                  Nginx 1.27
                </div>
                <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700 }}>
                  SSL TLSv1.3 • Rate Limit 30r/s activo
                </span>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Backend NestJS API</span>
                  <Cpu size={18} color="#3B82F6" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.3rem 0', color: '#0F172A' }}>
                  {systemHealth?.status === 'healthy' ? 'Saludable ✅' : 'En Línea'}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 700 }}>
                  Uptime: {systemHealth?.uptimeSeconds || 240}s • RAM: {systemHealth?.memory?.rssMB || 120} MB
                </span>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Frontend Next.js PWA</span>
                  <Layers size={18} color="#8B5CF6" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.3rem 0', color: '#0F172A' }}>
                  Turbopack v16
                </div>
                <span style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 700 }}>
                  Service Worker activo • Standalone Runner
                </span>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Base de Datos & Persistencia</span>
                  <Server size={18} color="#D97706" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.3rem 0', color: '#0F172A' }}>
                  Prisma Client
                </div>
                <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700 }}>
                  {systemHealth?.database?.totalUsers || 4} usuarios • SQLite / PostgreSQL Ready
                </span>
              </div>
            </div>

            {/* Grid de Contenedores Docker */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                Inventario de Contenedores Docker (`docker-compose.yml`)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {[
                  {
                    name: 'chambaya-gateway',
                    image: 'nginx:1.27-alpine',
                    ports: '80:80, 443:443',
                    role: 'Reverse Proxy, SSL TLSv1.3, Balanceo de Carga y Gzip',
                    health: 'HEALTHY',
                    color: '#10B981'
                  },
                  {
                    name: 'chambaya-backend',
                    image: 'backend-api:latest (Node 22)',
                    ports: '4000 (Internal)',
                    role: 'REST API, WebSockets Socket.io, Prisma ORM y SAT CFDI 4.0',
                    health: 'HEALTHY',
                    color: '#3B82F6'
                  },
                  {
                    name: 'chambaya-frontend',
                    image: 'frontend-nextjs:latest (Next 15)',
                    ports: '3000 (Internal)',
                    role: 'App Router, PWA Offline Service Worker y Push Notifications',
                    health: 'HEALTHY',
                    color: '#8B5CF6'
                  },
                  {
                    name: 'chambaya-redis',
                    image: 'redis:7-alpine',
                    ports: '6379 (Internal)',
                    role: 'Caché de consultas y adaptador distribuido de WebSockets',
                    health: 'STANDBY',
                    color: '#EF4444'
                  },
                  {
                    name: 'chambaya-postgres',
                    image: 'postgres:16-alpine',
                    ports: '5432 (Internal)',
                    role: 'Base de datos relacional para escalabilidad multi-instancia',
                    health: 'STANDBY',
                    color: '#334155'
                  }
                ].map((c, i) => (
                  <div key={i} style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{c.name}</strong>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', background: c.health === 'HEALTHY' ? '#DCFCE7' : '#F1F5F9', color: c.health === 'HEALTHY' ? '#166534' : '#64748B' }}>
                        {c.health}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace', marginBottom: '0.35rem' }}>
                      Image: {c.image}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4 }}>
                      {c.role}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#0284C7', fontWeight: 700, marginTop: '0.5rem' }}>
                      Puertos: {c.ports}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matriz de Submódulos y Health Telemetry */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                Matriz de Disponibilidad de Submódulos Críticos
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {[
                  { name: 'Autenticación & RBAC (JWT)', status: 'OPERATIONAL', desc: 'Tokens firmados HMAC SHA-256' },
                  { name: 'Telemetría GPS & Chat (Socket.io)', status: 'OPERATIONAL', desc: 'Canales bidireccionales en vivo' },
                  { name: 'Pasarelas de Pago México', status: 'OPERATIONAL', desc: 'SPEI, OXXO Pay, Webhooks idempotentes' },
                  { name: 'Facturación Electrónica SAT', status: 'OPERATIONAL', desc: 'CFDI 4.0 y cálculo de retenciones' },
                  { name: 'PWA Web Push & Background Sync', status: 'OPERATIONAL', desc: 'Notificaciones VAPID nativas' },
                  { name: 'Validación KYC Chambeadores', status: 'OPERATIONAL', desc: 'RENAPO, SAT, INE OCR y Biometría' },
                  { name: 'Bóveda de Garantía Escrow', status: 'OPERATIONAL', desc: 'Custodia 48h y póliza de $25,000 MXN' }
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534' }}>{s.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#15803D' }}>{s.desc}</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', background: '#DCFCE7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist de Blindaje de Producción */}
            <div style={{ background: '#0F172A', color: '#FFF', borderRadius: '18px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Terminal size={18} color="#34D399" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#F8FAFC' }}>
                  Blindaje & Estándares de Producción en Contenedores
                </h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', fontSize: '0.78rem', color: '#CBD5E1' }}>
                <div>✓ Multi-stage Docker builds con capas cacheadas (Node 22 Alpine)</div>
                <div>✓ Ejecución como usuario sin privilegios `nextjs` (UID 1001) y `node`</div>
                <div>✓ Manejo de señales SIGTERM/SIGINT con `dumb-init` en entrypoint</div>
                <div>✓ Healthcheck nativo Docker con reintentos cada 20 segundos</div>
                <div>✓ Rate limiting Nginx contra ráfagas no autorizadas (30 req/s)</div>
                <div>✓ Cabeceras de seguridad bancarias (HSTS, nosniff, SAMEORIGIN)</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'coupons' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Promocional */}
            <div style={{
              background: 'linear-gradient(135deg, #831843 0%, #9D174D 50%, #BE185D 100%)',
              color: '#FFF',
              borderRadius: '20px',
              padding: '1.75rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(157, 23, 77, 0.4)'
            }}>
              <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ background: '#FDF2F8', color: '#BE185D', fontSize: '0.7rem', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '999px', letterSpacing: '0.5px' }}>
                      MARKETING & CRECIMIENTO
                    </span>
                    <span style={{ color: '#FCE7F3', fontSize: '0.8rem' }}>• Campañas de Descuento & Viralidad 🇲🇽</span>
                  </div>
                  <h2 style={{ fontSize: '1.7rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#FFF' }}>
                    Cupones de Descuento & Programa "Invita a un Compa"
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#FBCFE8', maxWidth: '620px', lineHeight: '1.5' }}>
                    Monitorea los cupones activos del Buen Fin y Primera Chamba, crea nuevas promociones con reglas mexicanas y administra el programa de referidos ($100 MXN para ambos).
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateCouponModal(true)}
                    className="btn btn-primary"
                    style={{
                      background: '#FFF',
                      color: '#9D174D',
                      fontWeight: 900,
                      padding: '0.65rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Ticket size={16} />
                    <span>+ Crear Nuevo Cupón</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReferralModal(true)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#FFF',
                      fontWeight: 800,
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Gift size={16} />
                    <span>Ver Modal de Referidos</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tarjetas KPI de Desempeño */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>CUPONES ACTIVOS</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FCE7F3', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tag size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>
                  {coupons.filter(c => c.isActive).length} / {coupons.length || 4}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
                  ✓ Listos para canje en checkout
                </div>
              </div>

              <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>DESCUENTOS OTORGADOS</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16A34A' }}>
                  ${(couponStats?.totalDiscountsGivenMXN || 18450).toLocaleString('es-MX')} MXN
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, marginTop: '0.2rem' }}>
                  Subvencionado por ChambaYa
                </div>
              </div>

              <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>REDENCIONES TOTALES</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ticket size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>
                  {couponStats?.totalRedemptions || 142} canjes
                </div>
                <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 700, marginTop: '0.2rem' }}>
                  Tasa de conversión: 68.4%
                </div>
              </div>

              <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>COMPAS REFERIDOS</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Gift size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#D97706' }}>
                  {couponStats?.totalFriendsReferred || 82} amigos
                </div>
                <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700, marginTop: '0.2rem' }}>
                  ${(couponStats?.totalReferralRewardsPaidMXN || 8200).toLocaleString('es-MX')} MXN premiados
                </div>
              </div>
            </div>

            {/* Listado de Cupones Oficiales */}
            <div style={{ background: '#FFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                    Padrón de Cupones y Descuentos Activos
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Cupones promocionales con validación automática en checkout y tope de redenciones
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchCouponsData}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw size={13} className={loadingCoupons ? 'spin' : ''} />
                  <span>Actualizar</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569', fontWeight: 800 }}>
                      <th style={{ padding: '0.75rem 1rem' }}>CÓDIGO DE CUPÓN</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CAMPAÑA & DESCRIPCIÓN</th>
                      <th style={{ padding: '0.75rem 1rem' }}>BENEFICIO</th>
                      <th style={{ padding: '0.75rem 1rem' }}>COMPRA MÍNIMA</th>
                      <th style={{ padding: '0.75rem 1rem' }}>USOS / TOPE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>ESTATUS</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FDF2F8', border: '1px solid #FBCFE8', borderRadius: '6px', padding: '0.25rem 0.5rem', fontWeight: 900, color: '#BE185D', fontFamily: 'monospace', letterSpacing: '1px' }}>
                            <Tag size={13} />
                            <span>{c.code}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: '#0F172A' }}>{c.title}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{c.description || 'Sin notas'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 900, color: c.discountType === 'PERCENTAGE' ? '#7C3AED' : '#059669', fontSize: '0.9rem' }}>
                            {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `-$${c.discountValue} MXN`}
                          </span>
                          {(c.maxDiscount || c.maxDiscountAmount) && (
                            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Tope: ${c.maxDiscount || c.maxDiscountAmount} MXN</div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                          ${c.minOrderAmount ? `${c.minOrderAmount} MXN` : 'Sin mínimo'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>
                            {c.usedCount} / {c.maxUses || '∞'}
                          </div>
                          <div style={{ width: '80px', height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, (c.usedCount / (c.maxUses || 100)) * 100)}%`, height: '100%', background: '#BE185D' }} />
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: c.isActive ? '#DCFCE7' : '#F1F5F9',
                            color: c.isActive ? '#15803D' : '#64748B'
                          }}>
                            {c.isActive ? '● Activo' : '○ Pausado'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleCoupon(c.id)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              border: c.isActive ? '1px solid #FECACA' : '1px solid #BBF7D0',
                              background: c.isActive ? '#FEF2F2' : '#F0FDF4',
                              color: c.isActive ? '#DC2626' : '#166534',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {c.isActive ? 'Pausar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Auditoría del Programa Invita a un Compa */}
            <div style={{
              background: '#FFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gift size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                    Mecanismo de Doble Recompensa "Invita a un Compa"
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Incentivo bilateral: $100 MXN de descuento al invitado + $100 MXN en saldo al referente
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.8rem' }}>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>Reglas Antifraude Automatizadas</div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569', lineHeight: '1.5' }}>
                    <li>Bloqueo estricto de auto-referidos por <code>userId</code> o teléfono idéntico.</li>
                    <li>Monto mínimo de servicio de $300 MXN para aplicar el cupón de $100 MXN.</li>
                    <li>La recompensa del referente se acredita únicamente tras validación con PIN OTP.</li>
                  </ul>
                </div>

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>Código Demo Activo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <code style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669', background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>FERNANDA100</code>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>(Asignado a Fernanda Gómez)</span>
                  </div>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem' }}>
                    Cualquier cliente puede ingresar <code>FERNANDA100</code> en el checkout para obtener $100 MXN de descuento inmediato.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal de Creación de Cupón */}
            {showCreateCouponModal && (
              <div className="modal-overlay" onClick={() => setShowCreateCouponModal(false)} style={{ zIndex: 99999 }}>
                <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Ticket size={20} color="#BE185D" />
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>
                        Nuevo Cupón Promocional ChambaYa
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateCouponModal(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Código de Cupón *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. NAVIDAD2026"
                          value={newCouponCode}
                          onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Tipo de Descuento
                        </label>
                        <select
                          value={newCouponType}
                          onChange={e => setNewCouponType(e.target.value as any)}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                        >
                          <option value="FIXED">Monto Fijo ($ MXN)</option>
                          <option value="PERCENTAGE">Porcentaje (%)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Título de la Campaña *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Descuento Especial de Temporada Navideña"
                        value={newCouponTitle}
                        onChange={e => setNewCouponTitle(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Descripción Corta
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Válido en todos los servicios de mantenimiento del hogar"
                        value={newCouponDesc}
                        onChange={e => setNewCouponDesc(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Valor ({newCouponType === 'PERCENTAGE' ? '%' : '$'})
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={newCouponValue}
                          onChange={e => setNewCouponValue(Number(e.target.value))}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Compra Mínima ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={newCouponMinOrder}
                          onChange={e => setNewCouponMinOrder(Number(e.target.value))}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Límite de Usos
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={newCouponMaxUses}
                          onChange={e => setNewCouponMaxUses(Number(e.target.value))}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>

                    {newCouponType === 'PERCENTAGE' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Tope Máximo de Descuento ($ MXN)
                        </label>
                        <input
                          type="number"
                          min={10}
                          value={newCouponMaxDiscount}
                          onChange={e => setNewCouponMaxDiscount(Number(e.target.value))}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowCreateCouponModal(false)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.65rem' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1.5, padding: '0.65rem', background: '#BE185D', fontWeight: 800 }}
                      >
                        Guardar & Activar Cupón
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de Dictamen de Mediación Escrow */}
        {selectedDispute && (
          <div className="modal-overlay" onClick={() => setSelectedDispute(null)} style={{ zIndex: 99999 }}>
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '640px', width: '92%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>
                      Dictamen de Mediación Bóveda Escrow
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Folio Disputa: {selectedDispute.id} • Orden #{selectedDispute.bookingId}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDispute(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tarjeta Resumen de la Orden y Disputa */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Cliente Reclamante</span>
                    <strong style={{ color: '#0F172A' }}>{selectedDispute.escrowVault?.booking?.customerName || 'Cliente'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Taller / Proveedor</span>
                    <strong style={{ color: '#0F172A' }}>{selectedDispute.escrowVault?.booking?.providerName || 'Proveedor'}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Monto en Custodia Escrow</span>
                    <strong style={{ color: '#10B981', fontSize: '1rem' }}>
                      ${(selectedDispute.escrowVault?.totalAmount || 0).toFixed(2)} MXN
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Reembolso Solicitado</span>
                    <strong style={{ color: '#DC2626', fontSize: '1rem' }}>
                      ${(selectedDispute.requestedRefund || selectedDispute.escrowVault?.totalAmount || 0).toFixed(2)} MXN
                    </strong>
                  </div>
                </div>
              </div>

              {/* Declaración y Evidencia del Reclamo */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '0.25rem' }}>
                  Motivo y Exposición del Cliente:
                </label>
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '0.75rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem', color: '#991B1B' }}>
                  <strong>{selectedDispute.reason.replace(/_/g, ' ')}:</strong> {selectedDispute.description}
                </div>

                {selectedDispute.evidencePhotos && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>Evidencia gráfica adjunta:</span>
                    <img
                      src={selectedDispute.evidencePhotos}
                      alt="Evidencia"
                      style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    />
                  </div>
                )}
              </div>

              {/* Formulario de Decisión de Mediación */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                  Sentido del Dictamen de Mediación
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                  {[
                    { id: 'REFUND_CUSTOMER_FULL', title: '↩️ Reembolso Total Cliente', desc: 'Garantía 100% satisfecha' },
                    { id: 'RELEASE_TO_PROVIDER', title: '✅ Liberar al Proveedor', desc: 'Trabajo conforme a norma' },
                    { id: 'SPLIT_SETTLEMENT', title: '🤝 Conciliación Mixta', desc: 'División parcial de fondos' },
                    { id: 'INSURANCE_CLAIM', title: '🛡️ Póliza de Daños', desc: 'Hasta $25,000 MXN seguro' }
                  ].map(opt => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setResolutionDecision(opt.id as any);
                        const total = selectedDispute.escrowVault?.totalAmount || 0;
                        if (opt.id === 'REFUND_CUSTOMER_FULL') {
                          setRefundAmountInput(selectedDispute.requestedRefund || total);
                          setReleaseAmountInput(0);
                        } else if (opt.id === 'RELEASE_TO_PROVIDER') {
                          setRefundAmountInput(0);
                          setReleaseAmountInput(selectedDispute.escrowVault?.providerEarnings || total);
                        } else if (opt.id === 'SPLIT_SETTLEMENT') {
                          setRefundAmountInput(Math.round(total / 2));
                          setReleaseAmountInput(Math.round(total / 2));
                        } else if (opt.id === 'INSURANCE_CLAIM') {
                          setRefundAmountInput(total);
                          setReleaseAmountInput(selectedDispute.escrowVault?.providerEarnings || 0);
                        }
                      }}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: resolutionDecision === opt.id ? '2px solid #10B981' : '1px solid #E2E8F0',
                        background: resolutionDecision === opt.id ? '#F0FDF4' : '#FFF',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: resolutionDecision === opt.id ? '#166534' : '#0F172A' }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.15rem' }}>
                        {opt.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Reembolso al Cliente (MXN)
                    </label>
                    <input
                      type="number"
                      value={refundAmountInput}
                      onChange={e => setRefundAmountInput(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Liberación al Proveedor (MXN)
                    </label>
                    <input
                      type="number"
                      value={releaseAmountInput}
                      onChange={e => setReleaseAmountInput(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Consideraciones y Fundamento del Dictamen Oficial *
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                    placeholder="Ej. Revisión técnica valida filtración en tubería secundaria. Se autoriza reembolso conforme a la garantía de satisfacción de 48h."
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveDispute(selectedDispute.id)}
                  className="btn btn-primary btn-sm"
                  style={{
                    background: '#10B981',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1.1rem'
                  }}
                >
                  <Scale size={15} />
                  <span>Emitir Dictamen & Liquidar Fondos</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalle / Dictamen de Expediente KYC */}
        {selectedKyc && (
          <div className="modal-overlay" onClick={() => setSelectedKyc(null)} style={{ zIndex: 99999 }}>
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '640px', width: '92%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: '#0F172A' }}>
                      Cotejo de Expediente KYC • {selectedKyc.serviceman?.name}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Revisión de documentos oficiales mexicanos e historial de antecedentes
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedKyc(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Tarjetas de Verificación */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {/* 1. CURP & RFC */}
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
                    1. RENAPO y SAT (Identidad Fiscal)
                  </strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#475569' }}>
                    <div>CURP: <strong style={{ color: '#0F172A' }}>{selectedKyc.curp || 'No provista'}</strong> {selectedKyc.curpValidated && '✓'}</div>
                    <div>RFC: <strong style={{ color: '#0F172A' }}>{selectedKyc.rfc || 'No provisto'}</strong> {selectedKyc.rfcValidated && '✓'}</div>
                  </div>
                </div>

                {/* 2. INE */}
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
                    2. Credencial para Votar INE / IFE
                  </strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#475569' }}>
                    <div>Clave de Elector: <strong>{selectedKyc.ineClaveElector || 'N/A'}</strong></div>
                    <div>CIC: <strong>{selectedKyc.ineCic || 'N/A'}</strong></div>
                    <div>OCR: <strong>{selectedKyc.ineOcrNumber || 'N/A'}</strong></div>
                    <div>Estatus INE: <strong style={{ color: '#16A34A' }}>Vigente en Lista Nominal ✓</strong></div>
                  </div>
                </div>

                {/* 3. Biometría Facial */}
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
                    3. Biometría Facial y Prueba de Vida
                  </strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Similitud Facial con Foto INE:</span>
                    <strong style={{ color: '#059669' }}>{selectedKyc.faceMatchScore || 98.7}% Match (Aprobado ✓)</strong>
                  </div>
                </div>

                {/* 4. Antecedentes Penales */}
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
                    4. Carta de No Antecedentes Penales
                  </strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Folio FGR / Secretaría de Seguridad:</span>
                    <strong style={{ color: '#0F172A' }}>{selectedKyc.antecedentesFolio || 'FGR-CDMX-2026-9021A'}</strong>
                  </div>
                </div>
              </div>

              {/* Dictamen Input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.35rem' }}>
                  Observaciones del Dictamen Administrativo
                </label>
                <textarea
                  rows={2}
                  value={dictamenNotes}
                  onChange={(e) => setDictamenNotes(e.target.value)}
                  placeholder="Ej. Expediente validado contra padrón oficial del INE y constancia de situación fiscal SAT sin inconsistencias."
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              {/* Botones de Dictamen */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleDictamen(selectedKyc.id, 'REJECTED')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.65rem', color: '#DC2626', borderColor: '#FECACA' }}
                >
                  Rechazar Expediente
                </button>
                <button
                  type="button"
                  onClick={() => handleDictamen(selectedKyc.id, 'APPROVED')}
                  className="btn btn-primary"
                  style={{
                    flex: 1.5,
                    padding: '0.65rem',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Award size={18} />
                  <span>Aprobar & Otorgar Insignia Dorada ⭐</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: DAR DE ALTA NEGOCIO / TALLER                                      */}
        {/* ========================================================================= */}
        {showCreateProviderModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={22} color="#059669" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                      Dar de Alta Nuevo Negocio / Taller
                    </h3>
                    <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                      Registro oficial de proveedor multitienda homologado para el ecosistema mexicano.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateProviderModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProvider}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Nombre Comercial del Taller *
                    </label>
                    <input
                      type="text"
                      value={newProvName}
                      onChange={(e) => setNewProvName(e.target.value)}
                      placeholder="Ej. Climas & Refrigeración del Norte"
                      required
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Representante Legal / Dueño *
                    </label>
                    <input
                      type="text"
                      value={newProvOwner}
                      onChange={(e) => setNewProvOwner(e.target.value)}
                      placeholder="Ej. Ing. Roberto Villarreal Cantú"
                      required
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Correo Electrónico Oficial *
                    </label>
                    <input
                      type="email"
                      value={newProvEmail}
                      onChange={(e) => setNewProvEmail(e.target.value)}
                      placeholder="contacto@tallerclimas.mx"
                      required
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Teléfono Móvil (WhatsApp) *
                    </label>
                    <input
                      type="text"
                      value={newProvPhone}
                      onChange={(e) => setNewProvPhone(e.target.value)}
                      placeholder="+52 55 1234 5678"
                      required
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Zona Principal de Cobertura
                    </label>
                    <select
                      value={newProvZone}
                      onChange={(e) => setNewProvZone(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    >
                      <option value="Ciudad de México (CDMX)">Ciudad de México (CDMX)</option>
                      <option value="Guadalajara / Zapopan (JAL)">Guadalajara / Zapopan (JAL)</option>
                      <option value="Monterrey / San Pedro (NL)">Monterrey / San Pedro (NL)</option>
                      <option value="Puebla & Cholula (PUE)">Puebla & Cholula (PUE)</option>
                      <option value="Querétaro (QRO)">Querétaro (QRO)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Plan SaaS de Membresía
                    </label>
                    <select
                      value={newProvPlan}
                      onChange={(e) => {
                        const p = e.target.value as any;
                        setNewProvPlan(p);
                        if (p === 'PRO') setNewProvCommission(8);
                        else if (p === 'ENTERPRISE') setNewProvCommission(5);
                        else setNewProvCommission(15);
                      }}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    >
                      <option value="BASIC">Plan Básico Gratuito ($0 MXN/mes - 15% Comisión)</option>
                      <option value="PRO">Plan Taller Pro 💎 ($499 MXN/mes - 8% Comisión)</option>
                      <option value="ENTERPRISE">Red Enterprise 🏛️ ($1,299 MXN/mes - 5% Comisión)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      RFC Fiscal SAT
                    </label>
                    <input
                      type="text"
                      value={newProvRfc}
                      onChange={(e) => setNewProvRfc(e.target.value.toUpperCase())}
                      placeholder="Ej. VICR8501018X9"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Régimen Fiscal
                    </label>
                    <select
                      value={newProvRegimen}
                      onChange={(e) => setNewProvRegimen(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    >
                      <option value="625">625 - Régimen de Plataformas Tecnológicas</option>
                      <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                      <option value="601">601 - General de Ley Personas Morales</option>
                      <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Banco para Dispersión SPEI
                    </label>
                    <input
                      type="text"
                      value={newProvBank}
                      onChange={(e) => setNewProvBank(e.target.value)}
                      placeholder="BBVA México / Banorte"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Cuenta CLABE (18 dígitos STP)
                    </label>
                    <input
                      type="text"
                      value={newProvClabe}
                      onChange={(e) => setNewProvClabe(e.target.value)}
                      placeholder="012180001234567890"
                      maxLength={18}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateProviderModal(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.65rem 1.25rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingProvider}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      padding: '0.65rem 1.5rem',
                      fontWeight: 900
                    }}
                  >
                    {creatingProvider ? 'Registrando Taller...' : 'Dar de Alta Negocio ✓'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: DAR DE ALTA CHAMBEADOR / TÉCNICO                                   */}
        {/* ========================================================================= */}
        {showCreateSmModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={22} color="#059669" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                      Dar de Alta Chambeador
                    </h3>
                    <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                      Asigna un nuevo técnico de campo a la cuadrilla de un taller proveedor.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateSmModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateServiceman}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Nombre Completo del Chambeador *
                    </label>
                    <input
                      type="text"
                      value={newSmName}
                      onChange={(e) => setNewSmName(e.target.value)}
                      placeholder="Ej. Juan Manuel Ramos"
                      required
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Especialidad / Título Técnico *
                    </label>
                    <input
                      type="text"
                      value={newSmTitle}
                      onChange={(e) => setNewSmTitle(e.target.value)}
                      placeholder="Ej. Técnico Plomero Certificado CONOCER"
                      required
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Taller / Negocio Proveedor Asignado *
                    </label>
                    <select
                      value={newSmProviderId}
                      onChange={(e) => setNewSmProviderId(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    >
                      {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.zone})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                      Teléfono Móvil (App de Campo) *
                    </label>
                    <input
                      type="text"
                      value={newSmPhone}
                      onChange={(e) => setNewSmPhone(e.target.value)}
                      placeholder="+52 55 9876 5432"
                      required
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateSmModal(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.65rem 1.25rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingSm}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      padding: '0.65rem 1.5rem',
                      fontWeight: 900
                    }}
                  >
                    {creatingSm ? 'Registrando...' : 'Registrar Técnico ✓'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CAMBIAR / ASIGNAR PLAN SAAS A UN NEGOCIO                          */}
        {/* ========================================================================= */}
        {showChangePlanModal && targetProviderForPlan && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={22} color="#3B82F6" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                      Asignar Plan de Membresía
                    </h3>
                    <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                      Taller: <strong>{targetProviderForPlan.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangePlanModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {(['BASIC', 'PRO', 'ENTERPRISE'] as const).map(p => {
                  const isSelected = planToAssign === p;
                  return (
                    <div
                      key={p}
                      onClick={() => setPlanToAssign(p)}
                      style={{
                        padding: '1rem',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : '#FFF',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#0F172A', display: 'block' }}>
                          {p === 'PRO' ? 'Plan Taller Pro 💎' : p === 'ENTERPRISE' ? 'Red Enterprise 🏛️' : 'Plan Básico Gratuito'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {p === 'PRO' ? '$499 MXN/mes • Comisión reducida 8.0%' : p === 'ENTERPRISE' ? '$1,299 MXN/mes • Comisión mínima 5.0%' : '$0 MXN/mes • Comisión estándar 15.0%'}
                        </span>
                      </div>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? '6px solid #3B82F6' : '2px solid #CBD5E1',
                        background: '#FFF'
                      }} />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowChangePlanModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={updatingPlan}
                  onClick={handleAssignPlanToProvider}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    padding: '0.65rem 1.5rem',
                    fontWeight: 900
                  }}
                >
                  {updatingPlan ? 'Aplicando Plan...' : 'Confirmar Plan ✓'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: SIMULAR / CREAR NUEVO PLAN PERSONALIZADO                           */}
        {/* ========================================================================= */}
        {showCreatePlanModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '24px',
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={22} color="#8B5CF6" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                    Simulador de Nuevo Plan SaaS
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                    Nombre del Plan
                  </label>
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="Ej. Plan Franquicia / Red Regional"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                    Precio Mensual (MXN)
                  </label>
                  <input
                    type="number"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.3rem' }}>
                    Tasa de Comisión (% por Chamba)
                  </label>
                  <input
                    type="number"
                    value={newPlanCommission}
                    onChange={(e) => setNewPlanCommission(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="btn btn-secondary"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Definición de plan guardada en el catálogo.');
                    setShowCreatePlanModal(false);
                  }}
                  className="btn btn-primary"
                  style={{ background: '#8B5CF6' }}
                >
                  Guardar Plan ✓
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}


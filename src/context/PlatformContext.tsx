"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api, Category, Provider, Serviceman, ServiceItem, Booking, User } from '../lib/api';

interface PlatformContextType {
  currentUser: User | null;
  authToken: string | null;
  isLoadingAuth: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  loginWithRole: (email: string, pass: string, expectedRole?: 'CUSTOMER' | 'PROVIDER' | 'SERVICEMAN' | 'ADMIN') => Promise<User>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; otpPreview?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<User>;
  registerUser: (data: any) => Promise<User>;
  logout: () => void;
  quickSwitchRole: (role: 'CUSTOMER' | 'PROVIDER' | 'SERVICEMAN' | 'ADMIN') => Promise<void>;

  // Catalog & Entities
  categories: Category[];
  providers: Provider[];
  servicemen: Serviceman[];
  services: ServiceItem[];
  bookings: Booking[];
  gateways: Record<string, { name: string; enabled: boolean; feePercent: number }>;
  smsLogs: { id: string; to: string; text: string; time: string }[];
  customerUser: { name: string; email: string; phone: string; address: string; walletBalance: number };

  activeProviderId: string;
  setActiveProviderId: (id: string) => void;
  activeServicemanId: string;
  setActiveServicemanId: (id: string) => void;

  bookingModalService: ServiceItem | null;
  setBookingModalService: (srv: ServiceItem | null) => void;
  trackingBookingId: string | null;
  setTrackingBookingId: (id: string | null) => void;
  checkoutBookingId: string | null;
  setCheckoutBookingId: (id: string | null) => void;
  invoicingBookingId: string | null;
  setInvoicingBookingId: (id: string | null) => void;
  disputeBookingId: string | null;
  setDisputeBookingId: (id: string | null) => void;
  fieldOpsBookingId: string | null;
  setFieldOpsBookingId: (id: string | null) => void;
  showEmergencyModal: boolean;
  setShowEmergencyModal: (show: boolean) => void;
  activeEmergencyBookingId: string | null;
  setActiveEmergencyBookingId: (id: string | null) => void;
  showAiDiagnosticModal: boolean;
  setShowAiDiagnosticModal: (show: boolean) => void;
  showReferralModal: boolean;
  setShowReferralModal: (show: boolean) => void;
  refreshData: () => Promise<void>;
  notifications: { id: string; title: string; message: string; time: string }[];

  // Action methods
  createNewBooking: (data: any) => Promise<Booking>;
  acceptBooking: (id: string) => Promise<void>;
  assignServiceman: (bookingId: string, servicemanId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: string, otp?: string) => Promise<void>;
  submitReview: (bookingId: string, rating: number, reviewText: string) => Promise<void>;
  approveProvider: (id: string) => Promise<void>;
  updateCommissionRate: (id: string, rate: number) => Promise<void>;
  addCustomerWallet: (amount: number) => void;
  addNewService: (data: Partial<ServiceItem>) => Promise<void>;
  addNewServiceman: (data: Partial<Serviceman>) => Promise<void>;
  requestPayout: (id: string, amount: number) => Promise<void>;
  toggleGateway: (key: string) => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | null>(null);

export const PlatformProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [servicemen, setServicemen] = useState<Serviceman[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [gateways, setGateways] = useState<Record<string, any>>({});
  const [smsLogs, setSmsLogs] = useState<any[]>([]);

  const [activeProviderId, setActiveProviderId] = useState('prov-1');
  const [activeServicemanId, setActiveServicemanId] = useState('sm-1');

  const [customerUser, setCustomerUser] = useState({
    name: 'Fernanda Gómez',
    email: 'fernanda.gomez@gmail.com',
    phone: '+52 55 7281 1933',
    address: 'Calle Orizaba 142, Depto 4B, Col. Roma Norte, CDMX',
    walletBalance: 1850.00
  });

  const [bookingModalService, setBookingModalService] = useState<ServiceItem | null>(null);
  const [trackingBookingId, setTrackingBookingId] = useState<string | null>(null);
  const [checkoutBookingId, setCheckoutBookingId] = useState<string | null>(null);
  const [invoicingBookingId, setInvoicingBookingId] = useState<string | null>(null);
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [fieldOpsBookingId, setFieldOpsBookingId] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [activeEmergencyBookingId, setActiveEmergencyBookingId] = useState<string | null>(null);
  const [showAiDiagnosticModal, setShowAiDiagnosticModal] = useState<boolean>(false);
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'ChambaYa Autenticación JWT Activa',
      message: 'Tokens de seguridad con firma HMAC SHA-256 habilitados en NestJS.',
      time: 'Hace un momento'
    }
  ]);

  const addNotification = (title: string, message: string) => {
    setNotifications(prev => [
      { id: `notif-${Date.now()}`, title, message, time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) },
      ...prev.slice(0, 9)
    ]);
  };

  // Cargar datos en vivo desde la API de NestJS con Prisma
  const refreshData = async () => {
    try {
      const [cats, provs, servs, techs, bks, gws, sms] = await Promise.all([
        api.getCategories().catch(() => []),
        api.getProviders().catch(() => []),
        api.getServices().catch(() => []),
        api.getServicemen().catch(() => []),
        api.getBookings().catch(() => []),
        api.getGateways().catch(() => ({})),
        api.getSmsLogs().catch(() => [])
      ]);

      if (cats.length) setCategories(cats);
      if (provs.length) setProviders(provs);
      if (servs.length) setServices(servs);
      if (techs.length) setServicemen(techs);
      if (bks.length) setBookings(bks);
      if (Object.keys(gws).length) setGateways(gws);
      if (sms.length) setSmsLogs(sms);
    } catch (err) {
      console.warn('Error al cargar datos de ChambaYa:', err);
    }
  };

  // Autenticación inicial: verificar token persistido en localStorage
  useEffect(() => {
    refreshData();

    const initAuth = async () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('chambaya_jwt_token') : null;
        if (storedToken) {
          const profile = await api.getMe(storedToken);
          setCurrentUser(profile);
          setAuthToken(storedToken);
          if (profile.role === 'CUSTOMER') {
            setCustomerUser({
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              address: profile.address || 'CDMX',
              walletBalance: profile.walletBalance
            });
          }
          if (profile.role === 'PROVIDER' && profile.provider?.id) {
            setActiveProviderId(profile.provider.id);
          }
          if (profile.role === 'SERVICEMAN' && profile.serviceman?.id) {
            setActiveServicemanId(profile.serviceman.id);
          }
        }
      } catch (e) {
        console.warn('Sesión no encontrada o expirada:', e);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('chambaya_jwt_token');
        }
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();
  }, []);

  const loginWithRole = async (
    email: string,
    pass: string,
    expectedRole?: 'CUSTOMER' | 'PROVIDER' | 'SERVICEMAN' | 'ADMIN'
  ): Promise<User> => {
    const auth = await api.login(email, pass);
    if (expectedRole && auth.user.role !== expectedRole && auth.user.role !== 'ADMIN') {
      throw new Error(`Acceso denegado: Esta cuenta tiene rol [${auth.user.role}]. Se requiere rol [${expectedRole}] para ingresar a este portal.`);
    }
    setCurrentUser(auth.user);
    setAuthToken(auth.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chambaya_jwt_token', auth.accessToken);
    }
    if (auth.user.role === 'CUSTOMER') {
      setCustomerUser({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone,
        address: auth.user.address || 'CDMX',
        walletBalance: auth.user.walletBalance
      });
    }
    if (auth.user.role === 'PROVIDER' && auth.user.provider?.id) {
      setActiveProviderId(auth.user.provider.id);
    }
    if (auth.user.role === 'SERVICEMAN' && auth.user.serviceman?.id) {
      setActiveServicemanId(auth.user.serviceman.id);
    }
    addNotification('Sesión Iniciada', `Bienvenido al portal, ${auth.user.name} (${auth.user.role})`);
    return auth.user;
  };

  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    return loginWithRole(email, pass);
  };

  const sendOtp = async (phone: string) => {
    return api.sendOtp(phone);
  };

  const verifyOtp = async (phone: string, code: string): Promise<User> => {
    const auth = await api.verifyOtp(phone, code);
    setCurrentUser(auth.user);
    setAuthToken(auth.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chambaya_jwt_token', auth.accessToken);
    }
    setCustomerUser({
      name: auth.user.name,
      email: auth.user.email,
      phone: auth.user.phone,
      address: auth.user.address || 'CDMX',
      walletBalance: auth.user.walletBalance
    });
    addNotification('Celular Verificado', `Acceso concedido vía SMS OTP.`);
    return auth.user;
  };

  const registerUser = async (data: any): Promise<User> => {
    const auth = await api.register(data);
    setCurrentUser(auth.user);
    setAuthToken(auth.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chambaya_jwt_token', auth.accessToken);
    }
    addNotification('Cuenta Creada', `¡Tu cuenta ChambaYa fue creada con éxito!`);
    return auth.user;
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chambaya_jwt_token');
    }
    addNotification('Sesión Cerrada', 'Has cerrado tu sesión de ChambaYa.');
  };

  const quickSwitchRole = async (role: 'CUSTOMER' | 'PROVIDER' | 'SERVICEMAN' | 'ADMIN') => {
    const credentials = {
      CUSTOMER: { email: 'fernanda.gomez@gmail.com', pass: 'chambaya123' },
      PROVIDER: { email: 'contacto@tecnicosdelvalle.mx', pass: 'chambaya123' },
      SERVICEMAN: { email: 'carlos.mendoza@tecnicosdelvalle.mx', pass: 'chambaya123' },
      ADMIN: { email: 'admin@chambaya.mx', pass: 'admin123' }
    };

    const cred = credentials[role];
    const user = await loginWithEmail(cred.email, cred.pass);
    if (role === 'PROVIDER' && user.provider) {
      setActiveProviderId(user.provider.id);
    } else if (role === 'SERVICEMAN' && user.serviceman) {
      setActiveServicemanId(user.serviceman.id);
    }
  };

  const createNewBooking = async (bookingData: any) => {
    const created = await api.createBooking({
      ...bookingData,
      customerName: currentUser?.name || customerUser.name,
      customerPhone: currentUser?.phone || customerUser.phone,
      customerEmail: currentUser?.email || customerUser.email,
      customerAddress: bookingData.address || currentUser?.address || customerUser.address
    });

    if (bookingData.paymentMethod === 'wallet') {
      setCustomerUser(prev => ({ ...prev, walletBalance: Math.max(0, prev.walletBalance - created.amount) }));
      if (currentUser) {
        setCurrentUser({ ...currentUser, walletBalance: Math.max(0, currentUser.walletBalance - created.amount) });
      }
    }

    setBookings(prev => [created, ...prev]);
    addNotification('¡Chamba Solicitada!', `Tu solicitud ${created.id} ha sido registrada en base de datos.`);

    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch {}

    return created;
  };

  const acceptBooking = async (id: string) => {
    const updated = await api.acceptBooking(id);
    setBookings(prev => prev.map(b => b.id === id ? updated : b));
    addNotification('Chamba Aceptada', `La chamba ${id} fue confirmada en base de datos.`);
  };

  const assignServiceman = async (bookingId: string, servicemanId: string) => {
    const updated = await api.assignServiceman(bookingId, servicemanId);
    setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    setServicemen(prev => prev.map(s => s.id === servicemanId ? { ...s, status: 'busy', activeBookingId: bookingId } : s));
    addNotification('Chambeador Asignado', `Técnico de campo asignado y notificado.`);
  };

  const updateBookingStatus = async (bookingId: string, status: string, otp?: string) => {
    const updated = await api.updateBookingStatus(bookingId, status, otp);
    setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    if (status === 'completed') {
      addNotification('¡Chamba Concluida!', `El servicio para la orden ${bookingId} fue finalizado y los fondos liberados.`);
      refreshData();
    }
  };

  const submitReview = async (bookingId: string, rating: number, reviewText: string) => {
    const updated = await api.submitReview(bookingId, rating, reviewText);
    setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    addNotification('Calificación Enviada', `¡Gracias por calificar la chamba ${bookingId}!`);
  };

  const approveProvider = async (id: string) => {
    const updated = await api.approveKyc(id);
    setProviders(prev => prev.map(p => p.id === id ? updated : p));
    addNotification('Negocio Aprobado', `Expediente KYC aprobado en base de datos.`);
  };

  const updateCommissionRate = async (id: string, rate: number) => {
    const updated = await api.updateCommissionRate(id, rate);
    setProviders(prev => prev.map(p => p.id === id ? updated : p));
  };

  const addCustomerWallet = (amount: number) => {
    setCustomerUser(prev => ({ ...prev, walletBalance: prev.walletBalance + amount }));
    if (currentUser) {
      setCurrentUser(prev => prev ? ({ ...prev, walletBalance: prev.walletBalance + amount }) : null);
    }
    addNotification('Saldo Recargado', `+$${amount.toFixed(2)} MXN acreditados a tu monedero ChambaYa.`);
  };

  const addNewService = async (data: Partial<ServiceItem>) => {
    const created = await api.createService(data);
    setServices(prev => [created, ...prev]);
    addNotification('Servicio Publicado', `"${created.title}" guardado en la base de datos.`);
  };

  const addNewServiceman = async (data: Partial<Serviceman>) => {
    const created = await api.createServiceman(data);
    setServicemen(prev => [created, ...prev]);
    addNotification('Chambeador Registrado', `${created.name} agregado a tu cuadrilla.`);
  };

  const requestPayout = async (id: string, amount: number) => {
    await api.requestPayout(id, amount);
    setProviders(prev => prev.map(p => p.id === id ? { ...p, walletBalance: Math.max(0, p.walletBalance - amount) } : p));
    addNotification('Transferencia SPEI', `Retiro de $${amount.toFixed(2)} MXN registrado hacia tu cuenta CLABE.`);
  };

  const toggleGateway = async (key: string) => {
    const updated = await api.toggleGateway(key);
    setGateways(prev => ({ ...prev, [key]: updated }));
  };

  return (
    <PlatformContext.Provider
      value={{
        currentUser,
        authToken,
        isLoadingAuth,
        loginWithEmail,
        loginWithRole,
        sendOtp,
        verifyOtp,
        registerUser,
        logout,
        quickSwitchRole,
        categories,
        providers,
        servicemen,
        services,
        bookings,
        gateways,
        smsLogs,
        customerUser,
        activeProviderId,
        setActiveProviderId,
        activeServicemanId,
        setActiveServicemanId,
        bookingModalService,
        setBookingModalService,
        trackingBookingId,
        setTrackingBookingId,
        checkoutBookingId,
        setCheckoutBookingId,
        invoicingBookingId,
        setInvoicingBookingId,
        disputeBookingId,
        setDisputeBookingId,
        fieldOpsBookingId,
        setFieldOpsBookingId,
        showEmergencyModal,
        setShowEmergencyModal,
        activeEmergencyBookingId,
        setActiveEmergencyBookingId,
        showAiDiagnosticModal,
        setShowAiDiagnosticModal,
        showReferralModal,
        setShowReferralModal,
        refreshData,
        notifications,
        createNewBooking,
        acceptBooking,
        assignServiceman,
        updateBookingStatus,
        submitReview,
        approveProvider,
        updateCommissionRate,
        addCustomerWallet,
        addNewService,
        addNewServiceman,
        requestPayout,
        toggleGateway
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform debe usarse dentro de PlatformProvider');
  return ctx;
};

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:4000');

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'SERVICEMAN' | 'ADMIN';
  address?: string;
  avatar?: string;
  walletBalance: number;
  provider?: Provider | null;
  serviceman?: Serviceman | null;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  badge: string;
  image: string;
  description: string;
  servicesCount: number;
}

export interface Provider {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  zone: string;
  rating: number;
  reviewsCount: number;
  servicesCount?: number;
  servicemenCount?: number;
  status: 'active' | 'pending' | 'suspended';
  commissionRate: number;
  totalEarnings: number;
  walletBalance: number;
  avatar: string;
  clabeAccount?: string;
  bankName?: string;
  rfc?: string;
  curp?: string;
  regimenFiscal?: string;
  subscriptionPlan?: 'BASIC' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus?: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  subscriptionBadge?: 'STANDARD' | 'DIAMOND' | 'ENTERPRISE';
  subscriptionRenewsAt?: string;
}

export interface Serviceman {
  id: string;
  providerId: string;
  name: string;
  title: string;
  phone: string;
  rating: number;
  completedJobs: number;
  avatar: string;
  status: 'available' | 'busy' | 'offline' | 'suspended';
  currentLat?: number;
  currentLng?: number;
  currentAddress?: string;
  activeBookingId?: string | null;
  isVerified?: boolean;
  verificationBadge?: string;
  trustScore?: number;
  kycVerification?: KycVerification;
}

export interface ServiceItem {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  duration: string;
  rating: number;
  reviewsCount: number;
  image: string;
  badge: string;
  variants: { name: string; priceAdd: number }[];
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  providerId: string;
  providerName: string;
  servicemanId: string | null;
  servicemanName: string | null;
  servicemanPhone: string | null;
  servicemanAvatar: string | null;
  status: 'pending' | 'accepted' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTimeSlot: string;
  createdAt: string;
  amount: number;
  platformFee: number;
  providerEarnings: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid';
  transactionId: string;
  otp: string;
  rating?: number | null;
  reviewText?: string;
  timeline: { status: string; time: string; label: string }[];
}

export interface Invoice {
  id: string;
  uuid: string;
  bookingId: string;
  serie: string;
  folio: number;
  rfcEmisor: string;
  nombreEmisor: string;
  regimenEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  domicilioFiscalReceptor: string;
  regimenReceptor: string;
  usoCfdi: string;
  subtotal: number;
  iva: number;
  total: number;
  formaPago: string;
  metodoPago: string;
  claveProdServ: string;
  claveUnidad: string;
  fechaTimbrado: string;
  selloEmisor: string;
  selloSat: string;
  noCertificadoSat: string;
  cadenaOriginal: string;
  xmlContent: string;
  qrCodeUrl: string;
  status: string;
}

export interface TaxRetention {
  id: string;
  bookingId: string;
  providerId: string;
  grossAmount: number;
  platformFee: number;
  platformFeeIva: number;
  isrRetentionRate: number;
  isrRetained: number;
  ivaRetentionRate: number;
  ivaRetained: number;
  netPayout: number;
  payoutStatus: string;
  clabe: string;
  bankName: string;
  createdAt: string;
  booking?: Booking;
}

export interface ProviderTaxReport {
  provider: {
    id: string;
    name: string;
    rfc: string;
    curp: string;
    regimenFiscal: string;
    clabeAccount: string;
    bankName: string;
  };
  summary: {
    periodo: string;
    totalServicios: number;
    totalGross: number;
    totalIsrRetained: number;
    totalIvaRetained: number;
    totalPlatformFees: number;
    totalNetDispersed: number;
    isrRatePercentage: number;
    ivaRatePercentage: number;
  };
  retentions: TaxRetention[];
}

export interface GlobalTaxReport {
  periodo: string;
  totalChambasRetenidas: number;
  totalFacturasTimbradas: number;
  totalGross: number;
  totalInvoiced: number;
  totalIsrToEnterSat: number;
  totalIvaToEnterSat: number;
  totalRetentionsToEnterSat: number;
  totalPlatformRevenue: number;
  retentions: any[];
  invoices: Invoice[];
}

export const api = {
  // Authentication
  async sendOtp(phone: string): Promise<{ success: boolean; message: string; otpPreview?: string }> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    if (!res.ok) throw new Error('Error al enviar código SMS');
    return res.json();
  },

  async verifyOtp(phone: string, code: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Código incorrecto o expirado');
    }
    return res.json();
  },

  async login(email: string, pass: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Credenciales inválidas');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; phone: string; password: string; role?: string; address?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al registrar usuario');
    }
    return res.json();
  },

  async getMe(token: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Sesión no válida');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Services
  async getServices(params: { categoryId?: string; providerId?: string } = {}): Promise<ServiceItem[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const url = `${API_BASE}/services${query ? `?${query}` : ''}`;
    const res = await fetch(url, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  async createService(data: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Providers
  async getProviders(): Promise<Provider[]> {
    const res = await fetch(`${API_BASE}/providers`, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error('Failed to fetch providers');
    return res.json();
  },

  async createProvider(data: Partial<Provider>): Promise<Provider> {
    const res = await fetch(`${API_BASE}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al registrar nuevo negocio');
    return res.json();
  },

  async approveKyc(providerId: string): Promise<Provider> {
    const res = await fetch(`${API_BASE}/providers/${providerId}/kyc-approve`, { method: 'POST' });
    return res.json();
  },

  async updateCommissionRate(providerId: string, rate: number): Promise<Provider> {
    const res = await fetch(`${API_BASE}/providers/${providerId}/commission`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commissionRate: rate })
    });
    return res.json();
  },

  async toggleProviderStatus(providerId: string): Promise<Provider> {
    const res = await fetch(`${API_BASE}/providers/${providerId}/toggle-status`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async updateProviderStatus(providerId: string, status: string): Promise<Provider> {
    const res = await fetch(`${API_BASE}/providers/${providerId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async updateProviderPlan(providerId: string, plan: 'BASIC' | 'PRO' | 'ENTERPRISE'): Promise<Provider> {
    const res = await fetch(`${API_BASE}/providers/${providerId}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    return res.json();
  },

  async deleteProvider(providerId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/providers/${providerId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getAdminPayouts(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/providers/admin/payouts`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar retiros');
    return res.json();
  },

  async approvePayout(payoutId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/providers/admin/payouts/${payoutId}/approve`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async requestPayout(providerId: string, amount: number) {
    const res = await fetch(`${API_BASE}/providers/${providerId}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return res.json();
  },

  // Servicemen
  async getServicemen(providerId?: string): Promise<Serviceman[]> {
    const url = `${API_BASE}/servicemen${providerId ? `?providerId=${providerId}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    return res.json();
  },

  async createServiceman(data: Partial<Serviceman>): Promise<Serviceman> {
    const res = await fetch(`${API_BASE}/servicemen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateServicemanStatus(id: string, status: string): Promise<Serviceman> {
    const res = await fetch(`${API_BASE}/servicemen/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async toggleServicemanBlock(id: string): Promise<Serviceman> {
    const res = await fetch(`${API_BASE}/servicemen/${id}/toggle-block`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async deleteServiceman(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/servicemen/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async assignPlanToProvider(providerId: string, plan: 'BASIC' | 'PRO' | 'ENTERPRISE'): Promise<any> {
    const res = await fetch(`${API_BASE}/subscriptions/admin/assign-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, plan })
    });
    return res.json();
  },

  // Bookings
  async getBookings(params: { providerId?: string; servicemanId?: string; status?: string } = {}): Promise<Booking[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const url = `${API_BASE}/bookings${query ? `?${query}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    return res.json();
  },

  async createBooking(data: any): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async acceptBooking(id: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/accept`, { method: 'POST' });
    return res.json();
  },

  async assignServiceman(id: string, servicemanId: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servicemanId })
    });
    return res.json();
  },

  async updateBookingStatus(id: string, status: string, otp?: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, otp })
    });
    return res.json();
  },

  async submitReview(id: string, rating: number, reviewText: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, reviewText })
    });
    return res.json();
  },

  async getGateways() {
    const res = await fetch(`${API_BASE}/payments/gateways`, { next: { revalidate: 30 } });
    return res.json();
  },

  async toggleGateway(key: string) {
    const res = await fetch(`${API_BASE}/payments/gateways/${key}/toggle`, { method: 'PATCH' });
    return res.json();
  },

  async getSmsLogs() {
    const res = await fetch(`${API_BASE}/sms/logs`, { cache: 'no-store' });
    return res.json();
  },

  async sendSms(to: string, text: string) {
    const res = await fetch(`${API_BASE}/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, text })
    });
    return res.json();
  },

  async getChatMessages(bookingId: string) {
    const res = await fetch(`${API_BASE}/chat/${bookingId}/messages`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async sendChatMessage(bookingId: string, data: { senderId: string; senderName: string; senderRole: string; text: string }) {
    const res = await fetch(`${API_BASE}/chat/${bookingId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Payments & Real-time Webhooks
  async createPaymentIntent(bookingId: string, gateway: string, amount?: number) {
    const res = await fetch(`${API_BASE}/payments/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, gateway, amount })
    });
    if (!res.ok) throw new Error('Error al generar intención de pago');
    return res.json();
  },

  async getBookingPayment(bookingId: string) {
    const res = await fetch(`${API_BASE}/payments/booking/${bookingId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar pago de la chamba');
    return res.json();
  },

  async simulatePaymentWebhook(bookingId: string, gateway: string) {
    const res = await fetch(`${API_BASE}/payments/simulate-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, gateway })
    });
    if (!res.ok) throw new Error('Error al simular webhook');
    return res.json();
  },

  async getWebhookLogs(limit = 20) {
    const res = await fetch(`${API_BASE}/payments/webhooks/logs?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  // SAT CFDI 4.0 & Plataformas Tecnológicas Retenciones
  async calculateFiscalRetentions(grossAmount: number, hasRfc = true, commissionRate = 15.0) {
    const res = await fetch(`${API_BASE}/fiscal/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grossAmount, hasRfc, commissionRate })
    });
    return res.json();
  },

  async generateCfdi(data: {
    bookingId: string;
    rfcReceptor: string;
    nombreReceptor: string;
    domicilioFiscalReceptor: string;
    regimenReceptor: string;
    usoCfdi: string;
    formaPago?: string;
  }): Promise<Invoice> {
    const res = await fetch(`${API_BASE}/fiscal/cfdi/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al timbrar factura CFDI 4.0');
    }
    return res.json();
  },

  async getCfdi(bookingId: string): Promise<Invoice | null> {
    const res = await fetch(`${API_BASE}/fiscal/cfdi/${bookingId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  },

  async getProviderTaxRetentions(providerId: string): Promise<ProviderTaxReport> {
    const res = await fetch(`${API_BASE}/fiscal/provider/${providerId}/retentions`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar retenciones del proveedor');
    return res.json();
  },

  async getAdminTaxSummary(): Promise<GlobalTaxReport> {
    const res = await fetch(`${API_BASE}/fiscal/admin/summary`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar reporte fiscal global');
    return res.json();
  },

  // PWA & Web Push Notifications
  async getVapidKey(): Promise<{ publicKey: string }> {
    const res = await fetch(`${API_BASE}/notifications/vapid-key`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener clave VAPID');
    return res.json();
  },

  async subscribePushDevice(data: {
    userId?: string;
    role?: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string;
  }) {
    const res = await fetch(`${API_BASE}/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al registrar dispositivo');
    return res.json();
  },

  async sendTestPushNotification(data: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    role?: string;
  }) {
    const res = await fetch(`${API_BASE}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getPwaStats() {
    const res = await fetch(`${API_BASE}/notifications/stats`, { cache: 'no-store' });
    if (!res.ok) return { totalDispositivosPwa: 0, totalNotificacionesEnviadas: 0, distribucionRoles: [] };
    return res.json();
  },

  async getNotificationFeed(role?: string, limit = 20) {
    const query = new URLSearchParams();
    if (role) query.append('role', role);
    if (limit) query.append('limit', limit.toString());
    const res = await fetch(`${API_BASE}/notifications/feed?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async syncOfflineActions(actions: Array<{ type: string; payload: any; clientTimestamp?: string }>, userId?: string) {
    const res = await fetch(`${API_BASE}/notifications/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions, userId })
    });
    if (!res.ok) throw new Error('Error al sincronizar cola offline');
    return res.json();
  },

  // ==========================================
  // KYC IDENTITY VERIFICATION (OPCIÓN G)
  // ==========================================
  async validateCurp(curp: string) {
    const res = await fetch(`${API_BASE}/kyc/validate-curp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curp })
    });
    return res.json();
  },

  async validateRfc(rfc: string) {
    const res = await fetch(`${API_BASE}/kyc/validate-rfc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfc })
    });
    return res.json();
  },

  async simulateIneOcr(nameHint?: string) {
    const res = await fetch(`${API_BASE}/kyc/simulate-ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameHint })
    });
    return res.json();
  },

  async simulateFacematch() {
    const res = await fetch(`${API_BASE}/kyc/simulate-facematch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    return res.json();
  },

  async getKycExpediente(servicemanId: string) {
    const res = await fetch(`${API_BASE}/kyc/serviceman/${servicemanId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar expediente KYC');
    return res.json();
  },

  async submitKycExpediente(servicemanId: string, data: any) {
    const res = await fetch(`${API_BASE}/kyc/serviceman/${servicemanId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al enviar documentación KYC');
    return res.json();
  },

  async getAdminKycExpedientes(status?: string) {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/kyc/admin/expedientes${query}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async dictamenKyc(id: string, decision: 'APPROVED' | 'REJECTED', notes: string) {
    const res = await fetch(`${API_BASE}/kyc/admin/${id}/dictamen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes, adminUser: 'SuperAdmin ChambaYa' })
    });
    if (!res.ok) throw new Error('Error al emitir dictamen');
    return res.json();
  },

  async getKycStats() {
    const res = await fetch(`${API_BASE}/kyc/stats`, { cache: 'no-store' });
    if (!res.ok) return { totalExpedientes: 0, aprobados: 0, enRevision: 0, rechazados: 0, totalChambeadores: 0, chambeadoresVerificados: 0, porcentajeVerificacion: 0 };
    return res.json();
  },

  // Escrow & Satisfaction Guarantee
  async getEscrowByBooking(bookingId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/escrow/booking/${bookingId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener bóveda de garantía');
    return res.json();
  },

  async confirmEscrowSatisfaction(bookingId: string, rating: number = 5, reviewText: string = ''): Promise<any> {
    const res = await fetch(`${API_BASE}/escrow/booking/${bookingId}/confirm-satisfaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, reviewText })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al liberar fondos de garantía');
    }
    return res.json();
  },

  async openEscrowDispute(bookingId: string, data: { reason: string; description: string; evidencePhotos?: string; requestedRefund?: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/escrow/booking/${bookingId}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al abrir disputa de garantía');
    }
    return res.json();
  },

  async getAdminEscrowDisputes(status?: string): Promise<EscrowDispute[]> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/escrow/admin/disputes${query}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  },

  async resolveEscrowDispute(
    id: string,
    data: {
      decision: 'RELEASE_TO_PROVIDER' | 'REFUND_CUSTOMER_FULL' | 'SPLIT_SETTLEMENT' | 'INSURANCE_CLAIM';
      adminNotes: string;
      refundAmount?: number;
      releaseAmount?: number;
      mediatorName?: string;
    }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/escrow/admin/disputes/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al dictaminar resolución de mediación');
    }
    return res.json();
  },

  async getEscrowStats(): Promise<EscrowStats> {
    const res = await fetch(`${API_BASE}/escrow/stats`, { cache: 'no-store' });
    if (!res.ok) {
      return {
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
      };
    }
    return res.json();
  },

  async getSystemHealth(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // Operaciones de Campo (FieldOps) & Evidencias Antes/Después & Refacciones
  async getFieldOps(bookingId: string): Promise<BookingFieldOps> {
    const res = await fetch(`${API_BASE}/field-ops/booking/${bookingId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener datos de campo');
    return res.json();
  },

  async addBookingEvidence(bookingId: string, data: { type: 'BEFORE' | 'AFTER' | 'IN_PROGRESS'; photoUrl: string; description?: string }): Promise<BookingEvidence> {
    const res = await fetch(`${API_BASE}/field-ops/booking/${bookingId}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al registrar evidencia fotográfica');
    return res.json();
  },

  async requestMaterialItem(bookingId: string, data: { description: string; storeName?: string; ticketPhotoUrl: string; amount: number }): Promise<BookingMaterialItem> {
    const res = await fetch(`${API_BASE}/field-ops/booking/${bookingId}/materials/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al solicitar cargo de materiales');
    return res.json();
  },

  async respondMaterialItem(itemId: string, data: { approved: boolean; rejectionReason?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/field-ops/materials/${itemId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al responder solicitud de material');
    return res.json();
  },

  // Emergency ChambaExpress 24/7
  async quoteEmergency(dto: { emergencyType: string; severity?: string; address: string }): Promise<EmergencyQuote> {
    const res = await fetch(`${API_BASE}/emergency/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) throw new Error('Error al cotizar tarifa de emergencia');
    return res.json();
  },

  async createEmergency(dto: any): Promise<any> {
    const res = await fetch(`${API_BASE}/emergency/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) throw new Error('Error al solicitar despacho de emergencia');
    return res.json();
  },

  async getActiveEmergencies(): Promise<{ totalEmergencies: number; activeCount: number; dispatches: EmergencyDispatch[] }> {
    const res = await fetch(`${API_BASE}/emergency/active`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar emergencias activas');
    return res.json();
  },

  async getEmergency(bookingId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/emergency/${bookingId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar emergencia');
    return res.json();
  },

  async acceptEmergency(bookingId: string, servicemanId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/emergency/${bookingId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servicemanId })
    });
    if (!res.ok) throw new Error('Error al aceptar despacho de emergencia');
    return res.json();
  },

  // ChambaIA AI Diagnostics & Smart Quotes
  async getAiPresets(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/ai-diagnostic/presets`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener presets de ChambaIA');
    return res.json();
  },

  async analyzeAiProblem(dto: { description?: string; photoUrl?: string }): Promise<AiDiagnosticResult> {
    const res = await fetch(`${API_BASE}/ai-diagnostic/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) throw new Error('Error al analizar avería con ChambaIA');
    return res.json();
  },

  async getAiDiagnostic(diagnosticId: string): Promise<AiDiagnosticResult> {
    const res = await fetch(`${API_BASE}/ai-diagnostic/${diagnosticId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar diagnóstico');
    return res.json();
  },

  async convertAiDiagnosticToBooking(dto: any): Promise<any> {
    const res = await fetch(`${API_BASE}/ai-diagnostic/convert-to-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) throw new Error('Error al convertir diagnóstico en orden');
    return res.json();
  },

  // Promotions, Coupons & Referral Program ("Invita a un Compa")
  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/promotions`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar cupones');
    return res.json();
  },

  async createCoupon(data: any): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/promotions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear cupón');
    }
    return res.json();
  },

  async toggleCoupon(id: string): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/promotions/${id}/toggle`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Error al cambiar estatus del cupón');
    return res.json();
  },

  async validateCoupon(code: string, amount: number, userId?: string): Promise<CouponValidationResult> {
    const res = await fetch(`${API_BASE}/promotions/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, amount, userId })
    });
    return res.json();
  },

  async recordRedemption(dto: {
    code: string;
    bookingId?: string;
    userId?: string;
    userPhone?: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/promotions/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    return res.json();
  },

  async getUserReferral(userId: string, userName?: string): Promise<ReferralInfo> {
    const res = await fetch(`${API_BASE}/promotions/referral/${userId}?userName=${encodeURIComponent(userName || '')}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Error al obtener código de referidos');
    return res.json();
  },

  async getPromotionStats(): Promise<PromotionStats> {
    const res = await fetch(`${API_BASE}/promotions/stats`, { cache: 'no-store' });
    if (!res.ok) {
      return {
        totalCoupons: 4,
        totalRedemptions: 0,
        totalDiscountsGivenMXN: 18450,
        totalFriendsReferred: 82,
        totalReferralRewardsPaidMXN: 8200
      };
    }
    return res.json();
  },

  // Membresías ChambaYa Pro (SaaS Negocios)
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/subscriptions/plans`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar planes de suscripción');
    return res.json();
  },

  async getProviderSubscription(providerId: string): Promise<ProviderSubscription> {
    const res = await fetch(`${API_BASE}/subscriptions/provider/${providerId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar suscripción del negocio');
    return res.json();
  },

  async subscribeProvider(dto: {
    providerId: string;
    plan: 'PRO' | 'ENTERPRISE';
    paymentMethod?: string;
    cardLast4?: string;
    cardBrand?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/subscriptions/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) throw new Error('Error al activar suscripción');
    return res.json();
  },

  async cancelProviderSubscription(providerId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/subscriptions/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId })
    });
    if (!res.ok) throw new Error('Error al cancelar suscripción');
    return res.json();
  },

  async simulateSubscriptionRenewal(providerId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/subscriptions/simulate-renewal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId })
    });
    if (!res.ok) throw new Error('Error al simular cobro recurrente');
    return res.json();
  },

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const res = await fetch(`${API_BASE}/subscriptions/stats`, { cache: 'no-store' });
    if (!res.ok) {
      return {
        mrr: 48910,
        totalSubscribers: 92,
        proSubscribers: 74,
        enterpriseSubscribers: 18,
        averageTicketMXN: 531.63,
        churnRateMonthlyPct: 2.1,
        estimatedSavingsDeliveredMXN: 142300,
        plans: []
      };
    }
    return res.json();
  },

  // Almacenamiento y Carga de Archivos
  async uploadFile(file: File, category = 'general'): Promise<{
    success: boolean;
    url: string;
    filename: string;
    size: number;
    mimetype: string;
    category: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al subir archivo');
    }
    return res.json();
  },

  async uploadBase64(base64Data: string, category = 'kyc', filenameHint = 'capture'): Promise<{
    success: boolean;
    url: string;
    filename: string;
    size: number;
    mimetype: string;
    category: string;
  }> {
    const res = await fetch(`${API_BASE}/upload/base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, category, filenameHint }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al subir captura base64');
    }
    return res.json();
  }
};

export interface SubscriptionPlan {
  id: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  priceMonthlyMXN: number;
  commissionRate: number;
  badge: 'STANDARD' | 'DIAMOND' | 'ENTERPRISE';
  badgeLabel: string;
  isPopular?: boolean;
  features: string[];
}

export interface ProviderSubscription {
  providerId: string;
  providerName: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  commissionRate: number;
  badge: 'STANDARD' | 'DIAMOND' | 'ENTERPRISE';
  renewsAt?: string | null;
  planDetails: SubscriptionPlan;
  history: {
    id: string;
    plan: string;
    amount: number;
    currency?: string;
    status: string;
    renewalDate: string;
    paymentMethod: string;
    cardLast4?: string;
    cardBrand?: string;
    cfdiInvoiceUrl?: string;
    createdAt: string;
  }[];
}

export interface SubscriptionStats {
  mrr: number;
  totalSubscribers: number;
  proSubscribers: number;
  enterpriseSubscribers: number;
  averageTicketMXN: number;
  churnRateMonthlyPct: number;
  estimatedSavingsDeliveredMXN: number;
  plans: SubscriptionPlan[];
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  maxDiscountAmount?: number;
  maxUses: number;
  usedCount: number;
  validUntil?: string;
  isActive: boolean;
  _count?: { redemptions: number };
}

export interface CouponValidationResult {
  isValid: boolean;
  valid?: boolean;
  type?: 'COUPON' | 'REFERRAL';
  code: string;
  title?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  originalAmount?: number;
  finalAmount?: number;
  message: string;
  coupon?: Coupon | { code: string; title?: string; description?: string };
}

export interface ReferralInfo {
  id?: string;
  code: string;
  userId?: string;
  rewardAmount?: number;
  referredDiscount?: number;
  referredCount?: number;
  totalEarnedMXN?: number;
  pendingRewardMXN?: number;
  referrerReward?: number;
  refereeDiscount?: number;
  totalReferred?: number;
  totalEarned?: number;
  shareUrl?: string;
  whatsappUrl?: string;
  whatsappMessage?: string;
}

export interface PromotionStats {
  totalCoupons: number;
  totalRedemptions: number;
  totalDiscountsGivenMXN: number;
  totalFriendsReferred: number;
  totalReferralRewardsPaidMXN: number;
}

export interface KycVerification {
  id: string;
  servicemanId?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  trustScore: number;
  curp?: string;
  curpValidated: boolean;
  curpDetails?: string;
  rfc?: string;
  rfcValidated: boolean;
  ineClaveElector?: string;
  ineCic?: string;
  ineOcrNumber?: string;
  ineFrontUrl?: string;
  ineBackUrl?: string;
  ineValidated: boolean;
  selfieUrl?: string;
  faceMatchScore?: number;
  faceMatchPassed: boolean;
  antecedentesDocUrl?: string;
  antecedentesFolio?: string;
  antecedentesPassed: boolean;
  comprobanteDomicilioUrl?: string;
  domicilioPassed: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  submittedAt: string;
}

export interface EscrowDispute {
  id: string;
  escrowVaultId: string;
  bookingId: string;
  reason: string;
  description: string;
  evidencePhotos?: string | null;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_PROVIDER' | 'RESOLVED_CUSTOMER' | 'RESOLVED_SPLIT' | 'RESOLVED_INSURANCE';
  requestedRefund?: number | null;
  resolvedRefund?: number | null;
  resolvedRelease?: number | null;
  adminNotes?: string | null;
  mediatorName?: string | null;
  customerApproved: boolean;
  providerApproved: boolean;
  openedAt: string;
  resolvedAt?: string | null;
  escrowVault?: EscrowVault;
}

export interface EscrowVault {
  id: string;
  bookingId: string;
  totalAmount: number;
  providerEarnings: number;
  platformFee: number;
  currency: string;
  status: 'HELD_IN_ESCROW' | 'RELEASED' | 'DISPUTED' | 'REFUNDED' | 'SPLIT_SETTLED';
  heldAt: string;
  releasedAt?: string | null;
  guaranteeWindowHours: number;
  guaranteeExpiresAt: string;
  insuranceCovered: boolean;
  maxInsuranceCoverage: number;
  disputes?: EscrowDispute[];
  booking?: Booking;
}

export interface EscrowStats {
  totalBovedas: number;
  fondosEnCustodiaMXN: number;
  fondosLiberadosMXN: number;
  bovedasEnRetencion: number;
  bovedasLiberadas: number;
  bovedasEnDisputa: number;
  bovedasReembolsadas: number;
  disputasActivas: number;
  coberturaSeguroDanosMax: number;
  tasaResolucionGarantia: number;
}

export interface BookingEvidence {
  id: string;
  bookingId: string;
  type: 'BEFORE' | 'AFTER' | 'IN_PROGRESS';
  photoUrl: string;
  description?: string | null;
  capturedAt: string;
  lat?: number | null;
  lng?: number | null;
}

export interface BookingMaterialItem {
  id: string;
  bookingId: string;
  description: string;
  storeName: string;
  ticketPhotoUrl: string;
  amount: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID';
  requestedAt: string;
  approvedAt?: string | null;
  rejectedReason?: string | null;
}

export interface BookingFieldOps {
  bookingId: string;
  serviceTitle: string;
  status: string;
  baseAmount: number;
  materialsCost: number;
  totalAmount: number;
  evidences: BookingEvidence[];
  materials: BookingMaterialItem[];
  summary: {
    totalEvidences: number;
    hasBeforePhoto: boolean;
    hasAfterPhoto: boolean;
    totalMaterialsApproved: number;
    pendingApprovalsCount: number;
  };
}

export interface EmergencyQuote {
  emergencyType: string;
  emergencyTitle: string;
  severity: string;
  breakdown: {
    estimatedServiceBase: number;
    baseActivationFee: number;
    nightSurcharge: number;
    weekendSurcharge: number;
    severitySurcharge: number;
    totalSurcharge: number;
    totalEstimated: number;
  };
  targetEtaMinutes: number;
  isNight: boolean;
  isWeekend: boolean;
  guarantee: string;
}

export interface EmergencyDispatch {
  id: string;
  bookingId: string;
  severity: string;
  incidentDescription: string;
  emergencyAddress: string;
  clientPhone: string;
  targetEtaMinutes: number;
  dispatchRadiusKm: number;
  broadcastStartedAt: string;
  broadcastExpiresAt: string;
  status: 'SEARCHING' | 'ACCEPTED' | 'ON_SITE' | 'RESOLVED' | 'CANCELLED';
  acceptedServicemanId?: string | null;
  acceptedAt?: string | null;
  surchargeAmount: number;
  booking?: Booking;
}

export interface AiDiagnosticResult {
  diagnosticId: string;
  photoUrl?: string;
  customerQuery: string;
  problemTitle: string;
  tradeCategory: string;
  urgencyLevel: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  confidenceScore: number;
  plainDescription: string;
  technicalDiagnosis: string;
  rootCause: string;
  materialsRequired: {
    item: string;
    store: string;
    estimatedCostMxn: number;
    necessity: 'OBLIGATORIA' | 'RECOMENDADA';
  }[];
  laborEstimate: {
    minMxn: number;
    typicalMxn: number;
    maxMxn: number;
    durationMinutes: number;
  };
  totalEstimatedRange: {
    minMxn: number;
    maxMxn: number;
  };
  safetyAdvice: string[];
  nomReference: string;
  suggestedServiceId?: string;
  suggestedProviderId?: string;
  analyzedAt: string;
}







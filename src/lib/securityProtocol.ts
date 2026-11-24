export type LegalModalSection =
  | 'security_protocol'
  | 'terms'
  | 'privacy'
  | 'provider_contract'
  | null;

export interface GatehouseAccess {
  requiresGuardPass: boolean;
  colony: string;
  postalCode: string;
  crossStreets: string;
  guardNotes: string;
  passCode: string;
}

export interface DigitalSignature {
  signerName: string;
  signedAt: string;
  standard: string;
  sealHash: string;
}

export interface BookingSecurityRecord {
  techVerifyCode: string;
  closingOtp: string;
  insurancePolicyId: string;
  certificateHash: string;
  selfieCheckIn: boolean;
  selfiePhotoUrl?: string | null;
  premisesExited: boolean;
  exitTimestamp?: string | null;
  noShowReportedAt?: string | null;
  gatehouseAccess: GatehouseAccess;
  digitalSignature?: DigitalSignature | null;
}

const STORAGE_KEY = 'chambaya_security_protocol_v1';

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function deriveSafetyCodes(bookingId: string, startOtp?: string) {
  const seed = hashString(bookingId || 'CHAMBA-0001');
  const safeNum = 100 + (seed % 900);
  let closingNum = 1000 + ((seed * 7 + 313) % 9000);
  if (String(closingNum) === String(startOtp || '')) {
    closingNum = 1000 + ((closingNum + 1357) % 9000);
  }
  const hexA = seed.toString(16).toUpperCase().padStart(8, 'A');
  const hexB = hashString(`${bookingId}-SHA256-MX`).toString(16).toUpperCase().padStart(8, 'F');
  const shortId = bookingId.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase() || '9021';

  return {
    techVerifyCode: `SAFE-${safeNum}`,
    closingOtp: String(closingNum),
    gatehousePassCode: `PASE-${safeNum}-${shortId}`,
    insurancePolicyId: `INS-RC-MX-${shortId}`,
    baseCertificateHash: `SHA256-${hexA}${hexB}`
  };
}

export function buildDefaultSecurityRecord(
  bookingId: string,
  startOtp?: string,
  status?: string
): BookingSecurityRecord {
  const codes = deriveSafetyCodes(bookingId, startOtp);
  const alreadyCompleted = status === 'completed';
  const alreadyEnRouteOrFurther =
    status === 'on_the_way' || status === 'in_progress' || status === 'completed';

  return {
    techVerifyCode: codes.techVerifyCode,
    closingOtp: codes.closingOtp,
    insurancePolicyId: codes.insurancePolicyId,
    certificateHash: codes.baseCertificateHash,
    selfieCheckIn: alreadyEnRouteOrFurther,
    selfiePhotoUrl: null,
    premisesExited: alreadyCompleted,
    exitTimestamp: alreadyCompleted ? 'Verificado al cierre' : null,
    noShowReportedAt: null,
    gatehouseAccess: {
      requiresGuardPass: true,
      colony: 'Roma Norte',
      postalCode: '06700',
      crossStreets: '',
      guardNotes: 'Registrarse en caseta con INE y Pase Digital ChambaYa.',
      passCode: codes.gatehousePassCode
    },
    digitalSignature: null
  };
}

export function loadSecurityStore(): Record<string, Partial<BookingSecurityRecord>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSecurityStore(store: Record<string, Partial<BookingSecurityRecord>>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage quota errors
  }
}

export function maskPhoneMx(phone?: string | null): string {
  if (!phone) return 'Proxy Oculto';
  const clean = String(phone).trim();
  if (clean.length < 4) return '***-****';
  return `+52 ** **** ${clean.slice(-4)}`;
}

export function formatProtectedAddressMx(
  address?: string | null,
  status?: string,
  viewerRole: 'CUSTOMER' | 'PROVIDER' | 'SERVICEMAN' | 'ADMIN' = 'SERVICEMAN'
): string {
  if (!address) return 'Zona Verificada';
  if (viewerRole === 'CUSTOMER' || viewerRole === 'ADMIN') return address;
  if (status === 'pending' || status === 'completed' || status === 'cancelled') {
    const parts = address.split(',');
    const approxArea = parts.slice(-2).join(',').trim() || 'CDMX';
    return `${approxArea} • [Domicilio exacto protegido por LFPDPPP]`;
  }
  return address;
}

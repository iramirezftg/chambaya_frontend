import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PlatformProvider } from "../context/PlatformContext";
import { HeaderNav } from "../components/HeaderNav";
import { BookingModal } from "../components/BookingModal";
import { LiveTrackerModal } from "../components/LiveTrackerModal";
import { CheckoutPaymentModal } from "../components/CheckoutPaymentModal";
import { InvoiceModal } from "../components/InvoiceModal";
import { EscrowDisputeModal } from "../components/EscrowDisputeModal";
import { FieldOpsEvidenceModal } from "../components/FieldOpsEvidenceModal";
import { EmergencySosModal } from "../components/EmergencySosModal";
import { AiDiagnosticModal } from "../components/AiDiagnosticModal";
import { ReferralModal } from "../components/ReferralModal";
import { PwaManager } from "../components/PwaManager";

export const metadata: Metadata = {
  title: "ChambaYa | Servicios y Oficios a Domicilio en México",
  description: "La plataforma líder en México para contratar servicios y oficios para el hogar. Plomeros, electricistas, limpieza profunda y técnicos en climas certificados.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChambaYa",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ChambaYa" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PlatformProvider>
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <HeaderNav />
            <main style={{ flex: 1 }}>{children}</main>
            <BookingModal />
            <LiveTrackerModal />
            <CheckoutPaymentModal />
            <InvoiceModal />
            <EscrowDisputeModal />
            <FieldOpsEvidenceModal />
            <EmergencySosModal />
            <AiDiagnosticModal />
            <ReferralModal />
            <PwaManager />
          </div>
        </PlatformProvider>
      </body>
    </html>
  );
}

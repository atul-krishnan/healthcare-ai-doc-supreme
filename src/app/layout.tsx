import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { LayoutFrame } from "@/components/layout-frame";
import { MonitoringProvider } from "@/components/monitoring-provider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YourDoc | Free AI Doctor + Telemedicine",
  description:
    "AI-assisted telemedicine platform with instant triage, doctor consultations, health records, and subscriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${instrumentSerif.variable} antialiased`} suppressHydrationWarning>
        <MonitoringProvider>
          <LayoutFrame>{children}</LayoutFrame>
        </MonitoringProvider>
      </body>
    </html>
  );
}


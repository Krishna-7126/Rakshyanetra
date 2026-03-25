import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { TelemetryProvider } from "@/components/TelemetryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulse-Check | Structural Health Monitoring Dashboard",
  description:
    "Real-time Structural Health Monitoring for high-rise buildings. Live telemetry from MPU6050 vibration and HX711 strain gauge sensors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-zinc-950 text-slate-200 min-h-screen antialiased flex overflow-hidden`}>
        <TelemetryProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </TelemetryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Akış AI — İşinize odaklanın, tekrarları bize bırakın",
  description: "Şirket içi bilgi asistanları, müşteri destek otomasyonu ve belge işleme. Akış AI ile işletmeniz için bir sonraki adımı planlayın. Kurgusal hizmet demosu.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}

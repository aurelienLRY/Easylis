import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import { Providers } from "@/components/layout/Providers.layout";
import { Header } from "@/components/layout/Header.layout";
import { Footer } from "@/components/layout/Footer.layout";

/*components */
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  applicationName: "Easylis",
  title: {
    default: "Easylis | Gestionnaire d'activités pleine nature",
    template: "%s | Easylis",
  },
  description: "Easylis | Gestionnaire d'activités pleine nature",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Easylis",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Easylis | Gestionnaire d'activités pleine nature",
    description: "Easylis | Gestionnaire d'activités pleine nature",
    siteName: "Easylis",
    locale: "fr-FR",
    type: "website",
  },
};
/*
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};*/

/*
 *root layout
 *@returns {JSX.Element}
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className=" dark">
      <body className={`${inter.className} dark:bg-gray-900 dark:text-white flex flex-col`}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#ffffff",
            },
          }}
        >
          <Providers>
            <Header />
            <main className="flex flex-col items-center justify-center  box-border mt-4 md:mt-16 scroll-smooth min-h-[89vh]">
            {children}
            </main>
            <Footer />
          </Providers>
        </ConfigProvider>
      </body>
    </html>
  );
}

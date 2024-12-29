import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";

/*components */
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Easylis | Gestionnaire d'activités pleine nature",
  description: "Easylis | Gestionnaire d'activités pleine nature",
};

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
      <body className={`${inter.className} dark:bg-gray-900 dark:text-white`}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#ffffff",
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}

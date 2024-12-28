import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import { ConfigProvider } from "antd";
import layout from "antd/es/layout";
import { root } from "postcss";

/*components */
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Back Office | Gestion des utilisateurs",
  description: "Back Office | Gestion des utilisateurs",
};

/*
 *root layout
 *@returns {JSX.Element}
 */
 *root layout
 *@returns {JSX.Element}
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth dark">
      <body
        className={`${inter.className} w-screen dark:bg-gray-900 dark:text-white`}
      >
      <body
        className={`${inter.className} dark:bg-gray-900 dark:text-white mb-8 md:mb-0`}
      >
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#ffffff",
            },
          }}
        >
          {children}
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


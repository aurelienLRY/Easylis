"use client";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";

import { Toaster } from "sonner";

import { Header, Footer } from "@/components";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextUIProvider>
        <Toaster richColors position="top-center" closeButton />
        <Header />
        <main className="flex flex-col items-center justify-center  box-border mt-4 md:mt-16 scroll-smooth">
          {children}
        </main>
        <Footer />
      </NextUIProvider>
    </SessionProvider>
  );
}

"use client";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";

import { Toaster } from "sonner";

import { Header } from "@/components";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextUIProvider>
        <Toaster richColors position="top-center" closeButton />
        <Header />
        <main className="flex flex-col items-center justify-center  box-border mt-16">
          {children}
        </main>
      </NextUIProvider>
    </SessionProvider>
  );
}

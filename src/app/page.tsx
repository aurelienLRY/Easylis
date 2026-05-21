"use client";
/* librairies */
import { useEffect } from "react";
import Image from "next/image";
/*components*/
import { LoginForm } from "@/components";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [session.status, router]);

  return (
    <div className="w-full h-[79vh] relative">
      <Image
        src="/img/escalade-scroll.jpg"
        alt="image de fond de l'application"
        width={4453}
        height={2969}
        className="h-full w-full object-cover"
      />
      <LoginForm />
    </div>
  );
}

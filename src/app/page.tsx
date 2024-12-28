"use client";
/* librairies */
import Image from "next/image";
/*components*/
import { LoginForm } from "@/components";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const session = useSession();
  const router = useRouter();

  if (session.status === "authenticated") {
    router.push("/dashboard");
  }

  return (
    <div className="w-full h-screen relative -mt-16">
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

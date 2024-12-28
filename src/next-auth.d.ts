// next-auth.d.ts
import "next-auth";

import { IUser } from "@/types";

declare module "next-auth" {
  interface User {
    id: string;
    _id: string;
    email: string;
  }

  interface Session {
    user: User;
  }
}

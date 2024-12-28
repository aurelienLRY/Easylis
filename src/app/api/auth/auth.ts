import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";
import { User } from "@/libs/database/models/User.model";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const userFound = await User.findOne({
          email: credentials?.email,
        });
        await disconnectDB();
        console.log("userFound", userFound);

        if (!userFound) throw new Error("Email inconnu");

        const passwordMatch = await bcrypt.compare(
          credentials!.password,
          userFound.password
        );

        if (!passwordMatch) throw new Error("Mot de passe incorrect");
        return userFound;
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On ajoute les informations de l'utilisateur au token
      if (user) {
        token.id = user._id as string;
        token._id = user.id as string;
        token.email = user.email as string;
      }

      if (trigger === "update" && session) {
        token.id = session.user.id as string;
        token._id = session.user.id as string;
        token.email = session.user.email as string;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        // On ajoute les informations du token à la session utilisateur
        session.user = {
          id: token.id as string,
          _id: token.id as string,
          email: token.email as string,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

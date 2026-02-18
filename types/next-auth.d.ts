import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      subscriptionStatus: string;
      onboardingComplete: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    subscriptionStatus: string;
    onboardingComplete: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    subscriptionStatus: string;
    onboardingComplete: boolean;
  }
}

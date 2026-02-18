import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Leaf } from "lucide-react";

export const metadata = {
  title: "Set Up Your Profile",
};

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.onboardingComplete) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-5 border-b bg-white/80 backdrop-blur">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600">
          <Leaf className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">NutriGoal</span>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <OnboardingWizard />
      </div>
    </div>
  );
}

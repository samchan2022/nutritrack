"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import type { Gender, Goal, ActivityLevel, DietPreference } from "@/types";

interface FormData {
  name: string;
  age: string;
  gender: Gender | "";
  height: string;
  weight: string;
  goal: Goal | "";
  activityLevel: ActivityLevel | "";
  dietPreference: DietPreference | "";
}

const STEPS = ["Personal Info", "Body Metrics", "Goal & Activity", "Diet Preference"];

const initialData: FormData = {
  name: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  goal: "",
  activityLevel: "",
  dietPreference: "",
};

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const isStepValid = () => {
    switch (step) {
      case 0: return data.name.trim().length >= 2;
      case 1: return !!data.age && !!data.gender && !!data.height && !!data.weight;
      case 2: return !!data.goal && !!data.activityLevel;
      case 3: return !!data.dietPreference;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        age: parseInt(data.age),
        gender: data.gender,
        height: parseFloat(data.height),
        weight: parseFloat(data.weight),
        goal: data.goal,
        activityLevel: data.activityLevel,
        dietPreference: data.dietPreference,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to save profile");
      }

      // Update the session to reflect onboardingComplete = true
      await update({ onboardingComplete: true });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast({
        title: "Error saving profile",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                  i < step
                    ? "bg-emerald-600 text-white"
                    : i === step
                    ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 sm:w-16 transition-colors ${
                    i < step ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center">
          Step {step + 1} of {STEPS.length}: <span className="font-medium text-gray-700">{STEPS[step]}</span>
        </p>
      </div>

      {/* Step content */}
      <div className="space-y-5">
        {step === 0 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome! Let's get started</h2>
              <p className="text-gray-500 mt-1 text-sm">Tell us a bit about yourself</p>
            </div>
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Body Metrics</h2>
              <p className="text-gray-500 mt-1 text-sm">Used to calculate your calorie needs</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="14"
                  max="100"
                  placeholder="25"
                  value={data.age}
                  onChange={(e) => set("age", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={data.gender} onValueChange={(v) => set("gender", v as Gender)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  placeholder="175"
                  value={data.height}
                  onChange={(e) => set("height", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="30"
                  max="500"
                  step="0.1"
                  placeholder="70.0"
                  value={data.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Goal & Activity</h2>
              <p className="text-gray-500 mt-1 text-sm">We'll tailor your calorie targets</p>
            </div>
            <div>
              <Label>Primary Goal</Label>
              <Select value={data.goal} onValueChange={(v) => set("goal", v as Goal)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your goal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOSE_WEIGHT">Lose Weight</SelectItem>
                  <SelectItem value="GAIN_MUSCLE">Gain Muscle</SelectItem>
                  <SelectItem value="MAINTAIN">Maintain Weight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Activity Level</Label>
              <Select
                value={data.activityLevel}
                onValueChange={(v) => set("activityLevel", v as ActivityLevel)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select activity level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEDENTARY">Sedentary (desk job, no exercise)</SelectItem>
                  <SelectItem value="LIGHTLY_ACTIVE">Lightly Active (1–3 days/week)</SelectItem>
                  <SelectItem value="MODERATELY_ACTIVE">Moderately Active (3–5 days/week)</SelectItem>
                  <SelectItem value="VERY_ACTIVE">Very Active (6–7 days/week)</SelectItem>
                  <SelectItem value="EXTRA_ACTIVE">Extra Active (twice a day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Dietary Preference</h2>
              <p className="text-gray-500 mt-1 text-sm">We'll generate meals that suit your diet</p>
            </div>
            <div>
              <Label>Diet Type</Label>
              <Select
                value={data.dietPreference}
                onValueChange={(v) => set("dietPreference", v as DietPreference)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your diet..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">No Restrictions</SelectItem>
                  <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
                  <SelectItem value="VEGAN">Vegan</SelectItem>
                  <SelectItem value="KETO">Ketogenic</SelectItem>
                  <SelectItem value="PALEO">Paleo</SelectItem>
                  <SelectItem value="MEDITERRANEAN">Mediterranean</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            variant="emerald"
            onClick={() => setStep((s) => s + 1)}
            disabled={!isStepValid()}
            className="flex-1"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="emerald"
            onClick={handleSubmit}
            disabled={!isStepValid() || loading}
            className="flex-1"
          >
            {loading ? "Setting up your profile..." : "Get Started!"}
            {!loading && <Check className="h-4 w-4 ml-2" />}
          </Button>
        )}
      </div>
    </div>
  );
}

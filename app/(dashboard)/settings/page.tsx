"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Crown, User, Target, CreditCard, ExternalLink } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { getGoalLabel, getActivityLabel, getDietLabel } from "@/utils/formatters";

interface ProfileData {
  name: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  goal: string | null;
  activityLevel: string | null;
  dietPreference: string | null;
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;
  subscriptionStatus: string;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  const [form, setForm] = useState({
    name: "",
    weight: "",
    goal: "",
    activityLevel: "",
    dietPreference: "",
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setForm({
          name: data.name ?? "",
          weight: data.weight?.toString() ?? "",
          goal: data.goal ?? "",
          activityLevel: data.activityLevel ?? "",
          dietPreference: data.dietPreference ?? "",
        });
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          weight: parseFloat(form.weight) || undefined,
          goal: form.goal || undefined,
          activityLevel: form.activityLevel || undefined,
          dietPreference: form.dietPreference || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updated = await res.json() as ProfileData;
      setProfile(updated);
      await update({ name: form.name });
      toast({ title: "Profile updated!", variant: "success" });
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json() as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast({ title: "Could not open billing portal", variant: "destructive" });
    } finally {
      setManagingBilling(false);
    }
  };

  const isPremium = profile?.subscriptionStatus === "PREMIUM";

  if (!profile) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Profile Settings
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                value={session?.user?.email ?? ""}
                disabled
                className="mt-1 bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="weight">Current Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-gray-500" />
            Nutrition Goals
          </CardTitle>
          <CardDescription>Adjust your goal settings (recalculates targets)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Primary Goal</Label>
            <Select
              value={form.goal}
              onValueChange={(v) => setForm({ ...form, goal: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
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
              value={form.activityLevel}
              onValueChange={(v) => setForm({ ...form, activityLevel: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEDENTARY">Sedentary</SelectItem>
                <SelectItem value="LIGHTLY_ACTIVE">Lightly Active</SelectItem>
                <SelectItem value="MODERATELY_ACTIVE">Moderately Active</SelectItem>
                <SelectItem value="VERY_ACTIVE">Very Active</SelectItem>
                <SelectItem value="EXTRA_ACTIVE">Extra Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Dietary Preference</Label>
            <Select
              value={form.dietPreference}
              onValueChange={(v) => setForm({ ...form, dietPreference: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
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

          {/* Nutrition targets display */}
          {profile.calorieTarget && (
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[
                { label: "Calories", value: `${profile.calorieTarget} kcal` },
                { label: "Protein", value: `${profile.proteinTarget}g` },
                { label: "Carbs", value: `${profile.carbTarget}g` },
                { label: "Fat", value: `${profile.fatTarget}g` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="emerald"
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your NutriGoal subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
            <div>
              <p className="font-semibold text-gray-900">
                {isPremium ? "Premium Plan" : "Free Plan"}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {isPremium
                  ? "$9.99/month — All features unlocked"
                  : "Limited features — Upgrade for AI meal plans"}
              </p>
            </div>
            <Badge variant={isPremium ? "emerald" : "secondary"}>
              {isPremium ? (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </>
              ) : (
                "Free"
              )}
            </Badge>
          </div>

          {isPremium ? (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={managingBilling}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {managingBilling ? "Opening portal..." : "Manage Billing"}
            </Button>
          ) : (
            <Button
              variant="emerald"
              onClick={() => {
                fetch("/api/stripe/create-checkout", { method: "POST" })
                  .then((r) => r.json())
                  .then((d: { url?: string }) => { if (d.url) window.location.href = d.url; })
                  .catch(() => toast({ title: "Failed to start checkout", variant: "destructive" }));
              }}
              className="w-full"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium — $9.99/month
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

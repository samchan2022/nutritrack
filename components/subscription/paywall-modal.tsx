"use client";

import { useState } from "react";
import { Crown, Check, Zap, Brain, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const PREMIUM_FEATURES = [
  { icon: Brain, label: "AI-Generated Weekly Meal Plans" },
  { icon: TrendingUp, label: "Smart Weekly Calorie Adjustments" },
  { icon: Zap, label: "Advanced Progress Insights" },
  { icon: Crown, label: "Grocery List Generation" },
];

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Failed to create checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      toast({
        title: "Failed to start checkout",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-2">
            <Crown className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock AI-powered nutrition intelligence and personalized meal plans
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 shrink-0">
                <Icon className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-700">{label}</span>
              <Check className="h-4 w-4 text-emerald-600 ml-auto shrink-0" />
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center mb-4">
          <p className="text-3xl font-bold text-gray-900">
            $9.99
            <span className="text-base font-normal text-gray-500">/month</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Cancel anytime • Instant access</p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            variant="emerald"
            size="lg"
            className="w-full"
          >
            <Crown className="h-4 w-4 mr-2" />
            {loading ? "Redirecting to checkout..." : "Upgrade to Premium"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

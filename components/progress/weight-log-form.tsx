"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface WeightLogFormProps {
  currentWeight: number | null;
  onLogged: () => void;
}

export function WeightLogForm({ currentWeight, onLogged }: WeightLogFormProps) {
  const [weight, setWeight] = useState(currentWeight?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!w || w <= 0 || w > 500) {
      toast({ title: "Please enter a valid weight (kg)", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/weight-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: w }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Weight logged!", description: `${w} kg recorded`, variant: "success" });
      onLogged();
    } catch {
      toast({ title: "Failed to log weight. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="h-4 w-4 text-emerald-600" />
          Log Today's Weight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="weight" className="sr-only">Weight in kg</Label>
            <div className="relative">
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="20"
                max="500"
                placeholder="0.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="pr-10"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                kg
              </span>
            </div>
          </div>
          <Button type="submit" variant="emerald" disabled={loading || !weight}>
            {loading ? "Saving..." : "Log Weight"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

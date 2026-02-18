"use client";

import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchFoods } from "./food-database";
import type { FoodItem } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface FoodEntryFormProps {
  onAdded: () => void;
}

export function FoodEntryForm({ onAdded }: FoodEntryFormProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [multiplier, setMultiplier] = useState("1");
  const [isManual, setIsManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState({
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.length >= 1) {
      setResults(searchFoods(q, 8));
    } else {
      setResults([]);
    }
  };

  const handleSelect = (food: FoodItem) => {
    setSelected(food);
    setQuery(food.name);
    setResults([]);
    setMultiplier("1");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let payload: Record<string, unknown>;

      if (isManual) {
        if (!manual.foodName || !manual.calories) {
          toast({ title: "Please fill in at least food name and calories", variant: "destructive" });
          return;
        }
        payload = {
          foodName: manual.foodName,
          calories: parseFloat(manual.calories) || 0,
          protein: parseFloat(manual.protein) || 0,
          carbs: parseFloat(manual.carbs) || 0,
          fat: parseFloat(manual.fat) || 0,
        };
      } else {
        if (!selected) {
          toast({ title: "Please select a food item", variant: "destructive" });
          return;
        }
        const mult = parseFloat(multiplier) || 1;
        payload = {
          foodName: selected.name,
          calories: +(selected.calories * mult).toFixed(1),
          protein: +(selected.protein * mult).toFixed(1),
          carbs: +(selected.carbs * mult).toFixed(1),
          fat: +(selected.fat * mult).toFixed(1),
        };
      }

      const res = await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to log food");

      toast({ title: "Food logged!", variant: "success" });
      setSelected(null);
      setQuery("");
      setMultiplier("1");
      setManual({ foodName: "", calories: "", protein: "", carbs: "", fat: "" });
      onAdded();
    } catch {
      toast({ title: "Failed to log food. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const mult = parseFloat(multiplier) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          Add Food
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsManual(!isManual);
              setSelected(null);
              setQuery("");
              setResults([]);
            }}
            className="text-xs text-emerald-600"
          >
            {isManual ? "Search database" : "Enter manually"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isManual ? (
          /* Manual Entry */
          <div className="space-y-3">
            <div>
              <Label htmlFor="foodName">Food Name *</Label>
              <Input
                id="foodName"
                placeholder="e.g. Homemade Pasta"
                value={manual.foodName}
                onChange={(e) => setManual({ ...manual, foodName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="calories">Calories (kcal) *</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={manual.calories}
                  onChange={(e) => setManual({ ...manual, calories: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={manual.protein}
                  onChange={(e) => setManual({ ...manual, protein: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={manual.carbs}
                  onChange={(e) => setManual({ ...manual, carbs: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={manual.fat}
                  onChange={(e) => setManual({ ...manual, fat: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Search */
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search foods..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                autoComplete="off"
              />
              {selected && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => { setSelected(null); setQuery(""); }}
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Dropdown results */}
            {results.length > 0 && !selected && (
              <div className="border rounded-lg overflow-hidden shadow-sm bg-white divide-y">
                {results.map((food) => (
                  <button
                    key={food.name}
                    onClick={() => handleSelect(food)}
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.serving}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p className="font-semibold text-gray-700">{food.calories} kcal</p>
                        <p>P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected food + multiplier */}
            {selected && (
              <div className="bg-emerald-50 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-900">{selected.name}</p>
                  <p className="text-xs text-emerald-700">{selected.serving} = base</p>
                </div>
                <div>
                  <Label htmlFor="multiplier" className="text-xs">Servings / Multiplier</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={multiplier}
                    onChange={(e) => setMultiplier(e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 text-center text-xs">
                  {[
                    { label: "Calories", value: `${Math.round(selected.calories * mult)} kcal` },
                    { label: "Protein", value: `${(selected.protein * mult).toFixed(1)}g` },
                    { label: "Carbs", value: `${(selected.carbs * mult).toFixed(1)}g` },
                    { label: "Fat", value: `${(selected.fat * mult).toFixed(1)}g` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white rounded p-1.5">
                      <p className="text-gray-500">{label}</p>
                      <p className="font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading || (!isManual && !selected) || (isManual && !manual.foodName)}
          className="w-full"
          variant="emerald"
        >
          <Plus className="h-4 w-4 mr-2" />
          {loading ? "Logging..." : "Log Food"}
        </Button>
      </CardContent>
    </Card>
  );
}

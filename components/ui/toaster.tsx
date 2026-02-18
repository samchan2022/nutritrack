"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "./use-toast";
import { cn } from "@/utils/cn";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map(({ id, title, description, variant, open, onOpenChange }) => (
        <ToastPrimitive.Root
          key={id}
          open={open}
          onOpenChange={onOpenChange}
          className={cn(
            "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
            "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
            variant === "destructive"
              ? "border-destructive bg-destructive text-destructive-foreground"
              : variant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border bg-background text-foreground"
          )}
        >
          <div className="flex items-start gap-3">
            {variant === "success" && (
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {variant === "destructive" && (
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div className="grid gap-1">
              {title && (
                <ToastPrimitive.Title className="text-sm font-semibold">
                  {title}
                </ToastPrimitive.Title>
              )}
              {description && (
                <ToastPrimitive.Description className="text-sm opacity-90">
                  {description}
                </ToastPrimitive.Description>
              )}
            </div>
          </div>
          <ToastPrimitive.Close
            className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            onClick={() => dismiss(id)}
          >
            <X className="h-4 w-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:bottom-0 sm:flex-col md:max-w-[420px]" />
    </ToastPrimitive.Provider>
  );
}

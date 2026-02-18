import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "NutriGoal — AI-Powered Diet Tracking",
    template: "%s | NutriGoal",
  },
  description:
    "Track calories & macros, get AI-generated meal plans, and reach your health goals with NutriGoal.",
  keywords: ["nutrition", "diet tracker", "meal plan", "calorie tracker", "macros", "AI"],
  authors: [{ name: "NutriGoal" }],
  openGraph: {
    title: "NutriGoal — AI-Powered Diet Tracking",
    description: "Track calories & macros, get AI meal plans, and reach your health goals.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

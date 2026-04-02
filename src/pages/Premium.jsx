import { db } from '@/api/apiClient';

import React, { useState } from "react";

import { Sparkles, Check, ChevronLeft, Zap, Eye, EyeOff, Shield } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$9.99",
    per: "/ month",
    total: null,
    badge: null,
  },
  {
    id: "quarterly",
    label: "3 Months",
    price: "$7.99",
    per: "/ month",
    total: "Billed $23.99",
    badge: "Save 20%",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "$4.99",
    per: "/ month",
    total: "Billed $59.99",
    badge: "Best Value",
  },
];

const FEATURES = [
  { icon: Eye, label: "See who viewed your profile" },
  { icon: EyeOff, label: "Incognito mode — browse invisibly" },
  { icon: Zap, label: "Profile boost — appear at the top" },
  { icon: Shield, label: "Advanced filters & search" },
  { icon: Sparkles, label: "Premium badge on your profile" },
];

export default function Premium() {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const user = await db.auth.me();
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        await db.entities.UserProfile.update(profiles[0].id, { is_premium: true });
      }
      window.history.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 slyd-glass border-b border-[#2C2C2E]/50 px-4 h-14 flex items-center">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-[#1C1C1E]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold ml-2">SLYD Premium</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl slyd-gradient flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Unlock Premium</h1>
          <p className="text-[#8E8E93] text-sm">Get the most out of SLYD with exclusive features.</p>
        </motion.div>

        {/* Features */}
        <div className="slyd-card p-4 mb-6 space-y-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B9EFF]/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#3B9EFF]" />
              </div>
              <span className="text-sm">{label}</span>
              <Check className="w-4 h-4 text-[#30D158] ml-auto flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Plan selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-2xl p-3 border text-center transition-all ${
                selectedPlan === plan.id
                  ? "border-[#3B9EFF] bg-[#3B9EFF]/10"
                  : "border-[#2C2C2E] bg-[#1C1C1E]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full slyd-gradient text-white whitespace-nowrap">
                  {plan.badge}
                </span>
              )}
              <div className="text-xs text-[#8E8E93] mb-1">{plan.label}</div>
              <div className="text-lg font-bold">{plan.price}</div>
              <div className="text-[10px] text-[#8E8E93]">{plan.per}</div>
              {plan.total && <div className="text-[10px] text-[#8E8E93] mt-0.5">{plan.total}</div>}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-12 rounded-2xl slyd-gradient font-semibold text-white text-base flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Upgrade Now
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-[#8E8E93] mt-3">
          Cancel anytime. Billed through your account.
        </p>
      </div>
    </div>
  );
}
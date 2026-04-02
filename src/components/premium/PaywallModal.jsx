import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

export default function PaywallModal({ open, onClose, feature = "This feature" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="relative w-full max-w-lg bg-[#1C1C1E] rounded-3xl p-6 border border-[#2C2C2E]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center"
        >
          <X className="w-4 h-4 text-[#8E8E93]" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3B9EFF]/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7 text-[#3B9EFF]" />
          </div>
          <h2 className="text-xl font-bold mb-1">Premium Feature</h2>
          <p className="text-sm text-[#8E8E93]">
            {feature} is only available to Slyd Premium members.
          </p>
        </div>

        <Link
          to={createPageUrl("Premium")}
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full h-13 py-3.5 rounded-2xl slyd-gradient text-white font-bold text-base shadow-lg shadow-[#3B9EFF]/20"
        >
          <Sparkles className="w-5 h-5" /> Upgrade to Premium
        </Link>
      </motion.div>
    </div>
  );
}
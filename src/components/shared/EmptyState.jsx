import React from "react";
import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-[#8E8E93]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#8E8E93] max-w-xs mb-6">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
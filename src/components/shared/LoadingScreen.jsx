import React from "react";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-[218px] w-auto"
      >
        <img
          src="/images/logo.png"
          alt="SLYD"
          className="h-[218px] w-auto"
        />
      </motion.div>
    </div>
  );
}
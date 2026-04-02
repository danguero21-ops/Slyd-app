import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function PhotoGallery({ photos }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!photos || photos.length === 0) return null;

  const goTo = (index) => {
    setActiveIndex((index + photos.length) % photos.length);
  };

  return (
    <>
      {/* Main carousel */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1C1C1E]">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={photos[activeIndex]}
            alt={`Photo ${activeIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFullscreen(true)}
          />
        </AnimatePresence>

        {/* Dots */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1 rounded-full transition-all ${
                  i === activeIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Nav arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-0 top-0 bottom-0 w-1/3"
            />
            <button
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-0 top-0 bottom-0 w-1/3"
            />
          </>
        )}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button className="absolute top-4 right-4 z-10 p-2">
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={photos[activeIndex]}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
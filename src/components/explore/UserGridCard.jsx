import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import OnlineIndicator from "../shared/OnlineIndicator";
import { MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function UserGridCard({ profile, distance, index }) {
  const fallbackLetter = profile.display_name ? profile.display_name[0].toUpperCase() : "?";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Link
        to={createPageUrl(`ProfileDetail?email=${encodeURIComponent(profile.user_email)}`)}
        className="block relative aspect-[3/4] rounded-2xl overflow-hidden group"
      >
        {/* Image or fallback */}
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[#1C1C1E] flex items-center justify-center">
            <span className="text-4xl font-bold text-[#2C2C2E]">{fallbackLetter}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Online indicator */}
        {profile.is_online && (
          <div className="absolute top-2.5 left-2.5">
            <OnlineIndicator isOnline size="md" />
          </div>
        )}

        {/* Premium badge */}
        {profile.is_premium && (
          <div className="absolute top-2.5 right-2.5">
            <Sparkles className="w-4 h-4 text-[#3B9EFF]" />
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-semibold text-white text-sm leading-tight truncate">
                {profile.display_name}
                {profile.show_age !== false && profile.age && (
                  <span className="font-normal text-white/70">, {profile.age}</span>
                )}
              </p>
              {distance !== null && distance !== undefined && profile.show_distance !== false && (
                <p className="text-[10px] text-white/50 flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {distance < 1 ? "< 1 km" : `${Math.round(distance)} km`}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
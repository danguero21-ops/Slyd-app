import { db } from '@/api/apiClient';

import React, { useState, useEffect, useMemo, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UserGridCard from "../components/explore/UserGridCard";
import LoadingScreen from "../components/shared/LoadingScreen";
import EmptyState from "../components/shared/EmptyState";
import PaywallModal from "../components/premium/PaywallModal";
import { Users, SlidersHorizontal, X, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Explore() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [myProfile, setMyProfile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);
  const [filters, setFilters] = useState({ 
    sortBy: "distance", 
    ageMin: "", 
    ageMax: "",
    bodyType: "all",
    lookingFor: "all",
    side: "all",
    meetingIntent: "all",
  });

  useEffect(() => {
    (async () => {
      try {
        const user = await db.auth.me();
        const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
        if (profiles.length === 0) {
          navigate(createPageUrl("Onboarding"));
          return;
        }
        setMyProfile(profiles[0]);
        // Update online status
        await db.entities.UserProfile.update(profiles[0].id, {
          is_online: true,
          last_active: new Date().toISOString(),
        });
      } catch (error) {
        // If auth fails, redirect to login
        await db.auth.redirectToLogin();
      }
    })();
  }, [navigate]);

  const { data: allProfiles = [], isLoading } = useQuery({
    queryKey: ["explore-profiles"],
    queryFn: () => db.entities.UserProfile.filter({ onboarding_complete: true }),
    refetchInterval: 30000,
    enabled: !!myProfile,
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ["my-blocks"],
    queryFn: async () => {
      if (!myProfile) return [];
      const [blockedBy, blockedOther] = await Promise.all([
        db.entities.Block.filter({ blocked_email: myProfile.user_email }),
        db.entities.Block.filter({ blocker_email: myProfile.user_email }),
      ]);
      return [...blockedBy.map((b) => b.blocker_email), ...blockedOther.map((b) => b.blocked_email)];
    },
    enabled: !!myProfile,
  });

  const profiles = useMemo(() => {
    if (!myProfile) return [];
    let list = allProfiles.filter(
      (p) =>
        p.user_email !== myProfile.user_email &&
        !blocks.includes(p.user_email) &&
        p.visibility !== "nobody" &&
        !p.incognito_mode &&
        !p.stealth_mode
    );

    // Apply filters
    if (filters.ageMin) list = list.filter((p) => p.age >= parseInt(filters.ageMin));
    if (filters.ageMax) list = list.filter((p) => p.age <= parseInt(filters.ageMax));
    if (filters.bodyType !== "all") list = list.filter((p) => p.body_type === filters.bodyType);
    if (filters.lookingFor !== "all") list = list.filter((p) => p.looking_for?.includes(filters.lookingFor));
    if (filters.side !== "all") list = list.filter((p) => p.side === filters.side);
    if (filters.meetingIntent !== "all") list = list.filter((p) => p.meeting_intent === filters.meetingIntent);

    // Add distance and sort
    list = list.map((p) => ({
      ...p,
      _distance: getDistanceKm(myProfile.latitude, myProfile.longitude, p.latitude, p.longitude),
    }));

    // Sort boosted profiles first, then by criteria
    list.sort((a, b) => {
      if (a.is_boosted && !b.is_boosted) return -1;
      if (!a.is_boosted && b.is_boosted) return 1;
      if (filters.sortBy === "distance") {
        return (a._distance ?? 99999) - (b._distance ?? 99999);
      }
      if (filters.sortBy === "recently_active") {
        return new Date(b.last_active || 0) - new Date(a.last_active || 0);
      }
      if (filters.sortBy === "age") {
        return (a.age || 99) - (b.age || 99);
      }
      return 0;
    });

    return list;
  }, [allProfiles, myProfile, blocks, filters]);

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (containerRef.current?.scrollTop > 0) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullY(Math.min(delta * 0.4, 70));
  };

  const handleTouchEnd = async () => {
    if (pullY >= 60) {
      setRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ["explore-profiles"] });
      setRefreshing(false);
    }
    setPullY(0);
  };

  if (!myProfile || isLoading) return <LoadingScreen />;

  return (
    <div
      className="max-w-lg mx-auto"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullY || (refreshing ? 48 : 0) }}
      >
        <RefreshCw className={`w-5 h-5 text-[#3B9EFF] ${refreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullY * 3}deg)` }} />
      </div>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Advanced Filters"
      />
      {/* Filter bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-[#8E8E93]">{profiles.length} people nearby</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="text-[#8E8E93] hover:text-white hover:bg-[#1C1C1E]"
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5" />
          Filters
        </Button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-3">
                <Select
                  value={filters.sortBy}
                  onValueChange={(v) => setFilters({ ...filters, sortBy: v })}
                >
                  <SelectTrigger className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-10 rounded-xl flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                    <SelectItem value="distance" className="text-white">Distance</SelectItem>
                    <SelectItem value="recently_active" className="text-white">Recently Active</SelectItem>
                    <SelectItem value="age" className="text-white">Age</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                  className="text-[#8E8E93]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Free filters: Side & Meeting Intent */}
              <div className="flex gap-2">
                <Select value={filters.side} onValueChange={(v) => setFilters({ ...filters, side: v })}>
                  <SelectTrigger className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-10 rounded-xl flex-1">
                    <SelectValue placeholder="Side" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                    <SelectItem value="all" className="text-white">All Sides</SelectItem>
                    <SelectItem value="top" className="text-white">Top</SelectItem>
                    <SelectItem value="bottom" className="text-white">Bottom</SelectItem>
                    <SelectItem value="versatile" className="text-white">Versatile</SelectItem>
                    <SelectItem value="vers_top" className="text-white">Vers Top</SelectItem>
                    <SelectItem value="vers_bottom" className="text-white">Vers Bottom</SelectItem>
                    <SelectItem value="side" className="text-white">Side</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.meetingIntent} onValueChange={(v) => setFilters({ ...filters, meetingIntent: v })}>
                  <SelectTrigger className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-10 rounded-xl flex-1">
                    <SelectValue placeholder="Available" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                    <SelectItem value="all" className="text-white">Any Time</SelectItem>
                    <SelectItem value="right_now" className="text-white">Right Now</SelectItem>
                    <SelectItem value="today" className="text-white">Today</SelectItem>
                    <SelectItem value="this_week" className="text-white">This Week</SelectItem>
                    <SelectItem value="just_browsing" className="text-white">Just Browsing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {myProfile?.is_premium ? (
                <>
                  <Select
                    value={filters.bodyType}
                    onValueChange={(v) => setFilters({ ...filters, bodyType: v })}
                  >
                    <SelectTrigger className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-10 rounded-xl">
                      <SelectValue placeholder="Body Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                      <SelectItem value="all" className="text-white">All Body Types</SelectItem>
                      <SelectItem value="slim" className="text-white">Slim</SelectItem>
                      <SelectItem value="average" className="text-white">Average</SelectItem>
                      <SelectItem value="athletic" className="text-white">Athletic</SelectItem>
                      <SelectItem value="muscular" className="text-white">Muscular</SelectItem>
                      <SelectItem value="stocky" className="text-white">Stocky</SelectItem>
                      <SelectItem value="large" className="text-white">Large</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.lookingFor}
                    onValueChange={(v) => setFilters({ ...filters, lookingFor: v })}
                  >
                    <SelectTrigger className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-10 rounded-xl">
                      <SelectValue placeholder="Looking For" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                      <SelectItem value="all" className="text-white">All</SelectItem>
                      <SelectItem value="Chat" className="text-white">Chat</SelectItem>
                      <SelectItem value="Dates" className="text-white">Dates</SelectItem>
                      <SelectItem value="Friends" className="text-white">Friends</SelectItem>
                      <SelectItem value="Networking" className="text-white">Networking</SelectItem>
                      <SelectItem value="Right Now" className="text-white">Right Now</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <button
                  onClick={() => setShowPaywall(true)}
                  className="flex items-center gap-2 w-full p-3 rounded-xl bg-[#3B9EFF]/5 border border-[#3B9EFF]/20 text-left"
                >
                  <Lock className="w-4 h-4 text-[#3B9EFF] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white">Advanced Filters</p>
                    <p className="text-[10px] text-[#8E8E93]">Filter by body type, looking for & more</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-[#3B9EFF] bg-[#3B9EFF]/10 px-2 py-0.5 rounded-full">Premium</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {profiles.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 px-1">
          {profiles.map((p, i) => (
            <UserGridCard key={p.id} profile={p} distance={p._distance} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No one nearby"
        />
      )}
    </div>
  );
}
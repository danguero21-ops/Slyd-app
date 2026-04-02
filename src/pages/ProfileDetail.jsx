import { db } from '@/api/apiClient';

import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useQuery } from "@tanstack/react-query";
import PhotoGallery from "../components/profile/PhotoGallery";
import ReportBlockModal from "../components/profile/ReportBlockModal";
import ProfileTag from "../components/shared/ProfileTag";
import LoadingScreen from "../components/shared/LoadingScreen";
import OnlineIndicator from "../components/shared/OnlineIndicator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Shield,
  MapPin,
  Ruler,
  Weight,
  User2,
  Clock,
  MoreHorizontal,
  BadgeCheck,
} from "lucide-react";
import moment from "moment";
import { motion } from "framer-motion";

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

export default function ProfileDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const targetEmail = urlParams.get("email");

  const [myProfile, setMyProfile] = useState(null);
  const [showSafety, setShowSafety] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await db.auth.me();
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) setMyProfile(profiles[0]);

      // Record profile view (skip if viewer is in stealth mode)
      if (targetEmail && user.email !== targetEmail && !profiles[0]?.stealth_mode) {
        await db.entities.ProfileView.create({
          viewer_email: user.email,
          viewed_email: targetEmail,
          viewer_name: profiles[0]?.display_name || user.full_name,
          viewer_avatar: profiles[0]?.avatar_url || "",
        });
      }
    })();
  }, [targetEmail]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile-detail", targetEmail],
    queryFn: async () => {
      const profiles = await db.entities.UserProfile.filter({ user_email: targetEmail });
      return profiles[0] || null;
    },
    enabled: !!targetEmail,
  });

  // Check favorite status
  useEffect(() => {
    if (!myProfile || !targetEmail) return;
    db.entities.Favorite.filter({
      user_email: myProfile.user_email,
      favorited_email: targetEmail,
    }).then((favs) => setIsFavorited(favs.length > 0));
  }, [myProfile, targetEmail]);

  const handleFavorite = async () => {
    if (isFavorited) {
      const favs = await db.entities.Favorite.filter({
        user_email: myProfile.user_email,
        favorited_email: targetEmail,
      });
      if (favs.length > 0) await db.entities.Favorite.delete(favs[0].id);
      setIsFavorited(false);
    } else {
      await db.entities.Favorite.create({
        user_email: myProfile.user_email,
        favorited_email: targetEmail,
        favorited_name: profileData.display_name,
        favorited_avatar: profileData.avatar_url || "",
      });
      setIsFavorited(true);
    }
  };

  const handleMessage = async () => {
    // Check for existing conversation
    const convos = await db.entities.Conversation.list();
    const existing = convos.find(
      (c) =>
        c.participants?.includes(myProfile.user_email) &&
        c.participants?.includes(targetEmail)
    );
    if (existing) {
      navigate(createPageUrl(`ChatRoom?conversationId=${existing.id}`));
    } else {
      const newConvo = await db.entities.Conversation.create({
        participants: [myProfile.user_email, targetEmail],
        participant_names: [myProfile.display_name, profileData.display_name],
        participant_avatars: [myProfile.avatar_url || "", profileData.avatar_url || ""],
      });
      navigate(createPageUrl(`ChatRoom?conversationId=${newConvo.id}`));
    }
  };

  if (isLoading || !profileData) return <LoadingScreen />;

  const distance = myProfile
    ? getDistanceKm(myProfile.latitude, myProfile.longitude, profileData.latitude, profileData.longitude)
    : null;

  const stats = [
    profileData.show_age !== false && profileData.age && { icon: User2, label: `${profileData.age} years` },
    profileData.height && { icon: Ruler, label: profileData.height },
    profileData.weight && { icon: Weight, label: profileData.weight },
    profileData.show_distance !== false && distance != null && {
      icon: MapPin,
      label: distance < 1 ? "< 1 km away" : `${Math.round(distance)} km away`,
    },
    { icon: Clock, label: profileData.is_online ? "Online now" : moment(profileData.last_active).fromNow() },
  ].filter(Boolean);

  return (
    <div className="max-w-lg mx-auto bg-[#0A0A0A] min-h-screen">
      {/* Back & Safety buttons floating over photo */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => setShowSafety(true)}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"
        >
          <MoreHorizontal className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Photo gallery */}
      <PhotoGallery photos={profileData.photos?.length ? profileData.photos : (profileData.avatar_url ? [profileData.avatar_url] : [])} />

      {/* Profile info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 space-y-5"
      >
        {/* Name & status */}
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">{profileData.display_name}</h1>
          <OnlineIndicator isOnline={profileData.is_online} size="md" />
          {profileData.is_verified && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3B9EFF]/15 border border-[#3B9EFF]/30">
              <BadgeCheck className="w-3.5 h-3.5 text-[#3B9EFF]" />
              <span className="text-[10px] font-semibold text-[#3B9EFF]">Verified</span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1C1E] text-xs text-[#8E8E93]">
              <stat.icon className="w-3 h-3" />
              {stat.label}
            </div>
          ))}
        </div>

        {/* Body type */}
        {profileData.body_type && (
          <ProfileTag label={profileData.body_type} variant="outline" className="capitalize" />
        )}

        {/* Bio */}
        {profileData.bio && (
          <div>
            <h3 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">About</h3>
            <p className="text-sm text-white/80 leading-relaxed">{profileData.bio}</p>
          </div>
        )}

        {/* Side & Meeting Intent */}
        {(profileData.side || profileData.meeting_intent) && (
          <div className="flex flex-wrap gap-2">
            {profileData.side && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1C1E] text-xs text-[#8E8E93]">
                <span className="text-white/60">Side:</span>
                <span className="capitalize">{profileData.side.replace(/_/g, " ")}</span>
              </div>
            )}
            {profileData.meeting_intent && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1C1E] text-xs text-[#8E8E93]">
                <span className="text-white/60">Available:</span>
                <span className="capitalize">{profileData.meeting_intent.replace(/_/g, " ")}</span>
              </div>
            )}
          </div>
        )}

        {/* Looking for */}
        {profileData.looking_for?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Looking for</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.looking_for.map((item) => (
                <ProfileTag key={item} label={item} />
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {profileData.tags?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.tags.map((tag) => (
                <ProfileTag key={tag} label={tag} variant="outline" />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
          onClick={handleFavorite}
          variant="outline"
          className={`flex-1 h-12 rounded-2xl border-[#2C2C2E] ${
            isFavorited ? "text-[#3B9EFF] border-[#3B9EFF]/30" : "text-white"
          } hover:bg-[#1C1C1E]`}
          >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-[#3B9EFF]" : ""}`} />
          </Button>
          <Button
            onClick={handleMessage}
            className="flex-1 h-12 rounded-2xl slyd-gradient text-white font-semibold"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Safety modal */}
      {myProfile && (
        <ReportBlockModal
          open={showSafety}
          onClose={() => setShowSafety(false)}
          targetEmail={targetEmail}
          targetName={profileData.display_name}
          currentEmail={myProfile.user_email}
        />
      )}
    </div>
  );
}
import { db } from '@/api/apiClient';

import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import UserAvatar from "../components/shared/UserAvatar";
import ProfileTag from "../components/shared/ProfileTag";
import LoadingScreen from "../components/shared/LoadingScreen";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Camera,
  Edit3,
  LogOut,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MyProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await db.auth.me();
        setUser(u);
        const profiles = await db.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          navigate(createPageUrl("Onboarding"));
          return;
        }
        setLoading(false);
      } catch (error) {
        // If auth fails, redirect to login
        navigate(createPageUrl("Explore"));
      }
    })();
  }, [navigate]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    const updatedPhotos = [...(profile.photos || []), file_url];
    await db.entities.UserProfile.update(profile.id, {
      avatar_url: profile.avatar_url || file_url,
      photos: updatedPhotos,
    });
    setProfile({ ...profile, avatar_url: profile.avatar_url || file_url, photos: updatedPhotos });
  };

  if (loading) return <LoadingScreen />;

  const menuItems = [
    { icon: Edit3, label: "Edit Profile", page: "EditProfile" },
    { icon: Settings, label: "Settings", page: "Settings" },
    { icon: Shield, label: "Privacy & Safety", page: "Settings" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="relative mb-4">
          <UserAvatar
            src={profile.avatar_url}
            name={profile.display_name}
            isOnline={true}
            size="xl"
          />
          <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full slyd-gradient flex items-center justify-center cursor-pointer shadow-lg">
            <Camera className="w-3.5 h-3.5 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <h2 className="text-xl font-bold">{profile.display_name}</h2>
        {profile.bio && (
          <p className="text-sm text-[#8E8E93] text-center mt-1 max-w-xs">{profile.bio}</p>
        )}
        {profile.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {profile.tags.slice(0, 5).map((tag) => (
              <ProfileTag key={tag} label={tag} variant="outline" />
            ))}
          </div>
        )}
      </motion.div>

      {/* Premium CTA */}
      {!profile.is_premium && (
        <Link to={createPageUrl("Premium")}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="slyd-card p-4 mb-6 flex items-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 slyd-gradient opacity-10" />
            <div className="w-10 h-10 rounded-full bg-[#3B9EFF]/20 flex items-center justify-center shrink-0 relative z-10">
              <Sparkles className="w-5 h-5 text-[#3B9EFF]" />
            </div>
            <div className="flex-1 relative z-10">
              <p className="font-semibold text-sm">Premium</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8E8E93] relative z-10" />
          </motion.div>
        </Link>
      )}

      {/* Menu items */}
      <div className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={createPageUrl(item.page)}
            className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#1C1C1E] transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1C1C1E] flex items-center justify-center">
              <item.icon className="w-4 h-4 text-[#8E8E93]" />
            </div>
            <span className="text-sm font-medium flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <Button
        onClick={() => db.auth.logout()}
        variant="ghost"
        className="w-full mt-8 text-[#3B9EFF] hover:text-[#3B9EFF] hover:bg-[#3B9EFF]/10"
      >
        <LogOut className="w-4 h-4 mr-2" /> Log Out
      </Button>
    </div>
  );
}
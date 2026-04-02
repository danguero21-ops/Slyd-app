import { db } from '@/api/apiClient';

import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

const BODY_TYPES = ["slim", "average", "athletic", "muscular", "stocky", "large"];
const LOOKING_FOR = ["Chat", "Dates", "Friends", "Networking", "Right Now"];
const INTEREST_TAGS = ["Travel", "Music", "Fitness", "Gaming", "Art", "Food", "Outdoors", "Movies", "Tech", "Reading", "Sports", "Photography"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    age: "",
    height: "",
    weight: "",
    body_type: "",
    looking_for: [],
    tags: [],
    avatar_url: "",
    photos: [],
  });

  useEffect(() => {
    db.auth.me().then(async (u) => {
      setUser(u);
      setProfile((p) => ({ ...p, display_name: u.full_name || "" }));
      // Check if user already completed onboarding
      const existingProfiles = await db.entities.UserProfile.filter({ user_email: u.email });
      if (existingProfiles.length > 0 && existingProfiles[0].onboarding_complete) {
        navigate(createPageUrl("Explore"));
      } else {
        // Authenticated but not onboarded — skip past the landing screen
        setStep(1);
      }
    }).catch(() => {
      // Not authenticated — show branded landing (step 0)
    });
  }, [navigate]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setProfile((p) => ({
      ...p,
      avatar_url: p.avatar_url || file_url,
      photos: [...p.photos, file_url],
    }));
    setLoading(false);
  };

  const toggleTag = (tag, field) => {
    setProfile((p) => ({
      ...p,
      [field]: p[field].includes(tag)
        ? p[field].filter((t) => t !== tag)
        : [...p[field], tag],
    }));
  };

  const handleLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setProfile((p) => ({
            ...p,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
          setStep(4);
        },
        () => setStep(4)
      );
    } else {
      setStep(4);
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    await db.entities.UserProfile.create({
      ...profile,
      age: profile.age ? parseInt(profile.age) : null,
      user_email: user.email,
      is_online: true,
      last_active: new Date().toISOString(),
      onboarding_complete: true,
    });
    navigate(createPageUrl("Explore"));
  };

  const steps = [
    // Step 0: Branded landing / login entry
    <motion.div
      key="welcome"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-30%', opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="relative flex flex-col min-h-screen bg-[#0A0A0A] overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Mascot wallpaper */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/images/mascot.png"
          alt=""
          className="w-full h-full object-contain opacity-[0.9]"
          style={{ transform: 'scale(2.925)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between flex-1 px-6 py-12">
        {/* Top: wordmark */}
        <div className="flex flex-col items-center mt-8">

        </div>

        {/* Bottom: tagline + CTA */}
        <div className="w-full max-w-xs flex flex-col items-center gap-4 mb-6">
          <p className="text-[#8E8E93] text-sm text-center">Meet people around you.</p>
          <button
            onClick={() => db.auth.redirectToLogin(window.location.pathname)}
            className="w-full h-13 py-3.5 rounded-2xl slyd-gradient text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#3B9EFF]/20"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => db.auth.redirectToLogin(window.location.pathname)}
            className="text-sm text-[#8E8E93] hover:text-white transition-colors"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            Already have an account? <span className="text-[#3B9EFF] font-medium">Sign in</span>
          </button>
        </div>
      </div>
    </motion.div>,

    // Step 1: Basic Info
    <motion.div key="basics" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="px-6 py-8">
      <p className="text-xs font-medium text-[#3B9EFF] mb-1">1 / 4</p>
      <h2 className="text-2xl font-bold mb-6">Basic Info</h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-[#8E8E93] mb-1.5 block">Display Name</label>
          <Input
            value={profile.display_name}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            placeholder="Your name"
            className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-12 rounded-xl"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-[#8E8E93] mb-1.5 block">Age</label>
            <Input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              placeholder="25"
              className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-12 rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs text-[#8E8E93] mb-1.5 block">Height</label>
            <Input
              value={profile.height}
              onChange={(e) => setProfile({ ...profile, height: e.target.value })}
              placeholder={`5'10"`}
              className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-12 rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs text-[#8E8E93] mb-1.5 block">Weight</label>
            <Input
              value={profile.weight}
              onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
              placeholder="170 lbs"
              className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-12 rounded-xl"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#8E8E93] mb-1.5 block">Body Type</label>
          <Select onValueChange={(v) => setProfile({ ...profile, body_type: v })}>
            <SelectTrigger className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-12 rounded-xl">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
              {BODY_TYPES.map((bt) => (
                <SelectItem key={bt} value={bt} className="text-white capitalize">{bt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-[#8E8E93] mb-1.5 block">About you</label>
          <Textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Write something about yourself..."
            className="bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-xl resize-none"
            rows={3}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-12 rounded-2xl border-[#2C2C2E] text-white hover:bg-[#1C1C1E]">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={() => setStep(2)}
          disabled={!profile.display_name}
          className="flex-1 h-12 rounded-2xl slyd-gradient text-white font-semibold"
        >
          Next <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>,

    // Step 2: Photos
    <motion.div key="photos" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="px-6 py-8">
      <p className="text-xs font-medium text-[#3B9EFF] mb-1">2 / 4</p>
      <h2 className="text-2xl font-bold mb-6">Photos</h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-[#1C1C1E] border border-dashed border-[#2C2C2E] relative">
            {profile.photos[i] ? (
              <img src={profile.photos[i]} className="w-full h-full object-cover" alt="" />
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-[#2C2C2E] transition-colors">
                <Camera className="w-5 h-5 text-[#8E8E93] mb-1" />
                <span className="text-[10px] text-[#8E8E93]">Add</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
        ))}
      </div>

      {loading && <p className="text-xs text-[#8E8E93] text-center mb-4">Uploading...</p>}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-2xl border-[#2C2C2E] text-white hover:bg-[#1C1C1E]">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1 h-12 rounded-2xl slyd-gradient text-white font-semibold">
          Next <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>,

    // Step 3: Location
    <motion.div key="location" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <p className="text-xs font-medium text-[#3B9EFF] mb-1">3 / 4</p>
      <div className="w-20 h-20 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-6">
        <MapPin className="w-8 h-8 text-[#3B9EFF]" />
      </div>
      <h2 className="text-2xl font-bold mb-8">Location</h2>
      <Button
        onClick={handleLocationPermission}
        className="w-full max-w-xs h-12 rounded-2xl slyd-gradient text-white font-semibold"
      >
        <MapPin className="w-4 h-4 mr-2" /> Allow Location
      </Button>
      <button onClick={() => setStep(4)} className="text-[#8E8E93] text-sm mt-4 hover:text-white transition-colors">
        Skip for now
      </button>
    </motion.div>,

    // Step 4: Interests
    <motion.div key="interests" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="px-6 py-8">
      <p className="text-xs font-medium text-[#3B9EFF] mb-1">4 / 4</p>
      <h2 className="text-2xl font-bold mb-6">Interests</h2>

      <div className="flex flex-wrap gap-2 mb-8">
        {LOOKING_FOR.map((item) => (
          <button
            key={item}
            onClick={() => toggleTag(item, "looking_for")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              profile.looking_for.includes(item)
                ? "slyd-gradient text-white"
                : "bg-[#1C1C1E] text-[#8E8E93] border border-[#2C2C2E]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-3">Tags</h3>
      <div className="flex flex-wrap gap-2 mb-8">
        {INTEREST_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag, "tags")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              profile.tags.includes(tag)
                ? "slyd-gradient text-white"
                : "bg-[#1C1C1E] text-[#8E8E93] border border-[#2C2C2E]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-12 rounded-2xl border-[#2C2C2E] text-white hover:bg-[#1C1C1E]">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={handleFinish}
          disabled={loading}
          className="flex-1 h-12 rounded-2xl slyd-gradient text-white font-semibold"
        >
          {loading ? "Setting up..." : (
            <>
              <Sparkles className="w-4 h-4 mr-1" /> Let's Go
            </>
          )}
        </Button>
      </div>
    </motion.div>,
  ];

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-[#0A0A0A]">
      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>
    </div>
  );
}
import { db } from '@/api/apiClient';

import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingScreen from "../components/shared/LoadingScreen";
import { ArrowLeft, Camera, X, Save } from "lucide-react";
import { toast } from "sonner";

const BODY_TYPES = ["slim", "average", "athletic", "muscular", "stocky", "large"];
const LOOKING_FOR = ["Chat", "Dates", "Friends", "Networking", "Right Now"];
const INTEREST_TAGS = ["Travel", "Music", "Fitness", "Gaming", "Art", "Food", "Outdoors", "Movies", "Tech", "Reading", "Sports", "Photography"];
const SIDES = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "versatile", label: "Versatile" },
  { value: "vers_top", label: "Vers Top" },
  { value: "vers_bottom", label: "Vers Bottom" },
  { value: "side", label: "Side" },
];
const MEETING_INTENTS = [
  { value: "right_now", label: "Right Now" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "just_browsing", label: "Just Browsing" },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await db.auth.me();
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) setProfile(profiles[0]);
    })();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setProfile((p) => ({
      ...p,
      avatar_url: p.avatar_url || file_url,
      photos: [...(p.photos || []), file_url],
    }));
  };

  const removePhoto = (index) => {
    const newPhotos = profile.photos.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      photos: newPhotos,
      avatar_url: newPhotos[0] || "",
    });
  };

  const toggleItem = (item, field) => {
    setProfile((p) => ({
      ...p,
      [field]: (p[field] || []).includes(item)
        ? p[field].filter((t) => t !== item)
        : [...(p[field] || []), item],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...data } = profile;
    await db.entities.UserProfile.update(profile.id, data);
    toast.success("Profile updated!");
    setSaving(false);
    navigate(createPageUrl("MyProfile"));
  };

  if (!profile) return <LoadingScreen />;

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">Edit Profile</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="slyd-gradient text-white rounded-xl"
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Photos grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {(profile.photos || []).map((photo, i) => (
          <div key={i} className="aspect-square rounded-2xl overflow-hidden relative">
            <img src={photo} className="w-full h-full object-cover" alt="" />
            <button
              onClick={() => removePhoto(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {(profile.photos || []).length < 6 && (
          <label className="aspect-square rounded-2xl border border-dashed border-[#2C2C2E] bg-[#1C1C1E] flex flex-col items-center justify-center cursor-pointer hover:bg-[#2C2C2E] transition-colors">
            <Camera className="w-5 h-5 text-[#8E8E93] mb-1" />
            <span className="text-[10px] text-[#8E8E93]">Add</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-[#8E8E93] mb-1.5 block">Display Name</label>
          <Input
            value={profile.display_name || ""}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-11 rounded-xl"
          />
        </div>
        <div>
          <label className="text-xs text-[#8E8E93] mb-1.5 block">About</label>
          <Textarea
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-xl resize-none"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-[#8E8E93] mb-1.5 block">Age</label>
            <Input
              type="number"
              value={profile.age || ""}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || "" })}
              className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-11 rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs text-[#8E8E93] mb-1.5 block">Height</label>
            <Input
              value={profile.height || ""}
              onChange={(e) => setProfile({ ...profile, height: e.target.value })}
              className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-11 rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs text-[#8E8E93] mb-1.5 block">Weight</label>
            <Input
              value={profile.weight || ""}
              onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
              className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-11 rounded-xl"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#8E8E93] mb-1.5 block">Body Type</label>
          <Select value={profile.body_type || ""} onValueChange={(v) => setProfile({ ...profile, body_type: v })}>
            <SelectTrigger className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-11 rounded-xl">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
              {BODY_TYPES.map((bt) => (
                <SelectItem key={bt} value={bt} className="text-white capitalize">{bt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Side */}
        <div>
          <label className="text-xs text-[#8E8E93] mb-1.5 block">Side</label>
          <Select value={profile.side || ""} onValueChange={(v) => setProfile({ ...profile, side: v })}>
            <SelectTrigger className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-11 rounded-xl">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
              {SIDES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Meeting Intent */}
        <div>
          <label className="text-xs text-[#8E8E93] mb-1.5 block">Meeting Intent</label>
          <Select value={profile.meeting_intent || ""} onValueChange={(v) => setProfile({ ...profile, meeting_intent: v })}>
            <SelectTrigger className="bg-[#1C1C1E] border-[#2C2C2E] text-white h-11 rounded-xl">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
              {MEETING_INTENTS.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-white">{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Looking for */}
        <div>
          <label className="text-xs text-[#8E8E93] mb-2 block">Looking for</label>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR.map((item) => (
              <button
                key={item}
                onClick={() => toggleItem(item, "looking_for")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  (profile.looking_for || []).includes(item)
                    ? "slyd-gradient text-white"
                    : "bg-[#1C1C1E] text-[#8E8E93] border border-[#2C2C2E]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="text-xs text-[#8E8E93] mb-2 block">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleItem(tag, "tags")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  (profile.tags || []).includes(tag)
                    ? "slyd-gradient text-white"
                    : "bg-[#1C1C1E] text-[#8E8E93] border border-[#2C2C2E]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
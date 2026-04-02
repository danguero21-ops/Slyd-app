import { db } from '@/api/apiClient';

import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/shared/LoadingScreen";
import PaywallModal from "../components/premium/PaywallModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  MapPin,
  Bell,
  MessageCircle,
  Heart,
  Shield,
  UserX,
  Trash2,
  Lock,
  Ghost,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await db.auth.me();
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) setProfile(profiles[0]);
    })();
  }, []);

  const updateSetting = async (key, value) => {
    setProfile({ ...profile, [key]: value });
    await db.entities.UserProfile.update(profile.id, { [key]: value });
    toast.success("Setting updated");
  };

  if (!profile) return <LoadingScreen />;

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <PaywallModal
        open={!!paywallFeature}
        onClose={() => setPaywallFeature(null)}
        feature={paywallFeature}
      />
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">Settings</h1>
      </div>

      {/* Privacy */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3 px-1">
          Privacy
        </h3>
        <div className="slyd-card divide-y divide-[#2C2C2E]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-[#8E8E93]" />
              <p className="text-sm font-medium">Visibility</p>
            </div>
            <Select
              value={profile.visibility || "everyone"}
              onValueChange={(v) => updateSetting("visibility", v)}
            >
              <SelectTrigger className="w-32 bg-[#2C2C2E] border-0 text-white text-xs h-8 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                <SelectItem value="everyone" className="text-white text-xs">Everyone</SelectItem>
                <SelectItem value="favorites_only" className="text-white text-xs">Favorites only</SelectItem>
                <SelectItem value="nobody" className="text-white text-xs">Nobody</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#8E8E93]" />
              <p className="text-sm font-medium">Show Distance</p>
            </div>
            <Switch
              checked={profile.show_distance !== false}
              onCheckedChange={(v) => updateSetting("show_distance", v)}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <UserX className="w-4 h-4 text-[#8E8E93]" />
              <p className="text-sm font-medium">Show Age</p>
            </div>
            <Switch
              checked={profile.show_age !== false}
              onCheckedChange={(v) => updateSetting("show_age", v)}
            />
          </div>
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => { if (!profile.is_premium) setPaywallFeature("Incognito Mode"); }}
          >
            <div className="flex items-center gap-3">
              <EyeOff className="w-4 h-4 text-[#8E8E93]" />
              <div>
                <p className="text-sm font-medium">Incognito Mode</p>
                {!profile.is_premium && <p className="text-[10px] text-[#3B9EFF]">Premium only</p>}
              </div>
            </div>
            {profile.is_premium ? (
              <Switch
                checked={profile.incognito_mode || false}
                onCheckedChange={(v) => updateSetting("incognito_mode", v)}
              />
            ) : (
              <Lock className="w-4 h-4 text-[#3B9EFF]" />
            )}
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Ghost className="w-4 h-4 text-[#8E8E93]" />
              <div>
                <p className="text-sm font-medium">Stealth Mode</p>
                <p className="text-[10px] text-[#8E8E93]">Hidden from discovery & profile views</p>
              </div>
            </div>
            <Switch
              checked={profile.stealth_mode || false}
              onCheckedChange={(v) => updateSetting("stealth_mode", v)}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3 px-1">
          Notifications
        </h3>
        <div className="slyd-card divide-y divide-[#2C2C2E]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-[#8E8E93]" />
              <p className="text-sm font-medium">Messages</p>
            </div>
            <Switch
              checked={profile.notification_messages !== false}
              onCheckedChange={(v) => updateSetting("notification_messages", v)}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-[#8E8E93]" />
              <p className="text-sm font-medium">Profile Views</p>
            </div>
            <Switch
              checked={profile.notification_views !== false}
              onCheckedChange={(v) => updateSetting("notification_views", v)}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-[#8E8E93]" />
              <p className="text-sm font-medium">Favorites</p>
            </div>
            <Switch
              checked={profile.notification_favorites !== false}
              onCheckedChange={(v) => updateSetting("notification_favorites", v)}
            />
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <h3 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3 px-1">
          Account
        </h3>
        <div className="slyd-card">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-3 p-4 w-full text-left text-red-400 hover:bg-red-400/5 transition-colors rounded-2xl">
                <Trash2 className="w-4 h-4" />
                <p className="text-sm font-medium">Delete Account</p>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1C1C1E] border-[#2C2C2E]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Delete your account?</AlertDialogTitle>
                <AlertDialogDescription className="text-[#8E8E93]">
                  This action cannot be undone. Your profile, messages, and all data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-[#2C2C2E] border-0 text-white hover:bg-[#3C3C3E]">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await db.entities.UserProfile.delete(profile.id);
                    db.auth.logout();
                  }}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
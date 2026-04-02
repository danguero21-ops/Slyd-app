import { db } from '@/api/apiClient';

import React, { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import LoadingScreen from "../components/shared/LoadingScreen";
import EmptyState from "../components/shared/EmptyState";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function createUserIcon(avatarUrl, isOnline) {
  const onlineRing = isOnline ? "border: 2px solid #30D158;" : "border: 2px solid #2C2C2E;";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width: 44px; height: 44px; border-radius: 12px; ${onlineRing} overflow: hidden; background: #1C1C1E;">
      ${avatarUrl
        ? `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`
        : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #8E8E93; font-weight: bold;">?</div>`
      }
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

export default function NearbyMap() {
  const [myProfile, setMyProfile] = useState(null);
  const [center, setCenter] = useState([40.7128, -74.006]);

  useEffect(() => {
    (async () => {
      const user = await db.auth.me();
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        setMyProfile(profiles[0]);
        if (profiles[0].latitude && profiles[0].longitude) {
          setCenter([profiles[0].latitude, profiles[0].longitude]);
        }
      }
    })();
  }, []);

  const { data: allProfiles = [], isLoading } = useQuery({
    queryKey: ["map-profiles"],
    queryFn: () => db.entities.UserProfile.filter({ onboarding_complete: true }),
    refetchInterval: 30000,
  });

  const nearbyProfiles = allProfiles.filter(
    (p) =>
      p.user_email !== myProfile?.user_email &&
      p.latitude &&
      p.longitude &&
      p.visibility !== "nobody" &&
      !p.incognito_mode
  );

  if (!myProfile || isLoading) return <LoadingScreen />;

  if (!myProfile.latitude || !myProfile.longitude) {
    return (
      <EmptyState
        icon={MapPin}
        title="Location disabled"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-130px)] w-full relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        {nearbyProfiles.map((profile) => (
          <Marker
            key={profile.id}
            position={[profile.latitude, profile.longitude]}
            icon={createUserIcon(profile.avatar_url, profile.is_online)}
          >
            <Popup className="slyd-popup">
              <Link
                to={createPageUrl(`ProfileDetail?email=${encodeURIComponent(profile.user_email)}`)}
                className="flex items-center gap-3 p-1"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1C1C1E]">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                      {profile.display_name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{profile.display_name}</p>
                  {profile.age && <p className="text-xs text-gray-500">{profile.age} years</p>}
                </div>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating count */}
      <div className="absolute top-4 left-4 z-[999] px-3 py-1.5 rounded-full slyd-glass text-white text-xs font-medium border border-[#2C2C2E]">
        {nearbyProfiles.length} people nearby
      </div>
    </div>
  );
}
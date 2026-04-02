import { db } from '@/api/apiClient';

import React, { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import UserAvatar from "../components/shared/UserAvatar";
import LoadingScreen from "../components/shared/LoadingScreen";
import EmptyState from "../components/shared/EmptyState";
import PaywallModal from "../components/premium/PaywallModal";
import { Heart, Eye, Sparkles, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";

export default function Favorites() {
  const [currentEmail, setCurrentEmail] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await db.auth.me();
      setCurrentEmail(user.email);
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) setMyProfile(profiles[0]);
    })();
  }, []);

  const { data: favorites = [], isLoading: favsLoading } = useQuery({
    queryKey: ["my-favorites", currentEmail],
    queryFn: () => db.entities.Favorite.filter({ user_email: currentEmail }, "-created_date"),
    enabled: !!currentEmail
  });

  const { data: views = [], isLoading: viewsLoading } = useQuery({
    queryKey: ["profile-views", currentEmail],
    queryFn: () => db.entities.ProfileView.filter({ viewed_email: currentEmail }, "-created_date", 50),
    enabled: !!currentEmail
  });

  if (!currentEmail) return <LoadingScreen />;

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold">Activity</h1>
      </div>

      <Tabs defaultValue="favorites" className="px-4">
        <TabsList className="bg-[#1C1C1E] w-full h-10 rounded-xl">
          <TabsTrigger value="favorites" className="flex-1 rounded-lg data-[state=active]:bg-[#2C2C2E] data-[state=active]:text-white text-[#8E8E93]">
            <Heart className="w-3.5 h-3.5 mr-1.5" /> Favorites
          </TabsTrigger>
          <TabsTrigger value="views" className="flex-1 rounded-lg data-[state=active]:bg-[#2C2C2E] data-[state=active]:text-white text-[#8E8E93]">
            <Eye className="w-3.5 h-3.5 mr-1.5" /> Viewed Me
            

          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-4">
          {favsLoading ?
          <LoadingScreen /> :
          favorites.length > 0 ?
          <div className="space-y-1">
              {favorites.map((fav) =>
            <Link
              key={fav.id}
              to={createPageUrl(`ProfileDetail?email=${encodeURIComponent(fav.favorited_email)}`)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1C1C1E] transition-colors">

                  <UserAvatar src={fav.favorited_avatar} name={fav.favorited_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{fav.favorited_name}</p>
                    <p className="text-xs text-[#8E8E93]">{moment(fav.created_date).fromNow()}</p>
                  </div>
                  <Heart className="w-4 h-4 text-[#3B9EFF] fill-[#3B9EFF]" />
                </Link>
            )}
            </div> :

          <EmptyState
            icon={Heart}
            title="No favorites" />

          }
        </TabsContent>

        <TabsContent value="views" className="mt-4">
          {myProfile?.is_premium ? (
            viewsLoading ? (
              <LoadingScreen />
            ) : views.length > 0 ? (
              <div className="space-y-1">
                {views.map((view) => (
                  <Link
                    key={view.id}
                    to={createPageUrl(`ProfileDetail?email=${encodeURIComponent(view.viewer_email)}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1C1C1E] transition-colors"
                  >
                    <UserAvatar src={view.viewer_avatar} name={view.viewer_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{view.viewer_name}</p>
                      <p className="text-xs text-[#8E8E93]">{moment(view.created_date).fromNow()}</p>
                    </div>
                    <Eye className="w-4 h-4 text-[#8E8E93]" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={Eye} title="No views yet" />
            )
          ) : (
            <div className="relative">
              {/* Blurred fake preview rows */}
              <div className="space-y-1 pointer-events-none select-none">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1C1C1E] blur-sm opacity-50">
                    <div className="w-10 h-10 rounded-full bg-[#2C2C2E]" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-24 bg-[#2C2C2E] rounded-full" />
                      <div className="h-2 w-16 bg-[#2C2C2E] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-[#1C1C1E]/90 backdrop-blur-md rounded-2xl p-6 text-center border border-[#2C2C2E] mx-4">
                  <div className="w-12 h-12 rounded-full bg-[#3B9EFF]/10 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-[#3B9EFF]" />
                  </div>
                  <h3 className="font-bold mb-1">See who viewed you</h3>
                  <p className="text-xs text-[#8E8E93] mb-4">Unlock profile views with Premium</p>
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-2xl slyd-gradient text-white font-semibold text-sm"
                  >
                    <Sparkles className="w-4 h-4" /> Upgrade
                  </button>
                </div>
              </div>
              <PaywallModal
                open={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="Profile Views"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>);

}
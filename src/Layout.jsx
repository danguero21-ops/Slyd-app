import { db } from '@/api/apiClient';

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";

import { Grid3X3, MessageCircle, Heart, MapPin, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
{ icon: Grid3X3, label: "Explore", page: "Explore" },
{ icon: MapPin, label: "Nearby", page: "NearbyMap" },
{ icon: MessageCircle, label: "Chat", page: "Inbox" },
{ icon: Heart, label: "Favs", page: "Favorites" },
{ icon: User, label: "Profile", page: "MyProfile" }];

const HIDDEN_NAV_PAGES = ["Onboarding", "ProfileDetail", "ChatRoom"];

export default function Layout({ children, currentPageName }) {
  const [currentUser, setCurrentUser] = useState(null);
  const hideNav = HIDDEN_NAV_PAGES.includes(currentPageName);

  useEffect(() => {
    db.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col relative">
      {/* Background mascot wallpaper */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/images/mascot.png"
          alt=""
          className="w-full h-full object-contain opacity-15 scale-[1.95]" />

      </div>
      <style>{`
        :root {
          --background: 0 0% 4%;
          --foreground: 0 0% 98%;
          --card: 0 0% 11%;
          --card-foreground: 0 0% 98%;
          --popover: 0 0% 11%;
          --popover-foreground: 0 0% 98%;
          --primary: 207 100% 62%;
          --primary-foreground: 0 0% 100%;
          --secondary: 0 0% 15%;
          --secondary-foreground: 0 0% 98%;
          --muted: 0 0% 15%;
          --muted-foreground: 0 0% 56%;
          --accent: 0 0% 15%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 62% 50%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 18%;
          --input: 0 0% 18%;
          --ring: 207 100% 62%;
          --radius: 0.75rem;
        }
      `}</style>

      {/* Top bar for non-onboarding pages */}
      {!hideNav &&
      <header className="sticky top-0 z-50 slyd-glass border-b border-[#2C2C2E]/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center justify-center px-4 h-14 max-w-lg mx-auto">
            <Link to={createPageUrl("Explore")} className="flex items-center gap-2">
              <img src="/images/logo.png" alt="SLYD" className="h-[218px] w-auto mt-6" />
            </Link>
            <Link
            to={createPageUrl("Premium")}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-[#1C1C1E]">

              <Sparkles className="w-5 h-5 text-[#3B9EFF]" />
            </Link>
          </div>
        </header>
      }

      {/* Page content */}
      <main className={`flex-1 ${!hideNav ? "pb-20" : ""}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPageName}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-30%', opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            style={{ willChange: 'transform' }}>

            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      {!hideNav &&
      <nav className="fixed bottom-0 left-0 right-0 z-50 slyd-glass border-t border-[#2C2C2E]/50 safe-bottom">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
            {NAV_ITEMS.map(({ icon: Icon, label, page }) => {
            const isActive = currentPageName === page;
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                className="flex flex-col items-center gap-0.5 py-1 px-3 relative">

                  {isActive &&
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full slyd-gradient"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} />

                }
                  <Icon
                  className={`w-5 h-5 transition-colors ${
                  isActive ? "text-[#3B9EFF]" : "text-[#8E8E93]"}`
                  } />

                  <span
                  className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-white" : "text-[#8E8E93]"}`
                  }>

                    {label}
                  </span>
                </Link>);

          })}
          </div>
        </nav>
      }
    </div>);

}
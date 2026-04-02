/**
 * pages.config.js - Page routing configuration
 * 
 * This file lists all page routes for the app. Update imports here when adding new pages.
 * Import page components and add them to PAGES and pagesConfig.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ChatRoom from './pages/ChatRoom';
import EditProfile from './pages/EditProfile';
import Explore from './pages/Explore';
import Favorites from './pages/Favorites';
import Inbox from './pages/Inbox';
import MyProfile from './pages/MyProfile';
import NearbyMap from './pages/NearbyMap';
import Onboarding from './pages/Onboarding';
import Premium from './pages/Premium';
import ProfileDetail from './pages/ProfileDetail';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';

export const PAGES = {
    "ChatRoom": ChatRoom,
    "EditProfile": EditProfile,
    "Explore": Explore,
    "Favorites": Favorites,
    "Inbox": Inbox,
    "MyProfile": MyProfile,
    "NearbyMap": NearbyMap,
    "Onboarding": Onboarding,
    "Premium": Premium,
    "ProfileDetail": ProfileDetail,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};
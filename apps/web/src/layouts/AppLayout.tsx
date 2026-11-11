import { useState } from "react";
import { Outlet } from "react-router-dom";
import BottomTabs from "./BottomTabs.js";
import Sidebar from "./Sidebar.js";
import MoreSheet from "./MoreSheet.js";
import TrialBanner from "../components/TrialBanner.js";
import { useGym } from "../context/GymContext.js";

export default function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { gym } = useGym();

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      <div className="flex">
        {/* Desktop Sidebar (hidden on mobile) */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 pb-20 lg:pb-0 h-screen overflow-y-auto">
          
          {/* Mobile Top Header with Branding */}
          <div className="lg:hidden sticky top-0 z-30 bg-[#0c0a09]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3">
            {gym?.logoUrl ? (
              <img 
                src={gym.logoUrl} 
                alt={gym.name} 
                className="h-8 w-8 rounded-lg object-cover bg-white/10" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <img 
              src="/logo.svg" 
              alt="Palastra" 
              className={`h-8 w-8 drop-shadow-md ${gym?.logoUrl ? 'hidden' : ''}`} 
            />
            <span className="font-semibold text-white truncate">{gym?.name || "Palastra"}</span>
          </div>

          <TrialBanner />
          
          <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 lg:py-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <BottomTabs onMoreClick={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}

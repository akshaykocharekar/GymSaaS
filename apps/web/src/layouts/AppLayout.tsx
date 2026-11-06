import { useState } from "react";
import { Outlet } from "react-router-dom";
import BottomTabs from "./BottomTabs.js";
import Sidebar from "./Sidebar.js";
import MoreSheet from "./MoreSheet.js";
import TrialBanner from "../components/TrialBanner.js";

export default function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 pb-20 lg:pb-0">
          <TrialBanner />
          <Outlet />
        </div>
      </div>
      <BottomTabs onMoreClick={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
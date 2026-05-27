/**
 * HRLayout — shell layout for HR pages.
 * Same structure as AdminLayout but uses HR sidebar links.
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import HRSidebar from './HRSidebar';
import BottomTabBar from './BottomTabBar';

function HRLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background dark:bg-gray-950 overflow-hidden">
      <TopBar onMenuToggle={() => setMobileSidebarOpen((v) => !v)} />

      <div className="flex flex-1 min-h-0">
        <HRSidebar
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        {mobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-56 bg-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <HRSidebar collapsed={false} onCollapse={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 animate-fade-in"
        >
          <Outlet />
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
}

export default HRLayout;

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function AppLayout({ currentUser, onLogout, children, notifications = [], onMarkRead }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#fdf8f8] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          currentUser={currentUser}
          onLogout={onLogout}
          notifications={notifications}
          onMarkRead={onMarkRead}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              currentUser={currentUser}
              onLogout={onLogout}
              onClose={() => setSidebarOpen(false)}
              notifications={notifications}
              onMarkRead={onMarkRead}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e5e2e1]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#747878] hover:text-[#111111] transition-colors"
          >
            <Menu size={20} />
          </button>
          <span
            className="text-base font-semibold text-[#111111]"
            style={{ fontFamily: "'Newsreader', serif" }}
          >
            Portfolia
          </span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

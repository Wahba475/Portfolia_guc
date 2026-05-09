import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, Briefcase, User, LogOut, X,
  Bell, BellOff, Users, MessageSquare
} from 'lucide-react'
import { getRoleDashboardPath } from '../utils/roleRoutes'

export default function StudentSidebar({ currentUser, onLogout, onClose, notifications = [], onMarkRead }) {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { to: '/student/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
    { to: '/student/projects',    label: 'Projects',     icon: FolderKanban },
    { to: '/student/internships', label: 'Internships',  icon: Briefcase },
    { to: '/student/portfolios',  label: 'Portfolios',   icon: Users },
    { to: '/student/messages',    label: 'Messages',     icon: MessageSquare },
    { to: '/student/profile',     label: 'Profile',      icon: User },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length
  const notificationsOff = currentUser?.notificationsOff

  function handleLogoClick(e) {
    e.preventDefault()
    if (onClose) onClose()
    navigate(getRoleDashboardPath(currentUser?.role))
  }

  function handleBellClick() {
    if (onMarkRead) onMarkRead()
    navigate('/student/notifications')
    if (onClose) onClose()
  }

  function handleNavClick() {
    if (onClose) onClose()
  }

  return (
    <aside className="flex flex-col h-full w-60 bg-white border-r border-[#e5e2e1] py-6 px-4 flex-shrink-0">
      {/* Logo + Close */}
      <div className="flex items-center justify-between mb-8 px-2">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 group cursor-pointer bg-transparent border-none p-0 text-left"
          aria-label="Go to home"
        >
          <span className="w-6 h-6 bg-[#111111] flex items-center justify-center">
            <span className="text-white text-xs font-bold" style={{ fontFamily: "'Newsreader', serif" }}>P</span>
          </span>
          <span
            className="text-base font-semibold tracking-tight text-[#111111] group-hover:text-[#6b38d4] transition-colors"
            style={{ fontFamily: "'Newsreader', serif" }}
          >
            Portfolia
          </span>
        </button>
        <div className="flex items-center gap-1">
          {/* Notification bell */}
          {!notificationsOff && (
            <button
              onClick={handleBellClick}
              className="relative p-1 text-[#747878] hover:text-[#111111] transition-colors"
              title={unreadCount > 0 ? `${unreadCount} unread` : 'Notifications'}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center rounded-full leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          {notificationsOff && (
            <BellOff size={14} className="text-[#c4c7c7]" title="Notifications off" />
          )}
          {onClose && (
            <button onClick={onClose} className="text-[#747878] hover:text-[#111111] transition-colors lg:hidden ml-1">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, badge }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'))
          return (
            <Link
              key={to}
              to={to}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-100 border
                ${active
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'text-[#444748] border-transparent hover:border-[#e5e2e1] hover:text-[#111111] hover:bg-[#fdf8f8]'
                }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <Icon size={15} className={active ? 'text-white' : 'text-[#747878]'} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 leading-none border
                  ${active ? 'bg-white text-[#111111] border-white' : 'bg-[#fdf8f8] text-[#747878] border-[#e5e2e1]'}`}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-[#e5e2e1] pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 bg-[#111111] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {currentUser?.image || currentUser?.avatar
              ? <img src={currentUser.image || currentUser.avatar} alt={currentUser.name} className="w-8 h-8 object-cover" />
              : <span className="text-white text-xs font-bold">{currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111111] truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {currentUser?.name}
            </p>
            <p className="text-[10px] font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
              {currentUser?.role}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#444748] border border-[#e5e2e1] hover:border-[#111111] hover:text-[#111111] hover:bg-[#fdf8f8] transition-all"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  )
}

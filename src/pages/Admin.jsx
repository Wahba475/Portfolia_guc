import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import AdminLayout from '../components/AdminLayout'
import { Filter, Edit2, Plus, Trash2, X, Check, Users, FolderKanban, Briefcase, Shield, ArrowLeft, BookOpen, ToggleLeft, ToggleRight, EyeOff, Eye } from 'lucide-react'

/* ── Stat Card ─────────────────────────────────────────── */
function AdminStat({ icon: Icon, label, value, color = '#111111' }) {
  return (
    <div className="bg-white border border-[#e5e2e1] p-6 flex items-center gap-4">
      <div className="w-10 h-10 bg-[#f1edec] border border-[#e5e2e1] flex items-center justify-center flex-shrink-0">
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>{value}</p>
        <p className="text-xs font-semibold text-[#747878] uppercase tracking-wider mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</p>
      </div>
    </div>
  )
}

/* ── Edit User Modal ───────────────────────────────────── */
function EditUserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'student',
    bio: user.bio || '',
  })

  function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.')
      return
    }
    onSave({ ...user, ...form })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md border border-[#e5e2e1]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2e1]">
          <h3 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>
            Edit User
          </h3>
          <button onClick={onClose} className="text-[#747878] hover:text-[#111111] transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border-b border-[#c4c7c7] py-1.5 bg-transparent text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border-b border-[#c4c7c7] py-1.5 bg-transparent text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full border border-[#c4c7c7] py-1.5 px-2 bg-white text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <option value="student">Student</option>
              <option value="employer">Employer</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Bio</label>
            <textarea
              rows={2}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="w-full border border-[#c4c7c7] p-2 text-sm text-[#111111] focus:border-[#111111] focus:outline-none resize-none"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#111111] text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#c4c7c7] text-xs font-bold uppercase tracking-widest text-[#111111] hover:bg-[#f1edec] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Edit Course Modal ─────────────────────────────────── */
function EditCourseModal({ course, onSave, onClose }) {
  const [form, setForm] = useState({
    name: course?.name || '',
    code: course?.code || '',
  })

  function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Course name and code are required.')
      return
    }
    onSave({ ...(course || {}), ...form })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md border border-[#e5e2e1]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2e1]">
          <h3 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>
            {course ? 'Edit Course' : 'New Course'}
          </h3>
          <button onClick={onClose} className="text-[#747878] hover:text-[#111111] transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Course Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border-b border-[#c4c7c7] py-1.5 bg-transparent text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
              style={{ fontFamily: "'Manrope', sans-serif" }}
              placeholder="Bachelor Project"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Course Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="w-full border-b border-[#c4c7c7] py-1.5 bg-transparent text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
              style={{ fontFamily: "'Manrope', sans-serif" }}
              placeholder="CSEN901"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#111111] text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Save Course
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#c4c7c7] text-xs font-bold uppercase tracking-widest text-[#111111] hover:bg-[#f1edec] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Confirm Delete Modal ──────────────────────────────── */
function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm border border-[#e5e2e1] p-6">
        <p className="text-sm text-[#111111] mb-6" style={{ fontFamily: "'Manrope', sans-serif" }}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#ba1a1a] text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#93000a] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[#c4c7c7] text-[#111111] py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#f1edec] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Create User Modal (admin) ─────────────────────────── */
function CreateUserModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', bio: '' })

  function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Name, email and password are required.')
      return
    }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md border border-[#e5e2e1]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2e1]">
          <h3 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>Create Account</h3>
          <button onClick={onClose} className="text-[#747878] hover:text-[#111111] transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          {[{ label: 'Name', key: 'name' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'Password', key: 'password', type: 'password' }].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</label>
              <input type={type || 'text'} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border-b border-[#c4c7c7] py-1.5 bg-transparent text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
                style={{ fontFamily: "'Manrope', sans-serif" }} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full border border-[#c4c7c7] py-1.5 px-2 bg-white text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
              style={{ fontFamily: "'Manrope', sans-serif" }}>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-[#111111] text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Create Account</button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[#c4c7c7] text-xs font-bold uppercase tracking-widest text-[#111111] hover:bg-[#f1edec] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────── */
export default function Admin({
  currentUser,
  onLogout,
  userList,
  projects,
  internships,
  onDeleteUser,
  onUpdateUser,
  onDeleteProject,
  onDeleteInternship,
  courses,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  linkingRequests,
  onResolveLinkRequest,
  onUpdateProject,
  onCreateAdminUser,
  onResolveFlag,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const path = location.pathname
  const [activeTab, setActiveTab] = useState(() => {
    if (path.includes('/course-requests')) return 'Requests'
    if (path.includes('/courses')) return 'Courses'
    if (path.includes('/projects-moderation')) return 'Projects'
    if (path.includes('/employers-approval')) return 'Employers'
    if (path.includes('/users')) return 'Users'
    return 'Users'
  })

  // Sync state if pathname changes
  useEffect(() => {
    if (path.includes('/courses') && !path.includes('/course-requests')) setActiveTab('Courses')
    else if (path.includes('/projects-moderation')) setActiveTab('Projects')
    else if (path.includes('/course-requests')) setActiveTab('Requests')
    else if (path.includes('/employers-approval')) setActiveTab('Employers')
    else if (path.includes('/users')) setActiveTab('Users')
    else if (path.includes('/dashboard')) setActiveTab('Users')
  }, [path])

  function handleTabClick(tab) {
    setActiveTab(tab)
    if (tab === 'Users') navigate('/admin/users')
    else if (tab === 'Projects') navigate('/admin/projects-moderation')
    else if (tab === 'Requests') navigate('/admin/course-requests')
    else if (tab === 'Courses') navigate('/admin/courses')
    else if (tab === 'Internships') navigate('/admin/dashboard') // Fallback since no specific route
  }

  const [roleFilter, setRoleFilter] = useState('All')
  const [editingUser, setEditingUser] = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)
  const [isCreatingCourse, setIsCreatingCourse] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null) // { type, id, label }

  // ── Computed ──────────────────────────────────────────
  const filteredUsers = (userList || []).filter((u) => {
    if (u.id === currentUser.id) return false // hide self
    if (roleFilter === 'All') return true
    return u.role === roleFilter.toLowerCase()
  })

  const getStatusColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-[#111111] text-white'
      case 'employer': return 'bg-[#D97706] text-white'
      case 'instructor': return 'bg-[#1d4ed8] text-white'
      default: return 'bg-[#f1edec] text-[#111111]'
    }
  }

  // ── Handlers ──────────────────────────────────────────
  function handleSaveUser(updated) {
    onUpdateUser(updated)
    setEditingUser(null)
    toast.success(`User "${updated.name}" updated.`)
  }

  function handleDeleteUser(user) {
    setConfirmDelete({
      type: 'user',
      id: user.id,
      label: `Are you sure you want to delete user "${user.name}"? This will also remove their projects.`,
    })
  }

  function handleDeleteProject(project) {
    setConfirmDelete({
      type: 'project',
      id: project.id,
      label: `Are you sure you want to delete project "${project.title}"?`,
    })
  }

  function handleDeleteInternship(internship) {
    setConfirmDelete({
      type: 'internship',
      id: internship.id,
      label: `Are you sure you want to delete internship "${internship.role}" at ${internship.company}?`,
    })
  }

  function handleSaveCourse(updated) {
    if (isCreatingCourse) {
      onCreateCourse({ ...updated, id: String(Date.now()), createdAt: new Date().toISOString() })
    } else {
      onUpdateCourse(updated)
    }
    setEditingCourse(null)
    setIsCreatingCourse(false)
    toast.success('Course saved.')
  }

  function handleDeleteCourseItem(course) {
    setConfirmDelete({
      type: 'course',
      id: course.id,
      label: `Are you sure you want to delete course "${course.name}"?`,
    })
  }

  function handleCreateUser(userData) {
    onCreateAdminUser(userData)
    setIsCreatingUser(false)
    toast.success(`Account created for ${userData.name}.`)
  }

  function handleToggleUserActive(user) {
    const updated = { ...user, active: user.active === false ? true : false }
    onUpdateUser(updated)
    toast.success(`${user.name} ${updated.active === false ? 'deactivated' : 'activated'}.`)
  }

  function handleToggleProjectVisibility(project) {
    const updated = { ...project, adminHidden: !project.adminHidden }
    onUpdateProject(updated)
    toast.success(`Project "${project.title}" ${updated.adminHidden ? 'hidden' : 'made visible'}.`)
  }

  function executeDelete() {
    if (!confirmDelete) return
    const { type, id } = confirmDelete
    if (type === 'user') {
      onDeleteUser(id)
      toast.success('User deleted.')
    } else if (type === 'project') {
      onDeleteProject(id)
      toast.success('Project deleted.')
    } else if (type === 'internship') {
      onDeleteInternship(id)
      toast.success('Internship deleted.')
    } else if (type === 'course') {
      onDeleteCourse(id)
      toast.success('Course deleted.')
    }
    setConfirmDelete(null)
  }

  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-[1280px] mx-auto w-full space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col gap-2">
            <h1
              className="text-4xl font-bold text-[#111111]"
              style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.01em', lineHeight: '1.2' }}
            >
              System Administration
            </h1>
            <p className="text-base text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Manage global entities, user access, and platform configurations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 bg-[#f1edec] text-[#111111] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-[#e5e2e1]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <Shield size={12} />
              Admin Access
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <AdminStat icon={Users} label="Total Users" value={(userList || []).length} />
          <AdminStat icon={FolderKanban} label="Total Projects" value={(projects || []).length} />
          <AdminStat icon={Briefcase} label="Internships" value={(internships || []).length} />
          <AdminStat icon={BookOpen} label="Courses" value={(courses || []).length} />
        </div>

        {/* Data Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 border border-[#e5e2e1]">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['Users', 'Projects', 'Internships', 'Courses', 'Requests', 'Employers'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border
                  ${
                    activeTab === tab
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-[#f7f3f2] border-[#e5e2e1] text-[#747878] hover:text-[#111111] hover:border-[#111111]'
                  }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Role filter + Create Account – only for Users tab */}
          {activeTab === 'Users' && (
            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <div className="relative flex-1 md:w-48">
                <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#747878]" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 bg-white border border-[#e5e2e1] focus:outline-none focus:border-[#111111] text-sm appearance-none cursor-pointer text-[#111111]"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Student">Student</option>
                  <option value="Employer">Employer</option>
                  <option value="Instructor">Instructor</option>
                </select>
              </div>
              <button onClick={() => setIsCreatingUser(true)}
                className="flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors flex-shrink-0"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                <Plus size={14} /> Create Account
              </button>
            </div>
          )}
        </div>

        {/* ── Users Table ── */}
        {activeTab === 'Users' && (
          <div className="bg-white border border-[#e5e2e1] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f3f2] border-b border-[#e5e2e1]">
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Name & Email</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Role</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Projects</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider text-right" style={{ fontFamily: "'Inter', sans-serif" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-[#747878] text-sm">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#f7f3f2] transition-colors group ${idx !== filteredUsers.length - 1 ? 'border-b border-[#e5e2e1]' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#111111]">{user.name}</span>
                            {user.active === false && <span className="text-[9px] font-bold uppercase tracking-widest bg-[#ba1a1a] text-white px-1.5 py-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Deactivated</span>}
                          </div>
                          <span className="text-[#747878] text-xs mt-0.5">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(user.role)}`}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#747878]">
                        {(projects || []).filter((p) => p.ownerId === user.id).length}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleUserActive(user)}
                            className={`p-1.5 transition-colors focus:outline-none ${user.active === false ? 'text-green-600 hover:text-green-800' : 'text-[#747878] hover:text-[#ba1a1a]'}`}
                            title={user.active === false ? 'Activate user' : 'Deactivate user'}
                          >
                            {user.active === false ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 text-[#747878] hover:text-[#111111] transition-colors focus:outline-none focus:ring-1 focus:ring-[#111111]"
                            title="Edit user"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-[#747878] hover:text-[#ba1a1a] transition-colors focus:outline-none focus:ring-1 focus:ring-[#ba1a1a]"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="bg-white border-t border-[#e5e2e1] px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* ── Flagged Projects (Req 59-63) ── */}
        {activeTab === 'Projects' && (projects || []).some(p => p.flagged && p.flagStatus === 'pending') && (
          <div className="bg-white border border-red-200 mb-6">
            <div className="px-4 py-3 border-b border-red-100 bg-red-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                Flagged Projects — Pending Review
              </h3>
            </div>
            {(projects || []).filter(p => p.flagged && p.flagStatus === 'pending').map(p => {
              const owner = (userList || []).find(u => u.id === p.ownerId)
              return (
                <div key={p.id} className="px-4 py-4 border-b border-red-50 last:border-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>{p.title}</p>
                      <p className="text-xs text-[#747878] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>by {owner?.name || 'Unknown'}</p>
                      {p.flagReason && (
                        <p className="text-xs text-red-700 mt-1 italic" style={{ fontFamily: "'Manrope', sans-serif" }}>Reason: {p.flagReason}</p>
                      )}
                      {p.appeal && (
                        <p className="text-xs text-blue-700 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>Appeal: {p.appeal}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => { onResolveFlag && onResolveFlag(p.id, 'hide'); toast.success('Project hidden.') }}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        Hide
                      </button>
                      <button
                        onClick={() => { onResolveFlag && onResolveFlag(p.id, 'dismiss'); toast.success('Flag dismissed.') }}
                        className="px-3 py-1.5 border border-[#e5e2e1] text-xs font-bold uppercase tracking-wider text-[#111111] hover:bg-[#f1edec]"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Projects Table ── */}
        {activeTab === 'Projects' && (
          <div className="bg-white border border-[#e5e2e1] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f3f2] border-b border-[#e5e2e1]">
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Title</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Owner</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Visibility</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider text-right" style={{ fontFamily: "'Inter', sans-serif" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {(projects || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#747878] text-sm">No projects yet.</td>
                  </tr>
                ) : (
                  (projects || []).map((p, idx) => {
                    const owner = (userList || []).find((u) => u.id === p.ownerId)
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-[#f7f3f2] transition-colors group ${idx !== (projects || []).length - 1 ? 'border-b border-[#e5e2e1]' : ''}`}
                      >
                        <td className="py-3 px-4 font-semibold">{p.title}</td>
                        <td className="py-3 px-4 text-[#747878]">{owner?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#f1edec] text-[#111111]"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {p.status || 'In Progress'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#747878] text-xs uppercase">{p.visibility || 'Public'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleProjectVisibility(p)}
                              className={`p-1.5 transition-colors ${p.adminHidden ? 'text-green-600 hover:text-green-800' : 'text-[#747878] hover:text-[#111111]'}`}
                              title={p.adminHidden ? 'Show project' : 'Hide project'}
                            >
                              {p.adminHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteProject(p)}
                              className="p-1.5 text-[#747878] hover:text-[#ba1a1a] transition-colors focus:outline-none focus:ring-1 focus:ring-[#ba1a1a]"
                              title="Delete project"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            <div className="bg-white border-t border-[#e5e2e1] px-4 py-3">
              <span className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {(projects || []).length} total project{(projects || []).length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* ── Internships Table ── */}
        {activeTab === 'Internships' && (
          <div className="bg-white border border-[#e5e2e1] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f3f2] border-b border-[#e5e2e1]">
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Role & Company</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Type</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Applicants</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Posted</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider text-right" style={{ fontFamily: "'Inter', sans-serif" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {(internships || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#747878] text-sm">No internships yet.</td>
                  </tr>
                ) : (
                  (internships || []).map((i, idx) => (
                    <tr
                      key={i.id}
                      className={`hover:bg-[#f7f3f2] transition-colors group ${idx !== (internships || []).length - 1 ? 'border-b border-[#e5e2e1]' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{i.role}</span>
                          <span className="text-[#747878] text-xs">{i.company}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#747878] text-xs uppercase">{i.type || 'Full-time'}</td>
                      <td className="py-3 px-4 text-[#747878]">{(i.applicants || []).length}</td>
                      <td className="py-3 px-4 text-[#747878]">{i.postedAt || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteInternship(i)}
                          className="p-1.5 text-[#747878] hover:text-[#ba1a1a] transition-colors focus:outline-none focus:ring-1 focus:ring-[#ba1a1a]"
                          title="Delete internship"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="bg-white border-t border-[#e5e2e1] px-4 py-3">
              <span className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {(internships || []).length} total internship{(internships || []).length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* ── Courses Table ── */}
        {activeTab === 'Courses' && (
          <div className="bg-white border border-[#e5e2e1] overflow-x-auto">
            <div className="p-4 flex justify-end">
              <button
                onClick={() => {
                  setEditingCourse(null)
                  setIsCreatingCourse(true)
                }}
                className="flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Plus size={14} /> Add Course
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f3f2] border-y border-[#e5e2e1]">
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Code</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider text-right" style={{ fontFamily: "'Inter', sans-serif" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {(courses || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-[#747878] text-sm">No courses yet.</td>
                  </tr>
                ) : (
                  (courses || []).map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#f7f3f2] transition-colors group ${idx !== (courses || []).length - 1 ? 'border-b border-[#e5e2e1]' : ''}`}
                    >
                      <td className="py-3 px-4 font-semibold text-[#111111]">{c.code}</td>
                      <td className="py-3 px-4 text-[#747878]">{c.name}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingCourse(c)
                              setIsCreatingCourse(false)
                            }}
                            className="p-1.5 text-[#747878] hover:text-[#111111] transition-colors focus:outline-none focus:ring-1 focus:ring-[#111111]"
                            title="Edit course"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourseItem(c)}
                            className="p-1.5 text-[#747878] hover:text-[#ba1a1a] transition-colors focus:outline-none focus:ring-1 focus:ring-[#ba1a1a]"
                            title="Delete course"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Linking Requests ── */}
        {activeTab === 'Requests' && (
          <div className="bg-white border border-[#e5e2e1] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f3f2] border-b border-[#e5e2e1]">
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Instructor</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Course</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Type</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider text-right" style={{ fontFamily: "'Inter', sans-serif" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {(linkingRequests || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-[#747878] text-sm">No pending requests.</td>
                  </tr>
                ) : (
                  (linkingRequests || []).map((req, idx) => {
                    const inst = (userList || []).find(u => u.id === req.instructorId)
                    const crs = (courses || []).find(c => c.id === req.courseId)
                    return (
                      <tr
                        key={req.id}
                        className={`hover:bg-[#f7f3f2] transition-colors group ${idx !== (linkingRequests || []).length - 1 ? 'border-b border-[#e5e2e1]' : ''}`}
                      >
                        <td className="py-3 px-4 font-semibold text-[#111111]">{inst?.name || 'Unknown User'}</td>
                        <td className="py-3 px-4 text-[#747878]">{crs ? `${crs.code} - ${crs.name}` : 'Unknown Course'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${req.type === 'link' ? 'bg-[#1d4ed8] text-white' : 'bg-[#ba1a1a] text-white'}`}
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {req.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onResolveLinkRequest(req.id, 'accept')}
                              className="p-1.5 text-[#111111] bg-[#f1edec] hover:bg-[#111111] hover:text-white transition-colors"
                              title="Accept"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => onResolveLinkRequest(req.id, 'reject')}
                              className="p-1.5 text-[#111111] bg-[#f1edec] hover:bg-[#ba1a1a] hover:text-white transition-colors"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Employers Approval ── */}
        {activeTab === 'Employers' && (
          <div className="bg-white border border-[#e5e2e1] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f3f2] border-b border-[#e5e2e1]">
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Employer</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Company</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Document</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#747878] uppercase tracking-wider text-right" style={{ fontFamily: "'Inter', sans-serif" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {(userList || []).filter(u => u.role === 'employer' && u.approvalStatus === 'pending').length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-[#747878] text-sm">No pending employer applications.</td>
                  </tr>
                ) : (
                  (userList || []).filter(u => u.role === 'employer' && u.approvalStatus === 'pending').map((emp, idx) => (
                    <tr
                      key={emp.id}
                      className={`hover:bg-[#f7f3f2] transition-colors group ${idx !== (userList || []).filter(u => u.role === 'employer' && u.approvalStatus === 'pending').length - 1 ? 'border-b border-[#e5e2e1]' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#111111]">{emp.name}</span>
                          <span className="text-[#747878] text-xs mt-0.5">{emp.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#747878]">{emp.company} - {emp.position}</td>
                      <td className="py-3 px-4">
                        {emp.taxCertificate ? (
                          <a href={emp.taxCertificate} download={emp.taxCertificateFileName || 'tax-certificate.pdf'} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#111111] underline hover:text-[#6b38d4]">
                            {emp.taxCertificateFileName || 'Download PDF'}
                          </a>
                        ) : (
                          <span className="text-[#747878] text-xs">No file</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              onUpdateUser({ ...emp, approvalStatus: 'approved' })
                              toast.success(`Approved employer ${emp.name}`)
                            }}
                            className="bg-[#111111] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#333] transition-colors"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              onUpdateUser({ ...emp, approvalStatus: 'rejected' })
                              toast.success(`Rejected employer ${emp.name}`)
                            }}
                            className="bg-white text-[#ba1a1a] border border-[#ba1a1a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#fdf8f8] transition-colors"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreatingUser && (
        <CreateUserModal
          onSave={handleCreateUser}
          onClose={() => setIsCreatingUser(false)}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setEditingUser(null)}
        />
      )}
      {(editingCourse || isCreatingCourse) && (
        <EditCourseModal
          course={editingCourse}
          onSave={handleSaveCourse}
          onClose={() => {
            setEditingCourse(null)
            setIsCreatingCourse(false)
          }}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          message={confirmDelete.label}
          onConfirm={executeDelete}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </AdminLayout>
  )
}

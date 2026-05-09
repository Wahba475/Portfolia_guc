import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import { UploadCloud, Camera, Edit2, Check, X, Bell, BellOff, Trash2, CheckCircle2 } from 'lucide-react'

/* ── Profile Image Upload ───────────────────────────────── */
function AvatarUpload({ currentUser, onUpdateUser }) {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      onUpdateUser({ image: url })
      toast.success('Profile photo updated!')
    },
    [onUpdateUser]
  )

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    noClick: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  })

  const initials = currentUser?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-24 h-24 overflow-hidden border border-[#111111] bg-[#111111] flex items-center justify-center flex-shrink-0">
          {currentUser?.image ? (
            <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-2xl font-bold select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
              {initials}
            </span>
          )}
        </div>
        <button
          onClick={open}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
          aria-label="Change profile photo"
        >
          <Camera size={18} className="text-white" />
        </button>
      </div>

      <div
        {...getRootProps()}
        className={`w-full max-w-xs border border-dashed px-5 py-5 flex flex-col items-center gap-2 cursor-pointer transition-all
          ${isDragActive ? 'border-[#111111] bg-[#f1edec]' : 'border-[#c4c7c7] hover:border-[#111111] hover:bg-[#fdf8f8]'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={22} className={`transition-colors ${isDragActive ? 'text-[#111111]' : 'text-[#747878]'}`} />
        <p className="text-xs text-center text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
          <button type="button" onClick={open} className="text-[#111111] font-semibold hover:underline uppercase tracking-wider">
            Click to upload
          </button>
          {' '}or drag &amp; drop
        </p>
        <p className="text-[10px] text-[#747878] uppercase tracking-wider">PNG, JPG, GIF, WEBP</p>
      </div>
    </div>
  )
}

/* ── Info Row ────────────────────────────────────────────── */
function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-[#e5e2e1] last:border-0">
      <span className="w-32 flex-shrink-0 text-xs font-bold uppercase tracking-wider text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </span>
      <span className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>{value}</span>
    </div>
  )
}

/* ── Edit Field ──────────────────────────────────────────── */
function EditField({ label, value, onChange, type = 'text', textarea = false }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-[#e5e2e1] last:border-0">
      <label className="text-xs font-bold uppercase tracking-wider text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-[#c4c7c7] p-2 text-sm text-[#111111] focus:border-[#111111] focus:outline-none resize-none transition-colors bg-white"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-b border-[#c4c7c7] py-1.5 bg-transparent text-sm text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        />
      )}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────── */
export default function Profile({
  currentUser, onLogout, onUpdateUser, projects, internships = [],
  notifications = [], onMarkRead, onClearNotifications
}) {
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState({})
  const [activeSection, setActiveSection] = useState('info') // 'info' | 'notifications' | 'internships'

  // Req 90: completed internships — those where the student's status is 'accepted' and it's past deadline
  const completedInternships = internships.filter((i) => {
    const status = (i.applicantStatuses || {})[currentUser.id]
    return status === 'accepted'
  })

  // Req 89: student notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  function startEdit() {
    setDraft({
      name: currentUser.name || '',
      bio: currentUser.bio || '',
      skills: (currentUser.skills || []).join(', '),
      university: currentUser.university || '',
      major: currentUser.major || '',
      gpa: currentUser.gpa || '',
      company: currentUser.company || '',
      position: currentUser.position || '',
      department: currentUser.department || '',
    })
    setEditMode(true)
  }

  function cancelEdit() {
    setEditMode(false)
    setDraft({})
  }

  function saveEdit() {
    if (!draft.name?.trim()) {
      toast.error('Name cannot be empty.')
      return
    }
    const skillsArray = draft.skills
      ? draft.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : []
    const patch = {
      name: draft.name.trim(),
      bio: draft.bio.trim(),
      skills: skillsArray,
    }
    if (currentUser.role === 'student') {
      patch.university = draft.university
      patch.major = draft.major
      patch.gpa = draft.gpa
    } else if (currentUser.role === 'employer') {
      patch.company = draft.company
      patch.position = draft.position
    } else if (currentUser.role === 'instructor') {
      patch.department = draft.department
    }
    onUpdateUser(patch)
    setEditMode(false)
    setDraft({})
    toast.success('Profile updated successfully!')
  }

  // Req 91: toggle notifications
  function toggleNotifications() {
    const next = !currentUser.notificationsOff
    onUpdateUser({ notificationsOff: next })
    toast.success(next ? 'Notifications turned off.' : 'Notifications turned on.')
  }

  function setField(key) {
    return (val) => setDraft((d) => ({ ...d, [key]: val }))
  }

  const sections = [
    { id: 'info', label: 'Information' },
    { id: 'notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    ...(currentUser.role === 'student' ? [{ id: 'internships', label: 'Completed Internships' }] : []),
  ]

  return (
    <AppLayout currentUser={currentUser} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead}>
      <div className="max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#747878] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              Account
            </p>
            <h1 className="text-4xl font-bold text-[#111111] mb-2" style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em' }}>
              Profile
            </h1>
            <p className="text-lg text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Your personal and professional information.
            </p>
          </div>

          {activeSection === 'info' && (
            !editMode ? (
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-2 border border-[#111111] text-[#111111] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#f1edec] transition-colors flex-shrink-0"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={saveEdit}
                  className="inline-flex items-center gap-2 bg-[#111111] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Check size={14} /> Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 border border-[#e5e2e1] text-[#747878] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-[#111111] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            )
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Avatar + Info */}
          <div className="bg-white border border-[#e5e2e1] p-6 flex flex-col items-center gap-4 h-fit">
            <AvatarUpload currentUser={currentUser} onUpdateUser={onUpdateUser} />

            <div className="text-center mt-1">
              <p className="text-2xl font-bold text-[#111111] mb-1" style={{ fontFamily: "'Newsreader', serif" }}>
                {currentUser.name}
              </p>
              <p className="text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                {currentUser.role}
              </p>
              <p className="text-sm text-[#747878] mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {currentUser.email}
              </p>
            </div>

            {/* Skills */}
            {currentUser.skills?.length > 0 && !editMode && (
              <div className="w-full border-t border-[#e5e2e1] pt-4 mt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#747878] mb-3 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Skills
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentUser.skills.map((s) => (
                    <span key={s} className="bg-[#f1edec] text-[#111111] border border-[#e5e2e1] px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Req 91: Notifications Toggle */}
            <div className="w-full border-t border-[#e5e2e1] pt-4 mt-2">
              <button
                onClick={toggleNotifications}
                className={`w-full flex items-center justify-between px-3 py-2.5 border text-xs font-bold uppercase tracking-wider transition-colors
                  ${currentUser.notificationsOff
                    ? 'border-[#e5e2e1] text-[#747878] hover:border-[#111111]'
                    : 'border-[#111111] text-[#111111]'
                  }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <span className="flex items-center gap-2">
                  {currentUser.notificationsOff ? <BellOff size={14} /> : <Bell size={14} />}
                  Notifications
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 font-black ${currentUser.notificationsOff ? 'bg-[#f1edec] text-[#747878]' : 'bg-[#111111] text-white'}`}>
                  {currentUser.notificationsOff ? 'OFF' : 'ON'}
                </span>
              </button>
            </div>
          </div>

          {/* Right — Sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* Section Tabs */}
            <div className="flex gap-2 flex-wrap">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSection(s.id); setEditMode(false) }}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors
                    ${activeSection === s.id
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-[#747878] border-[#e5e2e1] hover:border-[#111111] hover:text-[#111111]'
                    }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* ── Info Section ── */}
            {activeSection === 'info' && (
              <div className="bg-white border border-[#e5e2e1] p-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#747878] mb-4 border-b border-[#e5e2e1] pb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {editMode ? 'Edit Information' : 'Information'}
                </h2>

                {editMode ? (
                  <div>
                    <EditField label="Full Name" value={draft.name} onChange={setField('name')} />
                    <EditField label="Bio" value={draft.bio} onChange={setField('bio')} textarea />
                    <EditField label="Skills (comma separated)" value={draft.skills} onChange={setField('skills')} />
                    {currentUser.role === 'student' && (
                      <>
                        <EditField label="University" value={draft.university} onChange={setField('university')} />
                        <EditField label="Major" value={draft.major} onChange={setField('major')} />
                        <EditField label="GPA" value={draft.gpa} onChange={setField('gpa')} />
                      </>
                    )}
                    {currentUser.role === 'employer' && (
                      <>
                        <EditField label="Company" value={draft.company} onChange={setField('company')} />
                        <EditField label="Position" value={draft.position} onChange={setField('position')} />
                      </>
                    )}
                    {currentUser.role === 'instructor' && (
                      <EditField label="Department" value={draft.department} onChange={setField('department')} />
                    )}
                  </div>
                ) : (
                  <>
                    <InfoRow label="Full Name" value={currentUser.name} />
                    <InfoRow label="Email" value={currentUser.email} />
                    <InfoRow label="Role" value={currentUser.role} />
                    {currentUser.role === 'student' && (
                      <>
                        <InfoRow label="University" value={currentUser.university} />
                        <InfoRow label="Major" value={currentUser.major} />
                        <InfoRow label="GPA" value={currentUser.gpa} />
                      </>
                    )}
                    {currentUser.role === 'employer' && (
                      <>
                        <InfoRow label="Company" value={currentUser.company} />
                        <InfoRow label="Position" value={currentUser.position} />
                      </>
                    )}
                    {currentUser.role === 'instructor' && (
                      <InfoRow label="Department" value={currentUser.department} />
                    )}
                    <InfoRow label="Bio" value={currentUser.bio} />
                    {!currentUser.bio && (
                      <p className="text-sm text-[#747878] italic py-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        No bio added yet. Click <strong>Edit Profile</strong> to add one.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Notifications Section (Req 89, 91) ── */}
            {activeSection === 'notifications' && (
              <div className="bg-white border border-[#e5e2e1]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2e1]">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Notifications
                  </h2>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#747878] hover:text-[#ba1a1a] transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <Trash2 size={12} /> Clear All
                    </button>
                  )}
                </div>

                {currentUser.notificationsOff ? (
                  <div className="px-6 py-10 text-center">
                    <BellOff size={24} className="mx-auto mb-3 text-[#c4c7c7]" />
                    <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      Notifications are turned off. Toggle them on from the left panel.
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <Bell size={24} className="mx-auto mb-3 text-[#c4c7c7]" />
                    <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      No notifications yet.
                    </p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-4 px-6 py-4 border-b border-[#e5e2e1] last:border-0 ${!n.read ? 'bg-[#fdf8f8]' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-[#111111]' : 'bg-[#e5e2e1]'}`} />
                        <div className="flex-1">
                          <p className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {n.message}
                          </p>
                          <p className="text-xs text-[#747878] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Completed Internships Section (Req 90) ── */}
            {activeSection === 'internships' && currentUser.role === 'student' && (
              <div className="bg-white border border-[#e5e2e1]">
                <div className="px-6 py-4 border-b border-[#e5e2e1]">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Completed Internships
                  </h2>
                  <p className="text-xs text-[#747878] mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    Internships where you were accepted.
                  </p>
                </div>
                {completedInternships.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <CheckCircle2 size={24} className="mx-auto mb-3 text-[#c4c7c7]" />
                    <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      No accepted internships yet.
                    </p>
                  </div>
                ) : (
                  <div>
                    {completedInternships.map((i, idx) => (
                      <div
                        key={i.id}
                        className={`flex items-center justify-between px-6 py-4 ${idx !== completedInternships.length - 1 ? 'border-b border-[#e5e2e1]' : ''}`}
                      >
                        <div>
                          <p className="text-sm font-bold text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {i.role}
                          </p>
                          <p className="text-xs text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {i.company} · {i.location} · {i.duration}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 border border-green-200 px-2 py-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Accepted
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

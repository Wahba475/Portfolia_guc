import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { getLayoutForRole } from '../utils/layoutForRole'
import { MapPin, Clock, Banknote, Search, Users, Plus, X, CheckCircle2, ChevronDown, ChevronUp, Pencil, Trash2, Archive, ArchiveRestore } from 'lucide-react'

const STATUS_STYLES = {
  pending:   'bg-[#f1edec] text-[#747878] border-[#e5e2e1]',
  nominated: 'bg-[#D97706] text-white border-[#D97706]',
  accepted:  'bg-green-600 text-white border-green-600',
  rejected:  'bg-[#ba1a1a] text-white border-[#ba1a1a]',
}

/* ── Req 76: Suggested applicants from employer favorites ── */
function SuggestedApplicants({ internship, favoritedPortfolios, userList }) {
  if (!favoritedPortfolios || favoritedPortfolios.length === 0) return null
  const applicantIds = internship.applicants || []
  const suggested = favoritedPortfolios
    .map(id => (userList || []).find(u => String(u.id) === String(id) && u.role === 'student'))
    .filter(Boolean)
    .filter(u => !applicantIds.includes(u.id))
  if (suggested.length === 0) return null
  return (
    <div className="mt-3 pt-3 border-t border-[#e5e2e1]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b38d4] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
        Suggested from Your Favorites
      </p>
      <div className="space-y-2">
        {suggested.map(u => (
          <div key={u.id} className="flex items-center gap-3 p-2 bg-[#f8f6ff] border border-[#ddd6fe]">
            <div className="w-7 h-7 bg-[#6b38d4] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">{u.name.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#111111] truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>{u.name}</p>
              <p className="text-[10px] text-[#747878] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{u.major || 'Student'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Req 88: Employer applicant management panel ── */
function ApplicantManager({ internship, userList, onSetApplicantStatus }) {
  const [open, setOpen] = useState(false)
  const statuses = internship.applicantStatuses || {}
  const applicantIds = internship.applicants || []

  if (applicantIds.length === 0) return (
    <p className="text-xs text-[#747878] mt-3 pt-3 border-t border-[#e5e2e1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      No applicants yet.
    </p>
  )

  return (
    <div className="mt-3 pt-3 border-t border-[#e5e2e1]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#6b38d4] transition-colors"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <span>Manage Applicants ({applicantIds.length})</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {applicantIds.map((uid) => {
            const user = (userList || []).find((u) => u.id === uid)
            const currentStatus = statuses[uid] || 'pending'
            return (
              <div key={uid} className="flex flex-col gap-2 p-3 bg-[#fdf8f8] border border-[#e5e2e1]">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111111] truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {user?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-[#747878] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {user?.email}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {['nominated', 'accepted', 'rejected'].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          onSetApplicantStatus(internship.id, uid, s)
                          toast.success(`${user?.name || 'Applicant'} marked as ${s}.`)
                        }}
                        className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest border transition-colors
                          ${currentStatus === s
                            ? STATUS_STYLES[s]
                            : 'bg-white text-[#747878] border-[#e5e2e1] hover:border-[#111111] hover:text-[#111111]'
                          }`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Cover letter display */}
                {statuses[`${uid}_cover`] && (
                  <div className="text-xs text-[#444748] bg-white border border-[#e5e2e1] p-2 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    <span className="font-bold text-[#111111] uppercase tracking-widest text-[10px] block mb-1">Cover Letter</span>
                    {statuses[`${uid}_cover`]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Edit Internship Modal (employer) ── */
function EditInternshipModal({ internship, onSave, onClose }) {
  const [form, setForm] = useState({
    role: internship.role || '',
    company: internship.company || '',
    description: internship.description || '',
    type: internship.type || 'Hybrid',
    location: internship.location || '',
    duration: internship.duration || '',
    stipend: internship.stipend || '',
    deadline: internship.deadline || '',
    requirements: (internship.requirements || []).join(', '),
    hiringStatus: internship.hiringStatus || 'hiring',
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.role.trim() || !form.company.trim()) { toast.error('Role and company are required.'); return }
    const reqs = form.requirements.split(',').map(r => r.trim()).filter(Boolean)
    onSave({ ...internship, ...form, requirements: reqs })
    toast.success('Internship updated.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg border border-[#e5e2e1] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e2e1] sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>Edit Internship</h3>
          <button onClick={onClose} className="text-[#747878] hover:text-[#111111] transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {[
            { label: 'Role / Title *', key: 'role' },
            { label: 'Company *', key: 'company' },
            { label: 'Location', key: 'location' },
            { label: 'Duration', key: 'duration' },
            { label: 'Stipend', key: 'stipend' },
            { label: 'Deadline', key: 'deadline', type: 'date' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</label>
              <input type={type || 'text'} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] transition-colors"
                style={{ fontFamily: "'Manrope', sans-serif" }} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-[#c4c7c7] p-3 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] transition-colors resize-none"
              style={{ fontFamily: "'Manrope', sans-serif" }} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Requirements <span className="normal-case font-normal text-[#747878]">(comma separated)</span></label>
            <input type="text" value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
              placeholder="React, TypeScript, Git"
              className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] transition-colors"
              style={{ fontFamily: "'Manrope', sans-serif" }} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Type</label>
            <div className="flex gap-2 flex-wrap">
              {['On-site', 'Remote', 'Hybrid'].map(v => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, type: v }))}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${form.type === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-[#c4c7c7] hover:bg-[#f1edec]'}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}>{v}</button>
              ))}
            </div>
          </div>
          {/* Req 77: Hiring status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Hiring Status</label>
            <div className="flex gap-2 flex-wrap">
              {[['hiring', 'Hiring'], ['filled', 'Position Filled']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, hiringStatus: val }))}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${form.hiringStatus === val ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-[#c4c7c7] hover:bg-[#f1edec]'}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}>{label}</button>
              ))}
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="submit" className="flex-1 bg-[#111111] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Save Changes</button>
            <button type="button" onClick={onClose} className="px-6 py-3 border border-[#c4c7c7] text-xs font-bold uppercase tracking-widest text-[#111111] hover:bg-[#f1edec] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Apply with Cover Letter Modal ── */
function ApplyModal({ internship, onApply, onClose }) {
  const [cover, setCover] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onApply(internship.id, cover)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md border border-[#e5e2e1]">
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e2e1]">
          <h3 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>Apply — {internship.role}</h3>
          <button onClick={onClose} className="text-[#747878] hover:text-[#111111]"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Cover Letter <span className="normal-case font-normal text-[#747878]">(optional)</span>
            </label>
            <textarea rows={5} value={cover} onChange={e => setCover(e.target.value)}
              placeholder="Tell us why you're a great fit…"
              className="w-full border border-[#c4c7c7] p-3 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors resize-none"
              style={{ fontFamily: "'Manrope', sans-serif" }} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-[#111111] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Submit Application</button>
            <button type="button" onClick={onClose} className="px-6 border border-[#c4c7c7] text-xs font-bold uppercase tracking-widest text-[#111111] hover:bg-[#f1edec] transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Internships({
  currentUser, onLogout, internships, userList = [],
  onApply, onCreateInternship, onSetApplicantStatus,
  onUpdateInternship, onDeleteInternship,
  notifications = [], onMarkRead
}) {
  const Layout = getLayoutForRole(currentUser?.role)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [companyFilter, setCompanyFilter] = useState('')
  const [durationFilter, setDurationFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [viewMode, setViewMode] = useState('browse')
  const [feedback, setFeedback] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [applyTarget, setApplyTarget] = useState(null)

  const [form, setForm] = useState({
    role: '', company: '', description: '', type: 'Hybrid',
    location: '', duration: '', stipend: '', deadline: '', requirements: '',
  })
  const [creating, setCreating] = useState(false)

  const types = ['All', 'On-site', 'Remote', 'Hybrid']
  const isEmployer = currentUser.role === 'employer'
  const isStudent = currentUser.role === 'student'

  const myPosted = internships.filter((i) => String(i.employerId) === String(currentUser.id))

  const filtered = useMemo(() => {
    let list = internships.filter((i) => {
      const matchQuery =
        i.role.toLowerCase().includes(query.toLowerCase()) ||
        i.company.toLowerCase().includes(query.toLowerCase()) ||
        (i.requirements || []).some((r) => r.toLowerCase().includes(query.toLowerCase()))
      const matchType = typeFilter === 'All' || i.type === typeFilter
      const matchCompany = !companyFilter || i.company.toLowerCase().includes(companyFilter.toLowerCase())
      const matchDuration = !durationFilter || (i.duration || '').toLowerCase().includes(durationFilter.toLowerCase())
      return matchQuery && matchType && matchCompany && matchDuration
    })

    if (sortOrder === 'newest') {
      list = [...list].sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0))
    } else if (sortOrder === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.postedAt || 0) - new Date(b.postedAt || 0))
    }

    return list
  }, [internships, query, typeFilter, companyFilter, durationFilter, sortOrder])

  function handleApplyWithCover(internshipId, coverLetter) {
    const result = onApply(internshipId, coverLetter)
    if (result?.success) {
      setFeedback((prev) => ({ ...prev, [internshipId]: 'applied' }))
      toast.success('Application submitted successfully!')
    } else {
      const msg = result?.error || 'Could not apply.'
      setFeedback((prev) => ({ ...prev, [internshipId]: msg }))
      toast.error(msg)
    }
  }

  function hasApplied(internship) {
    return (internship.applicants || []).includes(currentUser.id)
  }

  function getMyStatus(internship) {
    return (internship.applicantStatuses || {})[currentUser.id] || 'pending'
  }

  function handleCreate(e) {
    e.preventDefault()
    if (!form.role.trim() || !form.company.trim()) { toast.error('Role and company are required.'); return }
    setCreating(true)
    const reqs = form.requirements.split(',').map((r) => r.trim()).filter(Boolean)
    onCreateInternship({ ...form, requirements: reqs, tags: [], hiringStatus: 'hiring', archived: false })
    setCreating(false)
    setShowModal(false)
    setForm({ role: '', company: '', description: '', type: 'Hybrid', location: '', duration: '', stipend: '', deadline: '', requirements: '' })
    toast.success('Internship posted successfully!')
  }

  function handleArchiveToggle(internship) {
    onUpdateInternship({ ...internship, archived: !internship.archived })
    toast.success(internship.archived ? 'Internship unarchived.' : 'Internship archived.')
  }

  function handleDelete(internshipId) {
    if (window.confirm('Delete this internship? This cannot be undone.')) {
      onDeleteInternship(internshipId)
      toast.success('Internship deleted.')
    }
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead}>
      <div className="max-w-[1280px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#747878] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Opportunities
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#111111] mb-3"
              style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em', lineHeight: '1.15' }}>
              Internships
            </h1>
            <p className="text-lg text-[#747878] leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {filtered.length} position{filtered.length !== 1 ? 's' : ''} available.
            </p>
          </div>
          {isEmployer && (
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#111111] text-white px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors border border-[#111111] flex-shrink-0"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              <Plus size={14} /> Post Internship
            </button>
          )}
        </div>

        {/* Employer: view toggle */}
        {isEmployer && (
          <div className="flex gap-2 mb-6">
            {[['browse', 'Browse All'], ['mine', `My Postings (${myPosted.length})`]].map(([id, label]) => (
              <button key={id} onClick={() => setViewMode(id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors
                  ${viewMode === id ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#747878] border-[#e5e2e1] hover:border-[#111111] hover:text-[#111111]'}`}
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Controls (browse mode) */}
        {viewMode === 'browse' && (
          <div className="flex flex-col gap-4 mb-8 pb-4 border-b border-[#e5e2e1]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-2 flex-wrap">
                {types.map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border
                      ${typeFilter === t ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-[#c4c7c7] hover:bg-[#f1edec]'}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747878]" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by role, company…"
                  className="w-full pl-9 pr-4 py-2 border-b border-[#c4c7c7] bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#747878] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }} />
              </div>
            </div>
            {/* Req 80: Extra filters + Req 82: sort */}
            <div className="flex flex-wrap items-center gap-3">
              <input type="text" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
                placeholder="Filter by company…"
                className="border-b border-[#c4c7c7] py-1.5 px-0 w-44 bg-transparent focus:border-[#111111] focus:outline-none text-xs text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }} />
              <input type="text" value={durationFilter} onChange={e => setDurationFilter(e.target.value)}
                placeholder="Filter by duration…"
                className="border-b border-[#c4c7c7] py-1.5 px-0 w-40 bg-transparent focus:border-[#111111] focus:outline-none text-xs text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }} />
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                className="border border-[#c4c7c7] py-1.5 px-2 text-xs bg-white text-[#111111] focus:border-[#111111] focus:outline-none"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}

        {/* ── My Postings (employer) ── */}
        {isEmployer && viewMode === 'mine' && (
          myPosted.length === 0 ? (
            <div className="text-center py-16 text-[#747878] text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
              You haven't posted any internships yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myPosted.map((i) => (
                <div key={i.id} className={`bg-white border border-[#e5e2e1] p-6 flex flex-col gap-4 ${i.archived ? 'opacity-60' : ''}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>{i.role}</h3>
                      <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>{i.company} · {i.location}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#f1edec] text-[#111111] px-2 py-1 border border-[#e5e2e1]" style={{ fontFamily: "'Inter', sans-serif" }}>{i.type}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 border ${i.hiringStatus === 'filled' ? 'bg-[#f1edec] text-[#747878] border-[#e5e2e1]' : 'bg-green-600 text-white border-green-600'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {i.hiringStatus === 'filled' ? 'Position Filled' : 'Hiring'}
                      </span>
                      {i.archived && <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 bg-[#f1edec] text-[#747878] border border-[#e5e2e1]" style={{ fontFamily: "'Inter', sans-serif" }}>Archived</span>}
                    </div>
                  </div>
                  {/* Action buttons: Req 74, 78 */}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setEditTarget(i)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e2e1] text-xs font-bold uppercase tracking-wider text-[#111111] hover:bg-[#f1edec] transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleArchiveToggle(i)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e2e1] text-xs font-bold uppercase tracking-wider text-[#111111] hover:bg-[#f1edec] transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      {i.archived ? <><ArchiveRestore size={12} /> Unarchive</> : <><Archive size={12} /> Archive</>}
                    </button>
                    <button onClick={() => handleDelete(i.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#ba1a1a] text-xs font-bold uppercase tracking-wider text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                  {/* Req 88: Applicant status management */}
                  <ApplicantManager internship={i} userList={userList} onSetApplicantStatus={onSetApplicantStatus} />
                  <SuggestedApplicants internship={i} favoritedPortfolios={currentUser?.favorites?.portfolios} userList={userList} />
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Browse All ── */}
        {viewMode === 'browse' && (
          filtered.length === 0 ? (
            <div className="text-center py-16 text-[#747878] text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
              No internships match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.filter(i => !i.archived).map((i) => {
                const applied = hasApplied(i) || feedback[i.id] === 'applied'
                const myStatus = applied ? getMyStatus(i) : null
                return (
                  <div key={i.id}
                    className="bg-white border border-[#e5e2e1] p-6 flex flex-col gap-4 hover:border-[#111111] transition-colors duration-200 group">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="text-2xl font-bold text-[#111111] group-hover:text-[#6b38d4] transition-colors leading-snug" style={{ fontFamily: "'Newsreader', serif" }}>
                          {i.role}
                        </h3>
                        <p className="text-base text-[#111111] mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{i.company}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#f1edec] text-[#111111] px-2 py-1 border border-[#e5e2e1]" style={{ fontFamily: "'Inter', sans-serif" }}>{i.type}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 border ${i.status === 'closed' || i.hiringStatus === 'filled' ? 'bg-[#f1edec] text-[#747878] border-[#e5e2e1]' : 'bg-[#111111] text-white border-[#111111]'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          {i.hiringStatus === 'filled' ? 'Position Filled' : i.status === 'closed' ? 'Closed' : 'Open'}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-[#747878] leading-relaxed line-clamp-3 flex-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {i.description}
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[#111111] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#747878]" /> {i.location}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#747878]" /> {i.duration}</span>
                      {i.stipend && <span className="flex items-center gap-1.5"><Banknote size={12} className="text-[#747878]" /> {i.stipend}</span>}
                      <span className="flex items-center gap-1.5"><Users size={12} className="text-[#747878]" /> {(i.applicants || []).length} applicants</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-[#e5e2e1]">
                      {(i.requirements || []).map((r) => (
                        <span key={r} className="text-[10px] font-semibold uppercase tracking-wider bg-[#ebe7e6] text-[#111111] px-2 py-1" style={{ fontFamily: "'Inter', sans-serif" }}>{r}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-[#747878] font-semibold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Deadline: {i.deadline}
                      </span>
                      {/* Student: apply or status badge */}
                      {isStudent && (
                        applied ? (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 border
                            ${myStatus === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                              myStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                              myStatus === 'nominated' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-[#f1edec] text-[#747878] border-[#e5e2e1]'}`}
                            style={{ fontFamily: "'Inter', sans-serif" }}>
                            <CheckCircle2 size={12} />
                            {myStatus === 'pending' ? 'Applied' : myStatus}
                          </span>
                        ) : (
                          <button
                            onClick={() => setApplyTarget(i)}
                            disabled={i.status === 'closed' || i.hiringStatus === 'filled'}
                            className="bg-[#111111] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors border border-[#111111] disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ fontFamily: "'Inter', sans-serif" }}>
                            Apply Now
                          </button>
                        )
                      )}
                      {/* Employer: applicant count */}
                      {isEmployer && String(i.employerId) === String(currentUser.id) && (
                        <span className="text-xs font-bold text-[#111111] border border-[#e5e2e1] px-3 py-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {(i.applicants || []).length} applicant{(i.applicants || []).length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* ── Create Internship Modal (employer) ── */}
      {showModal && isEmployer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg border border-[#e5e2e1] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e2e1] sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>Post Internship</h3>
              <button onClick={() => setShowModal(false)} className="text-[#747878] hover:text-[#111111] transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="px-8 py-6 space-y-5">
              {[
                { label: 'Role / Title *', key: 'role', placeholder: 'e.g. Frontend Developer Intern' },
                { label: 'Company *', key: 'company', placeholder: 'e.g. TechCorp Egypt' },
                { label: 'Location', key: 'location', placeholder: 'Cairo, Egypt' },
                { label: 'Duration', key: 'duration', placeholder: '3 months' },
                { label: 'Stipend', key: 'stipend', placeholder: 'EGP 4,000 / month' },
                { label: 'Deadline', key: 'deadline', type: 'date', placeholder: '' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</label>
                  <input type={type || 'text'} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                    style={{ fontFamily: "'Manrope', sans-serif" }} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the role…"
                  className="w-full border border-[#c4c7c7] p-3 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors resize-none"
                  style={{ fontFamily: "'Manrope', sans-serif" }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Requirements <span className="normal-case text-[#747878] font-normal">(comma separated)</span>
                </label>
                <input type="text" value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                  placeholder="React, TypeScript, Git"
                  className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Type</label>
                <div className="flex gap-2 flex-wrap">
                  {['On-site', 'Remote', 'Hybrid'].map((v) => (
                    <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, type: v }))}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${form.type === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-[#c4c7c7] hover:bg-[#f1edec]'}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="submit" disabled={creating}
                  className="flex-1 bg-[#111111] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors disabled:opacity-50"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  {creating ? 'Posting…' : 'Post Internship'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-[#c4c7c7] text-xs font-bold uppercase tracking-widest text-[#111111] hover:bg-[#f1edec] transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit internship modal */}
      {editTarget && (
        <EditInternshipModal
          internship={editTarget}
          onSave={onUpdateInternship}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Apply with cover letter modal */}
      {applyTarget && (
        <ApplyModal
          internship={applyTarget}
          onApply={handleApplyWithCover}
          onClose={() => setApplyTarget(null)}
        />
      )}
    </Layout>
  )
}

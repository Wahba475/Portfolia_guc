import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getLayoutForRole } from '../utils/layoutForRole'
import { Search, Globe, Lock, Plus, X, Trash2, SortAsc } from 'lucide-react'

export default function Projects({ currentUser, onLogout, projects, onCreateProject, onDeleteProject, courses = [], notifications = [], onMarkRead, userList = [] }) {
  const Layout = getLayoutForRole(currentUser?.role)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Mine')
  const [courseFilter, setCourseFilter] = useState('')
  const [instructorFilter, setInstructorFilter] = useState('')
  const [sortBy, setSortBy] = useState('date-desc') // 'date-desc' | 'date-asc' | 'rating'
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', tags: '', visibility: 'Public',
    courseId: '', github: '', demo: '', languages: ''
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const filterTabs = ['Mine', 'All Public']

  const instructors = useMemo(() => userList.filter(u => u.role === 'instructor'), [userList])

  // Filter + sort logic — Req 43, 44, 45
  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      const matchQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(query.toLowerCase()))
      const matchCourse = !courseFilter || p.courseId === courseFilter
      const matchInstructor = !instructorFilter || (p.instructors || []).includes(instructorFilter)

      if (filter === 'Mine') return matchQuery && matchCourse && matchInstructor && String(p.ownerId) === String(currentUser.id)
      return matchQuery && matchCourse && matchInstructor && (p.visibility === 'Public' || !p.visibility)
    })

    if (sortBy === 'date-asc') list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    else if (sortBy === 'date-desc') list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))

    return list
  }, [projects, query, filter, courseFilter, instructorFilter, sortBy, currentUser.id])

  function handleCreate(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) return setError('Title is required.')
    setCreating(true)
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const languages = form.languages.split(',').map((l) => l.trim()).filter(Boolean)
    onCreateProject({ ...form, tags, languages })
    setCreating(false)
    setShowModal(false)
    setForm({ title: '', description: '', tags: '', visibility: 'Public', courseId: '', github: '', demo: '', languages: '' })
    toast.success('Project created successfully!')
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead}>
      <div className="max-w-[1280px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111111] mb-3" style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em', lineHeight: '1.15' }}>
              Projects
            </h2>
            <p className="text-lg text-[#747878] max-w-2xl leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Document your technical and academic work.
            </p>
          </div>
          {currentUser.role === 'student' && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#111111] text-white px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors border border-[#111111] flex-shrink-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <Plus size={14} /> New Project
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#e5e2e1]">
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border ${filter === f ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-[#c4c7c7] hover:bg-[#f1edec]'}`}
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Search — Req 42 */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747878]" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title…"
                className="pl-9 pr-4 py-2 border-b border-[#c4c7c7] bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#747878] transition-colors w-48"
                style={{ fontFamily: "'Manrope', sans-serif" }} />
            </div>

            {/* Filter by Course — Req 43 */}
            {courses.length > 0 && (
              <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
                className="border border-[#e5e2e1] bg-white px-3 py-2 text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
                style={{ fontFamily: "'Manrope', sans-serif" }}>
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}

            {/* Filter by Instructor — Req 43 */}
            {instructors.length > 0 && (
              <select value={instructorFilter} onChange={e => setInstructorFilter(e.target.value)}
                className="border border-[#e5e2e1] bg-white px-3 py-2 text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
                style={{ fontFamily: "'Manrope', sans-serif" }}>
                <option value="">All Instructors</option>
                {instructors.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
              </select>
            )}

            {/* Sort — Req 45 */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="border border-[#e5e2e1] bg-white px-3 py-2 text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
              style={{ fontFamily: "'Manrope', sans-serif" }}>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="rating">By Rating</option>
            </select>
          </div>
        </div>

        {/* Project Grid — Req 44 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#747878] text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {filter === 'Mine' ? 'No projects yet. Click "New Project" to start.' : 'No public projects match your search.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => {
              const isPublic = (p.visibility || 'Public') === 'Public'
              const isOwner = String(p.ownerId) === String(currentUser.id)
              return (
                <div key={p.id} className="bg-white border border-[#e5e2e1] p-6 flex flex-col gap-4 hover:border-[#111111] transition-colors duration-200 group relative">
                  {/* Delete button (owner only) */}
                  {isOwner && onDeleteProject && (
                    <button
                      onClick={(e) => { e.preventDefault(); if (window.confirm('Delete this project?')) { onDeleteProject(p.id); toast.success('Project deleted.') } }}
                      className="absolute top-3 right-3 p-1 text-[#c4c7c7] hover:text-[#ba1a1a] transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  <Link to={`/projects/${p.id}`} className="flex flex-col gap-4 flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {isOwner ? 'Yours' : 'Public'}
                        {p.courseId && (() => { const c = courses.find(c => c.id === p.courseId); return c ? ` · ${c.code}` : '' })()}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#f1edec] text-[#111111] px-2 py-1 flex items-center gap-1 border border-[#e5e2e1]" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {isPublic ? <Globe size={10} /> : <Lock size={10} />}
                        {isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-[#111111] group-hover:text-[#6b38d4] transition-colors leading-snug" style={{ fontFamily: "'Newsreader', serif" }}>
                      {p.title}
                    </h3>

                    <p className="text-sm text-[#747878] flex-1 line-clamp-3 leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {p.description}
                    </p>

                    {p.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-sm ${p.rating >= s ? 'text-[#D97706]' : 'text-[#e5e2e1]'}`}>★</span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-[#e5e2e1]">
                      {(p.tags || []).slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider bg-[#ebe7e6] text-[#111111] px-2 py-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Create Project Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg border border-[#e5e2e1] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e2e1] sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>
                New Project
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#747878] hover:text-[#111111] transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-8 py-6 space-y-5">
              {error && (
                <p className="text-xs text-red-600 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. E-Commerce Platform"
                  className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-base text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }} />
              </div>

              {/* Course — Req 19 */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Course</label>
                <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
                  className="w-full border border-[#c4c7c7] py-2 px-2 bg-white focus:border-[#111111] focus:outline-none text-sm text-[#111111]"
                  style={{ fontFamily: "'Manrope', sans-serif" }}>
                  <option value="">Select a course (optional)</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What is this project about?"
                  className="w-full border border-[#c4c7c7] p-3 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors resize-none"
                  style={{ fontFamily: "'Manrope', sans-serif" }} />
              </div>

              {/* GitHub — Req 19 */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>GitHub Link</label>
                <input type="url" value={form.github} onChange={e => setForm(f => ({ ...f, github: e.target.value }))}
                  placeholder="https://github.com/..."
                  className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }} />
              </div>

              {/* Demo — Req 19 */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Demo / Video Link</label>
                <input type="url" value={form.demo} onChange={e => setForm(f => ({ ...f, demo: e.target.value }))}
                  placeholder="https://youtube.com/... or live URL"
                  className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }} />
              </div>

              {/* Languages — Req 19 */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Programming Languages <span className="text-[#747878] normal-case font-normal">(comma separated)</span>
                </label>
                <input type="text" value={form.languages} onChange={e => setForm(f => ({ ...f, languages: e.target.value }))}
                  placeholder="Python, JavaScript, C++"
                  className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }} />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Tags <span className="text-[#747878] normal-case font-normal">(comma separated)</span>
                </label>
                <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }} />
              </div>

              {/* Visibility — Req 20 */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Visibility</label>
                <div className="flex gap-3">
                  {['Public', 'Private'].map((v) => (
                    <button key={v} type="button" onClick={() => setForm(f => ({ ...f, visibility: v }))}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${form.visibility === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-[#c4c7c7] hover:bg-[#f1edec]'}`}
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
                  {creating ? 'Creating…' : 'Create Project'}
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
    </Layout>
  )
}

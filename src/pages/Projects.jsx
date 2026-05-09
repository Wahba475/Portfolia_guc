import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import { Search, Globe, Lock, Plus, X } from 'lucide-react'

export default function Projects({ currentUser, onLogout, projects, onCreateProject }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Mine')
  const [showModal, setShowModal] = useState(false)

  // Create form state
  const [form, setForm] = useState({ title: '', description: '', tags: '', visibility: 'Public' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const filterTabs = ['Mine', 'All Public']

  // Filter logic
  const filtered = projects.filter((p) => {
    const matchQuery =
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(query.toLowerCase()))

    if (filter === 'Mine') {
      return matchQuery && String(p.ownerId) === String(currentUser.id)
    }
    // All Public
    return matchQuery && (p.visibility === 'Public' || !p.visibility)
  })

  function handleCreate(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) return setError('Title is required.')
    setCreating(true)
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    onCreateProject({ ...form, tags })
    setCreating(false)
    setShowModal(false)
    setForm({ title: '', description: '', tags: '', visibility: 'Public' })
    toast.success('Project created successfully!')
  }

  return (
    <AppLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-[1280px] mx-auto w-full">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#111111] mb-3"
              style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em', lineHeight: '1.15' }}
            >
              Projects
            </h2>
            <p
              className="text-lg text-[#747878] max-w-2xl leading-relaxed"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Document your technical and academic work.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#111111] text-white px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors border border-[#111111] flex-shrink-0"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <Plus size={14} /> New Project
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#e5e2e1]">
          <div className="flex gap-2">
            {filterTabs.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border
                  ${filter === f
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-[#111111] border-[#c4c7c7] hover:bg-[#f1edec]'
                  }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747878]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 border-b border-[#c4c7c7] bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#747878] transition-colors"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            />
          </div>
        </div>

        {/* Project Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#747878] text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {filter === 'Mine'
              ? 'You haven\'t created any projects yet. Click "New Project" to start.'
              : 'No public projects match your search.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => {
              const isPublic = (p.visibility || 'Public') === 'Public'
              const isOwner = String(p.ownerId) === String(currentUser.id)
              return (
                <Link
                  to={`/projects/${p.id}`}
                  key={p.id}
                  className="bg-white border border-[#e5e2e1] p-6 flex flex-col gap-4 hover:border-[#111111] transition-colors duration-200 group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className="text-xs font-semibold text-[#747878] uppercase tracking-wider"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {isOwner ? 'Yours' : 'Public'}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider bg-[#f1edec] text-[#111111] px-2 py-1 flex items-center gap-1 border border-[#e5e2e1]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {isPublic ? <Globe size={10} /> : <Lock size={10} />}
                      {isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>

                  <h3
                    className="text-2xl font-bold text-[#111111] group-hover:text-[#6b38d4] transition-colors leading-snug"
                    style={{ fontFamily: "'Newsreader', serif" }}
                  >
                    {p.title}
                  </h3>

                  <p
                    className="text-sm text-[#747878] flex-1 line-clamp-3 leading-relaxed"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {p.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-[#e5e2e1]">
                    {(p.tags || []).slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider bg-[#ebe7e6] text-[#111111] px-2 py-1"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Create Project Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg border border-[#e5e2e1]">
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#e5e2e1]">
              <h3
                className="text-2xl font-bold text-[#111111]"
                style={{ fontFamily: "'Newsreader', serif" }}
              >
                New Project
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#747878] hover:text-[#111111] transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-8 py-6 space-y-5">
              {error && (
                <p className="text-xs text-red-600 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {error}
                </p>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. E-Commerce Platform"
                  className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-base text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What is this project about?"
                  className="w-full border border-[#c4c7c7] p-3 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors resize-none"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Tags <span className="text-[#747878] normal-case font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#111111] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Visibility
                </label>
                <div className="flex gap-3">
                  {['Public', 'Private'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, visibility: v }))}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${form.visibility === v ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-[#c4c7c7] hover:bg-[#f1edec]'}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#111111] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors disabled:opacity-50"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {creating ? 'Creating…' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-[#c4c7c7] text-xs font-bold uppercase tracking-widest text-[#111111] hover:bg-[#f1edec] transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

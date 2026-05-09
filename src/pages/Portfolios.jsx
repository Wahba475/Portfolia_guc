import { useState, useMemo } from 'react'
import { Search, BookOpen, Heart, SortAsc } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLayoutForRole } from '../utils/layoutForRole'

// Req 47-51: Portfolio search, filter, sort, view

export default function Portfolios({ currentUser, onLogout, notifications, onMarkRead, onToggleFavorite, userList, projects }) {
  const Layout = getLayoutForRole(currentUser?.role)
  const [query, setQuery] = useState('')
  const [majorFilter, setMajorFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [sortBy, setSortBy] = useState('name') // 'name' | 'projects'

  const students = (userList || []).filter((u) => u.role === 'student' && u.active !== false)

  // Collect unique majors and skills
  const allMajors = [...new Set(students.map((s) => s.major).filter(Boolean))].sort()
  const allSkills = [...new Set(students.flatMap((s) => s.skills || []))].sort()

  const myFavorites = currentUser?.favorites?.portfolios || []

  const filtered = useMemo(() => {
    return students
      .filter((s) => {
        const q = query.toLowerCase()
        if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false
        if (majorFilter && s.major !== majorFilter) return false
        if (skillFilter && !(s.skills || []).includes(skillFilter)) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'projects') {
          const aCount = (projects || []).filter((p) => String(p.ownerId) === String(a.id) && p.visibility === 'Public').length
          const bCount = (projects || []).filter((p) => String(p.ownerId) === String(b.id) && p.visibility === 'Public').length
          return bCount - aCount
        }
        return a.name.localeCompare(b.name)
      })
  }, [students, query, majorFilter, skillFilter, sortBy, projects])

  function getPublicProjects(userId) {
    return (projects || []).filter((p) => String(p.ownerId) === String(userId) && p.visibility === 'Public')
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead}>
      <div className="max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#747878] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            Discover
          </p>
          <h1 className="text-4xl font-bold text-[#111111] mb-2" style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em' }}>
            Student Portfolios
          </h1>
          <p className="text-lg text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {filtered.length} portfolio{filtered.length !== 1 ? 's' : ''} found.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          {/* Search — Req 47 */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747878]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2.5 border border-[#e5e2e1] bg-white focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#747878] transition-colors"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            />
          </div>

          {/* Filter by Major — Req 48 */}
          <select
            value={majorFilter}
            onChange={(e) => setMajorFilter(e.target.value)}
            className="border border-[#e5e2e1] bg-white px-3 py-2.5 text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <option value="">All Majors</option>
            {allMajors.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* Filter by Skill — Req 48 */}
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="border border-[#e5e2e1] bg-white px-3 py-2.5 text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <option value="">All Skills</option>
            {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Sort — Req 50 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-[#e5e2e1] bg-white px-3 py-2.5 text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <option value="name">Sort: Name</option>
            <option value="projects">Sort: Most Projects</option>
          </select>
        </div>

        {/* Results — Req 49, 51 */}
        {filtered.length === 0 ? (
          <p className="text-center py-16 text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            No portfolios match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((student) => {
              const publicProjects = getPublicProjects(student.id)
              const isFav = myFavorites.includes(student.id)
              return (
                <div key={student.id} className="bg-white border border-[#e5e2e1] p-6 hover:border-[#111111] transition-colors group flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#111111] flex items-center justify-center flex-shrink-0">
                        {student.avatar
                          ? <img src={student.avatar} alt={student.name} className="w-10 h-10 object-cover" />
                          : <span className="text-white text-sm font-bold">{student.name.charAt(0)}</span>
                        }
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#111111] group-hover:text-[#6b38d4] transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {student.name}
                        </p>
                        <p className="text-xs text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {student.major || 'Student'}
                        </p>
                      </div>
                    </div>
                    {/* Req 65, 66: Favorites */}
                    {(currentUser.role === 'student' || currentUser.role === 'employer') && student.id !== currentUser.id && (
                      <button
                        onClick={() => onToggleFavorite('portfolios', student.id)}
                        className={`flex-shrink-0 transition-colors ${isFav ? 'text-red-500' : 'text-[#c4c7c7] hover:text-red-400'}`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>

                  {student.bio && (
                    <p className="text-xs text-[#747878] line-clamp-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {student.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {(student.skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {student.skills.slice(0, 4).map((s) => (
                        <span key={s} className="text-[9px] font-bold uppercase tracking-wider bg-[#f1edec] text-[#111111] px-2 py-0.5 border border-[#e5e2e1]" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {s}
                        </span>
                      ))}
                      {student.skills.length > 4 && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#747878]">+{student.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-[#e5e2e1] mt-auto">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      <BookOpen size={12} /> {publicProjects.length} project{publicProjects.length !== 1 ? 's' : ''}
                    </span>
                    <Link
                      to={`/portfolio/${student.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-[#111111] border border-[#111111] px-3 py-1.5 hover:bg-[#f1edec] transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      View Portfolio →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

import { useState } from 'react'
import { Search, BookOpen, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { getLayoutForRole } from '../utils/layoutForRole'

// Req 8, 9: Search/view course instructors

export default function Instructors({ currentUser, onLogout, notifications, onMarkRead, userList, courses }) {
  const Layout = getLayoutForRole(currentUser?.role)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const instructors = (userList || []).filter((u) => u.role === 'instructor' && u.active !== false)

  const filtered = instructors.filter((u) => {
    const q = query.toLowerCase()
    if (!q) return true
    // search by name
    if (u.name.toLowerCase().includes(q)) return true
    // search by linked course name
    const linkedCourseNames = (u.linkedCourses || []).map((cid) => {
      const c = (courses || []).find((c) => c.id === cid)
      return c ? c.name.toLowerCase() : ''
    })
    return linkedCourseNames.some((n) => n.includes(q))
  })

  function getLinkedCourses(instructor) {
    return (instructor.linkedCourses || []).map((cid) =>
      (courses || []).find((c) => c.id === cid)
    ).filter(Boolean)
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead}>
      <div className="max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#747878] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            Directory
          </p>
          <h1 className="text-4xl font-bold text-[#111111] mb-2" style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em' }}>
            Course Instructors
          </h1>
          <p className="text-lg text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Search by instructor name or course.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-8 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747878]" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
            placeholder="Search by name or course…"
            className="w-full pl-10 pr-4 py-3 border border-[#e5e2e1] bg-white focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#747878] transition-colors"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          />
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <p className="text-sm text-[#747878] py-12 text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
            No instructors found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((instructor) => {
              const linkedCourses = getLinkedCourses(instructor)
              const isSelected = selected?.id === instructor.id
              return (
                <div
                  key={instructor.id}
                  className="bg-white border border-[#e5e2e1] hover:border-[#111111] transition-colors"
                >
                  {/* Card header */}
                  <button
                    onClick={() => setSelected(isSelected ? null : instructor)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#111111] flex items-center justify-center flex-shrink-0">
                        {instructor.avatar
                          ? <img src={instructor.avatar} alt={instructor.name} className="w-12 h-12 object-cover" />
                          : <span className="text-white font-bold text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {instructor.name.charAt(0)}
                            </span>
                        }
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {instructor.name}
                        </p>
                        <p className="text-xs text-[#747878] uppercase tracking-wider mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {instructor.department || 'Instructor'}
                        </p>
                        <p className="text-xs text-[#747878] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {instructor.email}
                        </p>
                      </div>
                    </div>
                    {isSelected ? <ChevronUp size={16} className="text-[#747878] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#747878] flex-shrink-0" />}
                  </button>

                  {/* Expanded profile — Req 9 */}
                  {isSelected && (
                    <div className="px-6 pb-6 border-t border-[#e5e2e1] pt-5 space-y-4">
                      {instructor.bio && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#747878] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Bio
                          </p>
                          <p className="text-sm text-[#444748] leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {instructor.bio}
                          </p>
                        </div>
                      )}
                      {instructor.researchInterests && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#747878] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Research Interests
                          </p>
                          <p className="text-sm text-[#444748]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {instructor.researchInterests}
                          </p>
                        </div>
                      )}
                      {instructor.educationBackground && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#747878] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Education
                          </p>
                          <p className="text-sm text-[#444748]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {instructor.educationBackground}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#747878] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Linked Courses ({linkedCourses.length})
                        </p>
                        {linkedCourses.length === 0
                          ? <p className="text-xs text-[#747878]">No linked courses.</p>
                          : <div className="flex flex-wrap gap-2">
                              {linkedCourses.map((c) => (
                                <span key={c.id} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#f1edec] text-[#111111] px-2 py-1 border border-[#e5e2e1]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  <BookOpen size={10} /> {c.name} ({c.code})
                                </span>
                              ))}
                            </div>
                        }
                      </div>
                      <a
                        href={`mailto:${instructor.email}`}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111] border border-[#e5e2e1] px-4 py-2 hover:border-[#111111] hover:bg-[#f1edec] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <Mail size={12} /> Contact
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

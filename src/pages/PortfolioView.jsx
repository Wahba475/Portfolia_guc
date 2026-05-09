import { useParams, Link, useNavigate } from 'react-router-dom'
import { getLayoutForRole } from '../utils/layoutForRole'
import { BookOpen, User, ArrowLeft, Heart } from 'lucide-react'

export default function PortfolioView({ currentUser, onLogout, notifications, onMarkRead, onToggleFavorite, userList, projects }) {
  const { userId } = useParams()
  const navigate = useNavigate()
  const Layout = getLayoutForRole(currentUser?.role)
  
  const student = (userList || []).find((u) => String(u.id) === String(userId))
  const isFav = (currentUser?.favorites?.portfolios || []).includes(userId)
  
  const publicProjects = (projects || []).filter((p) => String(p.ownerId) === String(userId) && p.visibility === 'Public')

  if (!student) {
    return (
      <Layout currentUser={currentUser} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead}>
        <div className="text-center py-20">
          <p className="text-[#747878] text-sm">Portfolio not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-block text-[#111111] underline text-sm font-semibold">
            ← Back
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead}>
      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[#747878] text-xs font-semibold uppercase tracking-wider hover:text-[#111111] transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <div className="bg-white border border-[#e5e2e1] p-6 md:p-8 flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-24 h-24 bg-[#111111] flex items-center justify-center flex-shrink-0">
            {student.avatar
              ? <img src={student.avatar} alt={student.name} className="w-24 h-24 object-cover" />
              : <span className="text-white text-3xl font-bold">{student.name.charAt(0)}</span>
            }
          </div>
          <div className="flex-1 space-y-4">
             <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-[#111111] mb-1" style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em' }}>
                    {student.name}
                    </h1>
                    <p className="text-sm text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {student.major || 'Student'} • {student.university || 'GUC'}
                    </p>
                </div>
                {/* Req 65, 66: Favorites */}
                {(currentUser.role === 'student' || currentUser.role === 'employer') && student.id !== currentUser.id && (
                    <button
                    onClick={() => onToggleFavorite('portfolios', student.id)}
                    className={`flex-shrink-0 transition-colors flex items-center gap-2 px-3 py-2 border ${isFav ? 'text-red-500 border-red-200 bg-red-50' : 'text-[#747878] border-[#e5e2e1] hover:text-[#111111] hover:border-[#111111]'}`}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>{isFav ? 'Favorited' : 'Favorite'}</span>
                    </button>
                )}
             </div>
            
            {student.bio && (
                <p className="text-base text-[#111111] leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {student.bio}
                </p>
            )}

            {/* Skills */}
            {(student.skills || []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {student.skills.map((s) => (
                    <span key={s} className="text-xs font-bold uppercase tracking-wider bg-[#f1edec] text-[#111111] px-3 py-1.5 border border-[#e5e2e1]" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {s}
                    </span>
                    ))}
                </div>
            )}
            
            {student.linkedin && (
                <div className="pt-2">
                    <a href={student.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111] underline underline-offset-4 hover:text-[#6b38d4]" style={{ fontFamily: "'Inter', sans-serif" }}>
                        View LinkedIn / CV →
                    </a>
                </div>
            )}
          </div>
        </div>

        {/* Projects section */}
        <div>
           <div className="mb-6 pb-2 border-b border-[#e5e2e1] flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>
                    Public Projects
                </h2>
                <span className="text-xs font-bold uppercase tracking-wider text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {publicProjects.length} Total
                </span>
           </div>
           
           {publicProjects.length === 0 ? (
                <div className="bg-white border border-[#e5e2e1] p-12 text-center">
                    <BookOpen size={32} className="mx-auto text-[#c4c7c7] mb-3" />
                    <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        This student hasn't published any public projects yet.
                    </p>
                </div>
           ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {publicProjects.map(project => (
                         <div key={project.id} className="bg-white border border-[#e5e2e1] p-6 hover:border-[#111111] transition-colors flex flex-col gap-4">
                             <div>
                                <h3 className="text-xl font-bold text-[#111111] mb-1 group-hover:text-[#6b38d4] transition-colors leading-snug" style={{ fontFamily: "'Newsreader', serif" }}>
                                    {project.title}
                                </h3>
                                <p className="text-sm text-[#747878] line-clamp-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    {project.description}
                                </p>
                             </div>
                             
                             <div className="mt-auto pt-4 border-t border-[#e5e2e1] flex items-center justify-between">
                                <div className="flex gap-2">
                                    {(project.tags || []).slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider bg-[#f1edec] text-[#111111] px-2 py-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <Link
                                    to={`/projects/${project.id}`}
                                    className="text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#6b38d4] transition-colors"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Details →
                                </Link>
                             </div>
                         </div>
                    ))}
                </div>
           )}
        </div>
      </div>
    </Layout>
  )
}

import { getLayoutForRole } from '../utils/layoutForRole'
import StatCard from '../components/StatCard'
import { FolderKanban, FileText, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard({ currentUser, onLogout, projects, internships, notifications = [], onMarkRead }) {
  const Layout = getLayoutForRole(currentUser?.role)
  // Real stats from live data
  const myProjects = (projects || []).filter(
    (p) => String(p.ownerId) === String(currentUser.id)
  )

  const myApplications = (internships || []).filter(
    (i) => (i.applicants || []).includes(currentUser.id)
  )

  const openInternships = (internships || []).filter(
    (i) => i.status !== 'closed'
  )

  // Build a real activity feed from data
  function buildActivity() {
    const items = []

    // Recent projects created by this user
    myProjects
      .slice(-3)
      .reverse()
      .forEach((p) => {
        items.push({
          id: `proj-${p.id}`,
          icon: '📁',
          text: `You created a project: "${p.title}"`,
          time: p.createdAt || 'Recently',
          link: `/projects/${p.id}`,
        })
      })

    // Applied internships
    myApplications.slice(-2).reverse().forEach((i) => {
      items.push({
        id: `app-${i.id}`,
        icon: '📄',
        text: `You applied to "${i.role}" at ${i.company}`,
        time: 'Recently',
        link: '/internships',
      })
    })

    // Open internship announcements
    openInternships.slice(0, 2).forEach((i) => {
      if (!myApplications.find((a) => a.id === i.id)) {
        items.push({
          id: `intern-${i.id}`,
          icon: '🔔',
          text: `New opening: ${i.role} at ${i.company}`,
          time: i.postedAt || 'Recently',
          link: '/internships',
        })
      }
    })

    // If nothing at all, show a welcome message
    if (items.length === 0) {
      items.push({
        id: 'welcome',
        icon: '👋',
        text: `Welcome to Portfolia, ${currentUser.name}! Start by creating a project.`,
        time: 'Just now',
        link: '/projects',
      })
    }

    return items.slice(0, 6)
  }

  const activityFeed = buildActivity()

  return (
    <Layout currentUser={currentUser} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead}>
      <div className="max-w-[1280px] mx-auto w-full space-y-12">
        {/* Page header */}
        <header>
          <h1
            className="text-4xl md:text-5xl font-bold text-[#111111]"
            style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em', lineHeight: '1.15' }}
          >
            Welcome back, {currentUser.name?.split(' ')[0]}.
          </h1>
          <p className="text-lg text-[#747878] mt-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Your professional activity at a glance.
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Projects"
            value={myProjects.length}
            icon={FolderKanban}
            note={myProjects.length > 0 ? `${myProjects.filter(p => p.status === 'In Progress').length} in progress` : 'Create your first project'}
            highlightNote={myProjects.length > 0}
          />
          <StatCard
            label="Applications Sent"
            value={myApplications.length}
            icon={FileText}
            note={myApplications.length > 0 ? 'Under review' : 'Browse internships'}
          />
          <StatCard
            label="Open Positions"
            value={openInternships.length}
            icon={Bell}
            note="Available now"
            highlightNote={true}
          />
        </section>

        {/* Quick actions */}
        <section className="flex flex-wrap gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 bg-[#111111] text-white px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            + New Project
          </Link>
          <Link
            to="/internships"
            className="inline-flex items-center gap-2 border border-[#111111] text-[#111111] px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#f1edec] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Browse Internships
          </Link>
        </section>

        {/* Activity feed */}
        <section>
          <h2
            className="text-2xl font-bold text-[#111111] mb-6"
            style={{ fontFamily: "'Newsreader', serif" }}
          >
            Activity Feed
          </h2>
          <div className="bg-white border border-[#e5e2e1]">
            {activityFeed.map((item) => (
              <Link
                key={item.id}
                to={item.link || '#'}
                className="flex items-start gap-4 p-6 border-b border-[#e5e2e1] hover:bg-[#fdf8f8] transition-colors last:border-b-0 group"
              >
                <div className="w-10 h-10 bg-[#f1edec] border border-[#e5e2e1] flex-shrink-0 flex items-center justify-center text-base">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#111111] group-hover:text-[#6b38d4] transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {item.text}
                  </p>
                  <p className="text-xs text-[#747878] mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {item.time}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* My Projects preview */}
        {myProjects.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold text-[#111111]"
                style={{ fontFamily: "'Newsreader', serif" }}
              >
                My Projects
              </h2>
              <Link
                to="/projects"
                className="text-xs font-bold uppercase tracking-widest text-[#747878] hover:text-[#111111] transition-colors underline decoration-[#c4c7c7]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myProjects.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="bg-white border border-[#e5e2e1] p-5 hover:border-[#111111] transition-colors group"
                >
                  <h3
                    className="text-lg font-bold text-[#111111] group-hover:text-[#6b38d4] transition-colors mb-2 line-clamp-1"
                    style={{ fontFamily: "'Newsreader', serif" }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-xs text-[#747878] line-clamp-2 mb-3"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {p.description}
                  </p>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider bg-[#f1edec] text-[#111111] px-2 py-1"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {p.status || 'In Progress'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}

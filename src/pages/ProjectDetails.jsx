import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLayoutForRole } from '../utils/layoutForRole'
import { GitFork, ExternalLink, ArrowLeft, Plus, Send, Check, X } from 'lucide-react'

const TABS = ['Overview', 'Tasks', 'Comments', 'Collaborators']

export default function ProjectDetails({ currentUser, onLogout, projects, userList, onUpdateProject }) {
  const Layout = getLayoutForRole(currentUser?.role)
  const { id } = useParams()
  const [tab, setTab] = useState('Overview')

  // Task form
  const [taskText, setTaskText] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')

  // Comment form
  const [commentText, setCommentText] = useState('')

  // Collaborator form
  const [collabEmail, setCollabEmail] = useState('')
  const [collabMsg, setCollabMsg] = useState('')

  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <Layout currentUser={currentUser} onLogout={onLogout}>
        <div className="text-center py-20">
          <p className="text-[#747878] text-sm">Project not found.</p>
          <Link to="/projects" className="mt-4 inline-block text-[#111111] underline text-sm font-semibold">
            ← Back to projects
          </Link>
        </div>
      </Layout>
    )
  }

  const isOwner = String(project.ownerId) === String(currentUser.id)
  const tasks = project.tasks || []
  const comments = project.comments || []
  const collaborators = project.collaborators || []
  const milestones = project.milestones || []

  const completedTasks = tasks.filter((t) => t.done).length
  const completedMilestones = milestones.filter((m) => m.done).length
  const totalItems = milestones.length + tasks.length
  const completedItems = completedMilestones + completedTasks
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // ── Task actions ──────────────────────────────────────
  function addTask(e) {
    e.preventDefault()
    if (!taskText.trim()) return
    const newTask = {
      id: String(Date.now()),
      description: taskText.trim(),
      assignedTo: taskAssignee.trim() || currentUser.name,
      done: false,
      createdAt: new Date().toISOString(),
    }
    onUpdateProject({ ...project, tasks: [...tasks, newTask] })
    setTaskText('')
    setTaskAssignee('')
  }

  function toggleTask(taskId) {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    )
    onUpdateProject({ ...project, tasks: updated })
  }

  function deleteTask(taskId) {
    onUpdateProject({ ...project, tasks: tasks.filter((t) => t.id !== taskId) })
  }

  // ── Comment actions ───────────────────────────────────
  function addComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    const newComment = {
      id: String(Date.now()),
      text: commentText.trim(),
      author: currentUser.name,
      createdAt: new Date().toISOString(),
    }
    onUpdateProject({ ...project, comments: [...comments, newComment] })
    setCommentText('')
  }

  // ── Collaborator actions ──────────────────────────────
  function addCollaborator(e) {
    e.preventDefault()
    setCollabMsg('')
    if (!collabEmail.trim()) return
    const user = (userList || []).find(
      (u) => u.email.toLowerCase() === collabEmail.trim().toLowerCase()
    )
    if (!user) return setCollabMsg('No user found with that email.')
    if (collaborators.includes(user.name)) return setCollabMsg('Already a collaborator.')
    onUpdateProject({ ...project, collaborators: [...collaborators, user.name] })
    setCollabEmail('')
    setCollabMsg('Collaborator added!')
    setTimeout(() => setCollabMsg(''), 2500)
  }

  function toggleMilestone(idx) {
    if (!isOwner) return
    const updated = milestones.map((m, i) =>
      i === idx ? { ...m, done: !m.done } : m
    )
    onUpdateProject({ ...project, milestones: updated })
  }

  function formatDate(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* Back */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-[#747878] text-xs font-semibold uppercase tracking-wider hover:text-[#111111] transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={14} /> Back to Projects
        </Link>

        {/* Header */}
        <div className="bg-white border border-[#e5e2e1] p-6 md:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="bg-[#f1edec] text-[#111111] px-2 py-1 text-xs font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {project.status || 'In Progress'}
                </span>
                <span className="text-xs text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Created: {project.createdAt}
                </span>
              </div>
              <h1
                className="text-4xl font-semibold text-[#111111] mb-2"
                style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em', lineHeight: '1.1' }}
              >
                {project.title}
              </h1>
              <p className="text-[#747878] max-w-2xl text-base leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {project.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {project.github && (
                <a href={project.github} target="_blank" rel="noreferrer"
                  className="bg-white border border-[#111111] text-[#111111] px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#f1edec] transition-colors flex items-center gap-2"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <GitFork size={14} /> Code
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noreferrer"
                  className="bg-[#111111] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors flex items-center gap-2"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <ExternalLink size={14} /> Live Demo
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#e5e2e1] flex overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors
                ${tab === t ? 'border-b-2 border-[#111111] text-[#111111]' : 'text-[#747878] hover:text-[#111111]'}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {t}
              {t === 'Tasks' && tasks.length > 0 && (
                <span className="ml-2 bg-[#f1edec] text-[#111111] text-[10px] px-1.5 py-0.5 font-bold">{tasks.length}</span>
              )}
              {t === 'Comments' && comments.length > 0 && (
                <span className="ml-2 bg-[#f1edec] text-[#111111] text-[10px] px-1.5 py-0.5 font-bold">{comments.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-8 space-y-6">

            {/* OVERVIEW */}
            {tab === 'Overview' && (
              <section className="bg-white border border-[#e5e2e1] p-6 md:p-8">
                <h2 className="text-2xl font-bold text-[#111111] border-b border-[#e5e2e1] pb-2 mb-4" style={{ fontFamily: "'Newsreader', serif" }}>
                  Project Brief
                </h2>
                <p className="text-base text-[#111111] leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {project.description}
                </p>
              </section>
            )}

            {/* MILESTONES (Overview) */}
            {tab === 'Overview' && milestones.length > 0 && (
              <section className="bg-white border border-[#e5e2e1] p-6 md:p-8">
                <div className="flex justify-between items-center border-b border-[#e5e2e1] pb-2 mb-4">
                  <h2 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>Milestones</h2>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {completedMilestones}/{milestones.length} done
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#f1edec] mb-6">
                  <div className="h-1.5 bg-[#111111] transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <label key={i} className={`flex items-center gap-3 p-3 border transition-colors cursor-pointer ${isOwner ? 'hover:bg-[#f1edec] hover:border-[#e5e2e1]' : ''} border-transparent`}>
                      <input
                        type="checkbox"
                        checked={m.done}
                        onChange={() => toggleMilestone(i)}
                        disabled={!isOwner}
                        className="w-4 h-4 border-2 border-[#111111] accent-[#111111]"
                      />
                      <span className={`text-sm ${m.done ? 'line-through text-[#747878]' : 'text-[#111111]'}`} style={{ fontFamily: "'Manrope', sans-serif" }}>
                        {m.title}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {/* TASKS */}
            {tab === 'Tasks' && (
              <section className="bg-white border border-[#e5e2e1] p-6 md:p-8 space-y-6">
                <h2 className="text-2xl font-bold text-[#111111] border-b border-[#e5e2e1] pb-2" style={{ fontFamily: "'Newsreader', serif" }}>
                  Tasks
                </h2>

                {/* Add task form */}
                {isOwner && (
                  <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      placeholder="Task description…"
                      className="flex-1 border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    />
                    <input
                      type="text"
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      placeholder="Assigned to (optional)"
                      className="sm:w-48 border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-colors flex-shrink-0"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <Plus size={12} /> Add Task
                    </button>
                  </form>
                )}

                {/* Task list */}
                {tasks.length === 0 ? (
                  <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>No tasks yet.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 p-3 border border-[#e5e2e1] hover:bg-[#fdf8f8] transition-colors group">
                        <input
                          type="checkbox"
                          checked={t.done}
                          onChange={() => toggleTask(t.id)}
                          className="w-4 h-4 border-2 border-[#111111] accent-[#111111] flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${t.done ? 'line-through text-[#747878]' : 'text-[#111111]'}`} style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {t.description}
                          </p>
                          <p className="text-xs text-[#747878] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Assigned: {t.assignedTo}
                          </p>
                        </div>
                        {isOwner && (
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="text-[#c4c7c7] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* COMMENTS */}
            {tab === 'Comments' && (
              <section className="bg-white border border-[#e5e2e1] p-6 md:p-8 space-y-6">
                <h2 className="text-2xl font-bold text-[#111111] border-b border-[#e5e2e1] pb-2" style={{ fontFamily: "'Newsreader', serif" }}>
                  Comments
                </h2>

                {/* Add comment */}
                <form onSubmit={addComment} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Leave a comment…"
                      className="w-full border border-[#c4c7c7] p-3 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors resize-none"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex-shrink-0 inline-flex items-center gap-1.5 bg-[#111111] text-white px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <Send size={12} /> Post
                  </button>
                </form>

                {/* Comment list */}
                {comments.length === 0 ? (
                  <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>No comments yet. Be the first.</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((c) => (
                      <div key={c.id} className="border-l-2 border-[#e5e2e1] pl-4 space-y-1">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#111111] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">{c.author?.charAt(0)}</span>
                          </div>
                          <span className="text-xs font-bold text-[#111111]" style={{ fontFamily: "'Inter', sans-serif" }}>{c.author}</span>
                          <span className="text-xs text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-[#444748] leading-relaxed pl-9" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* COLLABORATORS */}
            {tab === 'Collaborators' && (
              <section className="bg-white border border-[#e5e2e1] p-6 md:p-8 space-y-6">
                <h2 className="text-2xl font-bold text-[#111111] border-b border-[#e5e2e1] pb-2" style={{ fontFamily: "'Newsreader', serif" }}>
                  Team
                </h2>

                {/* Current collaborators */}
                <div className="space-y-3">
                  {collaborators.length === 0 ? (
                    <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>No collaborators yet.</p>
                  ) : (
                    collaborators.map((name) => (
                      <div key={name} className="flex items-center gap-3 p-3 border border-[#e5e2e1]">
                        <div className="w-8 h-8 bg-[#f1edec] border border-[#e5e2e1] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#111111] text-xs font-bold">{name.charAt(0)}</span>
                        </div>
                        <span className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>{name}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add collaborator (owner only) */}
                {isOwner && (
                  <form onSubmit={addCollaborator} className="pt-4 border-t border-[#e5e2e1] space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#111111]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Add by email
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={collabEmail}
                        onChange={(e) => setCollabEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="flex-1 border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-colors flex-shrink-0"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {collabMsg && (
                      <p className={`text-xs font-semibold ${collabMsg.includes('added') ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {collabMsg}
                      </p>
                    )}
                  </form>
                )}
              </section>
            )}
          </div>

          {/* Right column — metadata */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#e5e2e1] p-6 space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#747878] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Project Lead
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#111111] flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.name?.charAt(0)}
                  </div>
                  <span className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {currentUser.name}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#e5e2e1] pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#747878] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Progress
                </h3>
                <p className="text-2xl font-black text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>
                  {progress}%
                </p>
                <div className="w-full h-1 bg-[#f1edec] mt-2">
                  <div className="h-1 bg-[#111111] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="border-t border-[#e5e2e1] pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#747878] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(project.tags || []).map((tag) => (
                    <span key={tag} className="bg-[#f1edec] text-[#111111] px-2 py-1 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#e5e2e1] pt-6 space-y-2">
                <div className="flex justify-between text-xs text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span>Tasks</span><span className="font-bold text-[#111111]">{completedTasks}/{tasks.length}</span>
                </div>
                <div className="flex justify-between text-xs text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span>Comments</span><span className="font-bold text-[#111111]">{comments.length}</span>
                </div>
                <div className="flex justify-between text-xs text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span>Collaborators</span><span className="font-bold text-[#111111]">{collaborators.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )

  function formatDate(iso) {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
    catch { return iso }
  }
}

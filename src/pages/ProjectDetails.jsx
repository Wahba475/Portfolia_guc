import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLayoutForRole } from '../utils/layoutForRole'
import { GitFork, ExternalLink, ArrowLeft, Plus, Send, Check, X, ChevronUp, ChevronDown } from 'lucide-react'

const BASE_TABS = ['Overview', 'Tasks', 'Comments', 'Collaborators', 'Instructors']
const BACHELOR_COURSE_ID = 'c1'

export default function ProjectDetails({ currentUser, onLogout, projects, userList, onUpdateProject, onAddNotification, courses = [], onFlagProject, onAppealFlag }) {
  const Layout = getLayoutForRole(currentUser?.role)
  const { id } = useParams()
  const [tab, setTab] = useState('Overview')
  const [flagReason, setFlagReason] = useState('')
  const [showFlagForm, setShowFlagForm] = useState(false)
  const [appealText, setAppealText] = useState('')
  const [showAppealForm, setShowAppealForm] = useState(false)


  // Thesis draft form (Req 23/24)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftUrl, setDraftUrl] = useState('')
  const [draftMsg, setDraftMsg] = useState('')

  // Task form
  const [taskText, setTaskText] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskDeadline, setTaskDeadline] = useState('')
  const [taskStatus, setTaskStatus] = useState('pending')

  // Comment form
  const [commentText, setCommentText] = useState('')

  // Task Comment form
  const [taskCommentText, setTaskCommentText] = useState({})

  // Collaborator form
  const [collabEmail, setCollabEmail] = useState('')
  const [collabMsg, setCollabMsg] = useState('')

  // Instructor form
  const [instEmail, setInstEmail] = useState('')
  const [instMsg, setInstMsg] = useState('')

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
  const collaborators = project.collaborators || []
  const isAssignedInstructor = currentUser.role === 'instructor' && (project.instructors || []).includes(currentUser.name)
  const canInteract = isOwner || collaborators.includes(currentUser.name) || isAssignedInstructor
  const isBachelorProject = project.courseId === BACHELOR_COURSE_ID
  const TABS = isBachelorProject ? [...BASE_TABS, 'Thesis Drafts'] : BASE_TABS

  const tasks = project.tasks || []
  const comments = project.comments || []
  const milestones = project.milestones || []
  const instructors = project.instructors || []

  const completedTasks = tasks.filter((t) => t.done).length
  const completedMilestones = milestones.filter((m) => m.done).length
  const totalItems = milestones.length + tasks.length
  const completedItems = completedMilestones + completedTasks
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // ── Thesis draft actions (Req 23/24) ──────────────────
  const drafts = project.thesisDrafts || []

  function addDraft(e) {
    e.preventDefault()
    if (!draftTitle.trim()) { setDraftMsg('Title is required.'); return }
    const newDraft = { id: String(Date.now()), title: draftTitle.trim(), url: draftUrl.trim(), isFinal: false, createdAt: new Date().toISOString() }
    onUpdateProject({ ...project, thesisDrafts: [...drafts, newDraft] })
    setDraftTitle('')
    setDraftUrl('')
    setDraftMsg('Draft uploaded.')
    setTimeout(() => setDraftMsg(''), 3000)
  }

  function deleteDraft(draftId) {
    onUpdateProject({ ...project, thesisDrafts: drafts.filter(d => d.id !== draftId) })
  }

  function setFinalDraft(draftId) {
    const updated = drafts.map(d => ({ ...d, isFinal: d.id === draftId }))
    onUpdateProject({ ...project, thesisDrafts: updated })
  }

  // ── Task actions ──────────────────────────────────────
  function addTask(e) {
    e.preventDefault()
    if (!taskText.trim()) return
    const newTask = {
      id: String(Date.now()),
      description: taskText.trim(),
      assignedTo: taskAssignee.trim() || currentUser.name,
      status: taskStatus,
      deadline: taskDeadline || null,
      done: taskStatus === 'completed',
      createdAt: new Date().toISOString(),
    }
    onUpdateProject({ ...project, tasks: [...tasks, newTask] })
    setTaskText('')
    setTaskAssignee('')
    setTaskDeadline('')
    setTaskStatus('pending')
  }

  function setTaskStatusUpdate(taskId, newStatus) {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, done: newStatus === 'completed' } : t
    )
    onUpdateProject({ ...project, tasks: updated })
  }

  function deleteTask(taskId) {
    onUpdateProject({ ...project, tasks: tasks.filter((t) => t.id !== taskId) })
  }

  function moveTaskUp(idx) {
    if (idx === 0) return
    const updated = [...tasks]
    ;[updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]]
    onUpdateProject({ ...project, tasks: updated })
  }

  function moveTaskDown(idx) {
    if (idx === tasks.length - 1) return
    const updated = [...tasks]
    ;[updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]]
    onUpdateProject({ ...project, tasks: updated })
  }

  function removeCollaborator(name) {
    onUpdateProject({ ...project, collaborators: collaborators.filter(c => c !== name) })
  }

  function addTaskComment(e, taskId) {
    e.preventDefault()
    const text = taskCommentText[taskId]
    if (!text?.trim()) return
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [...(t.comments || []), { id: String(Date.now()), author: currentUser.name, text: text.trim(), createdAt: new Date().toISOString() }]
        }
      }
      return t
    })
    onUpdateProject({ ...project, tasks: updatedTasks })
    setTaskCommentText(prev => ({ ...prev, [taskId]: '' }))
  }

  function deleteTaskComment(taskId, commentId) {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, comments: (t.comments || []).filter(c => c.id !== commentId) }
      }
      return t
    })
    onUpdateProject({ ...project, tasks: updatedTasks })
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
    // Req 41: Notify project owner when instructor comments
    if (onAddNotification && currentUser.role === 'instructor' && project.ownerId !== currentUser.id) {
      onAddNotification(project.ownerId, `${currentUser.name} left a comment on your project "${project.title}".`)
    }
    setCommentText('')
  }

  function deleteProjectComment(commentId) {
    onUpdateProject({ ...project, comments: comments.filter(c => c.id !== commentId) })
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

  // ── Instructor actions ──────────────────────────────
  function inviteInstructor(e) {
    e.preventDefault()
    setInstMsg('')
    if (!instEmail.trim()) return
    const user = (userList || []).find(
      (u) => u.email.toLowerCase() === instEmail.trim().toLowerCase() && u.role === 'instructor'
    )
    if (!user) return setInstMsg('No instructor found with that email.')
    if (instructors.includes(user.name)) return setInstMsg('Already an assigned instructor.')
    
    // Check if invitation already exists
    const existing = (project.invitations || []).find(i => i.email.toLowerCase() === instEmail.trim().toLowerCase())
    if (existing && existing.status === 'pending') return setInstMsg('Invitation already sent.')

    const newInv = {
      id: String(Date.now()),
      email: user.email,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    onUpdateProject({ ...project, invitations: [...(project.invitations || []), newInv] })
    
    if (onAddNotification) {
      onAddNotification(user.id, `You have been invited to supervise the project "${project.title}".`)
    }

    setInstEmail('')
    setInstMsg('Invitation sent!')
    setTimeout(() => setInstMsg(''), 2500)
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
                <p className="text-base text-[#111111] leading-relaxed mb-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {project.description}
                </p>
                {/* Course */}
                {project.courseId && (() => {
                  const course = courses.find(c => c.id === project.courseId)
                  return course ? (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>Course:</span>
                      <span className="text-xs font-semibold text-[#111111]" style={{ fontFamily: "'Inter', sans-serif" }}>{course.code} — {course.name}</span>
                    </div>
                  ) : null
                })()}
                {/* Languages */}
                {project.languages && project.languages.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>Languages:</span>
                    {project.languages.map(lang => (
                      <span key={lang} className="bg-[#f1edec] text-[#111111] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{lang}</span>
                    ))}
                  </div>
                )}
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
                        disabled={!canInteract}
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

                {/* Add task form — Req 32 */}
                {isOwner && (
                  <form onSubmit={addTask} className="space-y-3 bg-[#fdf8f8] border border-[#e5e2e1] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>Add Task</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)}
                        placeholder="Task description…"
                        className="flex-1 border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                        style={{ fontFamily: "'Manrope', sans-serif" }} />
                      <input type="text" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}
                        placeholder="Assigned to…"
                        className="sm:w-40 border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                        style={{ fontFamily: "'Manrope', sans-serif" }} />
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <select value={taskStatus} onChange={e => setTaskStatus(e.target.value)}
                        className="border border-[#c4c7c7] py-1.5 px-2 text-xs bg-white text-[#111111] focus:border-[#111111] focus:outline-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        <option value="pending">Pending</option>
                        <option value="postponed">Postponed</option>
                        <option value="completed">Completed</option>
                      </select>
                      <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)}
                        className="border-b border-[#c4c7c7] py-1.5 bg-transparent focus:border-[#111111] focus:outline-none text-xs text-[#111111] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }} />
                      <button type="submit"
                        className="inline-flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        <Plus size={12} /> Add Task
                      </button>
                    </div>
                  </form>
                )}

                {/* Task list */}
                {tasks.length === 0 ? (
                  <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>No tasks yet.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((t, idx) => {
                      const statusColors = {
                        completed: 'bg-green-100 text-green-800',
                        postponed: 'bg-amber-100 text-amber-800',
                        pending: 'bg-[#f1edec] text-[#747878]',
                      }
                      const statusLabel = t.status || (t.done ? 'completed' : 'pending')
                      return (
                        <div key={t.id} className="flex items-start gap-3 p-3 border border-[#e5e2e1] hover:bg-[#fdf8f8] transition-colors group">
                          {/* Reorder buttons (owner only) */}
                          {isOwner && (
                            <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
                              <button onClick={() => moveTaskUp(idx)} disabled={idx === 0}
                                className="text-[#c4c7c7] hover:text-[#111111] disabled:opacity-30 transition-colors">
                                <ChevronUp size={14} />
                              </button>
                              <button onClick={() => moveTaskDown(idx)} disabled={idx === tasks.length - 1}
                                className="text-[#c4c7c7] hover:text-[#111111] disabled:opacity-30 transition-colors">
                                <ChevronDown size={14} />
                              </button>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className={`text-sm ${statusLabel === 'completed' ? 'line-through text-[#747878]' : 'text-[#111111]'}`} style={{ fontFamily: "'Manrope', sans-serif" }}>
                                {t.description}
                              </p>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${statusColors[statusLabel] || statusColors.pending}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                {statusLabel}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                              <span>Assigned: {t.assignedTo}</span>
                              {t.deadline && <span>Due: {t.deadline}</span>}
                            </div>
                            {/* Status change (owner only) */}
                            {isOwner && (
                              <select
                                value={statusLabel}
                                onChange={e => setTaskStatusUpdate(t.id, e.target.value)}
                                className="mt-2 border border-[#e5e2e1] text-[10px] py-0.5 px-1 bg-white text-[#111111] focus:border-[#111111] focus:outline-none"
                                style={{ fontFamily: "'Inter', sans-serif" }}>
                                <option value="pending">Pending</option>
                                <option value="postponed">Postponed</option>
                                <option value="completed">Completed</option>
                              </select>
                            )}
                            {/* Task Comments */}
                            <div className="mt-3 space-y-2 pl-2 border-l-2 border-[#e5e2e1]">
                              {(t.comments || []).map(c => (
                                <div key={c.id} className="flex justify-between items-start group/comment">
                                  <p className="text-[11px] text-[#444748]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    <span className="font-bold text-[#111111] mr-1">{c.author}:</span>
                                    {c.text}
                                  </p>
                                  {canInteract && (
                                    <button onClick={() => deleteTaskComment(t.id, c.id)} className="text-[#c4c7c7] hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {canInteract && (
                                <form onSubmit={(e) => addTaskComment(e, t.id)} className="flex gap-2 mt-1">
                                  <input
                                    type="text"
                                    value={taskCommentText[t.id] || ''}
                                    onChange={e => setTaskCommentText(prev => ({...prev, [t.id]: e.target.value}))}
                                    placeholder="Reply..."
                                    className="flex-1 bg-transparent border-b border-[#e5e2e1] focus:border-[#111111] outline-none text-[11px]"
                                  />
                                  <button type="submit" className="text-[10px] font-bold uppercase tracking-wider text-[#747878] hover:text-[#111111]">
                                    Post
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>
                          {canInteract && (
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="text-[#c4c7c7] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      )
                    })}
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
                {canInteract && (
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
                )}

                {/* Comment list */}
                {comments.length === 0 ? (
                  <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>No comments yet. Be the first.</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((c) => (
                      <div key={c.id} className="border-l-2 border-[#e5e2e1] pl-4 space-y-1">
                        <div className="flex items-start justify-between group/pcomment">
                          <div>
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
                          {canInteract && (
                            <button onClick={() => deleteProjectComment(c.id)} className="text-[#c4c7c7] hover:text-red-500 opacity-0 group-hover/pcomment:opacity-100 transition-opacity">
                              <X size={14} />
                            </button>
                          )}
                        </div>
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
                      <div key={name} className="flex items-center gap-3 p-3 border border-[#e5e2e1] group">
                        <div className="w-8 h-8 bg-[#f1edec] border border-[#e5e2e1] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#111111] text-xs font-bold">{name.charAt(0)}</span>
                        </div>
                        <span className="text-sm text-[#111111] flex-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{name}</span>
                        {isOwner && (
                          <button onClick={() => removeCollaborator(name)}
                            className="text-[#c4c7c7] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                          </button>
                        )}
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

            {/* INSTRUCTORS */}
            {tab === 'Instructors' && (
              <section className="bg-white border border-[#e5e2e1] p-6 md:p-8 space-y-6">
                <h2 className="text-2xl font-bold text-[#111111] border-b border-[#e5e2e1] pb-2" style={{ fontFamily: "'Newsreader', serif" }}>
                  Instructors
                </h2>

                {/* Current Instructors */}
                <div className="space-y-3">
                  {instructors.length === 0 ? (
                    <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>No instructors assigned.</p>
                  ) : (
                    instructors.map((name) => (
                      <div key={name} className="flex items-center gap-3 p-3 border border-[#e5e2e1]">
                        <div className="w-8 h-8 bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">{name.charAt(0)}</span>
                        </div>
                        <span className="text-sm text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>{name}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add instructor (owner only) */}
                {isOwner && (
                  <form onSubmit={inviteInstructor} className="pt-4 border-t border-[#e5e2e1] space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#111111]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Invite by email
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={instEmail}
                        onChange={(e) => setInstEmail(e.target.value)}
                        placeholder="instructor@example.com"
                        className="flex-1 border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-colors flex-shrink-0"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <Plus size={12} /> Invite
                      </button>
                    </div>
                    {instMsg && (
                      <p className={`text-xs font-semibold ${instMsg.includes('sent') ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {instMsg}
                      </p>
                    )}
                  </form>
                )}
              </section>
            )}
            {/* THESIS DRAFTS (Req 23/24) */}
            {tab === 'Thesis Drafts' && isBachelorProject && (
              <section className="bg-white border border-[#e5e2e1] p-6 md:p-8 space-y-6">
                <h2 className="text-2xl font-bold text-[#111111] border-b border-[#e5e2e1] pb-2" style={{ fontFamily: "'Newsreader', serif" }}>
                  Thesis Drafts
                </h2>

                {/* Draft list */}
                {drafts.length === 0 ? (
                  <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>No thesis drafts uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {drafts.map(d => {
                      const canSee = isOwner || collaborators.includes(currentUser.name) || isAssignedInstructor || d.isFinal
                      if (!canSee) return null
                      return (
                        <div key={d.id} className={`flex items-start justify-between gap-3 p-4 border ${d.isFinal ? 'border-[#111111] bg-[#f8f8f8]' : 'border-[#e5e2e1]'}`}>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-bold text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>{d.title}</span>
                              {d.isFinal && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-[#111111] text-white px-2 py-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Final Draft</span>
                              )}
                            </div>
                            {d.url && (
                              <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-[#6b38d4] underline underline-offset-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                                View Document →
                              </a>
                            )}
                            <p className="text-[10px] text-[#747878] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {new Date(d.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {(isOwner || collaborators.includes(currentUser.name)) && (
                            <div className="flex gap-2 flex-shrink-0">
                              {!d.isFinal && (
                                <button
                                  onClick={() => setFinalDraft(d.id)}
                                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                                  style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                  Set Final
                                </button>
                              )}
                              <button
                                onClick={() => deleteDraft(d.id)}
                                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white transition-colors"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Upload form (owner/collaborator) */}
                {(isOwner || collaborators.includes(currentUser.name)) && (
                  <form onSubmit={addDraft} className="pt-4 border-t border-[#e5e2e1] space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#111111]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Upload New Draft
                    </label>
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      placeholder="Draft title (e.g. Draft v1)"
                      className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    />
                    <input
                      type="url"
                      value={draftUrl}
                      onChange={e => setDraftUrl(e.target.value)}
                      placeholder="Link to document (optional)"
                      className="w-full border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <Plus size={12} /> Upload Draft
                    </button>
                    {draftMsg && (
                      <p className={`text-xs font-semibold ${draftMsg.includes('uploaded') || draftMsg.includes('Draft') ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {draftMsg}
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
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#747878] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Rating
                </h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                     <button 
                       key={star} 
                       onClick={() => isAssignedInstructor && onUpdateProject({...project, rating: star})}
                       disabled={!isAssignedInstructor}
                       className={`text-2xl ${project.rating >= star ? 'text-[#D97706]' : 'text-[#c4c7c7]'} ${isAssignedInstructor ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                     >
                       ★
                     </button>
                  ))}
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

              {/* Req 59-63: Flag / Appeal */}
              {project.adminHidden && isOwner && (
                <div className="border-t border-[#e5e2e1] pt-6">
                  <p className="text-xs font-semibold text-red-600 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    This project was hidden by admin.
                  </p>
                  {project.appeal ? (
                    <p className="text-xs text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>Appeal submitted.</p>
                  ) : (
                    <>
                      {showAppealForm ? (
                        <div className="space-y-2">
                          <textarea
                            value={appealText}
                            onChange={e => setAppealText(e.target.value)}
                            placeholder="Explain why the flag should be removed…"
                            className="w-full border border-[#e5e2e1] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none resize-none"
                            rows={3}
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => { onAppealFlag && onAppealFlag(project.id, appealText); setShowAppealForm(false) }}
                              className="flex-1 bg-[#111111] text-white py-1.5 text-xs font-bold uppercase tracking-wider"
                              style={{ fontFamily: "'Inter', sans-serif" }}>
                              Submit Appeal
                            </button>
                            <button onClick={() => setShowAppealForm(false)}
                              className="px-3 py-1.5 border border-[#e5e2e1] text-xs font-bold text-[#747878]"
                              style={{ fontFamily: "'Inter', sans-serif" }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowAppealForm(true)}
                          className="w-full py-2 border border-[#111111] text-xs font-bold uppercase tracking-wider text-[#111111] hover:bg-[#f1edec] transition-colors"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          Appeal Decision
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {!project.adminHidden && !isOwner && onFlagProject && (
                <div className="border-t border-[#e5e2e1] pt-6">
                  {project.flagged ? (
                    <p className="text-xs text-[#747878]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {project.flagStatus === 'dismissed' ? 'Flag dismissed.' : 'This project has been flagged for review.'}
                    </p>
                  ) : showFlagForm ? (
                    <div className="space-y-2">
                      <textarea
                        value={flagReason}
                        onChange={e => setFlagReason(e.target.value)}
                        placeholder="Reason for flagging…"
                        className="w-full border border-[#e5e2e1] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none resize-none"
                        rows={3}
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { if (flagReason.trim()) { onFlagProject(project.id, flagReason); setShowFlagForm(false); setFlagReason('') } }}
                          className="flex-1 bg-red-600 text-white py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-red-700"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          Flag Project
                        </button>
                        <button onClick={() => setShowFlagForm(false)}
                          className="px-3 py-1.5 border border-[#e5e2e1] text-xs font-bold text-[#747878]"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowFlagForm(true)}
                      className="w-full py-2 border border-red-200 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      Flag Project
                    </button>
                  )}
                </div>
              )}
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

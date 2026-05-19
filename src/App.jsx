import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { users as initialUsers } from './data/users'
import { projects as initialProjects } from './data/projects'
import { internships as initialInternships } from './data/internships'
import { courses as initialCourses } from './data/courses'
import { getRoleBasePath, getRoleDashboardPath } from './utils/roleRoutes'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import Internships from './pages/Internships'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Messages from './pages/Messages'
import Portfolios from './pages/Portfolios'
import PortfolioView from './pages/PortfolioView'
import InstructorCourses from './pages/InstructorCourses'

// ── Seed guard: if localStorage has old data without admin, merge ──────────────
function hydrateUsers(saved) {
  if (!saved) return initialUsers
  try {
    const parsed = JSON.parse(saved)
    const adminSeed = initialUsers.find((u) => u.role === 'admin')
    const hasAdmin = parsed.some((u) => u.role === 'admin')
    if (!hasAdmin) {
      return adminSeed ? [...parsed, adminSeed] : parsed
    }
    // Always keep the admin seed credentials in sync
    if (adminSeed) {
      return parsed.map((u) =>
        u.role === 'admin' ? { ...u, email: adminSeed.email, password: adminSeed.password } : u
      )
    }
    return parsed
  } catch {
    return initialUsers
  }
}

export default function App() {
  const [userList, setUserList] = useState(() => {
    return hydrateUsers(localStorage.getItem('portfolia_users'))
  })

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('portfolia_currentUser')
    if (!saved) return null
    try { return JSON.parse(saved) } catch { return null }
  })

  const [projectsList, setProjectsList] = useState(() => {
    const saved = localStorage.getItem('portfolia_projects')
    if (!saved) return initialProjects
    try { return JSON.parse(saved) } catch { return initialProjects }
  })

  const [internshipsList, setInternshipsList] = useState(() => {
    const saved = localStorage.getItem('portfolia_internships')
    if (!saved) return initialInternships
    try {
      const parsed = JSON.parse(saved)
      return parsed.map(i => ({ ...i, applicants: Array.isArray(i.applicants) ? i.applicants : [] }))
    } catch { return initialInternships }
  })
  const [coursesList, setCoursesList] = useState(() => {
    const saved = localStorage.getItem('portfolia_courses')
    if (!saved) return initialCourses
    try { return JSON.parse(saved) } catch { return initialCourses }
  })
  const [linkingRequests, setLinkingRequests] = useState(() => {
    const saved = localStorage.getItem('portfolia_linking_requests')
    if (!saved) return []
    try { return JSON.parse(saved) } catch { return [] }
  })
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('portfolia_messages')
    if (!saved) return {}
    try { return JSON.parse(saved) } catch { return {} }
  })

  // ── Notifications ── { userId: [{ id, message, read, createdAt }] }
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('portfolia_notifications')
    if (!saved) return {}
    try { return JSON.parse(saved) } catch { return {} }
  })

  // ── Persistence ────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('portfolia_users', JSON.stringify(userList))
  }, [userList])

  useEffect(() => {
    localStorage.setItem('portfolia_projects', JSON.stringify(projectsList))
  }, [projectsList])

  useEffect(() => {
    localStorage.setItem('portfolia_internships', JSON.stringify(internshipsList))
  }, [internshipsList])

  useEffect(() => {
    localStorage.setItem('portfolia_courses', JSON.stringify(coursesList))
  }, [coursesList])

  useEffect(() => {
    localStorage.setItem('portfolia_notifications', JSON.stringify(notifications))
  }, [notifications])
  useEffect(() => {
    localStorage.setItem('portfolia_messages', JSON.stringify(messages))
  }, [messages])
  useEffect(() => {
    localStorage.setItem('portfolia_linking_requests', JSON.stringify(linkingRequests))
  }, [linkingRequests])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('portfolia_currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('portfolia_currentUser')
    }
  }, [currentUser])

  // ── Notification helpers ────────────────────────────────
  function addNotification(userId, message) {
    // Check if user has notifications disabled
    const targetUser = userList.find((u) => u.id === userId)
    if (targetUser?.notificationsOff) return

    setNotifications((prev) => {
      const existing = prev[userId] || []
      return {
        ...prev,
        [userId]: [
          { id: String(Date.now()), message, read: false, createdAt: new Date().toISOString() },
          ...existing,
        ],
      }
    })
  }

  function handleMarkNotificationsRead(userId) {
    setNotifications((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).map((n) => ({ ...n, read: true })),
    }))
  }

  function handleClearNotifications(userId) {
    setNotifications((prev) => ({ ...prev, [userId]: [] }))
  }

  // ── Auth ───────────────────────────────────────────────
  function handleLogin(email, password) {
    const found = userList.find(
      (u) => u.email === email && u.password === password
    )
    if (found) {
      if (found.active === false) {
        return { success: false, error: 'Your account has been deactivated. Please contact an admin.' }
      }
      if (found.role === 'employer' && found.approvalStatus === 'pending') {
        return { success: false, error: 'Your account is pending approval by an admin.' }
      }
      if (found.role === 'employer' && found.approvalStatus === 'rejected') {
        return { success: false, error: 'Your account application was rejected.' }
      }
      setCurrentUser(found)
      return { success: true, user: found }
    }
    return { success: false, error: 'Invalid email or password.' }
  }

  function handleRegister(newUser) {
    const id = String(Date.now())
    const user = {
      id,
      ...newUser,
      projects: [],
      applications: [],
      notificationsOff: false,
      approvalStatus: newUser.role === 'employer' ? 'pending' : 'approved',
      courses: newUser.role === 'instructor' ? ['c1'] : [], // Default to Bachelor Project (id: c1)
    }
    setUserList((prev) => [...prev, user])
    if (user.role === 'employer' && user.approvalStatus === 'pending') {
      return { success: true, isPending: true }
    } else {
      setCurrentUser(user)
      return { success: true }
    }
  }

  function handleLogout() {
    setCurrentUser(null)
    toast.success('You have been signed out.')
  }

  function handleUpdateUser(patch) {
    const updated = { ...currentUser, ...patch }
    setCurrentUser(updated)
    setUserList((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u))
    )
  }

  function handleToggleFavorite(type, targetId) {
    const favorites = currentUser?.favorites || { portfolios: [], projects: [] }
    const currentList = favorites[type] || []
    const exists = currentList.includes(targetId)
    const next = exists
      ? currentList.filter((id) => id !== targetId)
      : [...currentList, targetId]
    handleUpdateUser({
      favorites: {
        ...favorites,
        [type]: next,
      },
    })
  }

  // ── Projects ───────────────────────────────────────────
  function handleCreateProject(data) {
    const newProject = {
      id: String(Date.now()),
      ownerId: currentUser.id,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      visibility: data.visibility || 'Public',
      courseId: data.courseId || null,
      github: data.github || null,
      demo: data.demo || null,
      languages: data.languages || [],
      status: 'In Progress',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      collaborators: [],
      milestones: [],
      tasks: [],
      comments: [],
    }
    setProjectsList((prev) => [...prev, newProject])
    handleUpdateUser({
      projects: [...(currentUser.projects || []), newProject.id],
    })
    return newProject
  }

  function handleDeleteProject(projectId) {
    setProjectsList((prev) => prev.filter((p) => p.id !== projectId))
    handleUpdateUser({
      projects: (currentUser.projects || []).filter((id) => id !== projectId),
    })
  }

  function handleUpdateProject(updatedProject) {
    setProjectsList((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    )
  }

  // ── Internships ────────────────────────────────────────
  function handleApplyInternship(internshipId, coverLetter) {
    const internship = internshipsList.find((i) => i.id === internshipId)
    if (!internship) return { success: false, error: 'Not found' }
    const applicants = internship.applicants || []
    if (applicants.includes(currentUser.id)) {
      return { success: false, error: 'Already applied' }
    }

    setInternshipsList((prev) =>
      prev.map((i) =>
        i.id === internshipId
          ? {
              ...i,
              applicants: [...(i.applicants || []), currentUser.id],
              applicantStatuses: {
                ...(i.applicantStatuses || {}),
                [currentUser.id]: 'pending',
                ...(coverLetter ? { [`${currentUser.id}_cover`]: coverLetter } : {}),
              },
            }
          : i
      )
    )

    const updatedApplications = [...(currentUser.applications || []), internshipId]
    handleUpdateUser({ applications: updatedApplications })

    return { success: true }
  }

  function handleCreateInternship(data) {
    const newInternship = {
      id: String(Date.now()),
      ...data,
      employerId: currentUser.id,
      applicants: [],
      applicantStatuses: {},
      postedAt: new Date().toISOString().split('T')[0],
    }
    setInternshipsList((prev) => [...prev, newInternship])
    return newInternship
  }

  function getConversationId(a, b) {
    return [a, b].sort().join('_')
  }

  function handleSendMessage(receiverId, text) {
    if (!currentUser) return
    const conversationId = getConversationId(currentUser.id, receiverId)
    const newMsg = {
      id: String(Date.now()),
      senderId: currentUser.id,
      receiverId,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }))
    addNotification(receiverId, `New message from ${currentUser.name}.`)
  }

  function handleMarkConversationRead(otherUserId) {
    if (!currentUser) return
    const conversationId = getConversationId(currentUser.id, otherUserId)
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((msg) =>
        msg.receiverId === currentUser.id ? { ...msg, read: true } : msg
      ),
    }))
  }

  // Req 88: Employer sets applicant status (pending/nominated/accepted/rejected)
  function handleSetApplicantStatus(internshipId, applicantUserId, status) {
    setInternshipsList((prev) =>
      prev.map((i) =>
        i.id === internshipId
          ? {
              ...i,
              applicantStatuses: {
                ...(i.applicantStatuses || {}),
                [applicantUserId]: status,
              },
            }
          : i
      )
    )

    // Req 89: Notify student when accepted or rejected
    if (status === 'accepted' || status === 'rejected') {
      const internship = internshipsList.find((i) => i.id === internshipId)
      const roleName = internship?.role || 'Internship'
      const company = internship?.company || ''
      const msg =
        status === 'accepted'
          ? `🎉 Congratulations! You have been accepted for "${roleName}" at ${company}.`
          : `Your application for "${roleName}" at ${company} was not successful.`
      addNotification(applicantUserId, msg)
    }
  }

  // Admin actions ───────────────────────────────────────
  function handleAdminDeleteUser(userId) {
    setUserList((prev) => prev.filter((u) => u.id !== userId))
    setProjectsList((prev) => prev.filter((p) => p.ownerId !== userId))
  }

  function handleAdminCreateUser(userData) {
    const newUser = {
      id: String(Date.now()),
      ...userData,
      projects: [],
      applications: [],
      notificationsOff: false,
      approvalStatus: 'approved',
      courses: userData.role === 'instructor' ? ['c1'] : [],
    }
    setUserList((prev) => [...prev, newUser])
    return newUser
  }

  function handleAdminUpdateUser(updatedUser) {
    setUserList((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    )
  }

  function handleAdminDeleteProject(projectId) {
    setProjectsList((prev) => prev.filter((p) => p.id !== projectId))
  }

  function handleAdminDeleteInternship(internshipId) {
    setInternshipsList((prev) => prev.filter((i) => i.id !== internshipId))
  }

  function handleUpdateInternship(updatedInternship) {
    setInternshipsList((prev) =>
      prev.map((i) => (i.id === updatedInternship.id ? updatedInternship : i))
    )
  }

  function handleEmployerDeleteInternship(internshipId) {
    setInternshipsList((prev) => prev.filter((i) => i.id !== internshipId))
  }

  function handleAdminCreateCourse(c) {
    setCoursesList((prev) => [...prev, c])
  }
  function handleAdminUpdateCourse(c) {
    setCoursesList((prev) => prev.map((item) => (item.id === c.id ? c : item)))
  }
  function handleAdminDeleteCourse(id) {
    setCoursesList((prev) => prev.filter((c) => c.id !== id))
    // Also remove this course from all users
    setUserList((prev) => prev.map(u => ({
      ...u,
      courses: (u.courses || []).filter(cid => cid !== id)
    })))
  }

  function handleRequestCourseLink(req) {
    // req = { id, instructorId, courseId, type: 'link' | 'unlink', createdAt }
    setLinkingRequests((prev) => [...prev, req])
    
    // Notify admin
    const admins = userList.filter((u) => u.role === 'admin')
    admins.forEach((admin) => {
      addNotification(admin.id, `New course ${req.type} request from instructor.`)
    })
  }

  function handleAdminResolveLinkRequest(reqId, action) {
    const req = linkingRequests.find(r => r.id === reqId)
    if (!req) return

    if (action === 'accept') {
      setUserList(prev => prev.map(u => {
        if (u.id === req.instructorId) {
          const courses = u.courses || []
          let newCourses = []
          if (req.type === 'link') {
            newCourses = [...new Set([...courses, req.courseId])]
          } else {
            newCourses = courses.filter(id => id !== req.courseId)
          }
          if (currentUser && currentUser.id === u.id) {
            setCurrentUser({ ...u, courses: newCourses })
          }
          return { ...u, courses: newCourses }
        }
        return u
      }))
    }

    setLinkingRequests(prev => prev.filter(r => r.id !== reqId))
  }

  function handleFlagProject(projectId, reason) {
    setProjectsList(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, flagged: true, flagReason: reason, flagStatus: 'pending', appeal: null }
        : p
    ))
    const project = projectsList.find(p => p.id === projectId)
    if (project) addNotification('4', `Project "${project.title}" was flagged for review.`)
  }

  function handleAdminResolveFlag(projectId, action) {
    setProjectsList(prev => prev.map(p => {
      if (p.id !== projectId) return p
      if (action === 'hide') {
        const owner = userList.find(u => u.id === p.ownerId)
        if (owner) addNotification(owner.id, `Your project "${p.title}" has been hidden after review.`)
        return { ...p, adminHidden: true, flagged: false, flagStatus: 'accepted' }
      }
      // dismiss flag
      return { ...p, flagged: false, flagStatus: 'dismissed', flagReason: null }
    }))
  }

  function handleAppealFlag(projectId, message) {
    setProjectsList(prev => prev.map(p =>
      p.id === projectId ? { ...p, appeal: message, flagStatus: 'appealed' } : p
    ))
    addNotification('4', `Student appealed flag on project "${projectsList.find(p => p.id === projectId)?.title}".`)
  }

  // ── Current user's notifications ───────────────────────
  const myNotifications = currentUser ? (notifications[currentUser.id] || []) : []
  const defaultPath = currentUser ? getRoleDashboardPath(currentUser.role) : '/login'
  const currentBase = currentUser ? getRoleBasePath(currentUser.role) : '/student'

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing currentUser={currentUser} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} currentUser={currentUser} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} currentUser={currentUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword userList={userList} />} />
        {currentUser && (
          <>
            <Route path="/dashboard" element={<Navigate to={defaultPath} replace />} />
            <Route path="/projects" element={<Navigate to={`${currentBase}/projects`} replace />} />
            <Route path="/projects/:id" element={<ProjectDetails currentUser={currentUser} onLogout={handleLogout} projects={projectsList} userList={userList} onUpdateProject={handleUpdateProject} onAddNotification={addNotification} courses={coursesList} />} />
            <Route path="/internships" element={<Navigate to={`${currentBase}/internships`} replace />} />
            <Route path="/profile" element={<Navigate to={`${currentBase}/profile`} replace />} />

            <Route path="/student/dashboard" element={currentUser.role === 'student' ? <Dashboard currentUser={currentUser} onLogout={handleLogout} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} userList={userList} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/student/projects" element={currentUser.role === 'student' ? <Projects currentUser={currentUser} onLogout={handleLogout} projects={projectsList} onCreateProject={handleCreateProject} onDeleteProject={handleDeleteProject} courses={coursesList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} userList={userList} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/student/projects/:id" element={currentUser.role === 'student' ? <ProjectDetails currentUser={currentUser} onLogout={handleLogout} projects={projectsList} userList={userList} onUpdateProject={handleUpdateProject} onAddNotification={addNotification} courses={coursesList} onFlagProject={handleFlagProject} onAppealFlag={handleAppealFlag} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/student/internships" element={currentUser.role === 'student' ? <Internships currentUser={currentUser} onLogout={handleLogout} internships={internshipsList} userList={userList} onApply={handleApplyInternship} onCreateInternship={handleCreateInternship} onSetApplicantStatus={handleSetApplicantStatus} onUpdateInternship={handleUpdateInternship} onDeleteInternship={handleEmployerDeleteInternship} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/student/portfolios" element={currentUser.role === 'student' ? <Portfolios currentUser={currentUser} onLogout={handleLogout} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onToggleFavorite={handleToggleFavorite} userList={userList} projects={projectsList} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/student/messages" element={currentUser.role === 'student' ? <Messages currentUser={currentUser} onLogout={handleLogout} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} userList={userList} messages={messages} onSendMessage={handleSendMessage} onMarkConversationRead={handleMarkConversationRead} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/student/profile" element={currentUser.role === 'student' ? <Profile currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onClearNotifications={() => handleClearNotifications(currentUser.id)} userList={userList} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/student/notifications" element={currentUser.role === 'student' ? <Profile currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onClearNotifications={() => handleClearNotifications(currentUser.id)} userList={userList} /> : <Navigate to={defaultPath} replace />} />

            <Route path="/employer/dashboard" element={currentUser.role === 'employer' ? <Dashboard currentUser={currentUser} onLogout={handleLogout} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} userList={userList} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/employer/internships" element={currentUser.role === 'employer' ? <Internships currentUser={currentUser} onLogout={handleLogout} internships={internshipsList} userList={userList} onApply={handleApplyInternship} onCreateInternship={handleCreateInternship} onSetApplicantStatus={handleSetApplicantStatus} onUpdateInternship={handleUpdateInternship} onDeleteInternship={handleEmployerDeleteInternship} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/employer/portfolios" element={currentUser.role === 'employer' ? <Portfolios currentUser={currentUser} onLogout={handleLogout} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onToggleFavorite={handleToggleFavorite} userList={userList} projects={projectsList} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/employer/messages" element={currentUser.role === 'employer' ? <Messages currentUser={currentUser} onLogout={handleLogout} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} userList={userList} messages={messages} onSendMessage={handleSendMessage} onMarkConversationRead={handleMarkConversationRead} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/employer/profile" element={currentUser.role === 'employer' ? <Profile currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onClearNotifications={() => handleClearNotifications(currentUser.id)} userList={userList} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/employer/notifications" element={currentUser.role === 'employer' ? <Profile currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onClearNotifications={() => handleClearNotifications(currentUser.id)} userList={userList} /> : <Navigate to={defaultPath} replace />} />

            <Route path="/instructor/dashboard" element={currentUser.role === 'instructor' ? <Dashboard currentUser={currentUser} onLogout={handleLogout} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onUpdateProject={handleUpdateProject} userList={userList} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/instructor/courses" element={currentUser.role === 'instructor' ? <InstructorCourses currentUser={currentUser} onLogout={handleLogout} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} courses={coursesList} onRequestCourseLink={handleRequestCourseLink} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/instructor/portfolios" element={currentUser.role === 'instructor' ? <Portfolios currentUser={currentUser} onLogout={handleLogout} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onToggleFavorite={handleToggleFavorite} userList={userList} projects={projectsList} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/instructor/internships" element={currentUser.role === 'instructor' ? <Internships currentUser={currentUser} onLogout={handleLogout} internships={internshipsList} userList={userList} onApply={handleApplyInternship} onCreateInternship={handleCreateInternship} onSetApplicantStatus={handleSetApplicantStatus} onUpdateInternship={handleUpdateInternship} onDeleteInternship={handleEmployerDeleteInternship} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/instructor/messages" element={currentUser.role === 'instructor' ? <Messages currentUser={currentUser} onLogout={handleLogout} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} userList={userList} messages={messages} onSendMessage={handleSendMessage} onMarkConversationRead={handleMarkConversationRead} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/instructor/profile" element={currentUser.role === 'instructor' ? <Profile currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onClearNotifications={() => handleClearNotifications(currentUser.id)} courses={coursesList} onRequestCourseLink={handleRequestCourseLink} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/instructor/notifications" element={currentUser.role === 'instructor' ? <Profile currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onClearNotifications={() => handleClearNotifications(currentUser.id)} courses={coursesList} onRequestCourseLink={handleRequestCourseLink} /> : <Navigate to={defaultPath} replace />} />

            <Route path="/admin/dashboard" element={currentUser.role === 'admin' ? <Admin currentUser={currentUser} onLogout={handleLogout} userList={userList} projects={projectsList} internships={internshipsList} onDeleteUser={handleAdminDeleteUser} onUpdateUser={handleAdminUpdateUser} onDeleteProject={handleAdminDeleteProject} onDeleteInternship={handleAdminDeleteInternship} courses={coursesList} onCreateCourse={handleAdminCreateCourse} onUpdateCourse={handleAdminUpdateCourse} onDeleteCourse={handleAdminDeleteCourse} linkingRequests={linkingRequests} onResolveLinkRequest={handleAdminResolveLinkRequest} onUpdateProject={handleUpdateProject} onCreateAdminUser={handleAdminCreateUser} onResolveFlag={handleAdminResolveFlag} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/admin/users" element={currentUser.role === 'admin' ? <Admin currentUser={currentUser} onLogout={handleLogout} userList={userList} projects={projectsList} internships={internshipsList} onDeleteUser={handleAdminDeleteUser} onUpdateUser={handleAdminUpdateUser} onDeleteProject={handleAdminDeleteProject} onDeleteInternship={handleAdminDeleteInternship} courses={coursesList} onCreateCourse={handleAdminCreateCourse} onUpdateCourse={handleAdminUpdateCourse} onDeleteCourse={handleAdminDeleteCourse} linkingRequests={linkingRequests} onResolveLinkRequest={handleAdminResolveLinkRequest} onUpdateProject={handleUpdateProject} onCreateAdminUser={handleAdminCreateUser} onResolveFlag={handleAdminResolveFlag} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/admin/employers-approval" element={currentUser.role === 'admin' ? <Admin currentUser={currentUser} onLogout={handleLogout} userList={userList} projects={projectsList} internships={internshipsList} onDeleteUser={handleAdminDeleteUser} onUpdateUser={handleAdminUpdateUser} onDeleteProject={handleAdminDeleteProject} onDeleteInternship={handleAdminDeleteInternship} courses={coursesList} onCreateCourse={handleAdminCreateCourse} onUpdateCourse={handleAdminUpdateCourse} onDeleteCourse={handleAdminDeleteCourse} linkingRequests={linkingRequests} onResolveLinkRequest={handleAdminResolveLinkRequest} onUpdateProject={handleUpdateProject} onCreateAdminUser={handleAdminCreateUser} onResolveFlag={handleAdminResolveFlag} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/admin/courses" element={currentUser.role === 'admin' ? <Admin currentUser={currentUser} onLogout={handleLogout} userList={userList} projects={projectsList} internships={internshipsList} onDeleteUser={handleAdminDeleteUser} onUpdateUser={handleAdminUpdateUser} onDeleteProject={handleAdminDeleteProject} onDeleteInternship={handleAdminDeleteInternship} courses={coursesList} onCreateCourse={handleAdminCreateCourse} onUpdateCourse={handleAdminUpdateCourse} onDeleteCourse={handleAdminDeleteCourse} linkingRequests={linkingRequests} onResolveLinkRequest={handleAdminResolveLinkRequest} onUpdateProject={handleUpdateProject} onCreateAdminUser={handleAdminCreateUser} onResolveFlag={handleAdminResolveFlag} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/admin/course-requests" element={currentUser.role === 'admin' ? <Admin currentUser={currentUser} onLogout={handleLogout} userList={userList} projects={projectsList} internships={internshipsList} onDeleteUser={handleAdminDeleteUser} onUpdateUser={handleAdminUpdateUser} onDeleteProject={handleAdminDeleteProject} onDeleteInternship={handleAdminDeleteInternship} courses={coursesList} onCreateCourse={handleAdminCreateCourse} onUpdateCourse={handleAdminUpdateCourse} onDeleteCourse={handleAdminDeleteCourse} linkingRequests={linkingRequests} onResolveLinkRequest={handleAdminResolveLinkRequest} onUpdateProject={handleUpdateProject} onCreateAdminUser={handleAdminCreateUser} onResolveFlag={handleAdminResolveFlag} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/admin/projects-moderation" element={currentUser.role === 'admin' ? <Admin currentUser={currentUser} onLogout={handleLogout} userList={userList} projects={projectsList} internships={internshipsList} onDeleteUser={handleAdminDeleteUser} onUpdateUser={handleAdminUpdateUser} onDeleteProject={handleAdminDeleteProject} onDeleteInternship={handleAdminDeleteInternship} courses={coursesList} onCreateCourse={handleAdminCreateCourse} onUpdateCourse={handleAdminUpdateCourse} onDeleteCourse={handleAdminDeleteCourse} linkingRequests={linkingRequests} onResolveLinkRequest={handleAdminResolveLinkRequest} onUpdateProject={handleUpdateProject} onCreateAdminUser={handleAdminCreateUser} onResolveFlag={handleAdminResolveFlag} /> : <Navigate to={defaultPath} replace />} />
            <Route path="/admin/notifications" element={currentUser.role === 'admin' ? <Profile currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} projects={projectsList} internships={internshipsList} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onClearNotifications={() => handleClearNotifications(currentUser.id)} /> : <Navigate to={defaultPath} replace />} />

            <Route path="/portfolio/:userId" element={<PortfolioView currentUser={currentUser} onLogout={handleLogout} notifications={myNotifications} onMarkRead={() => handleMarkNotificationsRead(currentUser.id)} onToggleFavorite={handleToggleFavorite} userList={userList} projects={projectsList} />} />
          </>
        )}

        <Route path="*" element={<Navigate to={currentUser ? defaultPath : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

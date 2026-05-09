export function getRoleBasePath(role) {
  if (role === 'employer') return '/employer'
  if (role === 'instructor') return '/instructor'
  if (role === 'admin') return '/admin'
  return '/student'
}

export function getRoleDashboardPath(role) {
  return `${getRoleBasePath(role)}/dashboard`
}

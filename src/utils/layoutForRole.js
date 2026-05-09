import StudentLayout from '../components/StudentLayout'
import EmployerLayout from '../components/EmployerLayout'
import InstructorLayout from '../components/InstructorLayout'
import AdminLayout from '../components/AdminLayout'

export function getLayoutForRole(role) {
  if (role === 'employer') return EmployerLayout
  if (role === 'instructor') return InstructorLayout
  if (role === 'admin') return AdminLayout
  return StudentLayout
}

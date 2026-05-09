import AppLayout from './AppLayout'
import InstructorSidebar from './InstructorSidebar'

export default function InstructorLayout(props) {
  return <AppLayout {...props} SidebarComponent={InstructorSidebar} />
}

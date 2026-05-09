import AppLayout from './AppLayout'
import StudentSidebar from './StudentSidebar'

export default function StudentLayout(props) {
  return <AppLayout {...props} SidebarComponent={StudentSidebar} />
}

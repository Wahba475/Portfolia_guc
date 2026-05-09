import AppLayout from './AppLayout'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout(props) {
  return <AppLayout {...props} SidebarComponent={AdminSidebar} />
}

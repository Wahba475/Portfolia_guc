import AppLayout from './AppLayout'
import EmployerSidebar from './EmployerSidebar'

export default function EmployerLayout(props) {
  return <AppLayout {...props} SidebarComponent={EmployerSidebar} />
}

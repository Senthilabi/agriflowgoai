import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BookOpen,
  LogOut,
  Wheat,
  Settings,
  CreditCard,
} from 'lucide-react';
import { UserRole } from '@/types/domain';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['ADMIN', 'PRODUCER', 'PROCESSOR', 'LOGISTICS', 'RETAILER'] },
  { label: 'Orders', path: '/orders', icon: <ShoppingCart className="h-4 w-4" />, roles: ['ADMIN', 'PRODUCER', 'PROCESSOR', 'LOGISTICS', 'RETAILER'] },
  { label: 'Actors', path: '/actors', icon: <Users className="h-4 w-4" />, roles: ['ADMIN'] },
  { label: 'Ledger', path: '/ledger', icon: <CreditCard className="h-4 w-4" />, roles: ['ADMIN'] },
  { label: 'Products', path: '/products', icon: <Wheat className="h-4 w-4" />, roles: ['ADMIN'] },
  { label: 'Audit Log', path: '/audit', icon: <BookOpen className="h-4 w-4" />, roles: ['ADMIN'] },
  { label: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4" />, roles: ['ADMIN'] },
];

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md gradient-accent flex items-center justify-center">
            <Wheat className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-display text-sidebar-accent-foreground">AgriFlow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNav.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-accent-foreground">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-sidebar-accent-foreground">{user.name}</div>
            <div className="text-xs text-sidebar-foreground/50">{user.role}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;

import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Receipt, 
  Mail, 
  Calendar,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigationItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Payment Receipts', href: '/admin/receipts', icon: Receipt },
  { name: 'Email Management', href: '/admin/emails', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  return (
    <nav className="space-y-1 p-4">
      {navigationItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};

const AdminSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="py-4">
              <h2 className="px-4 text-lg font-semibold mb-4">Navigation</h2>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-card">
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;

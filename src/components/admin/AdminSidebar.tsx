import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Receipt, 
  Mail, 
  Calendar,
  Tag,
  Menu,
  X,
  Megaphone
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigationItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Discount Codes', href: '/admin/discounts', icon: Tag },
  { name: 'Payment Receipts', href: '/admin/receipts', icon: Receipt },
  { name: 'Email Campaigns', href: '/admin/campaigns', icon: Megaphone },
  { name: 'Email Management', href: '/admin/emails', icon: Mail },
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
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Admin Menu</h2>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
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

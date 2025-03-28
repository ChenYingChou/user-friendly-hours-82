
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Clock, 
  BarChart, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Home,
  PlusCircle,
  CalendarDays,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarLinks = [
    {
      to: "/dashboard",
      icon: <Home size={20} />,
      label: "Dashboard",
      show: true,
    },
    {
      to: "/time-entry",
      icon: <PlusCircle size={20} />,
      label: "Add Time Entry",
      show: true,
    },
    {
      to: "/my-entries",
      icon: <CalendarDays size={20} />,
      label: "My Time Entries",
      show: true,
    },
    {
      to: "/analysis",
      icon: <BarChart size={20} />,
      label: "Time Analysis",
      show: true,
    },
    {
      to: "/admin",
      icon: <Users size={20} />,
      label: "Admin Panel",
      show: isAdmin,
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">時間追蹤系統</h1>
        </div>
        <div className="text-sm text-muted-foreground">工時輸入與分析</div>
      </div>
      
      <div className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {sidebarLinks
            .filter((link) => link.show)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={() => setOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
        </nav>
      </div>
      
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-muted flex items-center justify-center h-9 w-9 rounded-full">
            <User size={16} />
          </div>
          <div>
            <div className="font-medium text-sm">{user?.name}</div>
            <div className="text-xs text-muted-foreground">
              {user?.role === "admin" ? "Administrator" : "User"}
            </div>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="hidden md:block w-64 border-r bg-background">
          <SidebarContent />
        </div>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden absolute top-4 left-4 z-50"
            >
              <Menu />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="app-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

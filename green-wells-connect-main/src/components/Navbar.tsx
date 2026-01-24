import { Link, useLocation } from "react-router-dom";
import { Home, Package, MapPin, Shield, LayoutDashboard, Truck, Warehouse, Sparkles, HeadphonesIcon, MessageSquare } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

const Navbar = () => {
  const location = useLocation();
  
  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/order", icon: Package, label: "Order" },
    { to: "/tracking", icon: MapPin, label: "Track" },
    { to: "/youth-hub", icon: Sparkles, label: "Youth Hub" },
    { to: "/support", icon: HeadphonesIcon, label: "Support" },
    { to: "/feedback", icon: MessageSquare, label: "Feedback" },
    { to: "/safety", icon: Shield, label: "Safety" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex justify-around md:justify-start md:gap-8 flex-1">
            {links.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs md:text-sm font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
          <div className="hidden md:block">
            <NotificationCenter />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { LayoutDashboard, List, PieChart, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/subscriptions", label: "Subs", icon: List },
  { to: "/budget", label: "Budget", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `bottom-nav__link${isActive ? " bottom-nav__link--active" : ""}`
          }
        >
          <Icon size={20} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
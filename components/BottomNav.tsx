"use client";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Home, Package, Plus, ClipboardList, User } from "lucide-react";

const NAV = [
  { href: "/dashboard",  icon: Home,          label: "Accueil" },
  { href: "/requests",   icon: ClipboardList, label: "Demandes" },
  { href: "/request",    icon: Plus,          label: "Nouveau",  primary: true },
  { href: "/track",      icon: Package,       label: "Suivre" },
  { href: "/profile",    icon: User,          label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb z-40">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon   = item.icon;
          if (item.primary) return (
            <button key={item.href} onClick={() => router.push(item.href)}
              className="flex flex-col items-center -mt-5">
              <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-medium">{item.label}</span>
            </button>
          );
          return (
            <button key={item.href} onClick={() => router.push(item.href)}
              className="flex flex-col items-center py-2 px-3 flex-1">
              <Icon className={`w-5 h-5 ${active ? "text-orange-500" : "text-slate-400"}`} />
              <span className={`text-[10px] mt-0.5 font-medium ${active ? "text-orange-500" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

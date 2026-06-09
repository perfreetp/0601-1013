import { NavLink } from 'react-router-dom';
import {
  Images,
  Scissors,
  Layers,
  CalendarClock,
  FileCheck,
  ChartBar,
  Users,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/format';
import Badge from '@/components/ui/Badge';

const navItems = [
  { to: '/materials', label: '素材库', icon: Images },
  { to: '/editor', label: '剪辑器', icon: Scissors },
  { to: '/templates', label: '模板', icon: Layers },
  { to: '/schedule', label: '排期', icon: CalendarClock },
  { to: '/reviews', label: '审核', icon: FileCheck },
  { to: '/analytics', label: '数据', icon: ChartBar },
  { to: '/members', label: '成员', icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 h-screen bg-gradient-to-b from-primary-800 to-primary-700 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">社团招新平台</h1>
            <p className="text-xs text-white/60">Club Recruitment</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200',
                  isActive && 'bg-white/15 text-white shadow-lg shadow-black/10'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
            alt="用户头像"
            className="w-10 h-10 rounded-full bg-white/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">张明</p>
            <div className="flex items-center gap-1.5">
              <Badge variant="accent">管理员</Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

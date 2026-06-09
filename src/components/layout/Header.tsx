import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Search, Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { cn } from '@/utils/format';

const breadcrumbMap: Record<string, string> = {
  '/': '首页',
  '/materials': '素材库',
  '/editor': '剪辑器',
  '/templates': '模板',
  '/schedule': '排期',
  '/reviews': '审核',
  '/analytics': '数据',
  '/members': '成员',
};

export default function Header() {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getBreadcrumbs = () => {
    const pathname = location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; path: string }[] = [
      { label: '首页', path: '/' },
    ];

    let currentPath = '';
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = breadcrumbMap[currentPath] || segment;
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between px-6">
      <nav className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-neutral-400" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-neutral-800">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-sm text-neutral-500 hover:text-primary-600 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索..."
            className="pl-10 pr-4 py-2 w-64 rounded-lg bg-neutral-100 border border-transparent text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-primary-300 transition-all"
          />
        </div>

        <button
          type="button"
          className="relative w-10 h-10 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
              alt="用户头像"
              className="w-8 h-8 rounded-full bg-neutral-200"
            />
            <ChevronDown
              className={cn(
                'w-4 h-4 text-neutral-500 transition-transform',
                showUserMenu && 'rotate-180'
              )}
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-card border border-neutral-100 overflow-hidden z-50 animate-fade-in">
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <User className="w-4 h-4" />
                个人中心
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                账户设置
              </button>
              <div className="border-t border-neutral-100" />
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

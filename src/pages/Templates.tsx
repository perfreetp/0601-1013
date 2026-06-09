import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Play, Users } from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useTemplateStore } from '@/store/useTemplateStore';
import { cn, formatNumber } from '@/utils/format';
import type { TemplateCategory } from '@/types';

const categoryTabs = [
  { value: 'all', label: '全部' },
  { value: 'intro', label: '社团介绍' },
  { value: 'review', label: '活动回顾' },
  { value: 'signup', label: '报名引导' },
];

export default function Templates() {
  const navigate = useNavigate();
  const { templates, selectedCategory, setCategory, applyTemplate } = useTemplateStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.style.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const handleApplyTemplate = (template: typeof templates[number]) => {
    applyTemplate(template);
    showToast(`已套用模板「${template.name}」`);
    setTimeout(() => navigate('/editor'), 800);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value as TemplateCategory | 'all');
  };

  const getCategoryBadgeVariant = (category: TemplateCategory) => {
    switch (category) {
      case 'intro':
        return 'primary' as const;
      case 'review':
        return 'accent' as const;
      case 'signup':
        return 'success' as const;
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="section-title">模板中心</h1>
            <p className="section-subtitle">快速套用精美模板，高效制作招新视频</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索模板名称或风格..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-72"
            />
          </div>
        </div>

        <Tabs value={selectedCategory} onChange={handleCategoryChange} items={categoryTabs} className="mb-6" />

        <div className="flex-1 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">没有找到匹配的模板</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  hover
                  className="overflow-hidden group"
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className={cn(
                        'w-full h-full object-cover transition-transform duration-500',
                        hoveredTemplate === template.id && 'scale-110'
                      )}
                    />
                    <div
                      className={cn(
                        'absolute inset-0 bg-black/60 flex items-center justify-center gap-3 transition-opacity duration-300',
                        hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white hover:border-white/50"
                      >
                        预览
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        icon={<Play className="w-4 h-4" />}
                        onClick={() => handleApplyTemplate(template)}
                      >
                        套用
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-neutral-800 line-clamp-1">{template.name}</h3>
                      <Badge variant={getCategoryBadgeVariant(template.category)}>
                        {template.style}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{formatNumber(template.usageCount)} 次使用</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div
          className={cn(
            'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
            toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          <div className="bg-neutral-800 text-white px-6 py-3 rounded-xl shadow-lg text-sm">
            {toast.message}
          </div>
        </div>
    </div>
  );
}

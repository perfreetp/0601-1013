import { useState, useMemo } from 'react';
import {
  Search,
  Grid3X3,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react';
import MaterialUploader from '@/components/features/MaterialUploader';
import MaterialCard from '@/components/features/MaterialCard';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useMaterialStore } from '@/store/useMaterialStore';
import { MATERIAL_TYPE_LABELS } from '@/utils/constants';
import { cn } from '@/utils/format';
import type { Material, MaterialType } from '@/types';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: '最新上传' },
  { value: 'createdAt-asc', label: '最早上传' },
  { value: 'name-asc', label: '名称 A-Z' },
  { value: 'name-desc', label: '名称 Z-A' },
  { value: 'size-desc', label: '文件大小' },
];

const TAB_ITEMS: { value: 'all' | MaterialType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'video', label: MATERIAL_TYPE_LABELS.video },
  { value: 'image', label: MATERIAL_TYPE_LABELS.image },
  { value: 'subtitle', label: MATERIAL_TYPE_LABELS.subtitle },
  { value: 'music', label: MATERIAL_TYPE_LABELS.music },
];

export default function Materials() {
  const {
    materials,
    searchQuery,
    filterType,
    addMaterial,
    setSearch,
    setFilter,
    deleteMaterial,
  } = useMaterialStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredMaterials = useMemo(() => {
    let result = [...materials];

    if (filterType !== 'all') {
      result = result.filter((m) => m.type === filterType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      let cmp = 0;
      if (field === 'name') {
        cmp = a.name.localeCompare(b.name, 'zh-CN');
      } else if (field === 'size') {
        cmp = a.size - b.size;
      } else {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return order === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [materials, filterType, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedMaterials = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredMaterials.slice(start, start + PAGE_SIZE);
  }, [filteredMaterials, safeCurrentPage]);

  const handleSelect = (material: Material) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(material.id)) {
        next.delete(material.id);
      } else {
        next.add(material.id);
      }
      return next;
    });
  };

  const handleDelete = (material: Material) => {
    deleteMaterial(material.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(material.id);
      return next;
    });
  };

  const handlePreview = (material: Material) => {
    console.log('Preview material:', material);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || SORT_OPTIONS[0].label;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="section-title">素材库</h1>
            <p className="section-subtitle">管理您的视频、图片、字幕和音乐素材</p>
          </div>
          <Button icon={<Upload className="w-4 h-4" />}>上传素材</Button>
        </div>

        <Card className="animate-slide-up">
          <CardContent>
            <MaterialUploader onMaterialCreated={(m) => addMaterial(m)} />
          </CardContent>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 lg:max-w-md">
              <Tabs
                value={filterType}
                onChange={(v) => {
                  setFilter(v as 'all' | MaterialType);
                  setCurrentPage(1);
                }}
                items={TAB_ITEMS.map((t) => ({ value: t.value, label: t.label }))}
              />
            </div>

            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="搜索素材名称或标签..."
                  className="input pl-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ChevronDown className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => setSortDropdownOpen((v) => !v)}
                >
                  {currentSortLabel}
                </Button>
                {sortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-card border border-neutral-100 py-1 z-10 animate-slide-up">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2 text-sm transition-colors',
                          sortBy === opt.value
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-neutral-600 hover:bg-neutral-50'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center p-1 rounded-lg bg-neutral-100">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-all',
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-all',
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <CardContent>
            {filteredMaterials.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-base font-semibold text-neutral-800 mb-1">
                  暂无素材
                </h3>
                <p className="text-sm text-neutral-500 max-w-xs">
                  {searchQuery || filterType !== 'all'
                    ? '没有找到匹配的素材，试试调整筛选条件或搜索关键词'
                    : '上传您的第一个素材开始创作吧'}
                </p>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    'grid gap-4',
                    viewMode === 'grid' &&
                      'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
                    viewMode === 'list' && 'grid-cols-1'
                  )}
                >
                  {paginatedMaterials.map((material, index) => (
                    <div
                      key={material.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <MaterialCard
                        material={material}
                        selected={selectedIds.has(material.id)}
                        onSelect={handleSelect}
                        onPreview={handlePreview}
                        onDelete={handleDelete}
                        className={viewMode === 'list' ? 'flex flex-row' : ''}
                      />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                    <span className="text-sm text-neutral-500">
                      共 {filteredMaterials.length} 个素材，第 {safeCurrentPage} /{' '}
                      {totalPages} 页
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={safeCurrentPage === 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors',
                              page === safeCurrentPage
                                ? 'bg-gradient-primary text-white shadow-sm'
                                : 'text-neutral-600 hover:bg-neutral-100'
                            )}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={safeCurrentPage === totalPages}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

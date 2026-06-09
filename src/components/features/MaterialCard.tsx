import { useState } from 'react';
import { Eye, Trash2, Play, FileVideo, Image, FileText, Music } from 'lucide-react';
import { cn, formatDuration, formatFileSize } from '@/utils/format';
import type { Material, MaterialType } from '@/types';
import { MATERIAL_TYPE_LABELS, MATERIAL_TYPE_COLORS } from '@/utils/constants';

interface MaterialCardProps {
  material: Material;
  selected?: boolean;
  onSelect?: (material: Material) => void;
  onPreview?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  className?: string;
}

const ICON_MAP: Record<MaterialType, typeof FileVideo> = {
  video: FileVideo,
  image: Image,
  subtitle: FileText,
  music: Music,
};

export default function MaterialCard({
  material,
  selected = false,
  onSelect,
  onPreview,
  onDelete,
  className,
}: MaterialCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = ICON_MAP[material.type];

  const handleClick = () => {
    onSelect?.(material);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(material);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(material);
  };

  const getMetaText = () => {
    if (material.type === 'video' || material.type === 'music') {
      return material.duration ? formatDuration(material.duration) : formatFileSize(material.size);
    }
    return formatFileSize(material.size);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-white',
        'border-2 shadow-card hover:shadow-card-hover hover:-translate-y-1',
        selected
          ? 'border-primary-500 shadow-glow-primary'
          : 'border-neutral-100 hover:border-primary-300',
        className
      )}
    >
      <div className="relative aspect-video bg-neutral-100 overflow-hidden">
        {material.cover ? (
          <img
            src={material.cover}
            alt={material.name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500',
              isHovered && 'scale-110'
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center',
                MATERIAL_TYPE_COLORS[material.type]
              )}
            >
              <Icon className="w-8 h-8" />
            </div>
          </div>
        )}

        {(material.type === 'video' || material.type === 'music') && (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
              <Play className="w-3 h-3 fill-current" />
              {material.duration ? formatDuration(material.duration) : '00:00'}
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
              MATERIAL_TYPE_COLORS[material.type]
            )}
          >
            <Icon className="w-3 h-3" />
            {MATERIAL_TYPE_LABELS[material.type]}
          </span>
        </div>

        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        <div
          className={cn(
            'absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            onClick={handlePreview}
            className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-neutral-800 hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="w-12 h-12 rounded-full bg-danger-500/90 flex items-center justify-center text-white hover:bg-danger-500 hover:scale-110 transition-all duration-200 shadow-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-sm font-semibold text-neutral-800 truncate mb-2" title={material.name}>
          {material.name}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">{getMetaText()}</span>
          <div className="flex items-center gap-1">
            {material.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600"
              >
                {tag}
              </span>
            ))}
            {material.tags.length > 2 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                +{material.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

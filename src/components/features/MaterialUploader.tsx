import { useState, useRef, useCallback } from 'react';
import { Upload, FileVideo, Image, FileText, Music, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '@/utils/format';
import type { Material, MaterialType } from '@/types';
import { MATERIAL_TYPE_LABELS, MATERIAL_TYPE_COLORS } from '@/utils/constants';

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  type: MaterialType;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface MaterialUploaderProps {
  className?: string;
  acceptedTypes?: MaterialType[];
  onUploadComplete?: (files: UploadingFile[]) => void;
  onUploadError?: (file: UploadingFile) => void;
  onMaterialCreated?: (material: Material) => void;
}

const ACCEPT_MAP: Record<MaterialType, string> = {
  video: 'video/*',
  image: 'image/*',
  subtitle: '.srt,.vtt,.ass',
  music: 'audio/*',
};

const ICON_MAP: Record<MaterialType, typeof FileVideo> = {
  video: FileVideo,
  image: Image,
  subtitle: FileText,
  music: Music,
};

function detectFileType(file: File): MaterialType | null {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'music';
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (['srt', 'vtt', 'ass'].includes(ext || '')) return 'subtitle';
  return null;
}

function uploadingFileToMaterial(uploadingFile: UploadingFile): Material {
  const shouldHaveDuration = uploadingFile.type === 'video' || uploadingFile.type === 'music';
  const randomSeed = Math.floor(Math.random() * 1000);
  return {
    id: uploadingFile.id,
    name: uploadingFile.name,
    type: uploadingFile.type,
    url: '',
    size: uploadingFile.size,
    duration: shouldHaveDuration ? Math.floor(Math.random() * 111) + 10 : undefined,
    cover: `https://picsum.photos/seed/${randomSeed}/400/300`,
    tags: [],
    createdAt: new Date().toISOString(),
  };
}

export default function MaterialUploader({
  className,
  acceptedTypes = ['video', 'image', 'subtitle', 'music'],
  onUploadComplete,
  onUploadError,
  onMaterialCreated,
}: MaterialUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedMimeTypes = acceptedTypes.map((t) => ACCEPT_MAP[t]).join(',');

  const simulateUpload = useCallback(
    (file: File, detectedType: MaterialType) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const uploadingFile: UploadingFile = {
        id,
        name: file.name,
        size: file.size,
        type: detectedType,
        progress: 0,
        status: 'uploading',
      };

      setUploadingFiles((prev) => [...prev, uploadingFile]);

      const totalSteps = 10;
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep += 1;
        const progress = Math.min((currentStep / totalSteps) * 100, 100);
        const isSuccess = Math.random() > 0.1;

        setUploadingFiles((prev) =>
          prev.map((f) => {
            if (f.id !== id) return f;
            if (progress >= 100) {
              clearInterval(interval);
              const finalFile: UploadingFile = {
                ...f,
                progress: 100,
                status: isSuccess ? 'success' : 'error',
                errorMessage: isSuccess ? undefined : '上传失败，请重试',
              };
              if (isSuccess) {
                onUploadComplete?.([finalFile]);
                const material = uploadingFileToMaterial(finalFile);
                onMaterialCreated?.(material);
              } else {
                onUploadError?.(finalFile);
              }
              return finalFile;
            }
            return { ...f, progress };
          })
        );
      }, 200);

      return id;
    },
    [onUploadComplete, onUploadError, onMaterialCreated]
  );

  const handleFiles = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((file) => {
        const detectedType = detectFileType(file);
        if (detectedType && acceptedTypes.includes(detectedType)) {
          simulateUpload(file, detectedType);
        }
      });
    },
    [acceptedTypes, simulateUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
        e.target.value = '';
      }
    },
    [handleFiles]
  );

  const handleRemoveFile = useCallback((id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center py-12 px-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300',
          isDragging
            ? 'border-primary-400 bg-primary-50 scale-[1.01] shadow-glow-primary'
            : 'border-neutral-300 bg-neutral-50 hover:border-primary-300 hover:bg-primary-50/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedMimeTypes}
          onChange={handleInputChange}
          className="hidden"
        />
        <div
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300',
            isDragging
              ? 'bg-gradient-primary text-white shadow-glow-primary'
              : 'bg-primary-100 text-primary-600'
          )}
        >
          <Upload className="w-8 h-8" />
        </div>
        <p className="text-base font-medium text-neutral-800 mb-1">
          {isDragging ? '松开鼠标开始上传' : '点击或拖拽文件到此处上传'}
        </p>
        <p className="text-sm text-neutral-500 mb-4">
          支持 {acceptedTypes.map((t) => MATERIAL_TYPE_LABELS[t]).join('、')} 等格式
        </p>
        <div className="flex items-center gap-2">
          {acceptedTypes.map((type) => {
            const Icon = ICON_MAP[type];
            return (
              <div
                key={type}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
                  MATERIAL_TYPE_COLORS[type]
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {MATERIAL_TYPE_LABELS[type]}
              </div>
            );
          })}
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadingFiles.map((file) => {
            const Icon = ICON_MAP[file.type];
            return (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-neutral-100 shadow-card"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                    MATERIAL_TYPE_COLORS[file.type]
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-neutral-800 truncate">{file.name}</p>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors shrink-0 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-500">{formatFileSize(file.size)}</span>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        file.status === 'success' && 'text-success-600',
                        file.status === 'error' && 'text-danger-600',
                        file.status === 'uploading' && 'text-primary-600'
                      )}
                    >
                      {file.status === 'uploading' && `${Math.round(file.progress)}%`}
                      {file.status === 'success' && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          上传成功
                        </span>
                      )}
                      {file.status === 'error' && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {file.errorMessage || '上传失败'}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        file.status === 'success' && 'bg-success-500',
                        file.status === 'error' && 'bg-danger-500',
                        file.status === 'uploading' && 'bg-gradient-primary'
                      )}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

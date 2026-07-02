import * as React from 'react';
import { Camera, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Div } from './layout';
import { P } from './typography';
import { Spinner } from './spinner';

interface PhotoUploadProps {
  url: string | null;
  isUploading?: boolean;
  disabled?: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  hint?: string;
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-20 h-20',
  lg: 'w-24 h-24',
};

const iconSizeMap = {
  sm: 18,
  md: 22,
  lg: 24,
};

export function PhotoUpload({
  url,
  isUploading = false,
  disabled = false,
  onFileChange,
  inputRef,
  size = 'sm',
  label = 'Upload Photo',
  hint,
}: PhotoUploadProps) {
  const fallbackRef = React.useRef<HTMLInputElement>(null);
  const ref = inputRef ?? fallbackRef;

  return (
    <Div type="row" align="center" gap="md">
      <Div className="relative shrink-0">
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => ref.current?.click()}
          className={cn(
            sizeMap[size],
            'group relative flex items-center justify-center overflow-hidden rounded-xl border bg-muted transition-colors',
            url ? 'border-border' : 'border-dashed border-border hover:border-primary hover:bg-muted/70',
            disabled ? 'cursor-default' : 'cursor-pointer',
          )}
        >
          {url ? (
            <img src={url} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={iconSizeMap[size]} className="text-muted-foreground" />
          )}
          {isUploading && (
            <Div type="row" justify="center" align="center" className="absolute inset-0 bg-black/40">
              <Spinner size="sm" />
            </Div>
          )}
        </button>
        {!disabled && !isUploading && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-card shadow-sm hover:bg-muted"
          >
            <Camera size={12} className="text-foreground" />
          </button>
        )}
      </Div>
      {!disabled && (
        <Div type="col" gap="xs">
          <input
            ref={ref}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFileChange}
          />
          <P className="text-sm font-medium">{url ? 'Photo uploaded' : label}</P>
          <P color="muted" className="text-xs">{hint ?? 'Click the box to upload — JPG, PNG or WebP, max 10MB'}</P>
        </Div>
      )}
    </Div>
  );
}

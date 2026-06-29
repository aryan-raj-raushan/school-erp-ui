"use client";

import React, { useRef, useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  /** Currently saved image URL */
  currentUrl?: string | null;
  /** Called with the selected File; should resolve when upload is done or throw on failure */
  onUpload: (file: File) => Promise<void>;
  shape?: "circle" | "square";
  /** Width & height in px */
  size?: number;
  label?: string;
  className?: string;
  accept?: string;
}

export function ImageUpload({
  currentUrl,
  onUpload,
  shape = "square",
  size = 96,
  label,
  className,
  accept = "image/jpeg,image/png,image/webp",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl ?? currentUrl ?? null;
  const radius = shape === "circle" ? "50%" : 12;

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch {
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        style={{ width: size, height: size, borderRadius: radius }}
        className={cn(
          "relative overflow-hidden border-2 border-dashed border-border",
          "bg-muted flex items-center justify-center",
          "hover:border-primary/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isUploading && "pointer-events-none opacity-70",
        )}
        aria-label={label ?? "Upload image"}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Uploaded"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Upload size={20} className="text-muted-foreground" />
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-1",
            "bg-black/50 opacity-0 hover:opacity-100 transition-opacity",
            displayUrl ? "text-white" : "hidden",
          )}
        >
          <Camera size={18} />
          <span className="text-xs font-medium">Change</span>
        </div>

        {/* Upload spinner */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 size={22} className="animate-spin text-white" />
          </div>
        )}
      </button>

      {label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

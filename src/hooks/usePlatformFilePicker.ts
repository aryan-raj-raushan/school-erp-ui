'use client';

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';

export function usePlatformFilePicker() {
  const isNative = Capacitor.isNativePlatform();

  async function pickImage(): Promise<File | null> {
    if (!isNative) return null;
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      quality: 85,
    });
    if (!photo.dataUrl) return null;
    const blob = await (await fetch(photo.dataUrl)).blob();
    return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
  }

  async function pickDocument(mimeTypes?: string[]): Promise<File | null> {
    if (!isNative) return null;
    const result = await FilePicker.pickFiles({ types: mimeTypes, limit: 1 });
    if (!result.files.length) return null;
    const f = result.files[0];
    if (f.blob) return new File([f.blob], f.name, { type: f.mimeType ?? 'application/octet-stream' });
    return null;
  }

  return { isNative, pickImage, pickDocument };
}

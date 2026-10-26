"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { Modal, ModalBody } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UploadsService } from "@/services/uploads.service";

interface DocumentViewButtonProps {
  link?: string | null;
  fileName?: string | null;
}

export function DocumentViewButton({ link, fileName }: DocumentViewButtonProps) {
  const [preview, setPreview] = useState<{ url: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  if (!link) return null;

  const open = async () => {
    setIsLoading(true);
    try {
      const blob = await UploadsService.fetchFile(link);
      setPreview({ url: URL.createObjectURL(blob), type: blob.type });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not open the document");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => void open()} disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : <Eye />} View
      </Button>
      {preview && (
        <Modal title={fileName ?? "Document"} size="lg" onClose={() => setPreview(null)}>
          <ModalBody>
            {preview.type.startsWith("image/") ? (
              <img src={preview.url} alt={fileName ?? "Document"} className="mx-auto max-h-[75dvh] rounded-lg" />
            ) : (
              <iframe src={preview.url} title={fileName ?? "Document"} className="w-full h-[75dvh] rounded-lg border-0" />
            )}
          </ModalBody>
        </Modal>
      )}
    </>
  );
}

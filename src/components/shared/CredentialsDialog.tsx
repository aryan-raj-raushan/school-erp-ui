"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "./WhatsAppButton";
import { credentialsMessage } from "@/lib/whatsapp";

export interface IssuedCredential {
  name: string;
  loginId: string;
  password: string;
  phone?: string | null;
  dialCode?: string | null;
}

interface CredentialsDialogProps {
  title: string;
  credentials: IssuedCredential[];
  onClose: () => void;
}

export function CredentialsDialog({ title, credentials, onClose }: CredentialsDialogProps) {
  if (!credentials.length) return null;

  const copy = async (c: IssuedCredential) => {
    try {
      await navigator.clipboard.writeText(credentialsMessage(c.name, c.loginId, c.password));
      toast.success("Login details copied");
    } catch {
      toast.error("Could not copy — please note the password manually");
    }
  };

  return (
    <Modal title={title} size="md" onClose={onClose}>
      <ModalBody className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          These temporary passwords are shown only once. Share them now — each user must set a new
          password after the first login.
        </p>
        {credentials.map((c) => (
          <div key={`${c.loginId}-${c.name}`} className="rounded-xl border border-border p-3 flex flex-col gap-2">
            <div className="text-sm font-semibold">{c.name}</div>
            <div className="grid grid-cols-[110px_1fr] gap-y-1 text-sm">
              <span className="text-muted-foreground">Login ID</span>
              <span className="font-mono">{c.loginId}</span>
              <span className="text-muted-foreground">Password</span>
              <span className="font-mono select-all">{c.password}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void copy(c)}>
                <Copy /> Copy
              </Button>
              <WhatsAppButton
                phone={c.phone}
                dialCode={c.dialCode}
                label="Send on WhatsApp"
                message={credentialsMessage(c.name, c.loginId, c.password)}
              />
            </div>
          </div>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button type="button" onClick={onClose}>Done</Button>
      </ModalFooter>
    </Modal>
  );
}

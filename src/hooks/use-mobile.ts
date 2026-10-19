import { useIsMobileSync } from "@/hooks/useIsMobileSync";

export function useIsMobile() {
  return useIsMobileSync();
}

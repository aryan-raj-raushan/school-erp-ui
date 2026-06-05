// ─── Shim: replace with your actual useSubjects hook ─────────────────────────
// This fetches subjects from /subjects endpoint.
// If you already have a useSubjects hook, remove this and import that instead.

import { useEffect, useState } from "react";
import { apiGateway } from "@/lib/api-gateway/api-gateway.instance";
import { ENDPOINTS } from "@/lib/api-gateway/endpoints";

export function useMasterSubjects(): any[] {
  const [subjects, setSubjects] = useState<any[]>([]);
  useEffect(() => {
    apiGateway
      .get<any[]>(ENDPOINTS.masterData.subjects, { params: { limit: 200 } })
      .then((res) => setSubjects(res.data))
      .catch(() => {});
  }, []);
  return subjects;
}

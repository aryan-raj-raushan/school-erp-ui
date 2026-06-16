import { apiGateway } from "@/lib/api-gateway/api-gateway.instance";
import { ENDPOINTS } from "@/lib/api-gateway/endpoints";
import type {
  TransferCertificateListRow,
  TransferCertificateDetail,
  BonafideCertificateListRow,
  BonafideCertificateDetail,
  CertificateFilters,
  CreateTransferCertificatePayload,
  CreateBonafideCertificatePayload,
} from "../types/certificates.types";
import type { PaginationMeta } from "@/types";

interface PaginatedApiResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export const CertificatesService = {
  // ─── Transfer ───────────────────────────────────────────────────────────────

  async listTransfer(
  filters: CertificateFilters = {},
): Promise<{
  items: TransferCertificateListRow[];
  pagination: PaginationMeta;
}> {
  const res = await apiGateway.get<
    PaginatedApiResponse<TransferCertificateListRow>
  >(
    ENDPOINTS.certificates.transfer.list,
    { params: filters },
  );

  return {
    items: res.data.items,
    pagination: res.data.meta,
  };
},

  async getTransferById(id: string): Promise<TransferCertificateDetail> {
    const res = await apiGateway.get<TransferCertificateDetail>(
      ENDPOINTS.certificates.transfer.byId(id),
    );
    return res.data;
  },

  async createTransfer(
    payload: CreateTransferCertificatePayload,
  ): Promise<TransferCertificateDetail> {
    const res = await apiGateway.post<TransferCertificateDetail>(
      ENDPOINTS.certificates.transfer.list,
      payload,
    );
    return res.data;
  },

  // ─── Bonafide ────────────────────────────────────────────────────────────────


  async listBonafide(filters: CertificateFilters = {}): Promise<{
    items: BonafideCertificateListRow[];
    pagination: PaginationMeta;
  }> {
    const res = await apiGateway.get<
      PaginatedApiResponse<BonafideCertificateListRow>
    >(ENDPOINTS.certificates.bonafide.list, { params: filters });

    return {
      items: res.data.items,
      pagination: res.data.meta,
    };
  },

  async getBonafideById(id: string): Promise<BonafideCertificateDetail> {
    const res = await apiGateway.get<BonafideCertificateDetail>(
      ENDPOINTS.certificates.bonafide.byId(id),
    );
    return res.data;
  },

  async createBonafide(
    payload: CreateBonafideCertificatePayload,
  ): Promise<BonafideCertificateDetail> {
    const res = await apiGateway.post<BonafideCertificateDetail>(
      ENDPOINTS.certificates.bonafide.list,
      payload,
    );
    return res.data;
  },
};

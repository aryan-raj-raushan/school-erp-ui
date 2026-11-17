import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export interface PincodeDetails {
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
  localities: string[];
}

export const PincodeService = {
  async lookup(pincode: string): Promise<PincodeDetails> {
    const res = await apiGateway.get<PincodeDetails>(ENDPOINTS.masterData.pincode(pincode));
    return res.data;
  },
};

import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export type SearchResultType =
  | 'student'
  | 'staff'
  | 'parent'
  | 'admission'
  | 'class'
  | 'subject'
  | 'department'
  | 'fee_type'
  | 'event'
  | 'academic_year'
  | 'homework';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  name: string;
  subtitle: string;
  meta?: string;
}

export interface GlobalSearchResult {
  students: SearchResultItem[];
  staff: SearchResultItem[];
  parents: SearchResultItem[];
  admissions: SearchResultItem[];
  classes: SearchResultItem[];
  subjects: SearchResultItem[];
  departments: SearchResultItem[];
  feeTypes: SearchResultItem[];
  events: SearchResultItem[];
  academicYears: SearchResultItem[];
  homework: SearchResultItem[];
  query: string;
}

export const EMPTY_SEARCH_RESULT: GlobalSearchResult = {
  students: [],
  staff: [],
  parents: [],
  admissions: [],
  classes: [],
  subjects: [],
  departments: [],
  feeTypes: [],
  events: [],
  academicYears: [],
  homework: [],
  query: '',
};

export const SearchService = {
  async global(q: string): Promise<GlobalSearchResult> {
    const res = await apiGateway.get<GlobalSearchResult>(ENDPOINTS.search.global, {
      params: { q },
    });
    return res.data ?? EMPTY_SEARCH_RESULT;
  },
};

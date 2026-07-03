export type SchoolEventType = 'EVENT' | 'HOLIDAY';
export type AppliesToType = 'STUDENTS' | 'STAFF' | 'BOTH';

export type SchoolEvent = {
  id: string;
  school_id: string;
  academic_year_id: string;
  name: string;
  type: SchoolEventType;
  description?: string | null;
  from_date: string;
  from_time?: string | null;
  to_date: string;
  to_time?: string | null;
  applies_to: AppliesToType;
  exempt_role_ids: string[];
  is_active: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
};

export interface SchoolEventFilters {
  page?: number;
  limit?: number;
  type?: SchoolEventType;
  academic_year_id?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}
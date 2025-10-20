import { AppSemester } from './user';

export interface SchoolYear {
  id: string;
  academic_year: number;
  created_at?: string;
  updated_at?: string;
  isCurrent?: boolean;
  semesters?: Semester[];
}

export interface Semester {
  id: string;
  school_year_id: string;
  name: AppSemester;
  applications_open: boolean;
  created_at?: string;
  updated_at?: string;
}
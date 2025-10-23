import { AppSemester } from './user';

export interface SchoolYear {
  id: string;
  academic_year: number;
  created_at?: string;
  updated_at?: string;
  isCurrent?: boolean;
  canUndo?: boolean;
  semesters?: Semester[];
}

export interface Semester {
  id: string;
  school_year_id: string;
  name: AppSemester;
  start_date: string;
  end_date: string;
  applications_open: boolean;
  created_at?: string;
  updated_at?: string;
}
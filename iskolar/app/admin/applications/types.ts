export type Status = 'Pending' | 'Approved' | 'Rejected';

export interface FilterDateRange {
  from: string;
  to: string;
}

export interface Filters {
  searchQuery?: string;
  selectedStatuses: Status[];
  selectedSchoolType?: 'Public' | 'Private';
  selectedBarangay?: string;
  dateRange: FilterDateRange;
}

export interface Student {
  position: number;
  score: string;
  type_scholarship: string | null; 
  student: {
      dni: string;
      fullname: string;
  };
  olympic: string;
  period: string;
  school: string;
  grade: string;
  section: string;
  level?: string;
}

export interface Props {
  students: Student[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onGoToInfo: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void; 
  isFiltering?: boolean; 
  isLoading?: boolean;
  selectedSection?: string;
  selectedGrade?: string;
  gradeOptions?: any[];
  sectionOptions?: any[];
}

export interface DynamicFilters {
  levels: { 
    codlevel: number; 
    name_large: string; 
    name_short: string; 
  }[];
  schools: { 
    codschool: number; 
    name: string; 
    logo?: string;      
    logo_url?: string;
    slug: string;
  }[];
  grades: { 
    codgrade: number; 
    codlevel: number; 
    name_large: string; 
    name_short: string;
    level: { 
      name_large: string; 
      name_short: string; 
    }; 
  }[];
  sections: { 
    codsection: number; 
    name_large: string; 
  }[];
}

export interface FilterProps {
  options: DynamicFilters | null;
  searchQuery: string;
  selectedLevel: string;
  selectedSchool: string;
  selectedGrade: string;
  selectedSection: string;

  onSearchChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onSchoolChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onClearFilters: () => void;
  isFiltering: boolean;
}

export interface SchoolDetailResponse {
  success: boolean;
  data: {
    school: {
      codschool: number;
      name: string;
      slug: string;
      logo?: string;    
      logo_url?: string;
    };
    levels: {
      codlevel: number;
      name_large: string;
      grades: {
        codgrade: number;
        name_large: string;
      }[];
    }[];
  };
}
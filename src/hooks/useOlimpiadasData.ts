import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getPublicFilters, 
  getSchoolDetails, 
  getSectionsBySchool, 
  getStudentResults 
} from '../services/api.service';
import { PAGINATION_LIMITS } from '../constants/theme';
import type { DynamicFilters } from '../models/filter.model';
import type { Student } from '../models/student.model';

export const useOlimpiadasData = () => {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filtersData, setFiltersData] = useState<DynamicFilters | null>(null);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1 });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState(PAGINATION_LIMITS.DESKTOP);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [schoolLevels, setSchoolLevels] = useState<any[]>([]);
  const [filteredSections, setFilteredSections] = useState<any[]>([]);
  const [shouldShowResults, setShouldShowResults] = useState(false);
  const [schoolTotalResults, setSchoolTotalResults] = useState(0);

  // ================= EFECTOS DE CARGA INICIAL =================
  useEffect(() => {
    const loadInitialFilters = async () => {
      try {
        const response = await getPublicFilters();
        if (response.success) {
          setFiltersData(response.data);
          setFilteredSections(response.data.sections); 
        }
      } catch (error) {
        console.error("Error al cargar filtros maestros:", error);
      }
    };
    loadInitialFilters();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth <= 900 ? PAGINATION_LIMITS.MOBILE : PAGINATION_LIMITS.DESKTOP);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ================= EFECTOS DE FILTROS EN CASCADA =================
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!selectedSchool || !filtersData) {
        setSchoolLevels([]);
        return;
      }
      const schoolObj = filtersData.schools.find(s => String(s.codschool) === String(selectedSchool));
      if (schoolObj) {
        const slug = schoolObj.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
        const response = await getSchoolDetails(slug);
        if (response && response.success && response.data.levels) {
          setSchoolLevels(response.data.levels); 
        }
      }
    };
    fetchSchoolData();
  }, [selectedSchool, filtersData]);

  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedSchool || !selectedGrade || !filtersData) {
        setFilteredSections([]);
        return;
      }
      const schoolObj = filtersData.schools.find(s => String(s.codschool) === String(selectedSchool));
      if (schoolObj) {
        const slug = schoolObj.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
        const response = await getSectionsBySchool(slug, selectedGrade);
        if (response && response.success) {
          setFilteredSections(response.data); 
        }
      }
    };
    fetchSections();
  }, [selectedSchool, selectedGrade, filtersData]);

  useEffect(() => {
    const fetchSchoolTotals = async () => {
      if (!selectedSchool) {
        setSchoolTotalResults(0);
        return;
      }
      try {
        const response = await getStudentResults({
          codschool: selectedSchool,
          per_page: 1
        });
        if (response.success) {
          setSchoolTotalResults(response.pagination?.total || 0);
        }
      } catch (error) {
        console.error("Error al obtener totales del colegio:", error);
        setSchoolTotalResults(0);
      }
    };
    fetchSchoolTotals();
  }, [selectedSchool]);

  useEffect(() => {
    setIsFiltering(true);
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ================= LÓGICA DE RESULTADOS =================
  const loadResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: itemsPerPage,
        codlevel: selectedLevel || undefined,
        codschool: selectedSchool || undefined,
        codgrade: selectedGrade || undefined,
        codsection: selectedSection || undefined
      };

      const query = debouncedSearchQuery.trim();
      if (query && /^\d+$/.test(query)) {
        params.dni = query;
      }

      const apiCall = getStudentResults(params);
      let response;

      if (currentPage === 1) {
        const [res] = await Promise.all([
          apiCall,
          new Promise(resolve => setTimeout(resolve, 1100)) 
        ]);
        response = res;
      } else {
        response = await apiCall;
      }
      
      if (response.success) {
        setAllStudents(response.data);
        setPagination({
          total: response.pagination?.total || response.data?.length || 0,
          last_page: response.pagination?.last_page || 1
        });
      }
    } catch (error) {
      console.error("Error al obtener resultados:", error);
      setAllStudents([]);
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  }, [currentPage, itemsPerPage, selectedLevel, selectedSchool, selectedGrade, selectedSection, debouncedSearchQuery]);

  useEffect(() => {
    const hasMinimumFilters = selectedSchool && selectedLevel;
    const isSearchingDni = debouncedSearchQuery.trim() !== '';

    if (hasMinimumFilters || isSearchingDni) {
      setShouldShowResults(true);
      loadResults();
    } else {
      setShouldShowResults(false);
      setAllStudents([]);
    }
  }, [selectedSchool, selectedLevel, selectedGrade, selectedSection, debouncedSearchQuery, currentPage, itemsPerPage, loadResults]);

  const dynamicOptions = useMemo(() => {
    if (!filtersData) return null;
    if (!selectedSchool) return { ...filtersData, sections: [] }; 

    const levels = schoolLevels.map(l => ({ 
      codlevel: l.codlevel, 
      name_large: l.name_large, 
      name_short: l.name_short 
    }));
   
    const grades: any[] = [];
    schoolLevels.forEach(l => {
      if (l.grades) {
        l.grades.forEach((g: any) => grades.push({ ...g, codlevel: l.codlevel }));
      }
    });

    return {
      ...filtersData,
      levels: levels.length > 0 ? levels : filtersData.levels,
      grades: grades.length > 0 ? grades : filtersData.grades,
      sections: filteredSections
    };
  }, [filtersData, selectedSchool, schoolLevels, filteredSections]);

  const finalStudentsToDisplay = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    const isDni = /^\d+$/.test(query);

    if (query && !isDni) {
      return allStudents.filter(s => 
        s.student?.fullname?.toLowerCase().includes(query)
      );
    }
    return allStudents;
  }, [allStudents, debouncedSearchQuery]);

  // ================= HANDLERS =================
  const handleLevelChange = (val: string) => {
    setSelectedLevel(val);
    setSelectedGrade(''); 
    setSelectedSection(''); 
    setCurrentPage(1);

    setTimeout(() => {
      const resultadosDiv = document.getElementById('resultados');
      if (resultadosDiv) {
        const y = resultadosDiv.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSchoolChange = (val: string) => {
    setSelectedSchool(val);
    setSelectedLevel(''); 
    setSelectedGrade(''); 
    setSelectedSection('');
    setCurrentPage(1);
    setSearchQuery('');
    setShouldShowResults(false); 

    setTimeout(() => {
      const filtrosDiv = document.getElementById('panel-filtros');
      if (filtrosDiv) {
        const y = filtrosDiv.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleGradeChange = (val: string) => {
    setSelectedGrade(val);
    setSelectedSection('');
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedSchool('');
    setSelectedGrade('');
    setSelectedSection('');
    setCurrentPage(1);
    setShouldShowResults(false); 
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const resultadosDiv = document.getElementById('resultados');
    if (resultadosDiv) {
      const y = resultadosDiv.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return {
    dynamicOptions, finalStudentsToDisplay, pagination,
    isLoading, isFiltering, shouldShowResults,
    searchQuery, setSearchQuery, debouncedSearchQuery,
    selectedLevel, selectedSchool, selectedGrade, selectedSection, setSelectedSection,
    currentPage,
    handleLevelChange, handleSchoolChange, handleGradeChange, handleClearFilters, handlePageChange,
    schoolTotalResults
  };
};
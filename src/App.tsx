import { useEffect, useState, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FilterSection from './components/FilterSection';
import ResultsSection from './components/ResultsSection';
import { fetchResults } from './services/api.service';
import { ACADEMIC_PERIODS, PAGINATION_LIMITS } from './constants/theme';
import type { Student } from './models/student.model';
import './App.css';

const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

function App() {
  const nextStepsRef = useRef<HTMLDivElement>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState<boolean>(false); // NUEVO ESTADO GLOBAL

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGINATION_LIMITS.DESKTOP);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const studentsData = await fetchResults('/data/data.json');
      setAllStudents(studentsData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) setIsFiltering(true);
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsFiltering(false);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, debouncedSearchQuery]);

  useEffect(() => {
    setIsFiltering(true);
    const handler = setTimeout(() => {
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [selectedLevel, selectedSchool, selectedGrade, selectedSection]);

  const dynamicFilters = useMemo(() => {
    if (allStudents.length === 0) return { levels: [], schools: [], grades: [], sections: [] };

    const getUnique = (data: Student[], key: keyof Student) => 
      [...new Set(data.map(item => String(item[key])))].sort();

    return {
      levels: getUnique(allStudents.filter(s => 
        (!selectedSchool || s.schoolName === selectedSchool) && 
        (!selectedGrade || s.grade === selectedGrade) && 
        (!selectedSection || s.section === selectedSection)
      ), 'level'),
      schools: getUnique(allStudents.filter(s => 
        (!selectedLevel || s.level === selectedLevel) && 
        (!selectedGrade || s.grade === selectedGrade) && 
        (!selectedSection || s.section === selectedSection)
      ), 'schoolName'),
      grades: getUnique(allStudents.filter(s => 
        (!selectedLevel || s.level === selectedLevel) && 
        (!selectedSchool || s.schoolName === selectedSchool) && 
        (!selectedSection || s.section === selectedSection)
      ), 'grade'),
      sections: getUnique(allStudents.filter(s => 
        (!selectedLevel || s.level === selectedLevel) && 
        (!selectedSchool || s.schoolName === selectedSchool) && 
        (!selectedGrade || s.grade === selectedGrade)
      ), 'section'),
    };
  }, [allStudents, selectedLevel, selectedSchool, selectedGrade, selectedSection]);

  const filteredStudents = useMemo(() => {
    const cleanSearchQuery = removeAccents(debouncedSearchQuery.toLowerCase());

    return allStudents.filter(student => {
      const cleanName = removeAccents(student.fullName.toLowerCase());
      const matchesSearch = cleanName.includes(cleanSearchQuery) || student.dni.includes(debouncedSearchQuery);
      const matchesLevel = !selectedLevel || student.level === selectedLevel;
      const matchesSchool = !selectedSchool || student.schoolName === selectedSchool;
      const matchesGrade = !selectedGrade || student.grade === selectedGrade;
      const matchesSection = !selectedSection || student.section === selectedSection;

      return matchesSearch && matchesLevel && matchesSchool && matchesGrade && matchesSection;
    });
  }, [allStudents, debouncedSearchQuery, selectedLevel, selectedSchool, selectedGrade, selectedSection]);
  
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [debouncedSearchQuery, selectedLevel, selectedSchool, selectedGrade, selectedSection]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth <= 900 ? PAGINATION_LIMITS.MOBILE : PAGINATION_LIMITS.DESKTOP);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedSchool('');
    setSelectedGrade('');
    setSelectedSection('');
    setCurrentPage(1);
  };

  const scrollToNextSteps = () => {
    nextStepsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Hero periods={ACADEMIC_PERIODS.map(p => p.label)} />

        <FilterSection 
          options={dynamicFilters}
          searchQuery={searchQuery}
          selectedLevel={selectedLevel}
          selectedSchool={selectedSchool}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          onSearchChange={setSearchQuery}
          onLevelChange={setSelectedLevel}
          onSchoolChange={setSelectedSchool}
          onGradeChange={setSelectedGrade}
          onSectionChange={setSelectedSection}
          onClearFilters={handleClearFilters}
          isFiltering={isFiltering}
        />

        {isLoading ? (
          <p className="loading-text" style={{ textAlign: 'center', marginTop: '40px' }}>
            Cargando datos del sistema...
          </p>
        ) : (
          <div style={{ 
            opacity: isFiltering ? 0.4 : 1, 
            pointerEvents: isFiltering ? 'none' : 'auto', 
            transition: 'opacity 0.2s ease' 
          }}>
            <ResultsSection 
              students={paginatedStudents}
              totalResults={filteredStudents.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onGoToInfo={scrollToNextSteps}
              searchQuery={debouncedSearchQuery}
            />
            
            
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
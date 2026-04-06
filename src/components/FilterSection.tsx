import './FilterSection.css';

interface DynamicFilters {
  levels: string[];
  schools: string[];
  grades: string[];
  sections: string[];
}

interface FilterProps {
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

const FilterSection = ({ 
  options, 
  searchQuery,
  selectedLevel,
  selectedSchool,
  selectedGrade,
  selectedSection, 
  onSearchChange, 
  onLevelChange, 
  onSchoolChange, 
  onGradeChange, 
  onSectionChange,
  onClearFilters,
  isFiltering
}: FilterProps) => {

  if (!options) return <p>Cargando filtros...</p>;

  return (
    <section className="filter-container">
      <div className="search-box">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por DNI o nombres y apellidos..." 
          className="search-input"
        />
      </div>

      <div className="filter-actions-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>

        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-blue)', opacity: isFiltering ? 1 : 0, transition: 'opacity 0.2s' }}>
          ⏳ Buscando...
        </div>

        <button className="clear-filters-btn" onClick={onClearFilters}>
          Limpiar filtros
        </button>
      </div>

      <div className="dropdown-grid">
        <div className="dropdown-group group-colegio">
          <label>COLEGIO</label>
          <select value={selectedSchool} onChange={(e) => onSchoolChange(e.target.value)}>
            <option value="">Todas las instituciones</option>
            {options.schools.map(school => <option key={school} value={school}>{school}</option>)}
          </select>
        </div>

        <div className="dropdown-group group-nivel">
          <label>NIVEL EDUCATIVO</label>
          <select value={selectedLevel} onChange={(e) => onLevelChange(e.target.value)}>
            <option value="">Todos los niveles</option>
            {options.levels.map(level => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>

        <div className="dropdown-group group-grado">
          <label>GRADO</label>
          <select value={selectedGrade} onChange={(e) => onGradeChange(e.target.value)}>
            <option value="">Todos los grados</option>
            {options.grades.map(grade => <option key={grade} value={grade}>{grade}</option>)}
          </select>
        </div>

        <div className="dropdown-group group-seccion">
          <label>SECCIÓN</label>
          <select value={selectedSection} onChange={(e) => onSectionChange(e.target.value)}>
            <option value="">Todas las secciones</option>
            {options.sections.map(section => <option key={section} value={section}>{section}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
};

export default FilterSection;
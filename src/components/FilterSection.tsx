import { useState, useEffect, useMemo } from 'react';
import './FilterSection.css';
import type { FilterProps } from '../models/filter.model';

const ORDEN_GRADOS: Record<string, number> = {
  "PRIMERO": 1,
  "SEGUNDO": 2,
  "TERCERO": 3,
  "CUARTO": 4,
  "QUINTO": 5,
  "SEXTO": 6
};

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
  isFiltering,
  totalResults
}: FilterProps & { totalResults?: number }) => {

  const [vpsImages, setVpsImages] = useState<{ url: string, filename: string }[]>([]);

  useEffect(() => {
    fetch('http://178.238.237.71:3001/list-images')
      .then(res => res.json())
      .then(data => {
        if (data.images) setVpsImages(data.images);
      })
      .catch(err => console.error("Error cargando lista del VPS:", err));
  }, []);

   useEffect(() => {
    if ((totalResults ?? 0) > 0 && options?.levels?.length === 1 && !selectedLevel) {
      onLevelChange(String(options.levels[0].codlevel));
    }
  }, [options?.levels, selectedLevel, onLevelChange, totalResults]);
 
  const gradosOrdenados = useMemo(() => {
    if (!options?.grades) return [];
    
    return options.grades
      .filter(grade => !selectedLevel || String(grade.codlevel) === String(selectedLevel))
      .sort((a, b) => {
        const nombreA = a.name_large.trim().toUpperCase();
        const nombreB = b.name_large.trim().toUpperCase();
        
        const valorA = ORDEN_GRADOS[nombreA] || 99;
        const valorB = ORDEN_GRADOS[nombreB] || 99;
        
        return valorA - valorB;
      });
  }, [options?.grades, selectedLevel]);

  if (!options) return <p>Cargando filtros...</p>;

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="filter-wrapper">
      
      {!selectedSchool && (
        <div className="filter-hint reveal-animation">
          <span className="hint-icon">👇</span>
          <p>Selecciona un colegio para activar la búsqueda y ver los resultados oficiales</p>
        </div>
      )}

      <div className="schools-header">
          <h3>Selecciona tu Institución Educativa</h3>
        {selectedSchool && (
          <button className="change-school-btn" onClick={onClearFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="schools-grid">
        {options.schools.map((school) => {
          const isActive = String(school.codschool) === String(selectedSchool);
          const finalLogoUrl = (school as any).vpsImageUrl || (school as any).logo;

          return (
            <div 
              key={school.codschool} 
              className={`school-card ${isActive ? 'active' : ''}`}
              onClick={() => onSchoolChange(String(school.codschool))}
            >
              <div className="school-logo">
                {finalLogoUrl ? (
                  <img 
                    src={finalLogoUrl} 
                    alt={`Logo ${school.name}`} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>{getInitials(school.name)}</span>
                )}
              </div>
              <span className="school-name">{school.name}</span>
            </div>
          );
        })}
      </div>
      
      {selectedSchool && (totalResults ?? 0) > 0 && (
        <div id="panel-filtros" className="filter-container reveal-animation">
          <div className="results-found-info">
            <p>Se encontraron <strong>{totalResults} resultados</strong></p>
          </div>

          <div className="secondary-filters-container">
            <div className="dropdown-grid">
              
              <div className="dropdown-group">
                <label>Nivel Educativo</label>
                <select value={selectedLevel} onChange={(e) => onLevelChange(e.target.value)}>
                  <option value="">Todos los niveles</option>
                  {options.levels.map(level => (
                    <option key={level.codlevel} value={level.codlevel}>{level.name_large}</option>
                  ))}
                </select>
              </div>

              <div className="dropdown-group">
                <label style={{ opacity: selectedLevel ? 1 : 0.5 }}>Grado</label>
                <select 
                  value={selectedGrade} 
                  onChange={(e) => onGradeChange(e.target.value)}
                  disabled={!selectedLevel}
                >
                  <option value="">{selectedLevel ? "Todos los grados" : "Selecciona nivel"}</option>
                  {/* 3. Mapeamos la lista ya ordenada */}
                  {gradosOrdenados.map(grade => (
                    <option key={grade.codgrade} value={grade.codgrade}>
                      {grade.name_large.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dropdown-group">
                <label style={{ opacity: selectedGrade ? 1 : 0.5 }}>Sección</label>
                <select 
                  value={selectedSection} 
                  onChange={(e) => onSectionChange(e.target.value)}
                  disabled={!selectedGrade}
                >
                  <option value="">{selectedGrade ? "Todas las secciones" : "Selecciona grado"}</option>
                  {options.sections.map(section => (
                    <option key={section.codsection} value={section.codsection}>{section.name_large}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>
      )}

      {selectedSchool && (totalResults ?? 0) === 0 && (
        <div className="filter-container reveal-animation">
          <div className="results-found-info results-unavailable">
            <p>⚠️ Sin resultados disponibles</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;

import './ResultsSection.css';
import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import type { Student, Props } from '../models/student.model';
import { SCHOLARSHIP_TYPES } from '../constants/theme';
import {
  formatDNI,
  formatName,
  formatLevel,
  formatSection,
  formatSchoolName,
  formatGrade,
  formatScholarshipType,
  formatScore
} from '../utils/formatters';
import { FiInbox, FiSearch, FiUsers } from 'react-icons/fi'; 
import SkeletonLoader from './Skeleton';

const ResultsSection = ({ 
  students, 
  totalResults, 
  currentPage, 
  totalPages, 
  onPageChange,
  onGoToInfo,
  searchQuery,
  onSearchChange, 
  isFiltering = false,
  isLoading = false,
  selectedSection = '',
  selectedGrade = '',
  gradeOptions = [],
  sectionOptions = []
}: Props) => {

  // Debounce la búsqueda
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Trigger búsqueda solo cuando debouncedSearch cambia
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onPageChange(1);
    }
  }, [debouncedSearch]);

  const getBadgeClass = (type: string | null) => {
    if (!type) return '';
    if (type === SCHOLARSHIP_TYPES.FULL || type === 'BC') return 'badge-full';
    if (type === SCHOLARSHIP_TYPES.HALF || type === 'SB' || type === 'BM') return 'badge-half';
    return '';
  };

  const isExactMatch = (dni?: string) => {
    if (!dni) return false;
    const formattedDNI = formatDNI(dni);
    return debouncedSearch.trim() !== '' && formattedDNI !== '-' && formattedDNI === debouncedSearch.trim();
  };

  let titleText = "Resultados Oficiales";
  if (!selectedGrade) {
    titleText = "Resultados - Todos";
  } else if (selectedGrade) {
    const gradeOption = gradeOptions.find(g => String(g.codgrade) === String(selectedGrade));
    const gradeName = gradeOption ? gradeOption.name_large.toUpperCase() : selectedGrade;
    const sectionOption = sectionOptions.find(s => String(s.codsection) === String(selectedSection));
    const sectionName = sectionOption ? sectionOption.name_large : '';
    const hasSection = sectionName && sectionName.trim() !== '' && sectionName !== '-';
    titleText = `Resultados - ${gradeName}${hasSection ? ` "${sectionName}"` : ''}`;
  }

  return (
    <section className="results-wrapper">
      
      {/* 1. CABECERA PREMIUM */}
      <div className="results-top-header reveal-animation">
        <div className="results-title-group">
          <h2>{titleText}</h2>
          {totalResults > 0 && !isLoading && (
            <span className="students-count-badge">
              <FiUsers className="badge-icon" />
              {totalResults} estudiantes
            </span>
          )}
        </div>

        <div className="results-search-container">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 8) {
                  onSearchChange(value);
                }
              }}
              placeholder="Ingresa DNI a consultar..."
              className="search-input"
              maxLength={8}
            />
            {searchQuery && (
              <span className="search-clear" onClick={() => onSearchChange('')}>✕</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. LÓGICA DE CARGA Y TABLAS */}
      {isLoading && currentPage === 1 ? (
          <SkeletonLoader />
        
      ) : (!students || students.length === 0) ? (
        <div className="empty-state reveal-animation">
          <span className="empty-state-icon"><FiInbox /></span>
          <h3>No se encontraron resultados</h3>
          <p>
            No hay alumnos registrados con el DNI <strong>"{searchQuery}"</strong> en este colegio o grado. 
            Verifica los datos e intenta de nuevo.
          </p>
        </div>
      ) : (
        <div style={{ 
          opacity: (isFiltering || isLoading) ? 0.4 : 1, 
          pointerEvents: (isFiltering || isLoading) ? 'none' : 'auto', 
          transition: 'opacity 0.3s ease',
          minHeight: '400px'
        }}>
          
          <div className="desktop-table-container reveal-animation">
            <table className="results-table">
              <thead>
                <tr>
                  <th>PUESTO</th>
                  <th>DNI</th>
                  <th>ESTUDIANTE</th>
                  <th>NIVEL</th>
                  <th>COLEGIO</th>
                  <th>GRADO</th>
                  <th>SECCIÓN</th>
                  <th>PUNTAJE</th>
                  <th>TIPO DE BECA</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, index) => {
                  const formattedDNI = formatDNI(s.student?.dni);
                  const formattedName = formatName(s.student?.fullname);
                  const formattedLevel = formatLevel(s.level);
                  const formattedSchool = formatSchoolName(s.school);
                  const formattedGrade = formatGrade(s.grade);
                  const formattedSection = formatSection(s.section);
                  const formattedScore = formatScore(s.score);
                  const formattedScholarship = formatScholarshipType(s.type_scholarship);

                  return (
                    <tr 
                      key={`${formattedDNI}-${index}`} 
                      className={isExactMatch(s.student?.dni) ? 'highlighted-row' : ''}
                    >
                      <td className="col-puesto">
                        {String((currentPage - 1) * students.length + index + 1).padStart(2, '0')}
                      </td>
                      <td>{formattedDNI}</td>
                      <td className="col-nombre">{formattedName}</td>
                      <td>{formattedLevel}</td>
                      <td>{formattedSchool}</td>
                      <td>{formattedGrade}</td>
                      <td>{formattedSection}</td>
                      <td className="col-puntaje">{formattedScore}</td>
                      <td>
                        {formattedScholarship !== '-' ? (
                          <span className={`badge ${getBadgeClass(s.type_scholarship)}`}>
                            {formattedScholarship}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards-container reveal-animation">
            {students.map((s, index) => {
              const formattedDNI = formatDNI(s.student?.dni);
              const formattedName = formatName(s.student?.fullname);
              const formattedLevel = formatLevel(s.level);
              const formattedSchool = formatSchoolName(s.school);
              const formattedGrade = formatGrade(s.grade);
              const formattedSection = formatSection(s.section);
              const formattedScore = formatScore(s.score);
              const formattedScholarship = formatScholarshipType(s.type_scholarship);

              return (
                <div 
                  key={`mobile-${formattedDNI}-${index}`} 
                  className={`student-card ${isExactMatch(s.student?.dni) ? 'highlighted-card' : ''}`}
                >
                  <div className="card-header">
                    <div className="rank-text-style">
                      <span className="rank-hash">#</span>
                      <span className="rank-number">{(currentPage - 1) * students.length + index + 1}</span>
                    </div>
                
                    <div className="card-school-info">
                      <span>{formattedSchool}</span>
                    </div>
                  </div>
            
                  <div className="card-body">
                    <h3 className="card-name">{formattedName}</h3>
                    <p className="card-meta">
                      DNI: {formattedDNI} • {formattedLevel ? `${formattedLevel} • ` : ''}{formattedGrade} "{formattedSection}"
                    </p>
                  </div>

                  <div className="card-footer-grid">
                    <div className="footer-item score-item">
                      <span className="item-label">PUNTAJE</span>
                      <strong className="item-value highlight-score">{formattedScore}</strong>
                    </div>

                    {formattedScholarship !== '-' ? (
                      <span className={`scholarship-tag ${getBadgeClass(s.type_scholarship)}`}>
                        {formattedScholarship}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pagination-container reveal-animation">
            <div className="results-count">
              Mostrando {students.length} de {totalResults}
            </div>

            <div className="pagination-actions">
              <button 
                className="page-btn" 
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                &larr; <span className="hide-mobile">Anterior</span>
              </button>
              
              <span className="page-info">Página {currentPage} de {totalPages}</span>
              
              <button 
                className="page-btn" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => onPageChange(currentPage + 1)}
              >
                <span className="hide-mobile">Siguiente</span> &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ResultsSection;
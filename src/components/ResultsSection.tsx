import './ResultsSection.css';
import type { Student } from '../models/student.model';
import { SCHOLARSHIP_TYPES } from '../constants/theme';

interface Props {
  students: Student[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onGoToInfo: () => void;
  searchQuery: string;
}

const ResultsSection = ({ 
  students, 
  totalResults, 
  currentPage, 
  totalPages, 
  onPageChange,
  onGoToInfo,
  searchQuery
}: Props) => {
  const getBadgeClass = (type: string) => {
    if (type === SCHOLARSHIP_TYPES.FULL) return 'badge-full';
    if (type === SCHOLARSHIP_TYPES.HALF) return 'badge-half';
    return '';
  };

  const isExactMatch = (dni: string) => {
    return searchQuery.trim() !== '' && dni === searchQuery.trim();
  };

  if (!students || students.length === 0) {
    return (
      <div className="empty-state">
        <h3>🔍 No encontramos resultados para "{searchQuery}"</h3>
        <p>Verifica que el DNI sea correcto o intenta buscar solo por apellidos.</p>
      </div>
    );
  }

  return (
    <section className="results-wrapper">
      
      <div className="desktop-table-container">
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
            {students.map((s) => (
              <tr key={s.id} className={isExactMatch(s.dni) ? 'highlighted-row' : ''}>
                <td className="col-puesto">{s.rank.toString().padStart(2, '0')}</td>
                <td>{s.dni}</td>
                <td className="col-nombre">{s.fullName}</td>
                <td>{s.level}</td>
                <td>{s.schoolName}</td>
                <td>{s.grade}</td>
                <td>{s.section}</td>
                <td className="col-puntaje">{s.score}</td>
                <td>
                    {s.scholarshipType === SCHOLARSHIP_TYPES.FULL|| s.scholarshipType === SCHOLARSHIP_TYPES.HALF ? (
                        <span className={`badge ${getBadgeClass(s.scholarshipType)}`}>
                        {s.scholarshipType}
                        </span>
                    ) : (
                        <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>-</span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-cards-container">
        {students.map((s) => (
        <div key={s.id} className={`student-card ${isExactMatch(s.dni) ? 'highlighted-card' : ''}`}>
        
        <div className="card-header">
          <div className="rank-text-style">
              <span className="rank-hash">#</span>
              <span className="rank-number">{s.rank}</span>
          </div>
            
          <div className="card-school-info" style={{ backgroundColor: 'transparent', padding: 0 }}>
            <svg className="school-icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: '14px', height: '14px' }}>
              <path d="M12 3L22 9V21H2V9L12 3M12 7.76L18.64 11H5.36L12 7.76M19 19V12.35L12 16.35L5 12.35V19H19Z"/>
            </svg>
            <span style={{ fontSize: '11px', fontWeight: '700' }}>{s.schoolName}</span>
          </div>
        </div>
      
        <div className="card-body">
          <h3 className="card-name">{s.fullName}</h3>
          <p className="card-meta">
            DNI: {s.dni} • {s.level} • {s.grade} "{s.section}"
          </p>
        </div>

        <div className="card-footer-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="footer-item score-item" style={{ border: 'none', padding: 0, textAlign: 'left' }}>
            <span className="item-label">PUNTAJE</span>
            <strong className="item-value highlight-score">{s.score}</strong>
          </div>

          {s.scholarshipType === SCHOLARSHIP_TYPES.FULL || s.scholarshipType === SCHOLARSHIP_TYPES.HALF ? (
            <span className={`scholarship-tag ${getBadgeClass(s.scholarshipType)}`} style={{ margin: 0 }}>
              {s.scholarshipType}
            </span>
          ) : null}
        </div>
      </div>
    ))}
  </div>

      <div className="pagination-container">
        <div className="results-count">
          Se encontraron {totalResults} resultados
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
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <span className="hide-mobile">Siguiente</span> &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
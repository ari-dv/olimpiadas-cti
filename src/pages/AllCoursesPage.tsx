import React, { useState, useRef, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import CoursesSection from '../components/CoursesSection';
import './AllCoursesPage.css';

const AllCoursesPage = () => {
  const [selectedLevel, setSelectedLevel] = useState<'primaria' | 'secundaria'>('primaria');
  const coursesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLevelChange = (level: 'primaria' | 'secundaria') => {
    setSelectedLevel(level);
    setTimeout(() => {
      coursesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
      
  return (
    <main className="main-content">
      <div className="back-link-container">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Volver a resultados
        </Link>
      </div>
      
      {/* EL NUEVO HEADER QUE PONE TODO EN LA MISMA LÍNEA */}
      <div className="page-header-row">
        
        {/* Izquierda: Textos */}
        <div className="page-header-text">
          <h1 className="page-title">
            Todos nuestros programas
          </h1>
          <p className="page-subtitle">
            Explora la lista completa de cursos especializados del CTI y encuentra el ideal para ti.
          </p>
        </div>

        {/* Derecha: Botones */}
        <div className="level-selector-container">
          <button
            className={`level-card ${selectedLevel === 'primaria' ? 'active' : ''}`}
            onClick={() => handleLevelChange('primaria')}
          >
            <span className="level-icon">📚</span>
            <span className="level-text">Primaria</span>
          </button>
          <button
            className={`level-card ${selectedLevel === 'secundaria' ? 'active' : ''}`}
            onClick={() => handleLevelChange('secundaria')}
          >
            <span className="level-icon">🎓</span>
            <span className="level-text">Secundaria</span>
          </button>
        </div>

      </div>

      <div key={selectedLevel} ref={coursesRef} className="courses-results-container fade-in-up">
        <CoursesSection level={selectedLevel} />
      </div>
      
    </main>
  );
};

export default AllCoursesPage;
import './Hero.css';
import { useMemo, useCallback } from 'react';
import logoOlimpiadas from '../assets/logo-olimpiadas.png';
import { FiUsers, FiHome, FiAward } from 'react-icons/fi';

interface HeroProps {
  periods: string[];
  onPeriodChange?: (period: string) => void;
  defaultPeriod?: string;
  // --- NUEVAS PROPS PARA ESTADÍSTICAS ---
  totalSchools?: number;
  totalParticipants?: number;
  totalScholarships?: number;
}

const Hero = ({ 
  periods, 
  onPeriodChange,
  defaultPeriod = periods[0],
  totalSchools = 0,
  totalParticipants = 0,
  totalScholarships = 0
}: HeroProps) => {
  
  const periodOptions = useMemo(() => {
    return periods.map((period, index) => (
      <option key={`${period}-${index}`} value={period}>
        {period}
      </option>
    ));
  }, [periods]);

  const handlePeriodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onPeriodChange) {
      onPeriodChange(e.target.value);
    }
  }, [onPeriodChange]);

  return (
    
    <section className="hero-section">

      <div className="hero-text">
        <h1 className="sr-only">Resultados Olimpiadas Escolares de Conocimientos</h1>

        <img 
          src={logoOlimpiadas} 
          alt="Olimpiadas Escolares de Conocimientos en Tecnología y Computación" 
          className="hero-logo"
          loading="eager"
          decoding="async"
        />
        
        <p>
          Consulta los <span>resultados oficiales</span> de la cuarta edición de las Olimpiadas Escolares de Conocimientos en Tecnología y Computación y descubre las 
          oportunidades de becas disponibles para ti.
        </p>
      </div>

      <div className="hero-period">
        <label htmlFor="period-select">Período Académico</label>
        
        <select 
          id="period-select" 
          className="period-select"
          defaultValue={defaultPeriod}
          onChange={handlePeriodChange}
          aria-label="Selecciona el período académico"
        >
          {periodOptions}
        </select>
      </div>

      <div className="hero-stats">
        <div className="stat-item">
          <div className="stat-text">
            <span className="stat-number">
              {totalSchools > 0 ? totalSchools : '...'}
            </span>
            <span className="stat-label">Colegios</span>
          </div>
        </div>
        
        <div className="stat-divider"></div>

        <div className="stat-item">
          <div className="stat-text">
            <span className="stat-number">
              {totalParticipants > 0 ? totalParticipants.toLocaleString() : '...'}
            </span>
            <span className="stat-label">Participantes</span>
          </div>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
           <div className="stat-text">
            <span className="stat-number">
              {totalScholarships > 0 ? totalScholarships : '...'} +
            </span>
            <span className="stat-label">Becas Ganadas</span>
          </div>
          <div className="stat-icon-wrapper"><FiAward className="stat-icon" /></div>
         
        </div>
      </div>
      

    </section>
  );
};

export default Hero;
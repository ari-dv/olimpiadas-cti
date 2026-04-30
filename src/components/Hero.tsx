import './Hero.css';
import { useMemo, useCallback } from 'react';
import logoOlimpiadas from '../assets/logo-olimpiadas.png';

interface HeroProps {
  periods: string[];
  onPeriodChange?: (period: string) => void;
  defaultPeriod?: string;
}

const Hero = ({ 
  periods, 
  onPeriodChange,
  defaultPeriod = periods[0] 
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
    </section>
  );
};

export default Hero;
import './Hero.css';

interface HeroProps {
  periods: string[];
}

const Hero = ({ periods }: HeroProps) => {
  return (
    <section className="hero-section">
      <div className="hero-text">
        <h1>Resultados Olimpiadas CTI</h1>
        <p>
          Consulta los resultados del examen de selección y descubre las 
          oportunidades de becas disponibles para los mejores talentos.
        </p>
      </div>
      
      <div className="hero-period">
        <label htmlFor="period-select">PERIODO ACADÉMICO</label>
        <select id="period-select" className="period-select">
          {periods.map((period, index) => (
            <option key={index} value={period}>{period}</option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default Hero;
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); 
  const navigate = useNavigate(); // <-- Agregamos el hook para navegar

  const navLinks = [
    { label: 'Resultados', path: '/#buscar-resultados' },
    { label: 'Becas', path: '/#becas' },
    { label: 'Cursos', path: '/cursos' }, 
    { label: 'Contacto', path: '/#contacto' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        
        <Link to="/" className="navbar-logo" onClick={closeMenu} style={{ textDecoration: 'none' }}>
          <img src={logo} alt="CTI Logo" />
          <div className="logo-text">
            <span>Centro en Tecnologías</span>
            <br />
            <span>de Información</span>
          </div>
        </Link>

        <button 
          className={`navbar-burger ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            {navLinks.map((link) => {
              const isAnchor = link.path.includes('#'); 
              return (
                <li key={link.label}>
                  {isAnchor ? (
                    <a href={link.path} onClick={closeMenu}>{link.label}</a>
                  ) : (
                    <Link to={link.path} onClick={closeMenu}>{link.label}</Link>
                  )}
                </li>
              );
            })}
            {/* Botón CTA - Ahora navega a la ruta en vez de abrir modal */}
            <li>
              <button 
                className="btn-cta-matricula" 
                onClick={() => {
                  closeMenu();
                  navigate('/inscripcion'); // <-- Viaje directo a la página
                }}
              >
                Inscribirse
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
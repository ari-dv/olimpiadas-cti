import { useState } from 'react';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Resultados', active: true },
    { label: 'Becas', active: false },
    { label: 'Cursos', active: false },
    { label: 'Nosotros', active: false },
    { label: 'Contacto', active: false },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="CTI Logo" />
          <div className="logo-text">
            <span>Centro en Tecnologías</span>
            <br />
            <span>de Información</span>
          </div>
        </div>

        <button 
          className={`navbar-burger ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href="#" className={link.active ? 'active' : ''}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
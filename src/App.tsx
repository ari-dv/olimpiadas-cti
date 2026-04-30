import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import logo from './assets/logo-cti.png';
import AllCoursesPage from './pages/AllCoursesPage';
import './App.css';
import './components/Footer.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        
        <Navbar />
        
        <Routes>
          {/* Ruta principal que carga nuestra nueva página Home */}
          <Route path="/" element={<Home />} />
          
          {/* Ruta de los cursos */}
          <Route path="/cursos" element={<AllCoursesPage />} />
        </Routes>

      <footer id="nosotros" className="main-footer">
        <div className="footer-content">
          
          {/* PARTE SUPERIOR: 2 Columnas claras */}
          <div className="footer-top">
            <div className="footer-brand">
              <div className="brand-header logo">
                <img src={logo}  alt="logo-cti" />
                <h4>Centro en Tecnologías de Información</h4>
              </div>
              <p>Facultad de Ingenieria de Sistemas e Informática - Universidad Nacional de San Martín, Tarapoto, Perú</p>
             </div>

            <div className="footer-links-section">
              <h4 className="footer-heading">Navegación</h4>
              <nav className="footer-nav">
                <a href="#buscar-resultados">Resultados</a>
                <a href="#becas">Becas</a>
                <a href="#cursos">Cursos</a>
              </nav>
            </div>

          </div>

          <button 
            className="back-to-top-btn" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="arrow">↑</span> Volver arriba
          </button>
          <div className="footer-divider"></div>
            <div className="footer-bottom">
              <div className="footer-copyright">
                <p>© 2026 CTI · Todos los derechos reservados</p>
              </div>
              
              <div className="footer-credits">
                <a href=''>Desarrollado por <strong>Ari</strong></a>
              </div>
            </div>

          </div>
      </footer>
        
      </div>
    </Router>
  );
}

export default App;
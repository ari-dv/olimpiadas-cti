import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import logo from './assets/logo-cti.png';
import AllCoursesPage from './pages/AllCoursesPage';
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primeicons/primeicons.css";
import './App.css';
import './components/Footer.css';
import { PrimeReactProvider } from 'primereact/api';
import { NuevaInscripcion } from './components/NuevaInscripcion';

// 1. Creamos este componente interno para poder leer la ruta (useLocation)
const AppLayout = () => {
  const location = useLocation();
  const esInscripcion = location.pathname === '/inscripcion';

  return (
    <div className="app-container">
      
      {/* 2. Si NO estamos en inscripción, muestra el Navbar */}
      {!esInscripcion && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<AllCoursesPage />} />
        <Route path="/inscripcion" element={<NuevaInscripcion />} />
      </Routes>

      {/* 3. También ocultamos el footer en la inscripción para evitar distracciones */}
      {!esInscripcion && (
        <footer id="nosotros" className="main-footer">
          <div className="footer-content">
            
            <div className="footer-top">
              <div className="footer-brand">
                <div className="brand-header logo">
                  <img src={logo} alt="logo-cti" />
                  <h4>Centro en Tecnologías de Información</h4>
                </div>
                <p>Facultad de Ingeniería de Sistemas e Informática - Universidad Nacional de San Martín, Tarapoto, Perú</p>
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
      )}
      
    </div>
  );
};

// 4. Tu componente App original se queda súper limpio
function App() {
  return (
    <PrimeReactProvider>
      <Router>
        <AppLayout />
      </Router>
    </PrimeReactProvider>
  );
}

export default App;
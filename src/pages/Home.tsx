import { useRef, useEffect, useState } from 'react';
import { FiAward, FiCheckCircle } from 'react-icons/fi';
import Hero from '../components/Hero';
import FilterSection from '../components/FilterSection';
import ResultsSection from '../components/ResultsSection';
import CoursesSection from '../components/CoursesSection';
import SupportSection from '../components/SupportSection';
import { ACADEMIC_PERIODS } from '../constants/theme';
import { useOlimpiadasData } from '../hooks/useOlimpiadasData';
import { getStudentResults } from '../services/api.service';

const Home = () => {
  const nextStepsRef = useRef<HTMLDivElement>(null);
  
  const data = useOlimpiadasData();

  const [totalRealParticipants, setTotalRealParticipants] = useState(0);

  const scrollToNextSteps = () => {
    nextStepsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchGlobalTotal = async () => {
      try {

        const response = await getStudentResults({ per_page: 1 });
        if (response.success && response.pagination) {
          setTotalRealParticipants(response.pagination.total);
        }
      } catch (error) {
        console.error("Error obteniendo total global de participantes", error);
      }
    };
    
    fetchGlobalTotal();
  }, []);

  useEffect(() => {
    if (data.selectedSchool && data.schoolTotalResults !== undefined) {
      setTimeout(() => {
        const panel = document.getElementById('panel-filtros');
        if (panel) {
           const elementPosition = panel.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - 320;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 50);
    }
  }, [data.selectedSchool, data.schoolTotalResults]);

  const getLevelName = () => {
    if (!data.selectedLevel || !data.dynamicOptions?.levels) return "Todos los niveles";
    
    const nivelEncontrado = data.dynamicOptions.levels.find(
      l => String(l.codlevel) === String(data.selectedLevel)
    );
    
    return nivelEncontrado ? nivelEncontrado.name_large : "Todos los niveles";
  };
  
  const totalSchools = data.dynamicOptions?.schools?.length || 0;

  return (
    <main className="main-content" >
      
      <Hero 
        periods={ACADEMIC_PERIODS.map(p => p.label)} 
        totalSchools={totalSchools}
        totalParticipants={totalRealParticipants} 
        totalScholarships={150}  
      />

      <div id="buscar-resultados">
      <FilterSection 
        options={data.dynamicOptions}
        searchQuery={data.searchQuery}
        selectedLevel={data.selectedLevel}
        selectedSchool={data.selectedSchool}
        selectedGrade={data.selectedGrade}
        selectedSection={data.selectedSection}
        onSearchChange={data.setSearchQuery}
        onLevelChange={data.handleLevelChange}
        onSchoolChange={data.handleSchoolChange}
        onGradeChange={data.handleGradeChange}
        onSectionChange={data.setSelectedSection}
        onClearFilters={data.handleClearFilters}
        isFiltering={data.isFiltering}
        totalResults={data.schoolTotalResults}
      />
      </div>

      {data.shouldShowResults && data.schoolTotalResults > 0 && (
        <div id="resultados">
      <ResultsSection 
            levelName={getLevelName()}
            students={data.finalStudentsToDisplay}
            totalResults={data.pagination.total}
            currentPage={data.currentPage}
            totalPages={data.pagination.last_page}
            onPageChange={data.handlePageChange}
            onGoToInfo={scrollToNextSteps}
            searchQuery={data.searchQuery} 
            onSearchChange={data.setSearchQuery} 
            isFiltering={data.isFiltering}
            isLoading={data.isLoading}
            selectedSection={data.selectedSection}
            selectedGrade={data.selectedGrade}
            gradeOptions={data.dynamicOptions?.grades || []}
            sectionOptions={data.dynamicOptions?.sections || []}
          />
        </div>
      )}

      <section id="becas" ref={nextStepsRef} className="scholarship-banner">
        <div className="banner-container">
          <div className="banner-intro">
            <h2 className="banner-title">
              <FiAward style={{ marginRight: '10px', verticalAlign: 'middle', color: '#daa520' }} />
              ¿Qué hacer ahora?
            </h2>
            <p className="banner-welcome-text">
              <strong>¡Felicidades por tu resultado!</strong> Si obtuviste una beca completa o semibeca en las Olimpiadas CTI, puedes aplicarla directamente a cualquiera de nuestros cursos especializados.
            </p>
          </div>

          <div className="benefits-columns">
            <div className="benefit-card">
              <div className="check-icon-gold"><FiCheckCircle size={24} /></div>
              <div className="benefit-info">
                <h3>Beca Completa:</h3>
                <p>El CTI cubre el <strong>100% del costo total</strong> del curso. Único pago: <strong>S/ 50.00</strong> por los 2 Certificados (Básico e Intermedio).</p>
              </div>
            </div>
            <div className="benefit-card">
              <div className="check-icon-gold"><FiCheckCircle size={24} /></div>
              <div className="benefit-info">
                <h3>Media Beca:</h3>
                <p>El CTI cubre el <strong>50% del costo</strong> (valorizado en S/ 360.00). El becario abona: <strong>S/ 90.00 mensuales</strong> con facilidades de pago. Incluye Certificado Básico e Intermedio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="cursos">
        <CoursesSection limit={3} />
      </div>

      <div id="contacto">
        <SupportSection />
      </div>
    </main>
  );
};

export default Home;
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar, FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { getCourses } from '../services/courses.service';
import './CoursesSection.css';
import type { Course } from '../models/courses.model';

interface CoursesSectionProps {
  limit?: number;
  level?: 'primaria' | 'secundaria';
}

const CoursesSection = ({ limit, level }: CoursesSectionProps) => {
  const phoneNumber = "51916413447";
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses('/data/coursesData.json');
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setCourses(shuffled);
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const displayedCourses = useMemo(() => {
    let result = [...courses];
    if (level) {
      result = result.filter(c => c.level.toLowerCase() === level.toLowerCase());
    }
    if (limit) {
      result = result.slice(0, limit);
    }
    return result;
  }, [courses, level, limit]);

  return (
    <section className="courses-section">

      <div className="start-date-banner">
        <FiCalendar className="start-date-icon" />
        <div className="start-date-text">
          <span className="start-date-label">Inicio de clases:</span>
          <span className="start-date-value">23 de Mayo</span>
        </div>
      </div>

      <div className="courses-header">
        <div className="courses-title-wrapper">
          <h2 className="courses-title">Cursos Disponibles</h2>
        </div>

        {limit && (
          <Link to="/cursos" className="view-all-desktop">
            Ver todos <FiArrowRight className="icon-arrow-right" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="loading-state">Cargando cursos...</div>
      ) : (
        <div className="courses-grid">
          {displayedCourses.map((course) => {
            const message = `Hola, quiero inscribirme en el curso de ${course.title}.`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            const finalImageUrl = (course as any).vpsImageUrl || course.imgSrc;

            return (
              <article key={course.id} className="course-card">
                <div className="course-image-container">
                  <img 
                    src={finalImageUrl} 
                    alt={course.title} 
                    className="course-image"
                    referrerPolicy="no-referrer"
                  />
                  {/* El Badge ahora tiene una clase extra para legibilidad */}
                  <span className={`course-badge badge-desktop ${course.badgeClass}`}>
                    {course.level}
                  </span>
                </div>
                
                <div className="course-info">
                  <span className={`course-badge badge-mobile ${course.badgeClass}`}>{course.level}</span>
                  <h3 className="course-name">{course.title}</h3>
                  
                  <div className="course-meta">
                    <div className="meta-item">
                      <FiClock className="icon-meta desktop-only-icon" />
                      <span>{course.duration}</span>
                    </div>
                    <span className="dot-separator">•</span>
                    <div className="meta-item">
                      <FiCalendar className="icon-meta desktop-only-icon" />
                      <span>{course.date}</span>
                    </div>
                  </div>

                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="course-action">
                    Solicitar información <FiExternalLink className="icon-action" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {limit && (
        <Link to="/cursos" className="view-all-mobile">Ver más cursos    🡺 </Link>
      )}
    </section>
  );
};

export default CoursesSection;
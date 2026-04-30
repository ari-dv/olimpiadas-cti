import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiClock, FiMapPin, FiHeadphones } from 'react-icons/fi';
import './SupportSection.css';

const SupportSection = () => {
  return (
    <section className="support-section">
      <div className="support-container">
        <div className="support-info-column">
          <div className="support-intro">
            <div className="support-icon-wrapper">
              <FiHeadphones className="headset-icon" />
            </div>
            <div className="support-text">
              <h3 className="support-title">INFORMES E INSCRIPCIONES</h3>
              <p className="support-subtitle">¿Tienes dudas sobre tus resultados o becas?</p>
            </div>
          </div>

          <div className="support-contact-row">
            <div className="support-contact">
              <span className="support-label">TELÉFONO / WHATSAPP</span>
              <a 
                href="https://wa.me/51997321063?text=Hola,%20quiero%20información%20sobre%20las%20becas%20e%20inscripciones%20del%20CTI." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-action-whatsapp"
              >
                <FaWhatsapp className="whatsapp-icon" />
                +51 997 321 063
              </a>
            </div>

            <div className="support-contact">
              <span className="support-label">DIRECCIÓN</span>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Jr.+Orellana+575,+Tarapoto,+Peru" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary-location"
              >
                <FiMapPin className="location-icon" />
                Jr. Orellana 575, Tarapoto
              </a>
            </div>
          </div>

          <div className="support-schedule">
            <span className="support-label desktop-only">HORARIO DE OFICINA</span>
            <div className="schedule-box">
              <FiClock className="clock-icon" />
              <p>
                <span className="desktop-only">Lunes a Viernes: 7:00 am - 2:45 pm</span>
                <span className="mobile-only">Horario de Oficina: 7:00 am - 2:45 pm<br/>Lun a Viernes</span>
              </p>
            </div>
          </div>

        </div>

        <div className="support-map-column">
          <iframe 
            title="Ubicación CTI Tarapoto"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1982.3551523497184!2d-76.3705!3d-6.4865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjknMTEuNCJTIDc2wrAyMicyMS44Ilc!5e0!3m2!1ses!2spe!4v1712590000000!5m2!1ses!2spe" 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

      </div>
    </section>
  );
};

export default SupportSection;
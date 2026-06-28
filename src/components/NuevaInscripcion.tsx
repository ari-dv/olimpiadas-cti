import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { RadioButton } from 'primereact/radiobutton';
import jsPDF from 'jspdf';
import './NuevaInscripcion.css';

// --- INTERFACES ---
interface EstudianteLocal {
  id: number;
  dni: string;
  names: string;
  lastNames: string;
  typeScholarship: string | null;
  email?: string;
  phone?: string;
}

interface CursoLocal {
  id: number;
  title: string;
  level: string;
  price: number;
  duration: string | null;
  imagePath: string | null;
}

interface GrupoLocal {
  id: number;
  name: string;
  days: string;
  startTime: string;
  endTime: string;
  capacity: number;
  curso?: { id: number };
}

export const NuevaInscripcion: React.FC = () => {
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const [pasoActual, setPasoActual] = useState(1);
  const [enviando, setEnviando] = useState(false);

  // ── Paso 1: Identidad ──────────────────────────────────────
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [estudianteActivo, setEstudianteActivo] = useState<EstudianteLocal | null>(null);
  const [esNuevoEstudiante, setEsNuevoEstudiante] = useState(false);

  const [nombreMostrado, setNombreMostrado] = useState('');
  const [apellidosMostrados, setApellidosMostrados] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [celularInput, setCelularInput] = useState('');
  const [becaDetectada, setBecaDetectada] = useState<string | null>(null);

  // ── Paso 2: Cursos ────────────────────────────────────────
  const [listaCursos, setListaCursos] = useState<CursoLocal[]>([]);
  const [filtroNivel, setFiltroNivel] = useState<string>('Todos');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<CursoLocal | null>(null);
  const [gruposDelCurso, setGruposDelCurso] = useState<GrupoLocal[]>([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<GrupoLocal | null>(null);

  // ── LÓGICA DE BECAS (BC y SM) ──────────────────────────────
  const tipoBeca = becaDetectada; // Puede ser 'BC', 'SM' o null
  let etiquetaBeca = 'Tarifa Regular';
  let precioOriginal = cursoSeleccionado?.price || 0;
  let precioFinal = precioOriginal;

  if (tipoBeca === 'BC') {
    etiquetaBeca = 'Beca Completa (100%)';
    precioFinal = 0;
  } else if (tipoBeca === 'SB') {
    etiquetaBeca = 'Semi Beca (50%)';
    precioFinal = precioOriginal / 2;
  }

  const nivelesDisponibles = ['Todos', ...Array.from(new Set(listaCursos.map(c => c.level).filter(Boolean)))];
  const cursosFiltrados = listaCursos.filter(c => filtroNivel === 'Todos' || c.level === filtroNivel);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCursos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/cursos');
        const data = response.data;
        setListaCursos(Array.isArray(data) ? data : (data.data || data.content || []));
      } catch {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los cursos.' });
      }
    };
    fetchCursos();
  }, []);

  useEffect(() => {
    if (!cursoSeleccionado) { setGruposDelCurso([]); return; }
    setCargandoGrupos(true);
    setGrupoSeleccionado(null);
    axios.get('http://localhost:8080/api/grupos')
      .then(response => {
        const data = response.data;
        const todos: GrupoLocal[] = Array.isArray(data) ? data : (data.data || data.content || []);
        setGruposDelCurso(todos.filter((g: any) => {
          const idCurso = g.curso?.id || g.courseId || g.curso;
          return Number(idCurso) === Number(cursoSeleccionado.id);
        }));
      })
      .catch(() => toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al cargar horarios.' }))
      .finally(() => setCargandoGrupos(false));
  }, [cursoSeleccionado]);

  // ────────────────────────────────────────────────────────────
  // BÚSQUEDA SECUENCIAL (BD Local ➔ Fallback RENIEC)
  // ────────────────────────────────────────────────────────────
  const buscarPorDni = async () => {
    if (dniBusqueda.trim().length !== 8) return;
    setBuscandoDni(true);
    
    setEstudianteActivo(null);
    setEsNuevoEstudiante(false);
    setNombreMostrado('');
    setApellidosMostrados('');
    setEmailInput('');
    setCelularInput('');
    setBecaDetectada(null);

    let encontradoLocal: EstudianteLocal | null = null;

    try {
      const responseLocal = await axios.get('http://localhost:8080/api/estudiantes', { params: { dni: dniBusqueda } });
      const resLocal = responseLocal.data;
      const buscarEnArray = (arr: any[]) => arr.find((e: any) => String(e.dni) === String(dniBusqueda));

      if (Array.isArray(resLocal)) encontradoLocal = buscarEnArray(resLocal);
      else if (resLocal) {
        if (Array.isArray(resLocal.data)) encontradoLocal = buscarEnArray(resLocal.data);
        else if (Array.isArray(resLocal.content)) encontradoLocal = buscarEnArray(resLocal.content);
        else if (resLocal._embedded && Array.isArray(resLocal._embedded.estudiantes)) encontradoLocal = buscarEnArray(resLocal._embedded.estudiantes);
        else if (String(resLocal.dni) === String(dniBusqueda)) encontradoLocal = resLocal; 
      }
    } catch (error) {
      console.log("Endpoint local no halló el DNI. Pasando a RENIEC...");
    }

    if (encontradoLocal) {
      setEstudianteActivo(encontradoLocal);
      setNombreMostrado(encontradoLocal.names);
      setApellidosMostrados(encontradoLocal.lastNames);
      setEmailInput(encontradoLocal.email || '');
      setCelularInput(encontradoLocal.phone || '');
      setBecaDetectada(encontradoLocal.typeScholarship || null);
      setEsNuevoEstudiante(false);
      
      toast.current?.show({ severity: 'success', summary: 'Usuario Encontrado', detail: 'Datos cargados del sistema.' });
      setBuscandoDni(false);
      return; 
    }

    try {
      toast.current?.show({ severity: 'info', summary: 'Buscando...', detail: 'Consultando RENIEC.' });
      const responseReniec = await axios.get(`http://localhost:8080/api/reniec/consultar`, { params: { dni: dniBusqueda } });
      const dataReniec = responseReniec.data;
      const datos = typeof dataReniec === 'string' ? JSON.parse(dataReniec) : dataReniec;

      if (datos && datos.nombres) {
        setNombreMostrado(datos.nombres);
        setApellidosMostrados(`${datos.apellidoPaterno} ${datos.apellidoMaterno}`);
        setEsNuevoEstudiante(true);
        setBecaDetectada(null);
        toast.current?.show({ severity: 'success', summary: 'Validado por RENIEC', detail: 'Completa tu correo y celular.' });
      } else {
        toast.current?.show({ severity: 'error', summary: 'No encontrado', detail: 'El DNI no existe.' });
      }
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error de Conexión', detail: 'No se pudo conectar con RENIEC.' });
    } finally {
      setBuscandoDni(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  // CORREGIR DATOS CON RENIEC
  // ────────────────────────────────────────────────────────────
  const corregirConReniec = async () => {
    toast.current?.show({ severity: 'info', summary: 'Consultando...', detail: 'Obteniendo datos oficiales de RENIEC' });
    try {
      const responseReniec = await axios.get(`http://localhost:8080/api/reniec/consultar`, { params: { dni: dniBusqueda } });
      const datos = typeof responseReniec.data === 'string' ? JSON.parse(responseReniec.data) : responseReniec.data;

      if (datos && datos.nombres) {
        setNombreMostrado(datos.nombres);
        setApellidosMostrados(`${datos.apellidoPaterno} ${datos.apellidoMaterno}`);
        toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Tus nombres han sido corregidos.' });
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'RENIEC no devolvió datos.' });
      }
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al conectar con RENIEC.' });
    }
  };

  const puedeAvanzarPaso1 = () => nombreMostrado.trim().length > 0 && emailInput.trim().includes('@') && celularInput.trim().length >= 9;
  const formatearHora = (hora: string) => hora ? hora.substring(0, 5) : '';
  const nombreCompleto = `${nombreMostrado} ${apellidosMostrados}`.trim();

  // ────────────────────────────────────────────────────────────
  // GENERADOR DEL PDF (FORMATO ORDEN DE PAGO FORMAL)
  // ────────────────────────────────────────────────────────────
  const generarOrdenDePagoPDF = () => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-PE');
    const nroOrden = Math.floor(100000 + Math.random() * 900000); // Número de orden aleatorio
    
    // --- CUADRO RUC (Estilo SUNAT / Formal) ---
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(130, 15, 65, 30); // x, y, width, height
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("R.U.C. N° 20146911639", 162.5, 23, { align: "center" });
    
    doc.setFillColor(230, 230, 230);
    doc.rect(130, 26, 65, 8, "FD"); // Fondo gris para el título
    doc.setFontSize(11);
    doc.text("ORDEN DE PAGO", 162.5, 31.5, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38); // Rojo
    doc.text(`N° 001 - ${nroOrden}`, 162.5, 41, { align: "center" });

    // --- CABECERA IZQUIERDA (Datos Empresa) ---
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CENTRO EN TECNOLOGÍAS", 15, 22);
    doc.text("DE INFORMACIÓN", 15, 29);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Universidad Nacional de San Martín", 15, 36);
    doc.text("Sede Tarapoto, San Martín, Perú", 15, 41);

    // --- DATOS DEL CLIENTE / POSTULANTE ---
    doc.setDrawColor(200);
    doc.rect(15, 55, 180, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Señor(es):", 18, 62);
    doc.setFont("helvetica", "normal");
    doc.text(nombreCompleto, 40, 62);
    
    doc.setFont("helvetica", "bold");
    doc.text("DNI / Doc:", 18, 70);
    doc.setFont("helvetica", "normal");
    doc.text(dniBusqueda, 40, 70);

    doc.setFont("helvetica", "bold");
    doc.text("Fecha Emisión:", 130, 62);
    doc.setFont("helvetica", "normal");
    doc.text(fechaActual, 160, 62);

    doc.setFont("helvetica", "bold");
    doc.text("Celular:", 18, 78);
    doc.setFont("helvetica", "normal");
    doc.text(celularInput, 40, 78);

    doc.setFont("helvetica", "bold");
    doc.text("Correo:", 130, 78);
    doc.setFont("helvetica", "normal");
    doc.text(emailInput, 150, 78);

    // --- TABLA DE DETALLES ---
    const startY = 95;
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    
    // Encabezados de tabla
    doc.setFillColor(240, 240, 240);
    doc.rect(15, startY, 180, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CANT.", 18, startY + 5.5);
    doc.text("DESCRIPCIÓN DEL CONCEPTO", 40, startY + 5.5);
    doc.text("P. UNIT.", 140, startY + 5.5);
    doc.text("IMPORTE", 170, startY + 5.5);

    // Fila 1: Curso
    doc.setFont("helvetica", "normal");
    doc.rect(15, startY + 8, 180, 15); // Borde de la fila
    doc.text("1", 21, startY + 16);
    doc.text(`Matrícula: ${cursoSeleccionado?.title}`, 40, startY + 14);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Horario: ${grupoSeleccionado?.days} (${formatearHora(grupoSeleccionado?.startTime || '')})`, 40, startY + 19);
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.text(`S/ ${precioOriginal.toFixed(2)}`, 140, startY + 16);
    doc.text(`S/ ${precioOriginal.toFixed(2)}`, 170, startY + 16);

    // Fila 2: Descuento (Si hay beca)
    let finalY = startY + 23;
    if (tipoBeca) {
      doc.rect(15, finalY, 180, 10);
      doc.text("1", 21, finalY + 6);
      doc.text(`Beneficio Institucional Aplicado: ${etiquetaBeca}`, 40, finalY + 6);
      const descuento = precioOriginal - precioFinal;
      doc.text(`- S/ ${descuento.toFixed(2)}`, 140, finalY + 6);
      doc.text(`- S/ ${descuento.toFixed(2)}`, 170, finalY + 6);
      finalY += 10;
    }

    // --- TOTALES ---
    doc.rect(15, finalY, 180, 10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL A PAGAR", 130, finalY + 6);
    doc.setFontSize(11);
    doc.text(`S/ ${precioFinal.toFixed(2)}`, 170, finalY + 6);

    // --- INSTRUCCIONES AL PIE ---
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    
    if (precioFinal > 0) {
      doc.text("INSTRUCCIONES DE PAGO:", 15, finalY + 20);
      doc.setFont("helvetica", "normal");
      doc.text("1. Acércate a la caja central de la UNSM o realiza el depósito en la cuenta autorizada.", 15, finalY + 25);
      doc.text("2. Presenta este documento junto con tu voucher para activar tu matrícula.", 15, finalY + 30);
    } else {
      doc.text("DOCUMENTO VÁLIDO COMO CONSTANCIA DE BECA:", 15, finalY + 20);
      doc.setFont("helvetica", "normal");
      doc.text("Tu inscripción ha sido procesada con beneficio del 100%. No requiere abono.", 15, finalY + 25);
    }

    doc.setFontSize(8);
    doc.text("Documento generado por el Sistema de Inscripciones CTI.", 105, 280, { align: "center" });

    doc.save(`Orden_Pago_CTI_${dniBusqueda}.pdf`);
  };

  // ────────────────────────────────────────────────────────────
  // CONFIRMACIÓN EN BD
  // ────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────
  // CONFIRMACIÓN EN BD
  // ────────────────────────────────────────────────────────────
  const confirmarMatricula = async () => {
    if (!grupoSeleccionado) return;
    setEnviando(true);
    try {
      let estudianteId = estudianteActivo?.id;

      if (esNuevoEstudiante && !estudianteActivo) {
        // Estudiante totalmente nuevo
        const nuevoEstudiante = {
          dni: dniBusqueda,
          names: nombreMostrado,
          lastNames: apellidosMostrados,
          email: emailInput,
          phone: celularInput,
          typeScholarship: null,
        };
        const regResp = await axios.post('http://localhost:8080/api/estudiantes', nuevoEstudiante);
        estudianteId = regResp.data?.id || regResp.data?.data?.id;
      } else if (estudianteActivo) {
        // ACTUALIZACIÓN DE ESTUDIANTE EXISTENTE
        // Usamos PUT (como está en tu Java) y le pasamos todo el objeto viejo + los datos nuevos
        await axios.put(`http://localhost:8080/api/estudiantes/${estudianteActivo.id}`, {
          ...estudianteActivo, // Así no perdemos el DNI ni la beca
          names: nombreMostrado,
          lastNames: apellidosMostrados,
          email: emailInput,
          phone: celularInput,
        }); 
      }

      // Matricular en el curso
      const payload = { studentId: estudianteId, groupId: grupoSeleccionado.id };
      const response = await axios.post('http://localhost:8080/api/inscripciones/inscribir', payload);

      if (response.status >= 200 && response.status < 300) { // Validamos cualquier respuesta de éxito
        toast.current?.show({ severity: 'success', summary: '¡Éxito!', detail: 'Inscripción procesada.' });
        
        generarOrdenDePagoPDF();
        
        // Redirección inmediata y bloqueamos que puedan retroceder a esta pantalla
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo procesar la inscripción.';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: msg });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="page-inscripcion-wrapper">
      <Toast ref={toast} position="top-center" />
      <div className="wizard-container">
        
        {/* --- CABECERA --- */}
        <div className="wizard-header">
          <Button icon="pi pi-times" text rounded severity="secondary" onClick={() => navigate('/')} className="btn-cerrar" disabled={enviando} aria-label="Cancelar" />
          <h2>Inscripción CTI</h2>
          <div className="stepper-indicador">
            <span className={pasoActual >= 1 ? 'activo' : ''}>1. Identidad</span>
            <div className="linea"></div>
            <span className={pasoActual >= 2 ? 'activo' : ''}>2. Curso</span>
            <div className="linea"></div>
            <span className={pasoActual >= 3 ? 'activo' : ''}>3. Resumen</span>
          </div>
        </div>

        {/* --- CUERPO --- */}
        <div className="wizard-body">

          {/* PASO 1 */}
          {pasoActual === 1 && (
            <div className="step-content step-identidad">
              <div className="identidad-grid">
                
                {/* Columna Búsqueda */}
                <div className="identidad-form">
                  <div className="icon-wrapper"><i className="pi pi-id-card"></i></div>
                  <h3>Ingresa tu DNI</h3>
                  <p>Validaremos tus datos en nuestro sistema y en RENIEC.</p>

                  <div className="p-inputgroup buscador-dni mt-3">
                    <InputText placeholder="Ej: 74839201" value={dniBusqueda} onChange={e => setDniBusqueda(e.target.value)} maxLength={8} keyfilter="int" onKeyDown={e => e.key === 'Enter' && buscarPorDni()} />
                    <Button icon="pi pi-search" loading={buscandoDni} onClick={buscarPorDni} />
                  </div>
                </div>

                {/* Columna Formulario */}
                <div className="identidad-resultado">
                  {nombreMostrado ? (
                    <div className="resultado-perfil slide-up">
                      <div className="perfil-nombre text-center">{nombreCompleto}</div>
                      
                      {/* BOTÓN MAGICO DE CORRECCIÓN */}
                {estudianteActivo && (
                  <div className="contenedor-boton-centro">
                    <Button 
                      label="¿Tus datos están mal? Corregir con RENIEC" 
                      icon="pi pi-refresh" 
                      text 
                      size="small" 
                      className="color p-button-sm p-button-secondary" 
                      onClick={corregirConReniec} 
                    />
                  </div>
                )}
                      
                      <div className="beca-box mb-4 mt-2">
                        {tipoBeca ? (
                           <div className="beca-alerta success"><i className="pi pi-check-circle"></i> {etiquetaBeca}</div>
                        ) : (
                           <div className="beca-alerta neutral"><i className="pi pi-info-circle"></i> Tarifa Regular</div>
                        )}
                      </div>

                      <div className="campos-contacto text-left">
                        <div className="campo-grupo">
                          <label>Correo Electrónico <span className="req">*</span></label>
                          <InputText value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="correo@ejemplo.com" type="email" />
                        </div>
                        <div className="campo-grupo mt-3">
                          <label>Celular / WhatsApp <span className="req">*</span></label>
                          <InputText value={celularInput} onChange={e => setCelularInput(e.target.value)} placeholder="Ingrese su número de celular" maxLength={9} keyfilter="int" />
                        </div>
                      </div>

                      <Button label="Continuar" icon="pi pi-arrow-right" iconPos="right" className="w-full mt-4 btn-continuar-step" onClick={() => setPasoActual(2)} disabled={!puedeAvanzarPaso1()} />
                    </div>
                  ) : (
                    <div className="estado-espera">
                      <i className="pi pi-search"></i>
                      <p>Esperando DNI...</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* PASO 2 */}
          {/* PASO 2 */}
          {pasoActual === 2 && (
            <div className="step-content">
              <div className="flex-header-step">
                <Button icon="pi pi-arrow-left" text rounded onClick={() => setPasoActual(1)} className="btn-atras-small" />
                <h3>Elige curso y horario</h3>
                <div style={{ width: '3rem' }} />
              </div>

              <div className="filtros-nivel">
                {nivelesDisponibles.map(nivel => (
                  <button key={nivel} className={`pill-filtro ${filtroNivel === nivel ? 'activo' : ''}`} onClick={() => { setFiltroNivel(nivel); setCursoSeleccionado(null); }}>{nivel}</button>
                ))}
              </div>

              <div className="lista-cursos-compacta">
                {cursosFiltrados.map(curso => (
                  <div key={curso.id} className={`curso-card-horizontal sin-imagen ${cursoSeleccionado?.id === curso.id ? 'seleccionado' : ''}`} onClick={() => setCursoSeleccionado(curso)}>
                    <i className="pi pi-desktop icon-top-right"></i> {/* Ícono en la esquina */}
                    
                    <div className="curso-info-mini w-full text-left">
                      <div>
                        <span className="badge-nivel-mini">{curso.level}</span>
                      </div>
                      
                      <h4 className="line-clamp-2">{curso.title}</h4>
                      
                      <div className="precio-mini">
                        {tipoBeca === 'BC' ? <><del className="precio-tachado">S/ {curso.price}</del><span className="precio-beca mx-2 font-bold text-green-600">S/ 0</span></> : 
                         tipoBeca === 'SM' ? <><del className="precio-tachado">S/ {curso.price}</del><span className="precio-beca mx-2 font-bold text-green-600">S/ {(curso.price / 2).toFixed(2)}</span></> : 
                         <span className="font-bold text-blue-600">S/ {curso.price.toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {cursoSeleccionado && (
                <div className="seccion-horarios-dinamicos mt-3 slide-up">
                  <h5>Horarios disponibles para {cursoSeleccionado.title}</h5>
                  {cargandoGrupos ? <p className="text-gray-500"><i className="pi pi-spin pi-spinner"></i> Buscando...</p> : (
                    <div className="lista-horarios-split">
                      {gruposDelCurso.map(grupo => {
                        const agotado = Number(grupo.capacity) <= 0;
                        return (
                          <div key={grupo.id} className={`item-horario-split ${grupoSeleccionado?.id === grupo.id ? 'activo' : ''} ${agotado ? 'agotado' : ''}`} onClick={() => !agotado && setGrupoSeleccionado(grupo)}>
                            <RadioButton inputId={`g-${grupo.id}`} name="g" value={grupo} onChange={e => setGrupoSeleccionado(e.value)} checked={grupoSeleccionado?.id === grupo.id} disabled={agotado} />
                            <label htmlFor={`g-${grupo.id}`} className="info-grupo-bd cursor-pointer w-full">
                              <div className="nombre-grupo">{grupo.name}</div>
                              <div className="horas-grupo">{grupo.days} • {formatearHora(grupo.startTime)} - {formatearHora(grupo.endTime)}</div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <Button label="Continuar al Resumen" icon="pi pi-arrow-right" iconPos="right" className="w-full mt-4 btn-continuar" disabled={!cursoSeleccionado || !grupoSeleccionado} onClick={() => setPasoActual(3)} />
            </div>
          )}

          {/* PASO 3 */}
          {pasoActual === 3 && cursoSeleccionado && grupoSeleccionado && (
            <div className="step-content">
              <div className="flex-header-step">
                <Button icon="pi pi-arrow-left" text rounded onClick={() => setPasoActual(2)} disabled={enviando} className="btn-atras-small" />
                <h3>Resumen de matrícula</h3>
                <div style={{ width: '3rem' }} />
              </div>

              <div className="resumen-box mt-2">
                <div className="resumen-fila"><span className="label">Alumno</span><span className="valor">{nombreCompleto}</span></div>
                <div className="resumen-fila"><span className="label">DNI</span><span className="valor">{dniBusqueda}</span></div>
                <div className="resumen-fila"><span className="label">Correo</span><span className="valor">{emailInput}</span></div>
                <div className="resumen-fila"><span className="label">Curso</span><span className="valor font-bold text-right">{cursoSeleccionado.title}</span></div>
                <div className="resumen-fila"><span className="label">Horario</span><span className="valor text-blue-600 font-bold">{grupoSeleccionado.days} ({formatearHora(grupoSeleccionado.startTime)})</span></div>
                <div className="resumen-fila"><span className="label">Beca</span><span className="valor text-green-600">{etiquetaBeca}</span></div>
                
                <div className="resumen-total">
                  <span>Total a pagar</span>
                  <div className="precio-final">
                    {tipoBeca && <del className="precio-original">S/ {precioOriginal.toFixed(2)}</del>}
                    <span>S/ {precioFinal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button label={enviando ? 'Procesando...' : 'Confirmar y Descargar Orden'} icon={enviando ? 'pi pi-spin pi-spinner' : 'pi pi-file-pdf'} className="w-full mt-4 btn-finalizar" onClick={confirmarMatricula} disabled={enviando} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
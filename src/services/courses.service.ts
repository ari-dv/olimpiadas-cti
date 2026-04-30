import axios from 'axios';

const API_BASE_URL = 'https://olimpiadas.ctiunsm.com/api';
const API_KEY = '!olympiccti@2026';
const VPS_BASE_URL = 'http://178.238.237.71:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY, 
  },
});

const vpsApi = axios.create({
  baseURL: VPS_BASE_URL,
});

// ============== IMÁGENES DEL VPS ==============

export const getVpsImages = async () => {
  try {
    const response = await vpsApi.get('/list-images');
    return response.data.images || [];
  } catch (error) {
    console.error("Error obteniendo imágenes del VPS:", error);
    return [];
  }
};

// ============== CURSOS ==============

export interface Course {
  id: number;
  title: string;
  level: string;
  badgeClass: string;
  duration: string;
  date: string;
  courseKey?: string; // identificador único para matching
  imgSrc?: string; // imagen original (fallback)
  vpsImageUrl?: string; // imagen del VPS (prioridad)
}

// Función para extraer palabras significativas del nombre del curso
// Con prioridad a palabras únicas que no se repiten en otros cursos
const extractCourseKeywords = (courseTitle: string, allCourseTitles: string[] = []): string[] => {
  let title = courseTitle.toLowerCase().trim();
  
  // Normalizar tildes y caracteres especiales
  title = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\-]/g, "");
  
  // Remover palabras comunes PERO preservar palabras clave
  let cleaned = title
    .replace(/\s*(con|de|y|o|en|la|el|a)\s+/g, ' ')
    .trim();
  
  // Dividir en palabras
  const words = cleaned.split(/[\s\-\.]+/).filter(w => w.length > 0);
  
  // Calcular qué palabras son únicas (no aparecen en otros cursos)
  const wordFrequency = new Map<string, number>();
  allCourseTitles.forEach(otherTitle => {
    let normalizedOther = otherTitle.toLowerCase().trim();
    normalizedOther = normalizedOther
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s\-]/g, "");
    
    const otherWords = normalizedOther
      .replace(/\s*(con|de|y|o|en|la|el|a)\s+/g, ' ')
      .trim()
      .split(/[\s\-\.]+/)
      .filter(w => w.length > 0);
    
    otherWords.forEach(word => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });
  });
  
  const keywordsWithPriority: Array<[string, number]> = [];
  
  // PRIORIDAD MÁXIMA: Palabras ÚNICAS (no aparecen en otros cursos)
  const uniqueWords = words.filter(word => wordFrequency.get(word) === 1);
  const sortedUniqueWords = uniqueWords.sort((a, b) => b.length - a.length);
  sortedUniqueWords.forEach(word => {
    if (word.length > 2) {
      keywordsWithPriority.push([word, 15]); // PRIORIDAD MUY ALTA
      keywordsWithPriority.push([`curso-${word}`, 14.9]);
      keywordsWithPriority.push([`curso${word}`, 14.8]);
    }
  });
  
  // PRIORIDAD 1: Palabras significativas (más largas, >3 caracteres)
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  sortedWords.forEach(word => {
    if (word.length > 3 && !uniqueWords.includes(word)) {
      keywordsWithPriority.push([word, 11]);
      keywordsWithPriority.push([`curso-${word}`, 10.5]);
      keywordsWithPriority.push([`curso${word}`, 10.4]);
    }
  });
  
  // PRIORIDAD 2: Todas las palabras juntas
  if (words.length > 1) {
    const allTogether = words.join('');
    const allWithDashes = words.join('-');
    keywordsWithPriority.push([allTogether, 9]);
    keywordsWithPriority.push([allWithDashes, 8.9]);
    keywordsWithPriority.push([`curso-${allTogether}`, 8.8]);
    keywordsWithPriority.push([`curso-${allWithDashes}`, 8.7]);
  }
  
  // PRIORIDAD 3: Últimas 2 palabras
  if (words.length >= 2) {
    keywordsWithPriority.push([words.slice(-2).join(''), 7]);
    keywordsWithPriority.push([words.slice(-2).join('-'), 6.9]);
    keywordsWithPriority.push([`curso-${words.slice(-2).join('-')}`, 6.8]);
  }
  
  // PRIORIDAD 4: Iniciales
  const initials = words.map(w => w.charAt(0)).join('');
  if (initials.length > 1) {
    keywordsWithPriority.push([initials, 2]);
  }
  
  // Ordenar por prioridad y eliminar duplicados
  const seen = new Set<string>();
  return keywordsWithPriority
    .sort((a, b) => b[1] - a[1])
    .filter(item => {
      if (seen.has(item[0])) return false;
      seen.add(item[0]);
      return true;
    })
    .map(item => item[0]);
};

// Función para obtener cursos desde un JSON local
export const getCourses = async (jsonPath: string = '/data/courses.json'): Promise<Course[]> => {
  try {
    // Opción 1: Si tienes un endpoint en tu API
    // const response = await api.get('/public/courses');
    // const courses = response.data.data;
    
    // Opción 2: Si cargas desde un archivo local
    const response = await fetch(jsonPath);
    const courses: Course[] = await response.json();
    
    // Obtener imágenes del VPS una sola vez
    const vpsImages = await getVpsImages();
    
    console.log('📚 Cursos cargados:', courses.length);
    console.log('📸 Imágenes VPS disponibles:', vpsImages.map((img: any) => img.filename));
    
    // Obtener todos los títulos para análisis de palabras únicas
    const allCourseTitles = courses.map(c => c.title);
    
    // Mapear imágenes a los cursos
    const coursesWithImages = courses.map((course: Course) => {
      const keywords = extractCourseKeywords(course.title, allCourseTitles);
      
      console.log(`\n🔍 Curso: "${course.title}"`);
      console.log(`   Keywords (prioridad a palabras únicas):`, keywords);
      
      // Buscar imagen en el VPS
      let bestMatch: any = null;
      
      for (const keyword of keywords) {
        if (bestMatch) break;
        
        const match = vpsImages.find((img: any) => {
          return img.filename.toLowerCase().includes(keyword);
        });
        
        if (match) {
          bestMatch = match;
          console.log(`   ✅ MATCH: "${keyword}" en "${match.filename}"`);
        }
      }
      
      if (!bestMatch) {
        console.log(`   ⚠️  Sin imagen en VPS, usando imgSrc original`);
      }
      
      return {
        ...course,
        vpsImageUrl: bestMatch?.url || null
      };
    });
    
    return coursesWithImages;
  } catch (error) {
    console.error("Error al cargar cursos:", error);
    return [];
  }
};

// Función para filtrar cursos por nivel
export const getCoursesByLevel = async (level: string, jsonPath?: string): Promise<Course[]> => {
  const allCourses = await getCourses(jsonPath);
  return allCourses.filter(course => course.level === level);
};

// Función para obtener un curso específico
export const getCourseById = async (id: number, jsonPath?: string): Promise<Course | null> => {
  const allCourses = await getCourses(jsonPath);
  return allCourses.find(course => course.id === id) || null;
};

export default api;
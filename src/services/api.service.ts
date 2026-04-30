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

export const getVpsImages = async () => {
  try {
    const response = await vpsApi.get('/list-images');
    return response.data.images || [];
  } catch (error) {
    console.error("Error obteniendo imágenes del VPS:", error);
    return [];
  }
};

const extractKeywords = (schoolName: string): string[] => {
  const name = schoolName.toLowerCase().trim();
  
  let cleaned = name
    .replace(/^i\.?e\.?\s*/i, '') 
    .replace(/^colegio\s*/i, '')   
    .replace(/^escuela\s*/i, '')  
    .trim();
  
  const words = cleaned.split(/[\s\-\.]+/).filter(w => w.length > 0);
  
  const keywordsWithPriority: Array<[string, number]> = [];
  
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  sortedWords.forEach(word => {
    if (word.length > 3) {
      keywordsWithPriority.push([word, 10]);
    }
  });
  
  if (words.length > 1) {
    keywordsWithPriority.push([words.join(''), 9]);
    keywordsWithPriority.push([words.join('-'), 8]);
  }
  
  if (words.length >= 2) {
    keywordsWithPriority.push([words.slice(-2).join(''), 7]);
    keywordsWithPriority.push([words.slice(-2).join('-'), 6]);
  }
  
  if (words.length >= 3) {
    keywordsWithPriority.push([words.slice(-3).join(''), 5]);
    keywordsWithPriority.push([words.slice(-3).join('-'), 4]);
  }
  
  const initials = words.map(w => w.charAt(0)).join('');
  if (initials.length > 1) {
    keywordsWithPriority.push([initials, 2]);
  }
  
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

export const getPublicFilters = async () => {
  try {
    const [filtersResponse, vpsImages] = await Promise.all([
      api.get('/public/filters'),
      getVpsImages()
    ]);
    
    const filters = filtersResponse.data;
    
    console.log('📸 VPS Images disponibles:');
    vpsImages.forEach((img: any) => {
      console.log(`   - ${img.filename}`);
    });
    
    if (filters.success && filters.data?.schools) {
      filters.data.schools = filters.data.schools.map((school: any) => {
        const schoolName = school.name;
        const keywords = extractKeywords(schoolName);
        
        console.log(`\n🔍 Escuela: "${schoolName}"`);
        console.log(`   Keywords (ordenadas por prioridad):`, keywords);
        
        let bestMatch: any = null;
        let bestMatchKeyword = '';
        
        for (const keyword of keywords) {
          if (bestMatch) break; // Ya encontramos un match de alta prioridad
          
          const match = vpsImages.find((img: any) => {
            const imgFilename = img.filename.toLowerCase();
            return imgFilename.includes(keyword);
          });
          
          if (match) {
            bestMatch = match;
            bestMatchKeyword = keyword;
            console.log(`   ✅ MATCH: "${keyword}" en "${match.filename}"`);
          }
        }
        
        if (!bestMatch) {
          console.log(`   ⚠️  Sin imagen en VPS, usando logo original`);
        }
        
        return {
          ...school,
          vpsImageUrl: bestMatch?.url || null
        };
      });
    }
    
    return filters;
  } catch (error) {
    console.error("Error en getPublicFilters:", error);
    return { success: false, data: null };
  }
};

export const getSchoolDetails = async (slug: string) => {
  try {
    const response = await api.get(`/public/schools/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo detalles del colegio:", error);
    return null;
  }
};

export const getSectionsBySchool = async (slug: string, codgrade: string | number) => {
  const response = await api.get(`/public/schools/${slug}/sections`, {
    params: {
      codgrade: codgrade
    }
  });
  return response.data; 
};

export const getPublicPeriods = async () => {
  const response = await api.get('/public/periods');
  return response.data;
};

export const getStudentResults = async (params: any) => {
  if (params.dni) {
    const response = await api.get('/public/results/search', { 
      params: { dni: params.dni } 
    });
    return response.data;
  }
  
  const response = await api.get('/public/results', { params });
  return response.data;
};

export default api;
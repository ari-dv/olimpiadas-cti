export const formatDNI = (dni: string | undefined | null): string => {
  if (!dni) return '-';
  
  const dniStr = String(dni).trim();

  if (!dniStr || dniStr.toLowerCase() === 'null' || dniStr === '-') {
    return '-';
  }

  if (/^[\d*]+$/.test(dniStr)) {
    return dniStr;
  }

  return '-';
};
  
  export const formatName = (name: string | undefined | null): string => {
    if (!name) return '-';
    
    const nameStr = String(name).trim();
    
    if (!nameStr || nameStr.toLowerCase() === 'null') {
      return '-';
    }

    return nameStr
      .toLowerCase()
      .split(/\s+/)
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ') 
      .replace(/\s+/g, ' '); 
  };
  
  export const formatLevel = (level: string | undefined | null): string => {
    if (!level) return '-';
    
    const levelStr = String(level).trim();
    
    if (!levelStr || levelStr.toLowerCase() === 'null') {
      return '-';
    }
    
    return levelStr
      .toLowerCase()
      .charAt(0)
      .toUpperCase() + levelStr.slice(1).toLowerCase();
  };
  
  export const formatSection = (section: string | undefined | null): string => {
    if (!section) return '-';
    
    const sectionStr = String(section).trim();
    
    if (!sectionStr || sectionStr.toLowerCase() === 'null') {
      return '-';
    }
    
    if (/^[a-z]$/i.test(sectionStr)) {
      return sectionStr.toUpperCase();
    }
    
    if (sectionStr.toLowerCase() === 'única') {
      return 'Única';
    }
    
    return sectionStr.charAt(0).toUpperCase() + sectionStr.slice(1).toLowerCase();
  };
  
  export const formatSchoolName = (school: string | undefined | null): string => {
    if (!school) return '-';
    
    const schoolStr = String(school).trim();
    
    if (!schoolStr || schoolStr.toLowerCase() === 'null') {
      return '-';
    }
    
    return schoolStr;
  };
  
  export const formatGrade = (grade: string | undefined | null): string => {
    if (!grade) return '-';
    
    const gradeStr = String(grade).trim();
    
    if (!gradeStr || gradeStr.toLowerCase() === 'null') {
      return '-';
    }
    
    return gradeStr
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  

  export const formatScholarshipType = (type: string | undefined | null): string => {
    if (!type) return '-';
    
    const typeStr = String(type).trim().toUpperCase();
    
    if (!typeStr || typeStr === 'NULL' || typeStr === 'SB') {return '-';}
    if (typeStr === 'BC') return 'BECA COMPLETA';
    if (typeStr === 'BM') return 'SEMI BECA';
    
    return typeStr;
  };
  
  export const formatScore = (score: number | string | undefined | null): string => {
    if (score === null || score === undefined || score === '') return '-';
    
    const scoreStr = String(score).trim();
    
    if (!scoreStr || scoreStr.toLowerCase() === 'null') {
      return '-';
    }
  
    const num = parseFloat(scoreStr);
    if (!isNaN(num)) {
      return String(num);
    }
    
    return '-';
  };

  export const formatGradeAbbreviation = (grade: string | undefined | null): string => {
    if (!grade) return '-';
    
    const gradeUpper = grade.trim().toUpperCase();
    
    const map: Record<string, string> = {
      'PRIMERO': '1°',
      'SEGUNDO': '2°',
      'TERCERO': '3°',
      'CUARTO': '4°',
      'QUINTO': '5°',
      'SEXTO': '6°'
    };
  
    // Retorna el valor mapeado o el original si no lo encuentra
    return map[gradeUpper] || gradeUpper;
  };
export interface Student {
    id: string;
    dni: string;
    fullName: string;
    level: string;
    schoolName: string;
    grade: string;
    section: string;
    score: number;
    scholarshipType: 'BECA COMPLETA' | 'SEMI BECA' | 'REGULAR';
    rank: number;
  }
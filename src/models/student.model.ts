
export interface Student {
  position: number;
  score: string;
  type_scholarship: string | null; 
  student: {
      dni: string;
      fullname: string;
  };
  olympic: string;
  period: string;
  school: string;
  grade: string;
  section: string;
  level?: string;
}
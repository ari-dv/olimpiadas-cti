import type { Student } from '../models/student.model';
import type { FilterOptions } from '../models/filter.model';

export const fetchResults = async (endpointUrl: string): Promise<Student[]> => {
  try {
    const response = await fetch(endpointUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: Student[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return []; 
  }
};

export const fetchFilterOptions = async (endpointUrl: string): Promise<FilterOptions | null> => {
  try {
    const response = await fetch(endpointUrl);
    if (!response.ok) throw new Error('Error fetching filters');
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch filters:", error);
    return null;
  }
};
/**
 * Absence model interfaces for the BMI system
 */

// Absence data for table display
export interface AbsenceTableDto {
  id: string;
  personId: string;
  personName?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  comment?: string;
}


// Detailed absence data for form
export interface AbsenceDetailDto {
  id: string;
  personId: string;
  personName?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  comment?: string;
}

// Request DTOs for CRUD operations
export interface CreateAbsenceRequest {
  personId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  comment?: string;
}

export interface UpdateAbsenceRequest {
  id: string;
  personId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  comment?: string;
}

// Response DTOs
export interface AbsenceResponse {
  success: boolean;
  message: string;
  data: AbsenceDetailDto;
}

export interface AbsencesResponse {
  success: boolean;
  message: string;
  data: AbsenceTableDto[];
  total: number;
}

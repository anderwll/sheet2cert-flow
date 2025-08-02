export interface PersonData {
  nome: string;
  cpf: string;
  telefone: string;
  certificado: string;
  email: string;
}

export interface ProcessedData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  isValid: boolean;
  errors: string[];
  willEmit: boolean;
}

export interface ColumnMapping {
  [key: string]: string;
}

export interface SpreadsheetStats {
  totalRecords: number;
  approvedForEmission: number;
  rejectedForEmission: number;
  invalidRecords: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EmissionData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}

export interface EmissionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface EmissionRequest {
  data: EmissionData[];
}

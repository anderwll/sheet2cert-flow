import type { ProcessedData } from "@/@types/spreadsheet";
import type { EmissionData } from "@/@types/api";

/**
 * Converts ProcessedData to EmissionData format
 */
export const convertToEmissionData = (
  processedData: ProcessedData
): EmissionData => {
  return {
    nome: processedData.nome,
    cpf: processedData.cpf,
    telefone: processedData.telefone,
    email: processedData.email,
  };
};

/**
 * Converts array of ProcessedData to array of EmissionData
 */
export const convertToEmissionDataArray = (
  processedDataArray: ProcessedData[]
): EmissionData[] => {
  return processedDataArray.map(convertToEmissionData);
};
